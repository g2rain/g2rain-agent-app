/**
 * 契约校验：装载校验规则（CONTRACT_SPEC 第 16 节）与枚举取值（第 18 节），
 * 外加「已绑定未配置 / 已配置未绑定」两条提示。返回带 JSON 路径的问题，供结构视图与源码视图定位。
 *
 * @example
 * lintContract(text, ['get_article_list']); // [{ path: ['tools', 'post_article_save'], severity: 'error', ... }]
 */
import { t } from '@platform/i18n';
import { locateJsonPath } from '@shared/json-path.util';
import type { JsonDiagnostic } from '@/components/json-editor';
import { CONTRACT_ENUMS, isWriteTool, parseContract, type SkillContract } from './contract';

export type ContractPath = (string | number)[];

export interface ContractIssue {
  path: ContractPath;
  /** error 阻断保存（runtime 会丢弃该技能）；warning 仅提示 */
  severity: 'error' | 'warning';
  message: string;
}

const msg = (code: string, text: string, vars: Record<string, string | number> = {}) =>
  Object.keys(vars).length > 0 ? t(code, vars, text) : t(code, text);

function checkEnum(issues: ContractIssue[], path: ContractPath, value: unknown, allowed: readonly string[]): void {
  if (value === undefined || value === null) return;
  const values = Array.isArray(value) ? value : [value];
  for (const item of values) {
    if (typeof item !== 'string' || !allowed.includes(item)) {
      issues.push({
        path,
        severity: 'error',
        message: msg('AGENT_LINT_ENUM', '取值 {value} 不合法，可选：{allowed}', { value: String(item), allowed: allowed.join(' / ') }),
      });
    }
  }
}

function lintTools(contract: SkillContract, issues: ContractIssue[]): void {
  const tools = contract.tools ?? {};
  for (const [name, tool] of Object.entries(tools)) {
    const base: ContractPath = ['tools', name];
    if (!name.trim()) issues.push({ path: base, severity: 'error', message: msg('AGENT_LINT_TOOL_KEY', '工具名不能为空') });
    checkEnum(issues, [...base, 'sideEffect'], tool.sideEffect, CONTRACT_ENUMS.sideEffect);
    if (isWriteTool(tool) && !tool.success) {
      issues.push({ path: base, severity: 'error', message: msg('AGENT_LINT_WRITE_SUCCESS', '写工具必须配置 success') });
    }
    if (tool.confirm === true && !isWriteTool(tool)) {
      issues.push({ path: [...base, 'confirm'], severity: 'error', message: msg('AGENT_LINT_CONFIRM', 'confirm 只能用于写工具') });
    }
    if (tool.success) checkEnum(issues, [...base, 'success', 'op'], tool.success.op, CONTRACT_ENUMS.successOp);
    (tool.extracts ?? []).forEach((extract, index) => {
      if (!extract.path) {
        issues.push({ path: [...base, 'extracts', index], severity: 'error', message: msg('AGENT_LINT_EXTRACT_PATH', '抽取规则必须配置 path') });
      }
    });
    if (tool.verify) {
      const verify = tool.verify.tool ? tools[tool.verify.tool] : undefined;
      if (!tool.verify.tool || !verify || isWriteTool(verify)) {
        issues.push({
          path: [...base, 'verify', 'tool'],
          severity: 'error',
          message: msg('AGENT_LINT_VERIFY', 'verify.tool 必须是契约中已配置的只读工具'),
        });
      }
    }
    for (const [arg, spec] of Object.entries(tool.args ?? {})) {
      const argPath: ContractPath = [...base, 'args', arg];
      if (spec.from !== undefined && spec.const !== undefined) {
        issues.push({ path: argPath, severity: 'error', message: msg('AGENT_LINT_FROM_CONST', '同一参数不能同时配置 from 与 const') });
      }
      if (spec.from && !CONTRACT_ENUMS.fromPrefix.some((prefix) => spec.from!.startsWith(prefix))) {
        issues.push({
          path: [...argPath, 'from'],
          severity: 'error',
          message: msg('AGENT_LINT_FROM_PREFIX', 'from 前缀不合法：{value}', { value: spec.from }),
        });
      }
      checkEnum(issues, [...argPath, 'when'], spec.when, CONTRACT_ENUMS.when);
      checkEnum(issues, [...argPath, 'sources'], spec.sources, CONTRACT_ENUMS.sources);
      checkEnum(issues, [...argPath, 'missing', 'action'], spec.missing?.action, CONTRACT_ENUMS.missingAction);
    }
  }
}

