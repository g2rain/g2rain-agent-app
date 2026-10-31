<template>
  <div ref="rootRef" class="conversation-detail" :class="{ 'is-embed': embed }" :style="fitStyle">
    <el-breadcrumb v-if="!embed" class="conversation-detail__crumb" separator="/">
      <el-breadcrumb-item v-if="hasRoute(CONVERSATION_PATH)" :to="{ path: CONVERSATION_PATH }">
        {{ $t('AGENT_MENU_CONVERSATION', '会话观测') }}
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t('AGENT_PAGE_CONVERSATION_DETAIL', '会话详情') }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-skeleton v-if="opening" :rows="8" animated />

    <el-result v-else-if="failure" icon="error" :sub-title="failure">
      <template #extra><el-button type="primary" @click="open">{{ $t('G2_BTN_RETRY', '重试') }}</el-button></template>
    </el-result>

    <el-empty v-else-if="!conversation" :description="$t('AGENT_CONVERSATION_NOT_FOUND', '没有找到这个会话')" />

    <template v-else>
      <header class="conversation-detail__head">
        <h2 class="conversation-detail__title">{{ conversation.title || $t('AGENT_CONVERSATION_UNTITLED', '未命名会话') }}</h2>
        <div class="conversation-detail__meta">
          <CopyText :text="conversation.conversationId" :length="8" :copied-text="$t('G2_MSG_COPIED', '已复制')" />
          <span>{{ $t('G2_FIELD_USER', '用户') }} {{ conversation.userId }}</span>
          <span v-if="span">{{ span }}</span>
          <span class="conversation-detail__spacer" />
          <div class="conversation-detail__actions">
            <el-button v-if="!embed" size="small" @click="goBack">{{ $t('G2_BTN_BACK', '返回') }}</el-button>
            <el-button size="small" :loading="refreshing" @click="refresh">{{ $t('G2_BTN_REFRESH', '刷新') }}</el-button>
          </div>
        </div>
        <div v-if="statusCounts.length > 0" class="conversation-detail__filters">
          <button
            v-for="item in statusCounts"
            :key="item.status"
            type="button"
            class="conversation-detail__chip"
            :class="{ 'is-active': statusFilter === item.status }"
            @click="statusFilter = statusFilter === item.status ? null : item.status"
          >
            <StatusDot :tone="describeStatus(item.status).tone" :label="`${describeStatus(item.status).label} ${item.count}`" />
          </button>
        </div>
      </header>

      <div class="conversation-detail__body">
        <div class="conversation-detail__stream">
          <section ref="scrollerRef" class="conversation-detail__timeline" @scroll.passive="onScroll">
            <div class="conversation-detail__edge">
              <template v-if="win.hasPrev.value">
                <span v-if="win.pending.value === 'prev'" class="conversation-detail__loading">{{ $t('G2_MSG_LOADING', '加载中…') }}</span>
                <el-button v-else-if="win.failed.value === 'prev'" link type="primary" @click="move('prev')">
                  {{ $t('AGENT_CONVERSATION_LOAD_RETRY', '加载失败，点击重试') }}
                </el-button>
                <span v-else>{{ $t('AGENT_CONVERSATION_MORE_EARLIER', '继续上滑加载更早的消息') }}</span>
              </template>
              <span v-else class="conversation-detail__boundary">
                {{ $t('AGENT_CONVERSATION_START', '会话开始') }} · {{ plainTime(conversation.createTime) }}
              </span>
            </div>

            <TurnList
              :turns="visibleTurns"
              :continued="win.hasPrev.value"
              :resumes="resumes"
              :write-tasks="writeTasks"
              :selected-task-id="selectedTaskId"
              :selected-trace-id="selectedTraceId"
              :locale="locale"
              @select="selectTask"
              @trace="selectTrace"
            />

            <div class="conversation-detail__edge">
              <template v-if="win.hasNext.value">
                <span v-if="win.pending.value === 'next'" class="conversation-detail__loading">{{ $t('G2_MSG_LOADING', '加载中…') }}</span>
                <el-button v-else-if="win.failed.value === 'next'" link type="primary" @click="move('next')">
                  {{ $t('AGENT_CONVERSATION_LOAD_RETRY', '加载失败，点击重试') }}
                </el-button>
                <span v-else>{{ $t('AGENT_CONVERSATION_MORE_LATER', '继续下滑加载更多') }}</span>
              </template>
              <span v-else-if="conversation.activeTaskId" class="conversation-detail__boundary">
                {{ $t('AGENT_CONVERSATION_ONGOING', '会话进行中') }}
                <el-button link type="primary" size="small" :loading="refreshing" @click="refresh">{{ $t('G2_BTN_REFRESH', '刷新') }}</el-button>
              </span>
              <span v-else class="conversation-detail__boundary">
                {{ $t('AGENT_CONVERSATION_END', '已是最新消息') }} · {{ plainTime(conversation.lastMessageTime) }}
              </span>
            </div>
          </section>

          <div class="conversation-detail__jumps">
            <el-tooltip v-if="!atTop" :content="$t('AGENT_CONVERSATION_TO_START', '回到开头')" placement="left">
              <el-button circle :icon="Top" :loading="jumping === 'start'" @click="jumpStart" />
            </el-tooltip>
            <el-tooltip v-if="!atBottom" :content="$t('AGENT_CONVERSATION_TO_LATEST', '跳到最新')" placement="left">
              <el-button circle :icon="Bottom" :loading="jumping === 'latest'" @click="jumpLatest" />
            </el-tooltip>
          </div>
        </div>

        <aside class="conversation-detail__aside">
          <ProgressSummary
            v-if="selectedTraceId"
            :trace-id="selectedTraceId"
            :steps="selectedProgress"
            :error="progress[selectedTraceId] === 'error'"
            @retry="selectTrace(selectedTraceId, true)"
          />
          <TaskSummary
            v-else-if="selectedTask"
            :task="selectedTask"
            :nodes="selectedNodes"
            :error="selectedDetail === 'error'"
            :resumes="resumes[selectedTask.taskId] ?? []"
            :embed="embed"
            @retry="selectTask(selectedTask.taskId, true)"
          />
          <el-empty v-else :image-size="64" :description="$t('AGENT_CONVERSATION_NO_TASK', '这里还没有任务')" />
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, shallowRef, watch } from 'vue';
import { Bottom, Top } from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router';
import { t } from '@platform/i18n';
import { useLocaleStore } from '@platform/stores/locale.store';
import { CopyText, StatusDot, useFitHeight } from '@/components';
import { EMPTY, MessageRole, ResumeAction, describeStatus, formatClock } from '@runtime/console';
import TurnList from './components/TurnList.vue';
import TaskSummary from './components/TaskSummary.vue';
import ProgressSummary from './components/ProgressSummary.vue';
import { ConversationDetailApi } from './api';
import { useMessageWindow } from './message-window';
import { buildTurns } from './turns';
import type {
  ChatConversationVo,
  ChatMessageVo,
  ProgressDetail,
  TaskDetail,
  TaskInstanceVo,
  TaskResumeRecordVo,
} from './type';

