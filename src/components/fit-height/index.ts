import { computed, onActivated, onBeforeUnmount, onMounted, ref, type CSSProperties, type Ref } from 'vue';

/** 最近的滚动容器：独立运行时为窗口（null），嵌入时为 Shell 的滚动层 */
function scrollPort(el: HTMLElement): HTMLElement | null {
  for (let node = el.parentElement; node; node = node.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(node).overflowY)) return node;
  }
  return null;
}

/**
 * 让页面恰好占满所在滚动容器的剩余可视高度。
 * 只认"最近的滚动容器"，不依赖任何 Shell 的结构，独立运行与嵌入 Shell 共用一套算法。
 */
export function useFitHeight(root: Ref<HTMLElement | null>, min = 320) {
  const height = ref(0);
  let observer: ResizeObserver | null = null;
  let frame = 0;

  function measure(): void {
    const el = root.value;
    if (!el) return;
    const port = scrollPort(el);
    const top = el.getBoundingClientRect().top;
    let available: number;
    if (port) {
      const rect = port.getBoundingClientRect();
      const padding = Number.parseFloat(getComputedStyle(port).paddingBottom) || 0;
      // 换算成容器内容坐标，与容器当前滚动位置无关
      const offset = top - rect.top - port.clientTop + port.scrollTop;
      available = port.clientHeight - padding - offset;
    } else {
      available = document.documentElement.clientHeight - (top + window.scrollY);
    }
    // 隐藏（display: none）时量不到，等重新显示后由 ResizeObserver 补测
    if (available > 0) height.value = Math.max(min, Math.floor(available));
  }

  function schedule(): void {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(measure);
  }

  onMounted(() => {
    const el = root.value;
    if (!el) return;
    // 只观察滚动容器，不观察自身，避免高度回写引发循环
    observer = new ResizeObserver(schedule);
    observer.observe(scrollPort(el) ?? document.documentElement);
    measure();
  });
  onActivated(schedule);
  onBeforeUnmount(() => {
    cancelAnimationFrame(frame);
    observer?.disconnect();
  });

  return computed<CSSProperties | undefined>(() =>
    height.value ? { height: `${height.value}px` } : undefined,
  );
}
