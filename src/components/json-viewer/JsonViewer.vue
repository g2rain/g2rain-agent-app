<template>
  <div class="json-viewer">
    <div v-if="deferred" class="json-viewer__deferred">
      <span>{{ sizeText }}</span>
      <el-button link type="primary" size="small" @click="expanded = true">{{ expandLabel }}</el-button>
    </div>
    <template v-else>
      <el-button v-if="copyLabel" class="json-viewer__copy" link size="small" @click="copy">{{ copyLabel }}</el-button>
      <JsonTree v-if="parsed.ok" :value="parsed.value" :depth="0" :collapsed-depth="collapsedDepth" />
      <pre v-else class="json-viewer__raw">{{ raw }}</pre>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import JsonTree from './JsonTree.vue';

/**
 * 只读 JSON 视图：可折叠树、复制原文；超过阈值的大报文先显示大小，点击后再解析渲染。
 * 内容不是合法 JSON 时按原文显示。
 *
 * @example
 * <JsonViewer :value="call.response" :collapsed-depth="2" expand-label="展开" copy-label="复制" />
 */
const props = withDefaults(
  defineProps<{
    value: unknown;
    collapsedDepth?: number;
    lazyThreshold?: number;
    expandLabel?: string;
    copyLabel?: string;
  }>(),
  { collapsedDepth: 1, lazyThreshold: 32 * 1024, expandLabel: 'Expand', copyLabel: '' },
);

const raw = computed(() => (typeof props.value === 'string' ? props.value : JSON.stringify(props.value, null, 2) ?? ''));
const expanded = ref(false);
const deferred = computed(() => !expanded.value && raw.value.length > props.lazyThreshold);
const sizeText = computed(() => `JSON · ${(raw.value.length / 1024).toFixed(1)} KB`);

const parsed = computed<{ ok: true; value: unknown } | { ok: false }>(() => {
  if (typeof props.value !== 'string') return { ok: true, value: props.value };
  try {
    return { ok: true, value: JSON.parse(props.value) };
  } catch {
    return { ok: false };
  }
});

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(raw.value);
  } catch {
    // 剪贴板不可用时静默
  }
}
</script>

<style scoped>
.json-viewer {
  position: relative;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: var(--g2-font-size-sm);
  line-height: 1.6;
  color: var(--g2-text-regular);
  word-break: break-all;
}
.json-viewer__copy { position: absolute; top: 0; right: 0; }
.json-viewer__raw { margin: 0; white-space: pre-wrap; }
.json-viewer__deferred { display: flex; align-items: center; gap: 8px; color: var(--g2-text-secondary); }
</style>