function lintRoot(contract: SkillContract, issues: ContractIssue[]): void {
  const tools = contract.tools ?? {};
  checkEnum(issues, ['mode'], contract.mode, CONTRACT_ENUMS.mode);
  if (contract.target !== undefined && !isWriteTool(tools[contract.target])) {
    issues.push({ path: ['target'], severity: 'error', message: msg('AGENT_LINT_TARGET', 'target 必须是契约中的写工具') });
  }
  if (contract.delegatable === true && Object.values(tools).some(isWriteTool)) {
    issues.push({ path: ['delegatable'], severity: 'error', message: msg('AGENT_LINT_DELEGATABLE', '可委派的技能不能包含写工具') });
  }
  for (const [name, output] of Object.entries(contract.outputs ?? {})) {
    const path: ContractPath = ['outputs', name];
    checkEnum(issues, [...path, 'type'], output.type, CONTRACT_ENUMS.outputType);
    checkEnum(issues, [...path, 'share'], output.share, CONTRACT_ENUMS.outputShare);
    checkEnum(issues, [...path, 'sources'], output.sources, CONTRACT_ENUMS.sources);
    if (output.type === 'LIST' && !(output.fields && output.fields.length > 0)) {
      issues.push({ path, severity: 'error', message: msg('AGENT_LINT_LIST_FIELDS', 'LIST 产出必须配置非空 fields') });
    }
  }
}

function lintBindings(contract: SkillContract, toolNames: readonly string[], issues: ContractIssue[]): void {
  const configured = new Set(Object.keys(contract.tools ?? {}));
  for (const name of toolNames) {
    if (!configured.has(name)) {
      issues.push({ path: ['tools'], severity: 'warning', message: msg('AGENT_LINT_UNCONFIGURED', '已绑定但未配置契约：{name}', { name }) });
    }
  }
  const bound = new Set(toolNames);
  for (const name of configured) {
    if (!bound.has(name)) {
      issues.push({ path: ['tools', name], severity: 'warning', message: msg('AGENT_LINT_UNBOUND', '契约中的工具未绑定：{name}', { name }) });
    }
  }
}

/** 校验契约文本；toolNames 为技能已绑定的业务工具 */
export function lintContract(text: string, toolNames: readonly string[]): ContractIssue[] {
  const parsed = parseContract(text);
  if (!parsed.ok) {
    return [{ path: [], severity: 'error', message: msg('AGENT_LINT_INVALID', '契约不是合法的 JSON 对象') }];
  }
  const issues: ContractIssue[] = [];
  lintRoot(parsed.contract, issues);
  lintTools(parsed.contract, issues);
  lintBindings(parsed.contract, toolNames, issues);
  return issues;
}

/** 把问题转成编辑器诊断；源码中定位不到的问题标在开头 */
export function toDiagnostics(text: string, issues: readonly ContractIssue[]): JsonDiagnostic[] {
  return issues.map((issue) => {
    const range = locateJsonPath(text, issue.path) ?? { from: 0, to: 0 };
    return { ...range, severity: issue.severity, message: issue.message };
  });
}

/** 问题是否属于某个路径（含其子路径） */
export function issueUnder(issue: ContractIssue, path: ContractPath): boolean {
  return path.every((segment, index) => issue.path[index] === segment);
}