const CONVERSATION_PATH = '/chat_conversation';
/** 距离滚动边界多少像素时加载相邻页 */
const EDGE_GAP = 120;

const route = useRoute();
const router = useRouter();
const localeStore = useLocaleStore();

const conversationId = computed(() => (typeof route.query.conversationId === 'string' ? route.query.conversationId : ''));
const embed = computed(() => route.query.embed === '1');
const locale = computed(() => localeStore.locale || 'zh-CN');

/** 页面占满所在滚动容器的剩余高度，时间线在页面内部滚动 */
const rootRef = ref<HTMLElement | null>(null);
const fitStyle = useFitHeight(rootRef);

const conversation = shallowRef<ChatConversationVo | null>(null);
const opening = ref(false);
const refreshing = ref(false);
const failure = ref('');

const win = useMessageWindow((num, size) => ConversationDetailApi.messages(conversationId.value, num, size), {
  prepare: loadTasks,
});

// ---------------------------------------------------------------- 任务（跟随消息窗口）

const tasks = shallowRef<TaskInstanceVo[]>([]);
const resumes = shallowRef<Record<string, TaskResumeRecordVo[]>>({});
const details = reactive<Record<string, TaskDetail>>({});
const selectedTaskId = ref<string | null>(null);
const statusFilter = ref<string | null>(null);
let taskSeq = 0;

