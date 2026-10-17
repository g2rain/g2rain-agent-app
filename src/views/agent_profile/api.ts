/**
 * 数字员工画像 API（g2rain-agent-studio）。
 * 自建 / 平台分入口，resourceType 由服务端写死。
 */
import { getHttpClient } from '@runtime/http';
import { Gateway, ResourceType } from '@runtime/console';
import type { AgentProfile, AgentProfilePayload, AgentProfileQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

const base = Gateway.STUDIO;
const http = () => getHttpClient('default');

export type AgentProfileKind = 'custom' | 'platform';

function kindOf(resourceType: string): AgentProfileKind {
  return resourceType === ResourceType.PLATFORM ? 'platform' : 'custom';
}

export class AgentProfileApi {
  static async list(
    kind: AgentProfileKind,
    params: AgentProfileQuery = {},
  ): Promise<AgentProfile[]> {
    const res = await http().get<AgentProfile[]>(`${base}/agent_profile/${kind}/list`, params);
    return res.data ?? [];
  }

  static async page(
    resourceType: string,
    params: AgentProfileQuery & PageSelectListDto,
  ): Promise<PageData<AgentProfile>> {
    const kind = kindOf(resourceType);
    const res = await http().get<PageData<AgentProfile>>(
      `${base}/agent_profile/${kind}/page`,
      params,
    );
    return res.data;
  }

  /** 保存；后端返回主键 id；resourceType 由入口决定，勿依赖客户端传值 */
  static async save(resourceType: string, payload: AgentProfilePayload): Promise<number> {
    const kind = kindOf(resourceType);
    const res = await http().post<number>(`${base}/agent_profile/${kind}/save`, payload);
    return res.data;
  }

  /** 列表启停：仅改状态 */
  static async updateStatus(id: number, status: string): Promise<void> {
    await http().post(`${base}/agent_profile/${id}/status`, { status });
  }

  static async remove(id: number): Promise<void> {
    await http().delete(`${base}/agent_profile/${id}`);
  }
}
