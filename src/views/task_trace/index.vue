<template>
  <div class="task-trace" :class="{ 'is-embed': embed }">
    <el-breadcrumb v-if="!embed" class="task-trace__crumb" separator="/">
      <el-breadcrumb-item v-if="hasRoute(CONVERSATION_PATH)" :to="{ path: CONVERSATION_PATH }">
        {{ $t('AGENT_MENU_CONVERSATION', '会话观测') }}
      </el-breadcrumb-item>
      <el-breadcrumb-item
        v-if="bundle && hasRoute(CONVERSATION_DETAIL_PATH)"
        :to="{ path: CONVERSATION_DETAIL_PATH, query: { conversationId: bundle.task.conversationId } }"
      >
        {{ $t('AGENT_PAGE_CONVERSATION_DETAIL', '会话详情') }}
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t('AGENT_PAGE_TASK_TRACE', '执行追踪') }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-skeleton v-if="loading && !bundle" :rows="8" animated />

    <el-result v-else-if="failure" icon="error" :sub-title="failure">
      <template #extra><el-button type="primary" @click="load()">{{ $t('G2_BTN_RETRY', '重试') }}</el-button></template>
    </el-result>

    <el-empty v-else-if="!bundle" :description="$t('AGENT_TRACE_NOT_FOUND', '没有找到这个任务')" />

    <template v-else>
      <header class="task-trace__head">
        <h2 class="task-trace__goal">{{ bundle.task.goalSummary || bundle.task.request || bundle.task.taskId }}</h2>
        <div class="task-trace__meta">
          <StatusDot v-bind="describeStatus(bundle.task.status)" />
          <span v-if="agentName">{{ agentName }}</span>
          <span>{{ formatDuration(elapsed(bundle.task.startedTime, bundle.task.finishedTime)) }}</span>
          <span>
            {{ $t('AGENT_TRACE_CONVERSATION', '会话') }}
            <CopyText :text="bundle.task.conversationId" :length="8" :copied-text="copiedText" />
          </span>
          <span v-if="bundle.task.traceId">
            trace <CopyText :text="bundle.task.traceId" :length="8" :copied-text="copiedText" />
          </span>
          <span class="task-trace__spacer" />
          <div class="task-trace__actions">
            <el-button v-if="!embed" size="small" @click="goBack">{{ $t('G2_BTN_BACK', '返回') }}</el-button>
            <el-switch v-if="!terminal" v-model="autoRefresh" size="small" :active-text="$t('AGENT_TRACE_AUTO_REFRESH', '自动刷新')" />
            <el-button size="small" :loading="loading" @click="load(true)">{{ $t('G2_BTN_REFRESH', '刷新') }}</el-button>
          </div>
        </div>
        <div class="task-trace__metrics">{{ metricsText }}</div>
        <el-alert v-if="showFinalAlert" class="task-trace__alert" type="error" :closable="false" :title="bundle.task.finalMessage ?? ''" show-icon />
      </header>

      <section class="task-trace__graph" :style="{ height: `${graphHeight}px` }">
        <TaskGraph :bundle="bundle" :selected-id="selectedId" @select="select" />
      </section>
      <div class="task-trace__splitter" @pointerdown="startResize" />

      <section class="task-trace__detail">
        <RequestDetail v-if="selectedId === REQUEST_ID" :task="bundle.task" />
        <NodeDetail
          v-else-if="selectedNode"
          v-model:tab="nodeTab"
          :node="selectedNode"
          :nodes="bundle.nodes"
          :edges="bundle.edges"
          :calls="selectedCalls"
          :messages="selectedMessages"
          :locale="locale"
          @open-call="openCall = $event"
        />
        <TaskDetail v-else :bundle="bundle" :agent-name="agentName" :locale="locale" />
      </section>

      <ToolCallDetail :call="openCall" @close="openCall = null" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { t } from '@platform/i18n';
import { useLocaleStore } from '@platform/stores/locale.store';
import { CopyText, StatusDot } from '@/components';
import {
  SideEffect,
  TERMINAL_TASK_STATUSES,
  TaskStatus,
  describeStatus,
  elapsed,
  formatDuration,
} from '@runtime/console';
import NodeDetail from './components/NodeDetail.vue';
import TaskDetail from './components/TaskDetail.vue';
import RequestDetail from './components/RequestDetail.vue';
import ToolCallDetail from './components/ToolCallDetail.vue';
import { TaskTraceApi } from './api';
import { REQUEST_ID, defaultSelection, isReused } from './trace';
import type { ToolCallRecordVo, TraceBundle } from './type';

const TaskGraph = defineAsyncComponent(() => import('./components/TaskGraph.vue'));

const CONVERSATION_PATH = '/chat_conversation';
const CONVERSATION_DETAIL_PATH = '/conversation_detail';
const REFRESH_INTERVAL = 5000;
const GRAPH_HEIGHT_KEY = 'g2rain.agent.trace.graphHeight';
const GRAPH_HEIGHT = { min: 220, max: 560, initial: 320 };

const route = useRoute();
const router = useRouter();
const localeStore = useLocaleStore();

const taskId = computed(() => (typeof route.query.taskId === 'string' ? route.query.taskId : ''));
const embed = computed(() => route.query.embed === '1');
const locale = computed(() => localeStore.locale || 'zh-CN');
const copiedText = computed(() => t('AGENT_COPIED', '已复制'));

const bundle = ref<TraceBundle | null>(null);
const agentName = ref('');
const loading = ref(false);
const failure = ref('');
const selectedId = ref<string | null>(null);
const nodeTab = ref('timeline');
const openCall = ref<ToolCallRecordVo | null>(null);
const autoRefresh = ref(false);

