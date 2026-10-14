<template>
  <div class="markdown-viewer">
    <Viewer :value="markdown" :plugins="plugins" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Viewer } from '@bytemd/vue-next';
import 'bytemd/dist/index.css';
import 'highlight.js/styles/github.css';
import { markdownPlugins } from './markdown-plugins';

/**
 * Markdown 只读渲染，用于智能体回复、节点结论、说明文字。
 *
 * @example
 * <MarkdownViewer :content="node.result" />
 */
const props = withDefaults(defineProps<{ content?: string | null; locale?: string }>(), {
  content: '',
  locale: 'zh-CN',
});

const plugins = computed(() => markdownPlugins(props.locale));
const markdown = computed(() => props.content ?? '');
</script>

<style scoped>
.markdown-viewer { color: var(--g2-text-primary); line-height: var(--g2-line-height-base); word-break: break-word; }
.markdown-viewer :deep(.markdown-body > :first-child) { margin-top: 0; }
.markdown-viewer :deep(.markdown-body > :last-child) { margin-bottom: 0; }
.markdown-viewer :deep(p) { margin: 0.4em 0; }
.markdown-viewer :deep(ul), .markdown-viewer :deep(ol) { margin: 0.4em 0; padding-left: 1.4em; }
</style>
