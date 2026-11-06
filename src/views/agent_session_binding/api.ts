/**
 * 智能体会话绑定表相关 API 服务
 * 提供智能体会话绑定表数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type { AgentSessionAssignPayload, AgentSessionBinding, AgentSessionBindingPayload, AgentSessionBindingQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

const base = Gateway.STUDIO;

/**
 * 智能体会话绑定表 API 服务类
 */
export class AgentSessionBindingApi {
  /**
   * 获取智能体会话绑定表列表
   * @param params 查询参数（可选）
   * @returns 智能体会话绑定表列表
   */
  static async list(params?: AgentSessionBindingQuery): Promise<AgentSessionBinding[]> {
    const http = getHttpClient('default');
    const res = await http.get<AgentSessionBinding[]>(`${base}/agent_session_binding/list`, params);
    return res.data || [];
  }

  /**
   * 分页查询智能体会话绑定表列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: AgentSessionBindingQuery & PageSelectListDto): Promise<PageData<AgentSessionBinding>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<AgentSessionBinding>>(`${base}/agent_session_binding/page`, params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 智能体会话绑定表 ID
   * @returns 智能体会话绑定表详情
   */
  static async getById(id: number): Promise<AgentSessionBinding> {
    const http = getHttpClient('default');
    const res = await http.get<AgentSessionBinding>(`${base}/agent_session_binding/${id}`);
    return res.data;
  }

  /**
   * 保存智能体会话绑定表（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 智能体会话绑定表数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的智能体会话绑定表
   */
  static async save(payload: AgentSessionBindingPayload): Promise<AgentSessionBinding> {
    const http = getHttpClient('default');
    const res = await http.post<AgentSessionBinding>(`${base}/agent_session_binding/save`, payload);
    return res.data;
  }

  /**
   * 删除智能体会话绑定表
   * @param id 智能体会话绑定表 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`${base}/agent_session_binding/${id}`);
  }

  /**
   * 访问授权：按勾选的会话类型全量同步
   * @param payload 智能体 ID 与会话类型集合（空集合表示全部取消）
   */
  static async assign(payload: AgentSessionAssignPayload): Promise<void> {
    const http = getHttpClient('default');
    await http.post(`${base}/agent_session_binding/assign`, payload);
  }
}