const turns = computed(() => buildTurns(win.messages.value, tasks.value));
const visibleTurns = computed(() =>
  statusFilter.value ? turns.value.filter((turn) => turn.tasks.some((task) => task.status === statusFilter.value)) : turns.value,
);

/** 窗口内按阅读顺序排列的任务 */
const orderedTasks = computed(() => turns.value.flatMap((turn) => turn.tasks));

const statusCounts = computed(() => {
  const counts = new Map<string, number>();
  for (const task of orderedTasks.value) counts.set(task.status, (counts.get(task.status) ?? 0) + 1);
  return [...counts].map(([status, count]) => ({ status, count }));
});

/** 有确认执行记录的任务视为发生过写操作 */
const writeTasks = computed(() => {
  const ids = new Set<string>();
  for (const [taskId, rows] of Object.entries(resumes.value)) {
    if (rows.some((row) => row.resumeAction === ResumeAction.CONFIRM)) ids.add(taskId);
  }
  return ids;
});

const selectedDetail = computed(() => (selectedTaskId.value ? details[selectedTaskId.value] : undefined));
const selectedTask = computed(() => {
  const summary = orderedTasks.value.find((task) => task.taskId === selectedTaskId.value);
  if (!summary) return null;
  const detail = selectedDetail.value;
  return detail && detail !== 'error' && detail.task ? detail.task : summary;
});
const selectedNodes = computed(() => {
  const detail = selectedDetail.value;
  return detail && detail !== 'error' ? detail.nodes : null;
});

/**
 * 按新窗口里的用户消息取任务与恢复记录，在窗口生效前完成，消息与任务同一次渲染出现。
 * 失败时保留上一次结果并提示，不阻断消息窗口。
 */
async function loadTasks(messages: ChatMessageVo[]): Promise<void> {
  const seq = ++taskSeq;
  const sourceIds = messages.filter((m) => m.role === MessageRole.USER).map((m) => m.messageId);
  try {
    const nextTasks = await ConversationDetailApi.tasks(conversationId.value, sourceIds);
    const nextResumes = await ConversationDetailApi.resumes(nextTasks.map((task) => task.taskId));
    if (seq !== taskSeq) return;
    tasks.value = nextTasks;
    resumes.value = groupByTask(nextResumes);
    pruneDetails();
  } catch {
    // 请求失败已由 http 层统一提示
  }
}

/** 选中的任务（或执行过程）移出窗口后，改选窗口内的第一个（或最后一个）任务 */
function ensureSelection(prefer: 'first' | 'last' = 'first'): void {
  if (selectedTraceId.value && traceInWindow(selectedTraceId.value)) return;
  selectedTraceId.value = null;
  pruneProgress();
  if (orderedTasks.value.some((task) => task.taskId === selectedTaskId.value)) return;
  const list = orderedTasks.value;
  const target = prefer === 'last' ? list[list.length - 1] : list[0];
  selectedTaskId.value = null;
  if (target) void selectTask(target.taskId);
}

function groupByTask(rows: TaskResumeRecordVo[]): Record<string, TaskResumeRecordVo[]> {
  const groups: Record<string, TaskResumeRecordVo[]> = {};
  for (const row of rows) (groups[row.taskId] ??= []).push(row);
  return groups;
}

