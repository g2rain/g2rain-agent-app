<template>
  <div ref="root" class="markdown-editor" :class="{ 'is-over': overLimit, 'is-readonly': readonly }" :style="{ '--md-height': height }">
    <MarkdownViewer v-if="readonly" :content="model" :locale="locale" />
    <Editor
      v-else
      :value="model"
      :mode="mode"
      :plugins="plugins"
      :locale="bytemdLocale"
      :placeholder="placeholder"
      @change="onChange"
    />
    <div v-if="maxLength > 0" class="markdown-editor__counter">{{ model.length }} / {{ maxLength }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { Editor } from '@bytemd/vue-next';
import 'bytemd/dist/index.css';
import 'highlight.js/styles/github.css';
import MarkdownViewer from './MarkdownViewer.vue';
import { editorLocale, markdownPlugins } from './markdown-plugins';

/**
 * Markdown 编辑器（GFM、代码高亮）。语言由调用方传入，组件不读取平台状态。
 *
 * @example
 * <MarkdownEditor v-model="form.skillManual" :locale="locale" height="520px" mode="split" />
 * <MarkdownEditor v-model="form.identityDesc" :locale="locale" mode="tab" :max-length="2000" />
 */
const props = withDefaults(
  defineProps<{
    locale?: string;
    height?: string;
    mode?: 'split' | 'tab';
    maxLength?: number;
    placeholder?: string;
    readonly?: boolean;
  }>(),
  { locale: 'zh-CN', height: '360px', mode: 'split', maxLength: 0, placeholder: '', readonly: false },
);

const model = defineModel<string>({ default: '' });

const plugins = computed(() => markdownPlugins(props.locale));
const bytemdLocale = computed(() => editorLocale(props.locale));
const overLimit = computed(() => props.maxLength > 0 && model.value.length > props.maxLength);

function onChange(value: string): void {
  model.value = value;
}

/**
 * CodeMirror 在不可见时（抽屉动画中、页签未显示）初始化会测到 0 尺寸而不渲染内容，
 * 变为可见后需 refresh 一次重新测量。
 */
const root = ref<HTMLElement | null>(null);
let observer: ResizeObserver | null = null;

onMounted(() => {
  if (!root.value) return;
  observer = new ResizeObserver(([entry]) => {
    if (!entry || entry.contentRect.height <= 0) return;
    const host = root.value?.querySelector('.CodeMirror') as (HTMLElement & { CodeMirror?: { refresh(): void } }) | null;
    host?.CodeMirror?.refresh();
  });
  observer.observe(root.value);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<style scoped>
.markdown-editor {
  position: relative;
  border: 1px solid var(--g2-border-color-light);
  border-radius: var(--g2-border-radius-base);
  overflow: hidden;
}
.markdown-editor.is-over { border-color: var(--g2-color-danger); }
.markdown-editor.is-readonly { padding: 12px 16px; max-height: var(--md-height); overflow: auto; }
.markdown-editor :deep(.bytemd) { height: var(--md-height); border: none; }
/* ByteMD 右侧「源代码」实为打开 GitHub 宣传入口，产品侧隐藏 */
.markdown-editor :deep(.bytemd-toolbar-right [bytemd-tippy-path="5"]) { display: none; }
/* ByteMD 默认限宽居中 + 行 padding 4%，画像场景改为贴左铺满 */
.markdown-editor :deep(.bytemd-editor .CodeMirror .CodeMirror-lines) {
  max-width: none;
  margin: 0;
  padding: 8px 0;
}
.markdown-editor :deep(.bytemd-editor .CodeMirror pre.CodeMirror-line),
.markdown-editor :deep(.bytemd-editor .CodeMirror pre.CodeMirror-line-like) {
  padding: 0 12px;
}
.markdown-editor :deep(.bytemd-preview .markdown-body) {
  max-width: none;
  margin: 0;
  padding: 8px 12px;
}
.markdown-editor__counter {
  position: absolute;
  right: 12px;
  bottom: 6px;
  font-size: var(--g2-font-size-sm);
  color: var(--g2-text-secondary);
  pointer-events: none;
}
.markdown-editor.is-over .markdown-editor__counter { color: var(--g2-color-danger); }
</style>
