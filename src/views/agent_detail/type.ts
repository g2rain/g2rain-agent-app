/**
 * 智能体详情的读取模型与写入载荷（g2rain-agent-studio）。
 */

/** 智能体（agent_profile） */
export interface AgentProfileVo {
  id: number;
  agentCode: string;
  agentName: string;
  resourceType: string;
  identityDesc: string | null;
  missionDesc: string | null;
  boundaryDesc: string | null;
  styleDesc: string | null;
  principleDesc: string | null;
  status: string;
  description: string | null;
  updateTime: string;
}

export type AgentProfilePayload = Partial<Omit<AgentProfileVo, 'updateTime'>>;

/** 技能（skill_profile） */
export interface SkillProfileVo {
  id: number;
  skillKey: string;
  skillName: string;
  resourceType: string;
  semanticDesc: string | null;
  skillManual: string | null;
  skillContract: string | null;
  status: string;
  description: string | null;
  updateTime: string;
}

export type SkillProfilePayload = Partial<Omit<SkillProfileVo, 'updateTime'>>;

/** 智能体 ↔ 技能（agent_skill_binding） */
export interface AgentSkillBindingVo {
  id: number;
  agentId: number;
  skillId: number;
  enabledFlag: number;
  description: string | null;
}

/** 技能 ↔ 工具（skill_tool_binding） */
export interface SkillToolBindingVo {
  id: number;
  skillId: number;
  toolName: string;
  enabledFlag: number;
  description: string | null;
}

/** 技能列表的一行：绑定 + 技能 + 模式 + 工具数 */
export interface SkillRow {
  binding: AgentSkillBindingVo;
  skill: SkillProfileVo | undefined;
  mode: string | undefined;
  toolCount: number;
}

/** runtime 每轮实际加载的能力包（capability_bundle） */
export interface CapabilityBundleVo {
  skills: {
    skillKey: string;
    skillName: string;
    semanticDesc: string | null;
    skillManual: string | null;
    skillContract: string | null;
    tools: { toolName: string }[];
  }[];
}

/** 智能体画像的五段描述及其长度上限（与表结构一致） */
export const PROFILE_SECTIONS = [
  { key: 'identityDesc', max: 2000 },
  { key: 'missionDesc', max: 2000 },
  { key: 'boundaryDesc', max: 4000 },
  { key: 'styleDesc', max: 2000 },
  { key: 'principleDesc', max: 4000 },
] as const;

export type ProfileSectionKey = (typeof PROFILE_SECTIONS)[number]['key'];
