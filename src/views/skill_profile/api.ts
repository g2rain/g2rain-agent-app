/**
 * 定义表相关 API 服务
 * 提供定义表数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import type { SkillProfile, SkillProfilePayload, SkillProfileQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

/**
 * 定义表 API 服务类
 */
export class SkillProfileApi {
  /**
   * 获取定义表列表
   * @param params 查询参数（可选）
   * @returns 定义表列表
   */
  static async list(params?: SkillProfileQuery): Promise<SkillProfile[]> {
    const http = getHttpClient('default');
    const res = await http.get<SkillProfile[]>('/skill_profile/list', params);
    return res.data || [];
  }

  /**
   * 分页查询定义表列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: SkillProfileQuery & PageSelectListDto): Promise<PageData<SkillProfile>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<SkillProfile>>('/skill_profile/page', params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 定义表 ID
   * @returns 定义表详情
   */
  static async getById(id: number): Promise<SkillProfile> {
    const http = getHttpClient('default');
    const res = await http.get<SkillProfile>(`/skill_profile/${id}`);
    return res.data;
  }

  /**
   * 保存定义表（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 定义表数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的定义表
   */
  static async save(payload: SkillProfilePayload): Promise<SkillProfile> {
    const http = getHttpClient('default');
    const res = await http.post<SkillProfile>('/skill_profile/save', payload);
    return res.data;
  }

  /**
   * 删除定义表
   * @param id 定义表 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/skill_profile/${id}`);
  }
}