const terminal = computed(() => !!bundle.value && TERMINAL_TASK_STATUSES.has(bundle.value.task.status));
const showFinalAlert = computed(
  () =>
    !!bundle.value?.task.finalMessage &&
    (bundle.value.task.status === TaskStatus.FAILED || bundle.value.task.status === TaskStatus.CANCELED),
);

const selectedNode = computed(() => bundle.value?.nodes.find((n) => n.nodeId === selectedId.value) ?? null);
const selectedCalls = computed(() => bundle.value?.calls.filter((c) => c.nodeId === selectedId.value) ?? []);
const selectedMessages = computed(() => bundle.value?.messages.filter((m) => m.nodeId === selectedId.value) ?? []);

const metricsText = computed(() => {
  if (!bundle.value) return '';
  const calls = bundle.value.calls.filter((c) => !isReused(c));
  return t(
    'AGENT_TRACE_METRICS',
    {
      steps: bundle.value.nodes.length,
      calls: calls.length,
      writes: calls.filter((c) => c.sideEffect === SideEffect.WRITE).length,
      approvals: bundle.value.resumes.length,
    },
    '{steps} 个步骤 · {calls} 次调用（写 {writes}） · {approvals} 次确认',
  );
});

function hasRoute(path: string): boolean {
  return router.resolve(path).matched.length > 0;
}

function goBack(): void {
  const conversationId = bundle.value?.task.conversationId;
  if (conversationId) {
    void router.push({ path: CONVERSATION_DETAIL_PATH, query: { conversationId } });
    return;
  }
  void router.push({ path: CONVERSATION_PATH });
}

/** 加载追踪数据；silent 为 true 时保留当前选中与视口（刷新） */
async function load(silent = false): Promise<void> {
  if (!taskId.value) {
    bundle.value = null;
    return;
  }
  loading.value = true;
  failure.value = '';
  try {
    const next = await TaskTraceApi.load(taskId.value);
    const keep = silent && next && selectedId.value;
    bundle.value = next;
    if (next && !keep) selectedId.value = defaultSelection(next);
    if (next?.task.agentId && !agentName.value) {
      agentName.value = await TaskTraceApi.agentName(next.task.agentId).catch(() => '');
    }
  } catch (error: unknown) {
    failure.value = error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载失败');
  } finally {
    loading.value = false;
  }
}

function select(id: string | null): void {
  selectedId.value = id;
}

// ---------------------------------------------------------------- 自动刷新

let timer: ReturnType<typeof setInterval> | undefined;

function stopRefresh(): void {
  clearInterval(timer);
  timer = undefined;
}

watch([autoRefresh, terminal], ([enabled, done]) => {
  stopRefresh();
  if (enabled && !done) {
    timer = setInterval(() => {
      if (document.visibilityState === 'visible' && !loading.value) void load(true);
    }, REFRESH_INTERVAL);
  }
});

// ---------------------------------------------------------------- 图区高度

function readHeight(): number {
  try {
    const saved = Number(localStorage.getItem(GRAPH_HEIGHT_KEY));
    return saved >= GRAPH_HEIGHT.min && saved <= GRAPH_HEIGHT.max ? saved : GRAPH_HEIGHT.initial;
  } catch {
    return GRAPH_HEIGHT.initial;
  }
}

const graphHeight = ref(readHeight());

function startResize(event: PointerEvent): void {
  const startY = event.clientY;
  const startHeight = graphHeight.value;
  const move = (e: PointerEvent) => {
    graphHeight.value = Math.min(GRAPH_HEIGHT.max, Math.max(GRAPH_HEIGHT.min, startHeight + e.clientY - startY));
  };
  const up = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    try {
      localStorage.setItem(GRAPH_HEIGHT_KEY, String(graphHeight.value));
    } catch {
      // 存储不可用时只在本次会话内生效
    }
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
}

watch(taskId, () => {
  agentName.value = '';
  autoRefresh.value = false;
  void load();
}, { immediate: true });

onBeforeUnmount(stopRefresh);
</script>

<style scoped>
.task-trace { display: flex; flex-direction: column; padding: 16px 24px 24px; min-width: 0; }
.task-trace.is-embed { padding: 12px 16px; }
.task-trace__crumb { margin-bottom: 12px; }
.task-trace__head { margin-bottom: 16px; }
.task-trace__goal { margin: 0 0 8px; font-size: 18px; font-weight: 600; color: var(--g2-text-primary); line-height: 1.4; }
.task-trace__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.task-trace__spacer { flex: 1; }
.task-trace__actions { display: inline-flex; align-items: center; gap: 8px; }
.task-trace__actions :deep(.el-button + .el-button) { margin-left: 0; }
.task-trace__metrics { margin-top: 6px; color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.task-trace__alert { margin-top: 12px; }
.task-trace__graph {
  border: 1px solid var(--g2-border-color-light);
  border-radius: var(--g2-border-radius-lg);
  overflow: hidden;
}
.task-trace__splitter {
  height: 12px;
  cursor: row-resize;
  position: relative;
}
.task-trace__splitter::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 5px;
  width: 40px;
  height: 3px;
  margin-left: -20px;
  border-radius: 2px;
  background: var(--g2-border-color);
}
.task-trace__detail {
  padding: 16px 20px;
  border: 1px solid var(--g2-border-color-light);
  border-radius: var(--g2-border-radius-lg);
  background: var(--g2-bg-container);
}
</style>
