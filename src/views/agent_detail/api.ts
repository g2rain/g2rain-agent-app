/**
 * 智能体详情 API（g2rain-agent-studio）。
 */
import { getHttpClient } from '@runtime/http';
import { Gateway, ResourceType } from '@runtime/console';
import { AgentProfileApi } from '@/views/agent_profile';
import type { AgentProfile, AgentProfilePayload } from '@/views/agent_profile';
import type {
  SkillProfilePayload,
  SkillProfileVo,
  SkillToolBindingVo,
} from './type';

const base = Gateway.STUDIO;
const http = () => getHttpClient('default');

async function list<T>(table: string, params: Record<string, unknown> = {}): Promise<T[]> {
  const res = await http().get<T[]>(`${base}/${table}/list`, params);
  return res.data ?? [];
}

async function save(table: string, payload: object): Promise<number> {
  const res = await http().post<number>(`${base}/${table}/save`, payload);
  return res.data;
}

async function remove(table: string, id: number): Promise<void> {
  await http().delete(`${base}/${table}/${id}`);
}

function agentKind(resourceType?: string): 'custom' | 'platform' {
  return resourceType === ResourceType.PLATFORM ? 'platform' : 'custom';
}

export class AgentDetailApi {
  static async agent(id: number, resourceType: string = ResourceType.CUSTOM): Promise<AgentProfile | null> {
    const rows = await AgentProfileApi.list(agentKind(resourceType), { id });
    return rows[0] ?? null;
  }

  static saveAgent(payload: AgentProfilePayload): Promise<number> {
    return AgentProfileApi.save(payload.resourceType || ResourceType.CUSTOM, payload);
  }

  /** 当前智能体下的技能 */
  static agentSkills(agentId: number): Promise<SkillProfileVo[]> {
    return list<SkillProfileVo>('skill_profile', { agentId });
  }

  static async skill(id: number): Promise<SkillProfileVo | null> {
    return (await list<SkillProfileVo>('skill_profile', { id }))[0] ?? null;
  }

  static saveSkill(payload: SkillProfilePayload): Promise<number> {
    return save('skill_profile', payload);
  }

  /** 技能列表启停：仅改状态 */
  static async updateSkillStatus(row: SkillProfileVo, status: string): Promise<void> {
    await http().post(`${base}/skill_profile/${row.id}/status`, { status });
  }

  static removeSkill(id: number): Promise<void> {
    return remove('skill_profile', id);
  }

  /** 全部工具绑定，用于技能列表的工具数（一期前端汇总） */
  static skillToolsAll(): Promise<SkillToolBindingVo[]> {
    return list<SkillToolBindingVo>('skill_tool_binding');
  }

  static skillTools(skillId: number): Promise<SkillToolBindingVo[]> {
    return list<SkillToolBindingVo>('skill_tool_binding', { skillId });
  }

  static saveSkillTool(payload: Partial<SkillToolBindingVo>): Promise<number> {
    return save('skill_tool_binding', payload);
  }

  /** 工具绑定启停：仅改 enabledFlag */
  static async updateSkillToolEnabled(id: number, enabledFlag: number): Promise<void> {
    await http().post(`${base}/skill_tool_binding/${id}/enabled`, { enabledFlag });
  }

  static removeSkillTool(id: number): Promise<void> {
    return remove('skill_tool_binding', id);
  }

}