/** 窗口外的任务明细不再保留 */
function pruneDetails(): void {
  const alive = new Set(tasks.value.map((task) => task.taskId));
  for (const taskId of Object.keys(details)) if (!alive.has(taskId)) delete details[taskId];
}

/** 选中任务并按需加载明细；结果按任务存放，快速切换不会串台 */
async function selectTask(taskId: string, force = false): Promise<void> {
  selectedTraceId.value = null;
  selectedTaskId.value = taskId;
  const cached = details[taskId];
  if (cached && cached !== 'error' && !force) return;
  delete details[taskId];
  try {
    const [task, nodes] = await Promise.all([ConversationDetailApi.task(taskId), ConversationDetailApi.nodes(taskId)]);
    if (inWindow(taskId)) details[taskId] = { task, nodes };
  } catch {
    if (inWindow(taskId)) details[taskId] = 'error';
  }
}

function inWindow(taskId: string): boolean {
  return tasks.value.some((task) => task.taskId === taskId);
}

// ---------------------------------------------------------------- 执行过程（按轮次追踪号按需加载）

const progress = reactive<Record<string, ProgressDetail>>({});
const selectedTraceId = ref<string | null>(null);

const selectedProgress = computed(() => {
  const detail = selectedTraceId.value ? progress[selectedTraceId.value] : undefined;
  return detail && detail !== 'error' ? detail : null;
});

/** 选中一轮的执行过程，与选中任务互斥；结果按追踪号存放 */
async function selectTrace(traceId: string, force = false): Promise<void> {
  selectedTaskId.value = null;
  selectedTraceId.value = traceId;
  const cached = progress[traceId];
  if (cached && cached !== 'error' && !force) return;
  delete progress[traceId];
  try {
    const steps = await ConversationDetailApi.progress(traceId);
    if (traceInWindow(traceId)) progress[traceId] = steps;
  } catch {
    if (traceInWindow(traceId)) progress[traceId] = 'error';
  }
}

function traceInWindow(traceId: string): boolean {
  return win.messages.value.some((message) => message.traceId === traceId);
}

/** 窗口外的执行过程不再保留 */
function pruneProgress(): void {
  for (const traceId of Object.keys(progress)) if (!traceInWindow(traceId)) delete progress[traceId];
}

// ---------------------------------------------------------------- 加载与刷新

let openSeq = 0;

/** 打开会话：会话信息与第一页消息；失败时整页显示错误 */
async function open(): Promise<void> {
  const seq = ++openSeq;
  lastTop = 0;
  conversation.value = null;
  tasks.value = [];
  resumes.value = {};
  selectedTaskId.value = null;
  selectedTraceId.value = null;
  statusFilter.value = null;
  Object.keys(details).forEach((key) => delete details[key]);
  Object.keys(progress).forEach((key) => delete progress[key]);
  if (!conversationId.value) return;

  opening.value = true;
  failure.value = '';
  try {
    const [found] = await Promise.all([ConversationDetailApi.conversation(conversationId.value), win.open()]);
    if (seq !== openSeq) return;
    conversation.value = found;
  } catch (error: unknown) {
    if (seq === openSeq) failure.value = messageOf(error);
  } finally {
    if (seq === openSeq) opening.value = false;
  }
  if (seq !== openSeq || !conversation.value) return;
  ensureSelection();
  await nextTick();
  fillViewport();
}

/** 原位刷新当前窗口；失败时只提示，保留已有内容与选中任务 */
async function refresh(): Promise<void> {
  if (refreshing.value || !conversation.value) return;
  refreshing.value = true;
  const anchors = captureAnchors();
  try {
    const [found] = await Promise.all([ConversationDetailApi.conversation(conversationId.value), win.reload()]);
    if (found) conversation.value = found;
    ensureSelection();
    if (selectedTraceId.value) await selectTrace(selectedTraceId.value, true);
    else if (selectedTaskId.value) await selectTask(selectedTaskId.value, true);
    await nextTick();
    restoreAnchors(anchors);
    updateEdges();
  } catch {
    // 请求失败已由 http 层统一提示
  } finally {
    refreshing.value = false;
  }
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载失败');
}

