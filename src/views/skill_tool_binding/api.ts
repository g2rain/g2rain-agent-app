/**
 * 绑定表相关 API 服务
 * 提供绑定表数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import type { SkillToolBinding, SkillToolBindingPayload, SkillToolBindingQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

/**
 * 绑定表 API 服务类
 */
export class SkillToolBindingApi {
  /**
   * 获取绑定表列表
   * @param params 查询参数（可选）
   * @returns 绑定表列表
   */
  static async list(params?: SkillToolBindingQuery): Promise<SkillToolBinding[]> {
    const http = getHttpClient('default');
    const res = await http.get<SkillToolBinding[]>('/skill_tool_binding/list', params);
    return res.data || [];
  }

  /**
   * 分页查询绑定表列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: SkillToolBindingQuery & PageSelectListDto): Promise<PageData<SkillToolBinding>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<SkillToolBinding>>('/skill_tool_binding/page', params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 绑定表 ID
   * @returns 绑定表详情
   */
  static async getById(id: number): Promise<SkillToolBinding> {
    const http = getHttpClient('default');
    const res = await http.get<SkillToolBinding>(`/skill_tool_binding/${id}`);
    return res.data;
  }

  /**
   * 保存绑定表（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 绑定表数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的绑定表
   */
  static async save(payload: SkillToolBindingPayload): Promise<SkillToolBinding> {
    const http = getHttpClient('default');
    const res = await http.post<SkillToolBinding>('/skill_tool_binding/save', payload);
    return res.data;
  }

  /**
   * 删除绑定表
   * @param id 绑定表 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/skill_tool_binding/${id}`);
  }
}

