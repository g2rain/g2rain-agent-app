/**
 * JSON 编辑器（CodeMirror 6）。体积较大，页面按需加载：
 *
 * @example
 * const JsonEditor = defineAsyncComponent(() => import('@/components/json-editor').then((m) => m.JsonEditor));
 */
export { default as JsonEditor } from './JsonEditor.vue';
export type { JsonDiagnostic } from './types';
