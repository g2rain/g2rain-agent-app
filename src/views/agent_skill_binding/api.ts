/**
 * 数字员工相关 API 服务
 * 提供数字员工数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import type { AgentSkillBinding, AgentSkillBindingPayload, AgentSkillBindingQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

/**
 * 数字员工 API 服务类
 */
export class AgentSkillBindingApi {
  /**
   * 获取数字员工列表
   * @param params 查询参数（可选）
   * @returns 数字员工列表
   */
  static async list(params?: AgentSkillBindingQuery): Promise<AgentSkillBinding[]> {
    const http = getHttpClient('default');
    const res = await http.get<AgentSkillBinding[]>('/agent_skill_binding/list', params);
    return res.data || [];
  }

  /**
   * 分页查询数字员工列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: AgentSkillBindingQuery & PageSelectListDto): Promise<PageData<AgentSkillBinding>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<AgentSkillBinding>>('/agent_skill_binding/page', params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 数字员工 ID
   * @returns 数字员工详情
   */
  static async getById(id: number): Promise<AgentSkillBinding> {
    const http = getHttpClient('default');
    const res = await http.get<AgentSkillBinding>(`/agent_skill_binding/${id}`);
    return res.data;
  }

  /**
   * 保存数字员工（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 数字员工数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的数字员工
   */
  static async save(payload: AgentSkillBindingPayload): Promise<AgentSkillBinding> {
    const http = getHttpClient('default');
    const res = await http.post<AgentSkillBinding>('/agent_skill_binding/save', payload);
    return res.data;
  }

  /**
   * 删除数字员工
   * @param id 数字员工 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/agent_skill_binding/${id}`);
  }
}

