/**
 * 智能体列表的查询条件与卡片行模型。
 */

export interface AgentQuery {
  /** 名称 / 编码关键字 */
  agentName?: string;
  /** PLATFORM | CUSTOM；空表示全部 */
  resourceType?: string;
  /** ACTIVE | INACTIVE */
  status?: string;
}

/** 智能体列表行（含一期前端汇总的技能数、工具数） */
export interface AgentCard {
  id: number;
  agentCode: string;
  agentName: string;
  resourceType: string;
  identityDesc: string | null;
  missionDesc: string | null;
  status: string;
  description: string | null;
  updateTime: string;
  skillCount: number;
  toolCount: number;
}

/** 新建只交名称与编码；resourceType 由后端按机构决定 */
export interface AgentCreatePayload {
  agentName: string;
  agentCode: string;
  status?: string;
}
