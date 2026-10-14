/**
 * Markdown 编辑与只读渲染（bytemd）。体积较大，页面按需加载：
 *
 * @example
 * const MarkdownEditor = defineAsyncComponent(() => import('@/components/markdown').then((m) => m.MarkdownEditor));
 */
export { default as MarkdownEditor } from './MarkdownEditor.vue';
export { default as MarkdownViewer } from './MarkdownViewer.vue';
