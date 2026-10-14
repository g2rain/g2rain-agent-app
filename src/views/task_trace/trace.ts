/**
 * 把执行追踪的原始数据整理成页面模型：图节点、节点卡片摘要、执行轨迹。
 * 纯函数，不访问接口与组件状态。
 */
import {
  CallStatus,
  EdgeType,
  NodeStatus,
  ResumeAction,
  SideEffect,
  TaskStatus,
  actionLabel,
  elapsed,
  isBuiltinAction,
  parseJson,
} from '@runtime/console';
import { redundantEdges, edgeKey, type DirectedEdge } from '@shared/graph.util';
import type { DagEdge, DagNode } from '@/components/dag-canvas';
import type { TaskGraphNodeVo, ToolCallRecordVo, TraceBundle } from './type';

/** 虚拟节点：用户请求与结果 */
export const REQUEST_ID = '__request';
export const RESULT_ID = '__result';

/** 节点的确认结果，取自恢复记录（检查点恢复后会被删除） */
export type ApprovalState = 'pending' | 'confirmed' | 'rejected' | 'replied' | 'canceled';

/** 节点卡片数据 */
export type GraphCard =
  | { kind: 'request'; time: string | null }
  | { kind: 'result'; status: string }
  | {
      kind: 'step';
      node: TaskGraphNodeVo;
      durationMs?: number;
      callCount: number;
      hasWrite: boolean;
      approval?: ApprovalState;
    };

/** 业务调用是否为复用历史写证据（没有真实发出） */
export function isReused(call: ToolCallRecordVo): boolean {
  return call.durationMs === 0 && call.businessOk === null;
}

const APPROVAL_BY_ACTION: Record<string, ApprovalState> = {
  [ResumeAction.CONFIRM]: 'confirmed',
  [ResumeAction.REJECT]: 'rejected',
  [ResumeAction.REPLY]: 'replied',
  [ResumeAction.CANCEL]: 'canceled',
};

function approvalOf(nodeId: string, bundle: TraceBundle): ApprovalState | undefined {
  const pending = bundle.checkpoints.some((cp) => cp.nodeId === nodeId);
  if (pending) return 'pending';
  const resumes = bundle.resumes.filter((r) => r.nodeId === nodeId);
  const last = resumes[resumes.length - 1];
  return last ? APPROVAL_BY_ACTION[last.resumeAction] : undefined;
}

/** 构造图数据：业务节点 + 首尾虚拟节点；冗余依赖淡化，委派边虚线 */
export function buildGraph(bundle: TraceBundle): { nodes: DagNode<GraphCard>[]; edges: DagEdge[] } {
  const ids = new Set(bundle.nodes.map((n) => n.nodeId));
  const real: (DirectedEdge & { delegate: boolean })[] = bundle.edges
    .filter((e) => ids.has(e.fromNodeId) && ids.has(e.toNodeId))
    .map((e) => ({ from: e.fromNodeId, to: e.toNodeId, delegate: e.edgeType === EdgeType.DELEGATE }));
  const redundant = redundantEdges(real);
  const hasIn = new Set(real.map((e) => e.to));
  const hasOut = new Set(real.map((e) => e.from));

  const nodes: DagNode<GraphCard>[] = [
    { id: REQUEST_ID, width: 140, height: 64, data: { kind: 'request', time: bundle.task.startedTime } },
    ...bundle.nodes.map((node) => {
      const calls = bundle.calls.filter((c) => c.nodeId === node.nodeId);
      return {
        id: node.nodeId,
        data: {
          kind: 'step' as const,
          node,
          durationMs: elapsed(node.startedTime, node.finishedTime),
          callCount: calls.filter((c) => !isReused(c)).length,
          hasWrite: calls.some((c) => c.sideEffect === SideEffect.WRITE && !isReused(c)),
          approval: approvalOf(node.nodeId, bundle),
        },
      };
    }),
    { id: RESULT_ID, width: 120, height: 64, data: { kind: 'result', status: bundle.task.status } },
  ];

  const edges: DagEdge[] = [
    ...bundle.nodes.filter((n) => !hasIn.has(n.nodeId)).map((n) => ({ from: REQUEST_ID, to: n.nodeId })),
    ...real.map((e) => ({
      from: e.from,
      to: e.to,
      dashed: e.delegate,
      faded: redundant.has(edgeKey(e)),
    })),
    ...bundle.nodes.filter((n) => !hasOut.has(n.nodeId)).map((n) => ({ from: n.nodeId, to: RESULT_ID })),
  ];
  if (bundle.nodes.length === 0) edges.push({ from: REQUEST_ID, to: RESULT_ID });
  return { nodes, edges };
}

/** 默认选中：失败任务选第一个失败节点，其余选结果节点 */
export function defaultSelection(bundle: TraceBundle): string {
  if (bundle.task.status === TaskStatus.FAILED) {
    const failed = bundle.nodes.find((n) => n.status === NodeStatus.FAILED || n.status === NodeStatus.TIMEOUT);
    if (failed) return failed.nodeId;
  }
  return RESULT_ID;
}

