/**
 * 智能体配置相关页面共用的 Mock：智能体、技能、技能绑定、工具绑定在内存中可增删改，
 * 刷新页面后恢复初始样例。仅在开发或显式 Mock 模式生效。
 *
 * @example
 * // views/xxx/mock.ts
 * import { registerStudioSample } from '@/views/studio_sample';
 * registerStudioSample();
 */
import type { AxiosRequestConfig } from 'axios';
import type { Result } from '@g2rain/http';
import { mockManager, type MockDataMap } from '@runtime/http';
import { Gateway, RecordStatus, ResourceType } from '@runtime/console';
import { STUDIO_SAMPLE, type SampleRow } from './data';

/** list / page 接口支持的精确过滤字段 */
const FILTER_KEYS = ['id', 'agentId', 'skillId', 'toolName', 'resourceType', 'status', 'serviceCode'] as const;

/** 各表的内存副本，保存与删除直接作用于此 */
const tables: Record<string, SampleRow[]> = Object.fromEntries(
  Object.entries(STUDIO_SAMPLE).map(([name, rows]) => [name, rows.map((row) => ({ ...row }))]),
);

let nextId = 90000;

function ok<T>(data: T): Result<T> {
  return { requestId: 'mock', requestTime: '', status: 200, errorCode: '', errorMessage: '', data };
}

function params(config: AxiosRequestConfig): Record<string, unknown> {
  return (config.params as Record<string, unknown> | undefined) ?? {};
}

function body(config: AxiosRequestConfig): SampleRow {
  const data = config.data;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as SampleRow;
    } catch {
      return {};
    }
  }
  return (data as SampleRow | undefined) ?? {};
}

function filterRows(rows: readonly SampleRow[], query: Record<string, unknown>): SampleRow[] {
  return rows.filter((row) => {
    if (!FILTER_KEYS.every((key) => query[key] === undefined || query[key] === '' || String(row[key]) === String(query[key]))) {
      return false;
    }
    // 名称关键字：匹配 agentName / agentCode（智能体列表搜索）
    const name = query.agentName;
    if (name !== undefined && name !== '') {
      const keyword = String(name).toLowerCase();
      const hay = `${row.agentName ?? ''} ${row.agentCode ?? ''}`.toLowerCase();
      if (!hay.includes(keyword)) return false;
    }
    return true;
  });
}

function now(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

/** 为一张表生成 list / page / save / delete 四个接口 */
function crud(prefix: string, table: string): MockDataMap {
  const rows = () => tables[table];
  return {
    [`${prefix}/list`]: (config: AxiosRequestConfig) => ok(filterRows(rows(), params(config))),
    [`${prefix}/page`]: (config: AxiosRequestConfig) => {
      const query = params(config);
      const pageNum = Number(query.pageNum ?? 1);
      const pageSize = Number(query.pageSize ?? 10);
      const all = filterRows(rows(), query);
      return ok({
        pageNum,
        pageSize,
        total: all.length,
        totalPages: Math.ceil(all.length / pageSize),
        records: all.slice((pageNum - 1) * pageSize, pageNum * pageSize),
      });
    },
    [`${prefix}/save`]: (config: AxiosRequestConfig) => {
      const payload = body(config);
      const existing = rows().find((row) => payload.id !== undefined && row.id === payload.id);
      if (existing) {
        Object.assign(existing, payload, { updateTime: now() });
        return ok(existing.id);
      }
      const id = nextId++;
      // 新建未传 resourceType 时由 Mock 补 CUSTOM，真实后端按机构是否运营方落 PLATFORM / CUSTOM
      const created: SampleRow = {
        ...payload,
        id,
        status: payload.status ?? RecordStatus.ACTIVE,
        ...(payload.resourceType ? {} : { resourceType: ResourceType.CUSTOM }),
        createTime: now(),
        updateTime: now(),
      };
      rows().push(created);
      return ok(id);
    },
    [`${prefix}/*`]: (config: AxiosRequestConfig) => {
      const id = Number(String(config.url ?? '').split('/').pop());
      const index = rows().findIndex((row) => row.id === id);
      if (index >= 0) rows().splice(index, 1);
      return ok(index >= 0 ? 1 : 0);
    },
  };
}

/** runtime 实际加载的能力包：只含 ACTIVE 技能与启用的绑定 */
function capabilityBundle(config: AxiosRequestConfig) {
  const agentId = Number(String(config.url ?? '').split('/').slice(-2)[0]);
  const skills = tables.agentSkills
    .filter((b) => b.agentId === agentId && b.enabledFlag === 1)
    .map((b) => tables.skills.find((s) => s.id === b.skillId))
    .filter((s): s is SampleRow => !!s && s.status === RecordStatus.ACTIVE)
    .map((s) => ({
      skillKey: s.skillKey,
      skillName: s.skillName,
      semanticDesc: s.semanticDesc,
      skillManual: s.skillManual,
      skillContract: s.skillContract,
      tools: tables.skillTools
        .filter((t) => t.skillId === s.id && t.enabledFlag === 1)
        .map((t) => ({ toolName: t.toolName })),
    }));
  return ok({ skills });
}

function resolveAgent(config: AxiosRequestConfig) {
  const agentId = Number(String(config.url ?? '').split('/').slice(-2)[0]);
  const agent = tables.agents.find((a) => a.id === agentId);
  return ok(agent ? { agentId: agent.id, ...agent } : null);
}

let registered = false;

export function registerStudioSample(): void {
  if (registered) return;
  registered = true;
  const studio = Gateway.STUDIO;
  // 先注册带通配符的能力包接口，避免被 `/agent_profile/*` 删除接口提前匹配
  mockManager.registerAll({
    [`${studio}/agent_profile/*/capability_bundle`]: capabilityBundle,
    [`${studio}/agent_profile/*/resolve`]: resolveAgent,
    ...crud(`${studio}/agent_profile`, 'agents'),
    ...crud(`${studio}/skill_profile`, 'skills'),
    ...crud(`${studio}/agent_skill_binding`, 'agentSkills'),
    ...crud(`${studio}/skill_tool_binding`, 'skillTools'),
    ...crud(`${Gateway.MCP}/mcp_tool_profile`, 'tools'),
  });
}
