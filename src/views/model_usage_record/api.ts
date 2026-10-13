/**
 * 模型用量记录相关 API 服务
 * 提供模型用量记录数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import type { ModelUsageRecord, ModelUsageRecordPayload, ModelUsageRecordQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

/**
 * 模型用量记录 API 服务类
 */
export class ModelUsageRecordApi {
  /**
   * 获取模型用量记录列表
   * @param params 查询参数（可选）
   * @returns 模型用量记录列表
   */
  static async list(params?: ModelUsageRecordQuery): Promise<ModelUsageRecord[]> {
    const http = getHttpClient('default');
    const res = await http.get<ModelUsageRecord[]>('/model_usage_record/list', params);
    return res.data || [];
  }

  /**
   * 分页查询模型用量记录列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: ModelUsageRecordQuery & PageSelectListDto): Promise<PageData<ModelUsageRecord>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<ModelUsageRecord>>('/model_usage_record/page', params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 模型用量记录 ID
   * @returns 模型用量记录详情
   */
  static async getById(id: number): Promise<ModelUsageRecord> {
    const http = getHttpClient('default');
    const res = await http.get<ModelUsageRecord>(`/model_usage_record/${id}`);
    return res.data;
  }

  /**
   * 保存模型用量记录（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 模型用量记录数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的模型用量记录
   */
  static async save(payload: ModelUsageRecordPayload): Promise<ModelUsageRecord> {
    const http = getHttpClient('default');
    const res = await http.post<ModelUsageRecord>('/model_usage_record/save', payload);
    return res.data;
  }

  /**
   * 删除模型用量记录
   * @param id 模型用量记录 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/model_usage_record/${id}`);
  }
}

