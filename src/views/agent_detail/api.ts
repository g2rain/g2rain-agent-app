/**
 * 智能体详情 API（g2rain-agent-studio）。
 */
import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type {
  AgentProfilePayload,
  AgentProfileVo,
  AgentSkillBindingVo,
  CapabilityBundleVo,
  SkillProfilePayload,
  SkillProfileVo,
  SkillToolBindingVo,
} from './type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

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

export class AgentDetailApi {
  static async agent(id: number): Promise<AgentProfileVo | null> {
    return (await list<AgentProfileVo>('agent_profile', { id }))[0] ?? null;
  }

  static saveAgent(payload: AgentProfilePayload): Promise<number> {
    return save('agent_profile', payload);
  }

  static agentSkills(agentId: number): Promise<AgentSkillBindingVo[]> {
    return list<AgentSkillBindingVo>('agent_skill_binding', { agentId });
  }

  /** 使用某个技能的全部绑定，用于「被 N 个智能体使用」与删除校验 */
  static skillUsages(skillId: number): Promise<AgentSkillBindingVo[]> {
    return list<AgentSkillBindingVo>('agent_skill_binding', { skillId });
  }

  static saveAgentSkill(payload: Partial<AgentSkillBindingVo>): Promise<number> {
    return save('agent_skill_binding', payload);
  }

  static removeAgentSkill(id: number): Promise<void> {
    return remove('agent_skill_binding', id);
  }

  /** 可绑定的技能（PLATFORM ∪ 本机构 CUSTOM，PLATFORM 合并待后端支持） */
  static skills(): Promise<SkillProfileVo[]> {
    return list<SkillProfileVo>('skill_profile');
  }

  static async skill(id: number): Promise<SkillProfileVo | null> {
    return (await list<SkillProfileVo>('skill_profile', { id }))[0] ?? null;
  }

  static saveSkill(payload: SkillProfilePayload): Promise<number> {
    return save('skill_profile', payload);
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

  static removeSkillTool(id: number): Promise<void> {
    return remove('skill_tool_binding', id);
  }

  static async bundle(agentId: number): Promise<CapabilityBundleVo> {
    const res = await http().get<CapabilityBundleVo>(`${base}/agent_profile/${agentId}/capability_bundle`);
    return res.data ?? { skills: [] };
  }
}
