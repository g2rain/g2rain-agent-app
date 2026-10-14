/**
 * 技能执行契约（skill_profile.skill_contract）的类型与工具函数。
 * 结构与取值以 g2rain-agent-runtime/docs/CONTRACT_SPEC.md 为准。
 */
import { SideEffect } from '@runtime/console';

/** 参数契约（tools.<name>.args.<path>） */
export interface ArgContract {
  from?: string;
  const?: unknown;
  when?: string;
  sources?: string[];
  required?: boolean;
  enum?: unknown[];
  missing?: { action?: string; tool?: string; message?: string };
  sensitive?: boolean;
  label?: string;
  fresh?: unknown;
}

/** 工具契约（tools.<name>） */
export interface ToolContract {
  label?: string;
  sideEffect?: string;
  confirm?: boolean;
  idempotencyKey?: string[];
  args?: Record<string, ArgContract>;
  success?: { path?: string; op?: string; value?: unknown };
  error?: { code?: string; message?: string };
  extracts?: { key?: string; path?: string; fields?: string[]; entity?: Record<string, unknown> }[];
  verify?: { tool?: string; args?: Record<string, unknown> };
}

/** 节点产出（outputs.<name>） */
export interface OutputContract {
  type?: string;
  fields?: string[];
  required?: boolean;
  share?: string;
  sources?: string[];
  hint?: string;
}

/** 节点输入（inputs.<name>） */
export interface InputContract {
  from?: string;
  required?: boolean;
  provider?: string;
}

export interface SkillContract {
  mode?: string;
  delegatable?: boolean;
  target?: string;
  inputs?: Record<string, InputContract>;
  outputs?: Record<string, OutputContract>;
  tools?: Record<string, ToolContract>;
}

/** 枚举取值（区分大小写），见 CONTRACT_SPEC 第 18 节 */
export const CONTRACT_ENUMS = {
  mode: ['REACT', 'PLAN'],
  sideEffect: [SideEffect.NONE, SideEffect.WRITE],
  when: ['ALWAYS', 'UNIQUE'],
  sources: ['USER', 'EVIDENCE', 'NODE_OUTPUT', 'SHARED', 'SESSION', 'PRIOR_TASK', 'MODEL', 'CONTRACT', 'PLATFORM'],
  missingAction: ['ASK_USER', 'CALL_TOOL', 'FAIL'],
  successOp: ['EQ', 'NE', 'IN', 'NOT_IN', 'TRUTHY', 'EXISTS'],
  outputType: ['VALUE', 'LIST'],
  outputShare: ['TASK', 'SESSION'],
  fromPrefix: ['inputs.', 'outputs.', 'shared.', 'session.', 'prior.', 'platform.', 'evidence.'],
} as const;

export type ContractParse = { ok: true; contract: SkillContract } | { ok: false; message: string };

/** 解析契约文本；空文本按无效处理（runtime 会丢弃契约为空的技能） */
export function parseContract(text: string | null | undefined): ContractParse {
  if (!text || !text.trim()) return { ok: false, message: 'empty' };
  try {
    const value: unknown = JSON.parse(text);
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return { ok: false, message: 'not-object' };
    return { ok: true, contract: value as SkillContract };
  } catch (error: unknown) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

/** 工具是否为写操作 */
export function isWriteTool(tool: ToolContract | undefined): boolean {
  return tool?.sideEffect === SideEffect.WRITE;
}

/** 契约的执行模式，未配置时为 runtime 默认值 REACT */
export function contractMode(text: string | null | undefined): string | undefined {
  const parsed = parseContract(text);
  return parsed.ok ? parsed.contract.mode ?? 'REACT' : undefined;
}

/** inputSchema 的最小结构 */
interface InputSchema {
  properties?: Record<string, { type?: string; description?: string; enum?: unknown[] }>;
  required?: string[];
}

/**
 * 按工具的 inputSchema 生成契约骨架：GET 视为只读，其余视为写；参数默认来自用户与模型。
 * 生成后由契约作者补充来源、缺值处理与抽取规则。
 */
export function toolSkeleton(tool: { title: string; method: string; inputSchema: string | null }): ToolContract {
  let schema: InputSchema = {};
  try {
    schema = JSON.parse(tool.inputSchema ?? '{}') as InputSchema;
  } catch {
    // 无法解析时生成空参数
  }
  const required = new Set(schema.required ?? []);
  const args: Record<string, ArgContract> = {};
  for (const [name, prop] of Object.entries(schema.properties ?? {})) {
    const path = prop.type === 'array' ? `${name}[]` : name;
    args[path] = {
      sources: ['USER', 'MODEL'],
      ...(required.has(name) ? {} : { required: false }),
      ...(prop.enum ? { enum: prop.enum } : {}),
      ...(prop.description ? { label: prop.description } : {}),
    };
  }
  return {
    label: tool.title,
    sideEffect: tool.method.toUpperCase() === 'GET' ? SideEffect.NONE : SideEffect.WRITE,
    args,
    success: { path: 'status', op: 'EQ', value: 200 },
    error: { code: 'errorCode', message: 'errorMessage' },
  };
}

/** 序列化契约，统一两个空格缩进 */
export function stringifyContract(contract: SkillContract): string {
  return JSON.stringify(contract, null, 2);
}
