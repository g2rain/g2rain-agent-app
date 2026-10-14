/**
 * 模型配置 API（g2rain-model-nexus）。
 */
import { getHttpClient } from '@runtime/http';
import { Gateway, ModelType, RecordStatus, ResourceType } from '@runtime/console';
import type { PageData } from '@platform/types/api.type';
import type { MarketCatalogOption, ModelOption, ModelProfilePayload, ModelProfileQuery, ModelProfileVo } from './type';

import './mock';

const base = Gateway.MODEL;
const http = () => getHttpClient('default');

export class ModelProfileApi {
  static async page(query: ModelProfileQuery, pageNum: number, pageSize: number): Promise<PageData<ModelProfileVo>> {
    const res = await http().get<PageData<ModelProfileVo>>(`${base}/model_service_profile/page`, {
      ...query,
      pageNum,
      pageSize,
    });
    return res.data;
  }

  static async options(): Promise<ModelOption[]> {
    const res = await http().get<ModelOption[]>(`${base}/model_service_profile/options`);
    return res.data ?? [];
  }

  /** 可选用的广场模型 */
  static async marketCatalogs(): Promise<MarketCatalogOption[]> {
    const res = await http().get<MarketCatalogOption[]>(`${base}/model_service_catalog/list`, {
      resourceType: ResourceType.MARKET,
      status: RecordStatus.ACTIVE,
    });
    return res.data ?? [];
  }

  static async save(payload: ModelProfilePayload): Promise<number> {
    const res = await http().post<number>(`${base}/model_service_profile/save`, payload);
    return res.data;
  }

  static async remove(id: number): Promise<void> {
    await http().delete(`${base}/model_service_profile/${id}`);
  }

  static async saveCatalog(payload: Record<string, unknown>): Promise<number> {
    const res = await http().post<number>(`${base}/model_service_catalog/save`, payload);
    return res.data;
  }

  static async tryCall(row: ModelProfileVo, input: { prompt?: string; query?: string; docs?: string[] }): Promise<{ data: unknown; ms: number }> {
    const started = Date.now();
    const path =
      row.modelType === ModelType.VECTOR
        ? `${base}/v1/embeddings`
        : row.modelType === ModelType.RERANK
          ? `${base}/v1/rerank`
          : `${base}/v1/chat/completions`;
    const body =
      row.modelType === ModelType.VECTOR
        ? { model: row.modelName, input: input.prompt ?? '' }
        : row.modelType === ModelType.RERANK
          ? { model: row.modelName, query: input.query ?? '', documents: input.docs ?? [] }
          : { model: row.modelName, messages: [{ role: 'user', content: input.prompt ?? '' }] };
    const res = await http().post<unknown>(path, body);
    return { data: res.data, ms: Date.now() - started };
  }
}