// ---------------------------------------------------------------- 滚动窗口

const scrollerRef = ref<HTMLElement | null>(null);
let lastTop = 0;
let adjusting = false;

function onScroll(): void {
  const el = scrollerRef.value;
  if (!el) return;
  const down = el.scrollTop > lastTop;
  lastTop = el.scrollTop;
  updateEdges();
  if (adjusting) return;
  if (down && el.scrollHeight - el.scrollTop - el.clientHeight < EDGE_GAP) void move('next');
  else if (!down && el.scrollTop < EDGE_GAP) void move('prev');
}

/** 窗口移动一页，并保持视口里的内容不跳动 */
async function move(edge: 'prev' | 'next'): Promise<void> {
  const anchors = captureAnchors();
  const moved = await (edge === 'next' ? win.next() : win.prev());
  if (!moved) return;
  await nextTick();
  restoreAnchors(anchors);
  ensureSelection();
  updateEdges();
}

interface Anchor {
  mid: string;
  offset: number;
}

/** 记录视口内可见消息相对视口顶部的位置，作为移动后的定位锚点 */
function captureAnchors(): Anchor[] {
  const el = scrollerRef.value;
  if (!el) return [];
  const view = el.getBoundingClientRect();
  const anchors: Anchor[] = [];
  for (const node of el.querySelectorAll<HTMLElement>('[data-mid]')) {
    const rect = node.getBoundingClientRect();
    if (rect.bottom > view.top && rect.top < view.bottom) anchors.push({ mid: node.dataset.mid!, offset: rect.top - view.top });
  }
  return anchors;
}

/** 用仍在窗口内的第一个锚点修正滚动位置 */
function restoreAnchors(anchors: Anchor[]): void {
  const el = scrollerRef.value;
  if (!el) return;
  for (const anchor of anchors) {
    const node = el.querySelector<HTMLElement>(`[data-mid="${CSS.escape(anchor.mid)}"]`);
    if (!node) continue;
    adjusting = true;
    el.scrollTop += node.getBoundingClientRect().top - el.getBoundingClientRect().top - anchor.offset;
    lastTop = el.scrollTop;
    requestAnimationFrame(() => (adjusting = false));
    return;
  }
}

// ---------------------------------------------------------------- 回到开头 / 跳到最新

/** 视口是否已在整个会话的最顶部、最底部；决定两个跳转按钮是否显示 */
const atTop = ref(true);
const atBottom = ref(true);
const jumping = ref<'start' | 'latest' | null>(null);

function updateEdges(): void {
  const el = scrollerRef.value;
  if (!el) return;
  atTop.value = !win.hasPrev.value && el.scrollTop < 8;
  atBottom.value = !win.hasNext.value && el.scrollHeight - el.scrollTop - el.clientHeight < 8;
}

/** 窗口不在开头时重新打开第一页，再滚到顶部 */
async function jumpStart(): Promise<void> {
  await jump('start', () => win.open(1), () => 0);
}

/** 窗口不在末尾时打开最后两页，再滚到底部，并选中最新的任务 */
async function jumpLatest(): Promise<void> {
  await jump('latest', () => win.openLatest(), (el) => el.scrollHeight);
}

