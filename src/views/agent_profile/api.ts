/**
 * 数字员工画像表相关 API 服务
 * 提供数字员工画像表数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import type { AgentProfile, AgentProfilePayload, AgentProfileQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

/**
 * 数字员工画像表 API 服务类
 */
export class AgentProfileApi {
  /**
   * 获取数字员工画像表列表
   * @param params 查询参数（可选）
   * @returns 数字员工画像表列表
   */
  static async list(params?: AgentProfileQuery): Promise<AgentProfile[]> {
    const http = getHttpClient('default');
    const res = await http.get<AgentProfile[]>('/agent_profile/list', params);
    return res.data || [];
  }

  /**
   * 分页查询数字员工画像表列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: AgentProfileQuery & PageSelectListDto): Promise<PageData<AgentProfile>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<AgentProfile>>('/agent_profile/page', params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 数字员工画像表 ID
   * @returns 数字员工画像表详情
   */
  static async getById(id: number): Promise<AgentProfile> {
    const http = getHttpClient('default');
    const res = await http.get<AgentProfile>(`/agent_profile/${id}`);
    return res.data;
  }

  /**
   * 保存数字员工画像表（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 数字员工画像表数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的数字员工画像表
   */
  static async save(payload: AgentProfilePayload): Promise<AgentProfile> {
    const http = getHttpClient('default');
    const res = await http.post<AgentProfile>('/agent_profile/save', payload);
    return res.data;
  }

  /**
   * 删除数字员工画像表
   * @param id 数字员工画像表 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/agent_profile/${id}`);
  }
}

