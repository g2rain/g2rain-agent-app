<template>
  <div v-if="card.kind === 'request'" class="node-card node-card--edge" :class="{ 'is-selected': selected }">
    <div class="node-card__title">▶ {{ $t('AGENT_TRACE_REQUEST', '用户请求') }}</div>
    <div class="node-card__meta">{{ formatClock(card.time) }}</div>
  </div>

  <div v-else-if="card.kind === 'result'" class="node-card node-card--edge" :class="{ 'is-selected': selected }">
    <div class="node-card__title">■ {{ $t('AGENT_TRACE_RESULT', '结果') }}</div>
    <StatusDot v-bind="describeStatus(card.status)" />
  </div>

  <div
    v-else
    class="node-card"
    :class="[`is-${tone}`, { 'is-selected': selected, 'is-muted': muted }]"
  >
    <div class="node-card__head">
      <StatusDot :tone="tone" />
      <span class="node-card__title" :title="card.node.title ?? ''">{{ card.node.title || card.node.nodeId }}</span>
      <span v-if="card.hasWrite" class="node-card__write">{{ $t('AGENT_TRACE_WRITE', '写') }}</span>
    </div>
    <div class="node-card__skill">{{ card.node.skillKey || '—' }}</div>
    <div class="node-card__meta">
      {{ formatDuration(card.durationMs) }} · {{ callsText }}
    </div>
    <div v-if="card.approval" class="node-card__approval" :class="`is-${card.approval}`">{{ approvalText }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { t } from '@platform/i18n';
import { StatusDot } from '@/components';
import { NodeStatus, describeStatus, formatClock, formatDuration } from '@runtime/console';
import type { GraphCard } from '../trace';

const props = defineProps<{ card: GraphCard; selected: boolean }>();

const tone = computed(() => (props.card.kind === 'step' ? describeStatus(props.card.node.status).tone : 'muted'));
/** 跳过、取消的步骤淡化；未开始的步骤保持正常显示 */
const muted = computed(() => props.card.kind === 'step' && tone.value === 'muted' && props.card.node.status !== NodeStatus.PENDING);
const callsText = computed(() =>
  props.card.kind === 'step' ? t('AGENT_TRACE_CALLS', { n: props.card.callCount }, '{n} 次调用') : '',
);

const APPROVAL_TEXT: Record<string, [string, string]> = {
  pending: ['AGENT_TRACE_APPROVAL_PENDING', '⏸ 等待确认'],
  confirmed: ['AGENT_TRACE_APPROVAL_CONFIRMED', '✓ 已确认'],
  rejected: ['AGENT_TRACE_APPROVAL_REJECTED', '✕ 已拒绝'],
  replied: ['AGENT_TRACE_APPROVAL_REPLIED', '↩ 已回复'],
  canceled: ['AGENT_TRACE_APPROVAL_CANCELED', '– 已取消'],
};

const approvalText = computed(() => {
  if (props.card.kind !== 'step' || !props.card.approval) return '';
  const [code, text] = APPROVAL_TEXT[props.card.approval];
  return t(code, text);
});
</script>

<style scoped>
.node-card {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 10px 12px;
  border: 1px solid var(--g2-border-color-light);
  border-left-width: 3px;
  border-left-color: var(--g2-border-color-light);
  border-radius: var(--g2-border-radius-base);
  background: var(--g2-bg-container);
  box-shadow: var(--g2-shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: box-shadow var(--g2-transition-duration), border-color var(--g2-transition-duration);
}
.node-card:hover { box-shadow: var(--g2-shadow-base); }
.node-card.is-selected { border-color: var(--g2-color-primary); box-shadow: var(--g2-shadow-base); }
.node-card.is-danger { border-left-color: var(--g2-color-danger); }
.node-card.is-muted { opacity: 0.55; }
.node-card--edge { align-items: center; justify-content: center; border-left-width: 1px; border-radius: 32px; }
.node-card__head { display: flex; align-items: center; gap: 6px; min-width: 0; }
.node-card__title {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  color: var(--g2-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.node-card--edge .node-card__title { flex: none; }
.node-card__write {
  flex: none;
  padding: 0 4px;
  font-size: 11px;
  line-height: 16px;
  color: var(--g2-color-warning);
  border: 1px solid var(--g2-color-warning);
  border-radius: 3px;
}
.node-card__skill {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  color: var(--g2-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.node-card__meta { font-size: var(--g2-font-size-sm); color: var(--g2-text-secondary); }
.node-card__approval { font-size: var(--g2-font-size-sm); }
.node-card__approval.is-pending { color: var(--g2-color-warning); }
.node-card__approval.is-confirmed { color: var(--g2-color-success); }
.node-card__approval.is-rejected { color: var(--g2-color-danger); }
.node-card__approval.is-replied, .node-card__approval.is-canceled { color: var(--g2-text-secondary); }
</style>
