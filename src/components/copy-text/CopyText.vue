<template>
  <el-tooltip :content="copied ? copiedText : text" placement="top" :show-after="300">
    <span class="copy-text" @click.stop="copy">{{ display }}</span>
  </el-tooltip>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue';

/**
 * 可复制的标识文本（ID、traceId）。等宽显示，可截短，悬停看全文，点击复制。
 *
 * @example
 * <CopyText text="9b1c31bd180d4b26a591f6eec1f2089b" :length="8" copied-text="已复制" />
 */
const props = withDefaults(defineProps<{ text: string; length?: number; copiedText?: string }>(), {
  length: 0,
  copiedText: 'Copied',
});

const copied = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

const display = computed(() => (props.length > 0 ? props.text.slice(0, props.length) : props.text));

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.text);
    copied.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => (copied.value = false), 1500);
  } catch {
    // 剪贴板不可用（非安全上下文）时保持静默，悬停仍可看到全文
  }
}

onBeforeUnmount(() => clearTimeout(timer));
</script>

<style scoped>
.copy-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: var(--g2-font-size-sm);
  color: var(--g2-text-secondary);
  cursor: pointer;
}
.copy-text:hover { color: var(--g2-color-primary); }
</style>
