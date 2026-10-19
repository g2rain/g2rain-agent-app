/**
 * 模型配置 API（g2rain-model-nexus）
 */

import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';
import type {
  MarketCatalogOption,
  ModelServiceProfile,
  ModelServiceProfilePayload,
  ModelServiceProfileQuery,
} from './type';

const base = Gateway.MODEL;
const http = () => getHttpClient('default');

export class ModelServiceProfileApi {
  static async page(
    params: ModelServiceProfileQuery & PageSelectListDto,
  ): Promise<PageData<ModelServiceProfile>> {
    const res = await http().get<PageData<ModelServiceProfile>>(`${base}/model_service_profile/page`, params);
    return res.data;
  }

  /** 模型广场候选分页（后端 page 已固定 MARKET） */
  static async marketCatalogPage(params: {
    pageNum: number;
    pageSize: number;
    status?: string;
    modelType?: string;
    modelName?: string;
    provider?: string;
  }): Promise<PageData<MarketCatalogOption>> {
    const res = await http().get<PageData<MarketCatalogOption>>(`${base}/model_service_catalog/page`, {
      status: 'ACTIVE',
      ...params,
    });
    return res.data;
  }

  static async save(payload: ModelServiceProfilePayload): Promise<number> {
    const res = await http().post<number>(`${base}/model_service_profile/save`, payload);
    return res.data;
  }

  static async remove(id: number): Promise<void> {
    await http().delete(`${base}/model_service_profile/${id}`);
  }

  static async updateStatus(id: number, status: string): Promise<void> {
    await http().post(`${base}/model_service_profile/${id}/status`, { status });
  }
}
