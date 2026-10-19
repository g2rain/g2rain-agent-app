/**
 * 模型服务目录相关 API 服务
 * 提供模型服务目录数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type { ModelServiceCatalog, ModelServiceCatalogPayload, ModelServiceCatalogQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

const base = Gateway.MODEL;
const http = () => getHttpClient('default');

/**
 * 模型服务目录 API 服务类
 */
export class ModelServiceCatalogApi {
  /**
   * 分页查询模型服务目录列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: ModelServiceCatalogQuery & PageSelectListDto): Promise<PageData<ModelServiceCatalog>> {
    const res = await http().get<PageData<ModelServiceCatalog>>(`${base}/model_service_catalog/page`, params);
    return res.data;
  }

  /**
   * 保存模型服务目录（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 模型服务目录数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的模型服务目录
   */
  static async save(payload: ModelServiceCatalogPayload): Promise<ModelServiceCatalog> {
    const res = await http().post<ModelServiceCatalog>(`${base}/model_service_catalog/save`, payload);
    return res.data;
  }

  /**
   * 删除模型服务目录
   * @param id 模型服务目录 ID
   */
  static async remove(id: number): Promise<void> {
    await http().delete(`${base}/model_service_catalog/${id}`);
  }

  /**
   * 修改模型目录状态
   */
  static async updateStatus(id: number, status: string): Promise<void> {
    await http().post(`${base}/model_service_catalog/${id}/status`, { status });
  }
}
