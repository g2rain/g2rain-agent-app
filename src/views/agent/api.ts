/**
 * 智能体列表 API（g2rain-agent-studio）。
 */
import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type { PageData } from '@platform/types/api.type';
import type { AgentCard, AgentCreatePayload, AgentQuery } from './type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

interface AgentProfileRow {
  id: number;
  agentCode: string;
  agentName: string;
  resourceType: string;
  identityDesc: string | null;
  missionDesc: string | null;
  status: string;
  description: string | null;
  updateTime: string;
}

interface BindingRow {
  agentId: number;
  skillId: number;
}

interface ToolBindingRow {
  skillId: number;
}

const base = Gateway.STUDIO;
const http = () => getHttpClient('default');

export class AgentApi {
  /** 分页查询智能体 */
  static async page(query: AgentQuery, pageNum: number, pageSize: number): Promise<PageData<AgentProfileRow>> {
    const res = await http().get<PageData<AgentProfileRow>>(`${base}/agent_profile/page`, {
      ...query,
      pageNum,
      pageSize,
    });
    return res.data;
  }

  /** 全部技能绑定，用于统计技能数（一期前端汇总） */
  static async agentSkills(): Promise<BindingRow[]> {
    const res = await http().get<BindingRow[]>(`${base}/agent_skill_binding/list`);
    return res.data ?? [];
  }

  /** 全部工具绑定，用于统计工具数（一期前端汇总） */
  static async skillTools(): Promise<ToolBindingRow[]> {
    const res = await http().get<ToolBindingRow[]>(`${base}/skill_tool_binding/list`);
    return res.data ?? [];
  }

  /** 新建：不传 resourceType，由后端按机构落 PLATFORM / CUSTOM */
  static async create(payload: AgentCreatePayload): Promise<number> {
    const res = await http().post<number>(`${base}/agent_profile/save`, payload);
    return res.data;
  }

  /** 启停 */
  static async saveStatus(id: number, status: string, snapshot: Partial<AgentCard>): Promise<number> {
    const res = await http().post<number>(`${base}/agent_profile/save`, {
      id,
      agentCode: snapshot.agentCode,
      agentName: snapshot.agentName,
      resourceType: snapshot.resourceType,
      identityDesc: snapshot.identityDesc,
      missionDesc: snapshot.missionDesc,
      status,
      description: snapshot.description,
    });
    return res.data;
  }

  static async remove(id: number): Promise<void> {
    await http().delete(`${base}/agent_profile/${id}`);
  }
}
