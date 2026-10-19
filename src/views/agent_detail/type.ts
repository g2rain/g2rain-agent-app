/**
 * 智能体详情页私有类型（g2rain-agent-studio）。
 * 智能体画像类型见 `@/views/agent_profile`，不在此重复定义。
 */

/** 技能（skill_profile） */
export interface SkillProfileVo {
  id: number;
  agentId: number;
  organId?: number | null;
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

/** 技能 ↔ 工具（skill_tool_binding） */
export interface SkillToolBindingVo {
  id: number;
  skillId: number;
  organId?: number | null;
  toolName: string;
  enabledFlag: number;
  description: string | null;
}

/** 技能列表的一行 */
export interface SkillRow {
  skill: SkillProfileVo;
  mode: string | undefined;
  toolCount: number;
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
