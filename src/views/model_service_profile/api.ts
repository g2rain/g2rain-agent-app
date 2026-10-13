/**
 * 模型服务配置相关 API 服务
 * 提供模型服务配置数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import type { ModelServiceProfile, ModelServiceProfilePayload, ModelServiceProfileQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

/**
 * 模型服务配置 API 服务类
 */
export class ModelServiceProfileApi {
  /**
   * 获取模型服务配置列表
   * @param params 查询参数（可选）
   * @returns 模型服务配置列表
   */
  static async list(params?: ModelServiceProfileQuery): Promise<ModelServiceProfile[]> {
    const http = getHttpClient('default');
    const res = await http.get<ModelServiceProfile[]>('/model_service_profile/list', params);
    return res.data || [];
  }

  /**
   * 分页查询模型服务配置列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: ModelServiceProfileQuery & PageSelectListDto): Promise<PageData<ModelServiceProfile>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<ModelServiceProfile>>('/model_service_profile/page', params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 模型服务配置 ID
   * @returns 模型服务配置详情
   */
  static async getById(id: number): Promise<ModelServiceProfile> {
    const http = getHttpClient('default');
    const res = await http.get<ModelServiceProfile>(`/model_service_profile/${id}`);
    return res.data;
  }

  /**
   * 保存模型服务配置（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 模型服务配置数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的模型服务配置
   */
  static async save(payload: ModelServiceProfilePayload): Promise<ModelServiceProfile> {
    const http = getHttpClient('default');
    const res = await http.post<ModelServiceProfile>('/model_service_profile/save', payload);
    return res.data;
  }

  /**
   * 删除模型服务配置
   * @param id 模型服务配置 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/model_service_profile/${id}`);
  }
}

