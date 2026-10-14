<template>
  <DagCanvas
    :nodes="graph.nodes"
    :edges="visibleEdges"
    :selected-id="selectedId"
    :labels="canvasLabels"
    @select="emit('select', $event)"
  >
    <template #node="{ node, selected }">
      <NodeCard :card="node" :selected="selected" />
    </template>
    <template #toolbar>
      <el-checkbox v-model="directOnly" size="small" border>{{ $t('AGENT_TRACE_DIRECT_ONLY', '只看直接依赖') }}</el-checkbox>
    </template>
  </DagCanvas>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { t } from '@platform/i18n';
import { DagCanvas } from '@/components/dag-canvas';
import NodeCard from './NodeCard.vue';
import { buildGraph } from '../trace';
import type { TraceBundle } from '../type';

/**
 * 任务图：业务节点 + 首尾虚拟节点；冗余依赖默认淡化，可切换为隐藏。
 * 本组件由页面按需加载，vue-flow 与 dagre 随之进入独立分块。
 */
const props = defineProps<{ bundle: TraceBundle; selectedId: string | null }>();
const emit = defineEmits<{ select: [id: string | null] }>();

const directOnly = ref(false);
const graph = computed(() => buildGraph(props.bundle));
const visibleEdges = computed(() => (directOnly.value ? graph.value.edges.filter((e) => !e.faded) : graph.value.edges));

const canvasLabels = computed(() => ({
  fit: t('AGENT_CANVAS_FIT', '适应画布'),
  zoomIn: t('AGENT_CANVAS_ZOOM_IN', '放大'),
  zoomOut: t('AGENT_CANVAS_ZOOM_OUT', '缩小'),
  fullscreen: t('AGENT_CANVAS_FULLSCREEN', '全屏'),
}));
</script>
