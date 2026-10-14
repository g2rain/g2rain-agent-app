<template>
  <div ref="root" class="dag-canvas" :class="{ 'is-fullscreen': fullscreen }">
    <div class="dag-canvas__toolbar">
      <el-button-group size="small">
        <el-button :title="labels.fit" @click="fit">⤢</el-button>
        <el-button :title="labels.zoomOut" @click="zoomOut()">－</el-button>
        <el-button :title="labels.zoomIn" @click="zoomIn()">＋</el-button>
        <el-button :title="labels.fullscreen" @click="toggleFullscreen">⛶</el-button>
      </el-button-group>
      <slot name="toolbar" />
    </div>
    <VueFlow
      :id="flowId"
      :nodes="flowNodes"
      :edges="flowEdges"
      :nodes-draggable="false"
      :nodes-connectable="false"
      :elements-selectable="false"
      :zoom-on-double-click="false"
      :min-zoom="0.3"
      :max-zoom="1.6"
      @node-click="({ node }) => emit('select', node.id)"
      @pane-click="emit('select', null)"
      @node-mouse-enter="({ node }) => (hoverId = node.id)"
      @node-mouse-leave="hoverId = null"
    >
      <template #node-dag="{ id, data }">
        <Handle type="target" :position="targetPosition" class="dag-canvas__handle" />
        <slot name="node" :node="data" :selected="id === selectedId" />
        <Handle type="source" :position="sourcePosition" class="dag-canvas__handle" />
      </template>
    </VueFlow>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, useId, watch } from 'vue';
import { Handle, MarkerType, Position, VueFlow, useVueFlow, type Edge, type Node } from '@vue-flow/core';
import '@vue-flow/core/dist/style.css';
import { edgeKey } from '@shared/graph.util';
import { layoutDag, type DagPositions } from './layout';
import type { DagDirection, DagEdge, DagNode } from './types';

/**
 * 只读的有向无环图画布：dagre 自动布局，支持适应、缩放、全屏、选中与悬停高亮；容器尺寸变化时自动适应。
 * 节点外观完全由 `#node` 插槽决定，组件不感知业务字段。
 *
 * @example
 * <DagCanvas :nodes="nodes" :edges="edges" :selected-id="active" @select="active = $event">
 *   <template #node="{ node, selected }"><NodeCard :node="node" :selected="selected" /></template>
 * </DagCanvas>
 */
const props = withDefaults(
  defineProps<{
    nodes: DagNode<T>[];
    edges: DagEdge[];
    selectedId?: string | null;
    direction?: DagDirection;
    nodeWidth?: number;
    nodeHeight?: number;
    labels?: { fit: string; zoomIn: string; zoomOut: string; fullscreen: string };
  }>(),
  {
    selectedId: null,
    direction: 'LR',
    nodeWidth: 220,
    nodeHeight: 96,
    labels: () => ({ fit: 'Fit', zoomIn: 'Zoom in', zoomOut: 'Zoom out', fullscreen: 'Fullscreen' }),
  },
);

const emit = defineEmits<{ select: [id: string | null] }>();
defineSlots<{ node(props: { node: T; selected: boolean }): unknown; toolbar(): unknown }>();

/** 每个组件实例独立的画布 ID，避免多个 Tab 共享图状态 */
const flowId = `dag-${useId()}`;
const { fitView, zoomIn, zoomOut } = useVueFlow(flowId);

const root = ref<HTMLDivElement>();
const positions = shallowRef<DagPositions>(new Map());
const hoverId = ref<string | null>(null);
const fullscreen = ref(false);

const sourcePosition = computed(() => (props.direction === 'LR' ? Position.Right : Position.Bottom));
const targetPosition = computed(() => (props.direction === 'LR' ? Position.Left : Position.Top));

const flowNodes = computed<Node[]>(() =>
  props.nodes.map((node) => ({
    id: node.id,
    type: 'dag',
    position: positions.value.get(node.id) ?? { x: 0, y: 0 },
    data: node.data,
    width: node.width ?? props.nodeWidth,
    height: node.height ?? props.nodeHeight,
  })),
);

const flowEdges = computed<Edge[]>(() =>
  props.edges.map((edge) => {
    const lit = hoverId.value !== null && (edge.from === hoverId.value || edge.to === hoverId.value);
    return {
      id: edgeKey(edge),
      source: edge.from,
      target: edge.to,
      type: 'smoothstep',
      label: edge.label,
      markerEnd: MarkerType.ArrowClosed,
      class: { 'is-dashed': !!edge.dashed, 'is-faded': !!edge.faded && !lit, 'is-lit': lit },
    };
  }),
);

/** 结构签名：节点与边变化时才重新布局，刷新数据不打乱视口 */
const signature = computed(
  () => `${props.direction}|${props.nodes.map((n) => n.id).join(',')}|${props.edges.map(edgeKey).join(',')}`,
);

let laidOut = '';
async function relayout(): Promise<void> {
  const current = signature.value;
  if (current === laidOut) return;
  positions.value = await layoutDag(props.nodes, props.edges, props.direction, {
    width: props.nodeWidth,
    height: props.nodeHeight,
  });
  laidOut = current;
  await nextTick();
  fit();
}

function fit(): void {
  void fitView({ padding: 0.15, maxZoom: 1 });
}

async function toggleFullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await root.value?.requestFullscreen();
  } catch {
    // 浏览器拒绝全屏时保持原状
  }
}

function onFullscreenChange(): void {
  fullscreen.value = document.fullscreenElement === root.value;
}

/** 容器尺寸变化（窗口缩放、分隔条拖动、全屏切换）后重新适应画布，防抖避免拖动时频繁计算 */
let resizeTimer: ReturnType<typeof setTimeout> | undefined;
const resizeObserver = new ResizeObserver(() => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(fit, 120);
});

watch(signature, () => void relayout());
onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange);
  if (root.value) resizeObserver.observe(root.value);
  void relayout();
});
onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange);
  resizeObserver.disconnect();
  clearTimeout(resizeTimer);
});
</script>

<style scoped>
.dag-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--g2-bg-page);
  background-image: radial-gradient(var(--g2-border-color-light) 1px, transparent 1px);
  background-size: 16px 16px;
}
.dag-canvas.is-fullscreen { background-color: var(--g2-bg-page); }
.dag-canvas__toolbar {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 5;
  display: flex;
  gap: 8px;
}
.dag-canvas__handle { opacity: 0; pointer-events: none; }
.dag-canvas :deep(.vue-flow__node-dag) { cursor: pointer; }
.dag-canvas :deep(.vue-flow__edge-path) { stroke: var(--g2-text-placeholder); stroke-width: 1.5; }
.dag-canvas :deep(.vue-flow__edge.is-dashed .vue-flow__edge-path) { stroke-dasharray: 5 4; }
.dag-canvas :deep(.vue-flow__edge.is-faded) { opacity: 0.35; }
.dag-canvas :deep(.vue-flow__edge.is-lit .vue-flow__edge-path) { stroke: var(--g2-color-primary); stroke-width: 2; }
.dag-canvas :deep(.vue-flow__arrowhead polyline) { stroke: var(--g2-text-placeholder); fill: var(--g2-text-placeholder); }
</style>