async function jump(kind: 'start' | 'latest', reopen: () => Promise<void>, target: (el: HTMLElement) => number): Promise<void> {
  const el = scrollerRef.value;
  if (!el || jumping.value) return;
  const needsReopen = kind === 'start' ? win.hasPrev.value : win.hasNext.value;
  jumping.value = kind;
  try {
    if (needsReopen) {
      await reopen();
      await nextTick();
      adjusting = true;
      el.scrollTop = target(el);
      lastTop = el.scrollTop;
      requestAnimationFrame(() => (adjusting = false));
    } else {
      el.scrollTo({ top: target(el), behavior: 'smooth' });
    }
    if (needsReopen) ensureSelection(kind === 'latest' ? 'last' : 'first');
  } finally {
    jumping.value = null;
    await nextTick();
    updateEdges();
  }
}

/** 首屏内容不足一屏时补取下一页，保证可以滚动 */
function fillViewport(): void {
  const el = scrollerRef.value;
  if (el && el.scrollHeight <= el.clientHeight && win.hasNext.value) void move('next');
  updateEdges();
}

// ---------------------------------------------------------------- 其他

/** 会话起止时间 */
const span = computed(() => {
  const start = plainTime(conversation.value?.createTime);
  const end = plainTime(conversation.value?.lastMessageTime);
  if (start === EMPTY) return '';
  if (end === EMPTY) return start;
  return start.slice(0, 10) === end.slice(0, 10) ? `${start} – ${formatClock(end)}` : `${start} – ${end}`;
});

function plainTime(time: string | null | undefined): string {
  return time ? time.replace('T', ' ').slice(0, 19) : EMPTY;
}

function hasRoute(path: string): boolean {
  return router.resolve(path).matched.length > 0;
}

function goBack(): void {
  void router.push({ path: CONVERSATION_PATH });
}

watch(conversationId, () => void open(), { immediate: true });
</script>

<style scoped>
.conversation-detail {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 16px 24px 24px;
  overflow: hidden;
}
.conversation-detail.is-embed { padding: 12px 16px; }
.conversation-detail__crumb { flex: none; margin-bottom: 12px; }
.conversation-detail__head { flex: none; margin-bottom: 16px; }
.conversation-detail__title { margin: 0 0 8px; font-size: 18px; font-weight: 600; color: var(--g2-text-primary); }
.conversation-detail__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.conversation-detail__spacer { flex: 1; }
.conversation-detail__actions { display: inline-flex; align-items: center; gap: 8px; }
.conversation-detail__actions :deep(.el-button + .el-button) { margin-left: 0; }
.conversation-detail__filters { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.conversation-detail__chip {
  padding: 4px 10px;
  border: 1px solid var(--g2-border-color-light);
  border-radius: 14px;
  background: var(--g2-bg-container);
  cursor: pointer;
}
.conversation-detail__chip.is-active { border-color: var(--g2-color-primary); }
.conversation-detail__body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
}
.conversation-detail__stream { position: relative; min-height: 0; }
.conversation-detail__stream > .conversation-detail__timeline { height: 100%; box-sizing: border-box; }
.conversation-detail__jumps {
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.conversation-detail__jumps :deep(.el-button + .el-button) { margin-left: 0; }
.conversation-detail__jumps :deep(.el-button) { box-shadow: var(--g2-shadow-sm); }
.conversation-detail__timeline,
.conversation-detail__aside {
  min-height: 0;
  overflow: auto;
  border: 1px solid var(--g2-border-color-light);
  border-radius: var(--g2-border-radius-lg);
  background: var(--g2-bg-container);
}
.conversation-detail__timeline { padding: 4px 20px; overscroll-behavior: contain; }
.conversation-detail__aside { padding: 16px 20px; }
.conversation-detail__edge {
  padding: 12px 0;
  text-align: center;
  font-size: var(--g2-font-size-sm);
  color: var(--g2-text-placeholder);
}
.conversation-detail__boundary { display: inline-flex; align-items: center; gap: 6px; }
.conversation-detail__loading { color: var(--g2-text-secondary); }
@media (max-width: 1100px) {
  .conversation-detail__body { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); }
  .conversation-detail__aside { order: -1; max-height: 240px; }
}
</style>
