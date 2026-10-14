/**
 * 模型目录 API（g2rain-model-nexus）。
 */
import { getHttpClient } from '@runtime/http';
import { Gateway, ModelType } from '@runtime/console';
import type { PageData } from '@platform/types/api.type';
import type { ModelCatalogPayload, ModelCatalogQuery, ModelCatalogVo } from './type';

import './mock';

const base = Gateway.MODEL;
const http = () => getHttpClient('default');

export class ModelCatalogApi {
  static async page(query: ModelCatalogQuery, pageNum: number, pageSize: number): Promise<PageData<ModelCatalogVo>> {
    const res = await http().get<PageData<ModelCatalogVo>>(`${base}/model_service_catalog/page`, {
      ...query,
      pageNum,
      pageSize,
    });
    return res.data;
  }

  static async list(query: ModelCatalogQuery = {}): Promise<ModelCatalogVo[]> {
    const res = await http().get<ModelCatalogVo[]>(`${base}/model_service_catalog/list`, { ...query });
    return res.data ?? [];
  }

  static async save(payload: ModelCatalogPayload): Promise<number> {
    const res = await http().post<number>(`${base}/model_service_catalog/save`, payload);
    return res.data;
  }

  static async remove(id: number): Promise<void> {
    await http().delete(`${base}/model_service_catalog/${id}`);
  }

  /** 各目录被 profile 引用次数（一期前端汇总；机构数待后端） */
  static async refCounts(): Promise<Map<number, number>> {
    const res = await http().get<{ catalogId: number }[]>(`${base}/model_service_profile/list`);
    const map = new Map<number, number>();
    for (const row of res.data ?? []) {
      map.set(row.catalogId, (map.get(row.catalogId) ?? 0) + 1);
    }
    return map;
  }

  /** 连接测试：按模型类型打对应兼容接口 */
  static async testConnection(row: Pick<ModelCatalogVo, 'modelName' | 'modelType' | 'baseUrl'>): Promise<unknown> {
    const path =
      row.modelType === ModelType.VECTOR
        ? `${base}/v1/embeddings`
        : row.modelType === ModelType.RERANK
          ? `${base}/v1/rerank`
          : `${base}/v1/chat/completions`;
    const body =
      row.modelType === ModelType.VECTOR
        ? { model: row.modelName, input: 'ping' }
        : row.modelType === ModelType.RERANK
          ? { model: row.modelName, query: 'ping', documents: ['a', 'b'] }
          : { model: row.modelName, messages: [{ role: 'user', content: 'ping' }] };
    const res = await http().post<unknown>(path, body);
    return res.data;
  }
}