// ---------------------------------------------------------------- 执行轨迹

/** 节点状态中记录的动作 */
interface NodeAction {
  actor?: string;
  round?: number;
  callId?: string;
  toolName?: string | null;
  arguments?: string | null;
  message?: string | null;
}

/** 节点状态 JSON（task_graph_node.state） */
export interface NodeState {
  state?: Record<string, unknown>;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  rounds?: number;
  tokens?: number;
  actions?: NodeAction[];
}

/** 轨迹条目的结论 */
export type StepOutcome = 'ok' | 'rejected' | 'blocked' | 'suspended' | 'failed' | 'reused';

/** 一行执行轨迹；连续相同的动作合并，`repeat` 为重复次数 */
export interface TimelineStep {
  round: number | null;
  actor: 'agent' | 'user';
  name: string;
  toolName: string | null;
  write: boolean;
  summary: string;
  detail: string;
  outcome: StepOutcome;
  call?: ToolCallRecordVo;
  repeat: number;
  /** 折叠后最后一次出现的轮次 */
  lastRound: number | null;
}

export function parseNodeState(node: TaskGraphNodeVo): NodeState {
  return parseJson<NodeState>(node.state, {});
}

const HEALTHY_CALL = new Set<string>([CallStatus.SUCCESS, CallStatus.STARTED]);

/** 动作参数的一句话摘要：优先取 summary / question / output / key，否则取第一个字符串值 */
function argumentSummary(raw: string | null | undefined): string {
  const args = parseJson<Record<string, unknown>>(raw, {});
  for (const key of ['summary', 'question', 'output', 'reason', 'key']) {
    const value = args[key];
    if (typeof value === 'string' && value) return value;
  }
  const first = Object.values(args).find((v) => typeof v === 'string');
  return typeof first === 'string' ? first : '';
}

function firstLine(text: string): string {
  return text.split('\n').find((line) => line.trim()) ?? '';
}

function actionStep(action: NodeAction): TimelineStep {
  const toolName = action.toolName ?? null;
  const message = action.message ?? '';
  const step: TimelineStep = {
    round: action.round ?? null,
    actor: toolName ? 'agent' : 'user',
    name: actionLabel(toolName),
    toolName,
    write: false,
    summary: firstLine(toolName ? argumentSummary(action.arguments) : message),
    detail: '',
    outcome: 'ok',
    repeat: 1,
    lastRound: action.round ?? null,
  };
  if (!toolName) return step;
  if (!isBuiltinAction(toolName)) {
    // 业务工具出现在动作里，说明这次调用被运行时拦下，未进入工具调用记录
    return { ...step, outcome: 'blocked', detail: message };
  }
  const reply = parseJson<{ nodeStatus?: string; message?: string | null }>(message, {});
  const detail = reply.message ?? '';
  switch (reply.nodeStatus) {
    case undefined:
    case NodeStatus.DONE:
      return { ...step, detail };
    case NodeStatus.SUSPENDED:
      return { ...step, outcome: 'suspended', detail };
    case NodeStatus.FAILED:
      return { ...step, outcome: 'failed', detail };
    default:
      // 节点仍在运行却带回说明，表示该动作被运行时拒绝
      return { ...step, outcome: detail ? 'rejected' : 'ok', detail };
  }
}

function callStep(call: ToolCallRecordVo): TimelineStep {
  const reused = isReused(call);
  const failed = call.businessOk === 0 || !HEALTHY_CALL.has(call.callStatus);
  return {
    round: call.round,
    actor: 'agent',
    name: call.toolName,
    toolName: call.toolName,
    write: call.sideEffect === SideEffect.WRITE,
    summary: firstLine(call.errorMessage ?? call.resultSummary ?? ''),
    detail: '',
    outcome: reused ? 'reused' : failed ? 'failed' : 'ok',
    call,
    repeat: 1,
    lastRound: call.round,
  };
}

function sameStep(a: TimelineStep, b: TimelineStep): boolean {
  return !a.call && !b.call && a.toolName === b.toolName && a.summary === b.summary && a.detail === b.detail;
}

/**
 * 合并节点的执行轨迹：内置动作与被拦下的调用来自节点状态，真实业务调用来自工具调用记录；
 * 按轮次排序，连续相同的动作折叠为一行。
 */
export function buildTimeline(node: TaskGraphNodeVo, calls: readonly ToolCallRecordVo[]): TimelineStep[] {
  const actions = parseNodeState(node).actions ?? [];
  const steps = [
    ...actions.map(actionStep),
    ...calls.filter((c) => c.nodeId === node.nodeId).map(callStep),
  ].sort((a, b) => (a.round ?? 0) - (b.round ?? 0));

  const merged: TimelineStep[] = [];
  for (const step of steps) {
    const last = merged[merged.length - 1];
    if (last && sameStep(last, step)) {
      last.repeat += 1;
      last.lastRound = step.round;
    }
    else merged.push({ ...step });
  }
  return merged;
}
