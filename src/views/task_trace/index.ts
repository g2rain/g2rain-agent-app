/**
 * 执行追踪的公共 API：其他页面通过它跳转到执行追踪，不深度导入内部实现。
 *
 * @example
 * router.push(taskTraceRoute(task.taskId, embed));
 */
import type { RouteLocationRaw } from 'vue-router';

export const TASK_TRACE_PATH = '/task_trace';

/** 执行追踪的路由；嵌入模式下保持 embed 参数 */
export function taskTraceRoute(taskId: string, embed = false): RouteLocationRaw {
  return { path: TASK_TRACE_PATH, query: embed ? { taskId, embed: '1' } : { taskId } };
}

export type { ChatMessageVo, TaskGraphNodeVo, TaskInstanceVo, TaskResumeRecordVo } from './type';
