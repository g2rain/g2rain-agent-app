/**
 * 会话消息的两页窗口：内存中最多保留相邻两页消息，阅读连贯且内存有上限。
 *
 * - 向下取下一页后丢弃最上面一页，向上取上一页后丢弃最下面一页；
 * - 同一时间只有一个请求在途，在途期间的重复触发直接忽略；
 * - 窗口被重新打开后，之前发出的请求即使返回也不再写入；
 * - prepare 在新窗口生效前执行（如按新窗口取任务），让消息与关联数据在同一次渲染中出现。
 *
 * @example
 * const win = useMessageWindow((num, size) => api.messages(id, num, size), { prepare: loadTasks });
 * await win.open();
 * await win.next(); // true 表示窗口已移动
 * await win.openLatest(); // 跳到最新
 */
import { computed, ref, shallowRef } from 'vue';
import type { ChatMessageVo } from './type';

type Edge = 'prev' | 'next';
type Fetch = (pageNum: number, pageSize: number) => Promise<{ records: ChatMessageVo[]; total: number }>;

interface WindowOptions {
  pageSize?: number;
  /** 新窗口生效前执行；自行处理异常，不影响窗口移动 */
  prepare?: (messages: ChatMessageVo[]) => Promise<void>;
}

interface MessagePage {
  num: number;
  rows: ChatMessageVo[];
}

const CAPACITY = 2;

export function useMessageWindow(fetch: Fetch, { pageSize = 30, prepare }: WindowOptions = {}) {
  const pages = shallowRef<MessagePage[]>([]);
  const total = ref(0);
  /** 在途方向；open 表示正在打开或重载 */
  const pending = ref<Edge | 'open' | null>(null);
  /** 最近一次失败的方向，供边界处显示重试 */
  const failed = ref<Edge | null>(null);
  let epoch = 0;

  const messages = computed(() => pages.value.flatMap((page) => page.rows));
  const first = computed(() => pages.value[0]?.num ?? 1);
  const last = computed(() => pages.value[pages.value.length - 1]?.num ?? 0);
  const hasPrev = computed(() => first.value > 1);
  const hasNext = computed(() => last.value * pageSize < total.value);

  async function fetchPage(num: number): Promise<MessagePage & { total: number }> {
    const page = await fetch(num, pageSize);
    return { num, rows: page.records ?? [], total: page.total };
  }

  /** 先执行 prepare，再在窗口仍有效时提交；返回是否已提交 */
  async function commit(token: number, next: MessagePage[], nextTotal: number): Promise<boolean> {
    await prepare?.(next.flatMap((page) => page.rows));
    if (token !== epoch) return false;
    total.value = nextTotal;
    pages.value = next;
    return true;
  }

  /** 从第 num 页重新打开窗口；失败时抛出，由调用方决定如何展示 */
  async function open(num = 1): Promise<void> {
    const token = ++epoch;
    pending.value = 'open';
    failed.value = null;
    try {
      const page = await fetchPage(num);
      if (token === epoch) await commit(token, [page], page.total);
    } finally {
      if (token === epoch) pending.value = null;
    }
  }

  /** 打开最新的两页（跳到最新）；失败时抛出，窗口保持原样 */
  async function openLatest(): Promise<void> {
    const token = ++epoch;
    pending.value = 'open';
    failed.value = null;
    try {
      const lastNum = Math.max(1, Math.ceil(total.value / pageSize));
      const nums = lastNum > 1 ? [lastNum - 1, lastNum] : [1];
      const next = await Promise.all(nums.map(fetchPage));
      if (token === epoch) {
        await commit(token, next.filter((page) => page.rows.length > 0), next[next.length - 1].total);
      }
    } finally {
      if (token === epoch) pending.value = null;
    }
  }

  /** 原位重载当前窗口的各页（刷新）；失败时抛出，窗口保持原样 */
  async function reload(): Promise<void> {
    const nums = pages.value.map((page) => page.num);
    if (nums.length === 0) return open();
    const token = ++epoch;
    pending.value = 'open';
    failed.value = null;
    try {
      const next = await Promise.all(nums.map(fetchPage));
      if (token === epoch) {
        await commit(token, next.filter((page) => page.rows.length > 0), next[next.length - 1].total);
      }
    } finally {
      if (token === epoch) pending.value = null;
    }
  }

  /** 向一侧移动一页；返回窗口是否发生了变化 */
  async function move(edge: Edge): Promise<boolean> {
    if (pending.value || (edge === 'next' ? !hasNext.value : !hasPrev.value)) return false;
    const token = epoch;
    pending.value = edge;
    failed.value = null;
    try {
      const page = await fetchPage(edge === 'next' ? last.value + 1 : first.value - 1);
      if (token !== epoch) return false;
      if (page.rows.length === 0) {
        total.value = page.total;
        return false;
      }
      const next =
        edge === 'next'
          ? [...pages.value, page].slice(-CAPACITY)
          : [page, ...pages.value].slice(0, CAPACITY);
      return await commit(token, next, page.total);
    } catch {
      if (token === epoch) failed.value = edge;
      return false;
    } finally {
      if (token === epoch) pending.value = null;
    }
  }

  return {
    messages,
    hasPrev,
    hasNext,
    pending,
    failed,
    open,
    openLatest,
    reload,
    next: () => move('next'),
    prev: () => move('prev'),
  };
}
