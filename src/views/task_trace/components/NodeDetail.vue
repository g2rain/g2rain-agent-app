<template>
  <div class="node-detail">
    <div class="node-detail__head">
      <StatusDot v-bind="describeStatus(node.status)" />
      <span class="node-detail__title">{{ node.title || node.nodeId }}</span>
      <span class="node-detail__meta">
        <code>{{ node.skillKey || EMPTY }}</code>
        <template v-if="node.target"> · {{ $t('AGENT_TRACE_TARGET', '目标') }} <code>{{ node.target }}</code></template>
        · {{ $t('AGENT_TRACE_ROUNDS', { n: state.rounds ?? 0 }, '{n} 轮') }}
        · {{ formatDuration(elapsed(node.startedTime, node.finishedTime)) }}
      </span>
    </div>

    <el-tabs v-model="tab">
      <el-tab-pane :label="$t('AGENT_TRACE_TAB_OVERVIEW', '概要')" name="overview">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item :label="$t('AGENT_TRACE_OBJECTIVE', '目标')">{{ node.objective || EMPTY }}</el-descriptions-item>
          <el-descriptions-item :label="$t('AGENT_TRACE_CONCLUSION', '结论')">
            <MarkdownViewer v-if="node.result" :content="node.result" :locale="locale" />
            <span v-else>{{ EMPTY }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="node.errorCode || node.errorMessage" :label="$t('AGENT_TRACE_ERROR', '错误')">
            <span class="node-detail__error">{{ node.errorCode }} {{ node.errorMessage }}</span>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('AGENT_TRACE_DEPENDS', '依赖步骤')">{{ dependsText }}</el-descriptions-item>
          <el-descriptions-item :label="$t('AGENT_TRACE_TIME', '起止时间')">
            {{ formatClock(node.startedTime) }} – {{ formatClock(node.finishedTime) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <el-tab-pane :label="$t('AGENT_TRACE_TAB_TIMELINE', '执行轨迹')" name="timeline">
        <ActionTimeline :steps="timeline" @open-call="emit('open-call', $event)" />
      </el-tab-pane>

      <el-tab-pane :label="`${$t('AGENT_TRACE_TAB_CALLS', '工具调用')} ${calls.length}`" name="calls">
        <el-table :data="calls" size="small" @row-click="(row: ToolCallRecordVo) => emit('open-call', row)">
          <el-table-column :label="$t('AGENT_TRACE_ROUND_SHORT', '轮次')" prop="round" width="64" />
          <el-table-column :label="$t('AGENT_TRACE_TOOL', '工具')" min-width="220">
            <template #default="{ row }">
              <code>{{ row.toolName }}</code>
              <span v-if="row.sideEffect === SideEffect.WRITE" class="node-detail__write">{{ $t('AGENT_TRACE_WRITE', '写') }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('G2_FIELD_RESULT', '结果')" width="140">
            <template #default="{ row }">
              <span v-if="isReused(row)" class="node-detail__muted">{{ $t('AGENT_TRACE_OUTCOME_REUSED', '复用') }}</span>
              <StatusDot v-else v-bind="describeStatus(row.callStatus)" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('G2_FIELD_DURATION', '耗时')" width="100">
            <template #default="{ row }">{{ formatDuration(row.durationMs) }}</template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane :label="$t('AGENT_TRACE_TAB_SCRATCH', '便签')" name="scratch">
        <el-empty v-if="scratchKeys.length === 0" :image-size="64" :description="$t('AGENT_TRACE_NO_SCRATCH', '没有写入便签')" />
        <el-descriptions v-else :column="1" border size="small">
          <el-descriptions-item v-for="key in scratchKeys" :key="key" :label="key">
            <JsonViewer :value="state.state?.[key]" :collapsed-depth="2" :expand-label="$t('AGENT_EXPAND', '展开')" />
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <el-tab-pane :label="$t('AGENT_TRACE_TAB_IO', '输入输出')" name="io">
        <div class="node-detail__io">
          <section>
            <h4>{{ $t('AGENT_TRACE_INPUTS', '输入') }}</h4>
            <JsonViewer :value="node.inputs || '{}'" :collapsed-depth="2" />
          </section>
          <section>
            <h4>{{ $t('AGENT_TRACE_OUTPUTS', '输出') }}</h4>
            <JsonViewer :value="node.outputs || '{}'" :collapsed-depth="2" />
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane v-if="messages.length > 0" :label="$t('AGENT_TRACE_TAB_MESSAGES', '消息')" name="messages">
        <div v-for="message in messages" :key="message.messageId" class="node-detail__message">
          <MarkdownViewer :content="message.content" :locale="locale" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { t } from '@platform/i18n';
import { JsonViewer, StatusDot } from '@/components';
import { EMPTY, SideEffect, describeStatus, elapsed, formatClock, formatDuration } from '@runtime/console';
import ActionTimeline from './ActionTimeline.vue';
import { buildTimeline, isReused, parseNodeState } from '../trace';
import type { ChatMessageVo, TaskGraphEdgeVo, TaskGraphNodeVo, ToolCallRecordVo } from '../type';

const MarkdownViewer = defineAsyncComponent(() => import('@/components/markdown').then((m) => m.MarkdownViewer));

/** 业务节点详情。切换节点时由父组件保持当前 Tab（v-model:tab） */
const props = defineProps<{
  node: TaskGraphNodeVo;
  nodes: TaskGraphNodeVo[];
  edges: TaskGraphEdgeVo[];
  calls: ToolCallRecordVo[];
  messages: ChatMessageVo[];
  locale: string;
}>();
const emit = defineEmits<{ 'open-call': [call: ToolCallRecordVo] }>();
const tab = defineModel<string>('tab', { default: 'timeline' });

const state = computed(() => parseNodeState(props.node));
const timeline = computed(() => buildTimeline(props.node, props.calls));
const scratchKeys = computed(() => Object.keys(state.value.state ?? {}));

const dependsText = computed(() => {
  const titles = props.edges
    .filter((e) => e.toNodeId === props.node.nodeId)
    .map((e) => props.nodes.find((n) => n.nodeId === e.fromNodeId)?.title ?? e.fromNodeId);
  return titles.length > 0 ? titles.join('、') : t('AGENT_TRACE_NO_DEPENDS', '无');
});
</script>

<style scoped>
.node-detail__head { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 4px; }
.node-detail__title { font-size: var(--g2-font-size-lg); font-weight: 600; color: var(--g2-text-primary); }
.node-detail__meta { color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.node-detail code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
.node-detail__error { color: var(--g2-color-danger); }
.node-detail__muted { color: var(--g2-text-secondary); }
.node-detail__write {
  margin-left: 6px;
  padding: 0 4px;
  font-size: 11px;
  color: var(--g2-color-warning);
  border: 1px solid var(--g2-color-warning);
  border-radius: 3px;
}
.node-detail__io { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }
.node-detail__io h4 { margin: 0 0 8px; font-size: var(--g2-font-size-base); color: var(--g2-text-regular); }
.node-detail__message { padding: 8px 0; border-bottom: 1px dashed var(--g2-border-color-light); }
.node-detail :deep(.el-table__row) { cursor: pointer; }
</style>
