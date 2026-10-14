/**
 * 有向无环图画布（vue-flow + dagre）。DagCanvas 是泛型组件，不直接用 defineAsyncComponent 包装；
 * 由页面内的图组件静态引入，页面再按需加载该图组件，使 vue-flow 进入独立分块。
 *
 * @example
 * // TaskGraph.vue
 * import { DagCanvas } from '@/components/dag-canvas';
 * // index.vue
 * const TaskGraph = defineAsyncComponent(() => import('./components/TaskGraph.vue'));
 */
export { default as DagCanvas } from './DagCanvas.vue';
export type { DagNode, DagEdge, DagDirection } from './types';
