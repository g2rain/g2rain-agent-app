<template>
  <el-empty v-if="steps.length === 0" :description="$t('AGENT_TRACE_NO_ACTION', '没有记录到动作')" :image-size="64" />
  <ol v-else class="timeline">
    <li v-for="(step, index) in steps" :key="index" class="timeline__step" :class="`is-${step.outcome}`">
      <span class="timeline__round">{{ roundText(step, index) }}</span>
      <span class="timeline__actor">{{ step.actor === 'user' ? '👤' : '⚙' }}</span>
      <div class="timeline__body">
        <div class="timeline__head">
          <span class="timeline__name" :class="{ 'is-code': !isLabel(step) }">{{ step.name }}</span>
          <span v-if="step.write" class="timeline__tag is-write">{{ $t('AGENT_TRACE_WRITE', '写') }}</span>
          <span v-if="outcomeText(step)" class="timeline__tag" :class="`is-${step.outcome}`">{{ outcomeText(step) }}</span>
          <span v-if="step.repeat > 1" class="timeline__tag is-repeat">{{ fill($t('AGENT_TRACE_REPEAT', '重复 {n} 次'), { n: step.repeat }) }}</span>
          <el-button v-if="step.call" link type="primary" size="small" @click="emit('open-call', step.call)">
            {{ $t('G2_BTN_DETAIL', '详情') }}
          </el-button>
        </div>
        <div v-if="step.summary" class="timeline__summary">{{ step.summary }}</div>
        <div v-if="step.detail" class="timeline__detail">{{ step.detail }}</div>
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
import { t } from '@platform/i18n';
import { fill, isBuiltinAction } from '@runtime/console';
import type { TimelineStep } from '../trace';
import type { ToolCallRecordVo } from '../type';

/** 节点执行轨迹：一轮一行，拦截与拒绝高亮，连续相同动作已在 trace.ts 中折叠 */
defineProps<{ steps: TimelineStep[] }>();
const emit = defineEmits<{ 'open-call': [call: ToolCallRecordVo] }>();

const OUTCOME_TEXT: Partial<Record<TimelineStep['outcome'], [string, string]>> = {
  blocked: ['AGENT_TRACE_OUTCOME_BLOCKED', '被拦截'],
  rejected: ['AGENT_TRACE_OUTCOME_REJECTED', '被拒绝'],
  suspended: ['AGENT_TRACE_OUTCOME_SUSPENDED', '挂起，等待用户'],
  failed: ['AGENT_TRACE_OUTCOME_FAILED', '失败'],
  reused: ['AGENT_TRACE_OUTCOME_REUSED', '复用'],
};

function outcomeText(step: TimelineStep): string {
  const entry = OUTCOME_TEXT[step.outcome];
  return entry ? t(entry[0], entry[1]) : '';
}

/** 内置动作与用户操作显示中文名，业务工具名用等宽字体 */
function isLabel(step: TimelineStep): boolean {
  return !step.toolName || isBuiltinAction(step.toolName);
}

/** 折叠行显示轮次区间，如 5–9 */
function roundText(step: TimelineStep, index: number): string {
  if (step.round === null) return String(index + 1);
  return step.repeat > 1 && step.lastRound !== step.round ? `${step.round}–${step.lastRound}` : String(step.round);
}
</script>

<style scoped>
.timeline { margin: 0; padding: 0; list-style: none; }
.timeline__step {
  display: grid;
  grid-template-columns: 40px 20px 1fr;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px dashed var(--g2-border-color-light);
}
.timeline__step:last-child { border-bottom: none; }
.timeline__round { color: var(--g2-text-placeholder); font-variant-numeric: tabular-nums; text-align: right; }
.timeline__body { min-width: 0; }
.timeline__head { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.timeline__name { font-weight: 600; color: var(--g2-text-primary); }
.timeline__name.is-code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-weight: 500; }
.timeline__tag {
  padding: 0 6px;
  font-size: 11px;
  line-height: 18px;
  border-radius: 3px;
  border: 1px solid var(--g2-border-color-light);
  color: var(--g2-text-secondary);
}
.timeline__tag.is-write, .timeline__tag.is-blocked, .timeline__tag.is-suspended {
  color: var(--g2-color-warning);
  border-color: var(--g2-color-warning);
}
.timeline__tag.is-rejected, .timeline__tag.is-failed { color: var(--g2-color-danger); border-color: var(--g2-color-danger); }
.timeline__summary { margin-top: 4px; color: var(--g2-text-regular); word-break: break-word; }
.timeline__detail { margin-top: 2px; font-size: var(--g2-font-size-sm); color: var(--g2-text-secondary); word-break: break-word; }
.timeline__step.is-rejected .timeline__detail,
.timeline__step.is-failed .timeline__detail { color: var(--g2-color-danger); }
.timeline__step.is-blocked .timeline__detail { color: var(--g2-color-warning); }
</style>
