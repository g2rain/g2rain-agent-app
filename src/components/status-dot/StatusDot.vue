<template>
  <span class="status-dot" :class="`status-dot--${tone}`">
    <i class="status-dot__mark" />
    <span v-if="label" class="status-dot__label">{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import type { Tone } from './types';

/** 圆点 + 文字的状态标记，只认语义色，不认业务状态 */
withDefaults(defineProps<{ tone?: Tone; label?: string }>(), { tone: 'muted', label: '' });
</script>

<style scoped>
.status-dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1;
  white-space: nowrap;
}
.status-dot__mark {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--status-dot-color);
  flex: none;
}
.status-dot__label {
  color: var(--g2-text-regular);
  font-size: var(--g2-font-size-sm);
}
.status-dot--running { --status-dot-color: var(--g2-color-primary); }
.status-dot--waiting { --status-dot-color: var(--g2-color-warning); }
.status-dot--success { --status-dot-color: var(--g2-color-success); }
.status-dot--danger { --status-dot-color: var(--g2-color-danger); }
.status-dot--muted { --status-dot-color: var(--g2-text-placeholder); }
.status-dot--running .status-dot__mark { animation: status-dot-breath 1.6s ease-in-out infinite; }
@keyframes status-dot-breath {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--status-dot-color) 45%, transparent); }
  50% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--status-dot-color) 0%, transparent); }
}
</style>
