<template>
  <div class="progress-summary">
    <div class="progress-summary__head">
      <span class="progress-summary__label">{{ $t('G2_LBL_PROGRESS', '执行过程') }}</span>
      <CopyText :text="traceId" :length="12" :copied-text="$t('G2_MSG_COPIED', '已复制')" />
    </div>

    <div v-if="error" class="progress-summary__muted">
      {{ $t('G2_MSG_LOAD_FAIL', '加载失败') }}
      <el-button link type="primary" size="small" @click="emit('retry')">{{ $t('G2_BTN_RETRY', '重试') }}</el-button>
    </div>
    <el-skeleton v-else-if="steps === null" :rows="4" animated />
    <div v-else-if="rows.length === 0" class="progress-summary__muted">
      {{ $t('AGENT_CONVERSATION_PROGRESS_EMPTY', '这一轮没有记录执行过程') }}
    </div>
    <ol v-else class="progress-summary__rows">
      <li v-for="row in rows" :key="row.step.stepId" :class="`is-${row.step.status.toLowerCase()}`">
        <button
          type="button"
          class="progress-summary__row"
          :style="{ paddingLeft: `${row.depth * 16}px` }"
          :disabled="!row.extra"
          @click="toggle(row.step.stepId)"
        >
          <span class="progress-summary__icon" aria-hidden="true">{{ iconOf(row.step) }}</span>
          <span class="progress-summary__title">{{ row.step.title }}</span>
          <span v-if="row.step.detail" class="progress-summary__detail">{{ row.step.detail }}</span>
          <span class="progress-summary__elapsed">{{ formatDuration(row.step.elapsedMs) }}</span>
          <span v-if="row.extra" class="progress-summary__arrow" :class="{ 'is-open': isOpen(row) }">▸</span>
        </button>
        <dl v-if="row.extra && isOpen(row)" class="progress-summary__extra" :style="{ marginLeft: `${row.depth * 16 + 20}px` }">
          <template v-if="row.step.errorCode">
            <dt>errorCode</dt>
            <dd>{{ row.step.errorCode }}</dd>
          </template>
          <template v-for="(value, key) in row.extra" :key="key">
            <dt>{{ key }}</dt>
            <dd>{{ typeof value === 'string' ? value : JSON.stringify(value) }}</dd>
          </template>
        </dl>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { CopyText } from '@/components';
import { formatDuration } from '@runtime/console';
import type { ChatProgressVo } from '../type';

/**
 * 一轮的执行过程：按层级展开步骤，可展开查看排查信息（实际模型、token、工具参数摘要、上游原文）。
 * 失败步骤默认展开。
 */
const props = defineProps<{
  traceId: string;
  /** 步骤；加载中为 null */
  steps: ChatProgressVo[] | null;
  error: boolean;
}>();
const emit = defineEmits<{ retry: [] }>();

/** 手动切换过的展开状态；未切换时失败步骤默认展开 */
const toggled = reactive<Record<string, boolean>>({});

/** 按 parentStepId 深度优先展开为带缩进的行，保持开始顺序 */
const rows = computed(() => {
  const steps = props.steps ?? [];
  const ids = new Set(steps.map((step) => step.stepId));
  const children = new Map<string | null, ChatProgressVo[]>();
  for (const step of [...steps].sort((a, b) => a.seq - b.seq)) {
    const key = step.parentStepId && ids.has(step.parentStepId) ? step.parentStepId : null;
    children.set(key, [...(children.get(key) ?? []), step]);
  }
  const result: { step: ChatProgressVo; depth: number; extra: Record<string, unknown> | null }[] = [];
  const walk = (parent: string | null, depth: number): void => {
    for (const step of children.get(parent) ?? []) {
      result.push({ step, depth, extra: parseExtra(step.extra) });
      walk(step.stepId, depth + 1);
    }
  };
  walk(null, 0);
  return result;
});

function parseExtra(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as unknown;
    return value && typeof value === 'object' && Object.keys(value).length > 0 ? (value as Record<string, unknown>) : null;
  } catch {
    return { raw };
  }
}

function isOpen(row: { step: ChatProgressVo }): boolean {
  return toggled[row.step.stepId] ?? row.step.status === 'FAILED';
}

function toggle(stepId: string): void {
  const row = rows.value.find((item) => item.step.stepId === stepId);
  if (row) toggled[stepId] = !isOpen(row);
}

function iconOf(step: ChatProgressVo): string {
  if (step.status === 'FAILED') return '✗';
  if (step.status === 'DONE') return '✓';
  return '•';
}
</script>

<style scoped>
.progress-summary { display: flex; flex-direction: column; gap: 10px; }
.progress-summary__head { display: flex; align-items: center; justify-content: space-between; }
.progress-summary__label { font-size: var(--g2-font-size-sm); color: var(--g2-text-secondary); }
.progress-summary__muted { color: var(--g2-text-placeholder); font-size: var(--g2-font-size-sm); }
.progress-summary__rows { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 2px; }
.progress-summary__row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  width: 100%;
  padding-top: 3px;
  padding-bottom: 3px;
  border: none;
  background: transparent;
  color: var(--g2-text-regular);
  font: inherit;
  font-size: var(--g2-font-size-sm);
  text-align: left;
  cursor: pointer;
}
.progress-summary__row:disabled { cursor: default; }
.progress-summary__row:not(:disabled):hover .progress-summary__title { color: var(--g2-color-primary); }
.progress-summary__icon { width: 12px; flex-shrink: 0; text-align: center; color: var(--g2-text-placeholder); }
.is-done .progress-summary__icon { color: var(--g2-color-success); }
.is-failed .progress-summary__row, .is-failed .progress-summary__icon { color: var(--g2-color-danger); }
.progress-summary__title { flex-shrink: 0; color: var(--g2-text-primary); }
.is-failed .progress-summary__title { color: inherit; }
.progress-summary__detail { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--g2-text-secondary); }
.progress-summary__elapsed { margin-left: auto; flex-shrink: 0; color: var(--g2-text-placeholder); font-variant-numeric: tabular-nums; }
.progress-summary__arrow { flex-shrink: 0; color: var(--g2-text-placeholder); transition: transform 0.15s ease; }
.progress-summary__arrow.is-open { transform: rotate(90deg); }
.progress-summary__extra {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 2px 10px;
  margin: 2px 0 6px;
  padding: 6px 10px;
  border-left: 2px solid var(--g2-border-color-light);
  background: var(--g2-fill-color-light, #f5f7fa);
  font-size: var(--g2-font-size-sm);
}
.progress-summary__extra dt { color: var(--g2-text-placeholder); }
.progress-summary__extra dd { margin: 0; color: var(--g2-text-regular); word-break: break-all; white-space: pre-wrap; }
</style>
