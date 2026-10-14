/**
 * 运行观测页面共用的 Mock：会话观测、会话详情、执行追踪都调用 `registerHarnessSample()`，
 * 保证无论先打开哪个页面，同一组接口返回同一份样例。仅在开发或显式 Mock 模式生效。
 *
 * @example
 * // views/xxx/mock.ts
 * import { registerHarnessSample } from '@/views/harness_sample';
 * registerHarnessSample();
 */
import type { AxiosRequestConfig } from 'axios';
import type { Result } from '@g2rain/http';
import { mockManager, type MockDataMap } from '@runtime/http';
import { Gateway } from '@runtime/console';
import { HARNESS_SAMPLE, type SampleRow } from './data';

/** list 接口支持的精确过滤字段 */
const FILTER_KEYS = ['conversationId', 'taskId', 'nodeId', 'payloadId'] as const;

function ok<T>(data: T): Result<T> {
  return { requestId: 'mock', requestTime: '', status: 200, errorCode: '', errorMessage: '', data };
}

function params(config: AxiosRequestConfig): Record<string, unknown> {
  return (config.params as Record<string, unknown> | undefined) ?? {};
}

function filterRows(rows: readonly SampleRow[], query: Record<string, unknown>): SampleRow[] {
  return rows.filter((row) => FILTER_KEYS.every((key) => query[key] === undefined || row[key] === query[key]));
}

function list(table: string) {
  return (config: AxiosRequestConfig) => ok(filterRows(HARNESS_SAMPLE[table] ?? [], params(config)));
}

/** 会话分页：标题模糊匹配，按最近消息时间倒序 */
function conversationPage(config: AxiosRequestConfig) {
  const query = params(config);
  const pageNum = Number(query.pageNum ?? 1);
  const pageSize = Number(query.pageSize ?? 10);
  const keyword = typeof query.title === 'string' ? query.title : '';
  const rows = filterRows(HARNESS_SAMPLE.conversations, query)
    .filter((row) => !keyword || String(row.title ?? '').includes(keyword))
    .sort((a, b) => String(b.lastMessageTime ?? '').localeCompare(String(a.lastMessageTime ?? '')));
  return ok({
    pageNum,
    pageSize,
    total: rows.length,
    totalPages: Math.ceil(rows.length / pageSize),
    records: rows.slice((pageNum - 1) * pageSize, pageNum * pageSize),
  });
}

let registered = false;

export function registerHarnessSample(): void {
  if (registered) return;
  registered = true;
  const base = Gateway.HARNESS;
  const map: MockDataMap = {
    [`${base}/chat_conversation/page`]: conversationPage,
    [`${base}/chat_conversation/list`]: list('conversations'),
    [`${base}/chat_message/list`]: list('messages'),
    [`${base}/task_instance/list`]: list('tasks'),
    [`${base}/task_graph_node/list`]: list('nodes'),
    [`${base}/task_graph_edge/list`]: list('edges'),
    [`${base}/task_checkpoint/list`]: list('checkpoints'),
    [`${base}/task_resume_record/list`]: list('resumes'),
    [`${base}/tool_call_record/list`]: list('calls'),
    [`${base}/task_node_payload/list`]: list('payloads'),
    [`${Gateway.STUDIO}/agent_profile/*/resolve`]: ok({ agentName: 'CMS内容管理数字员工' }),
  };
  mockManager.registerAll(map);
}
