/**
 * 用量统计 API（g2rain-model-nexus，只读）。
 */
import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type { PageData } from '@platform/types/api.type';
import type { ModelUsageOption, ModelUsageQuery, ModelUsageStats, ModelUsageVo } from './type';

import './mock';

const base = Gateway.MODEL;
const http = () => getHttpClient('default');

export class ModelUsageApi {
  static async page(query: ModelUsageQuery, pageNum: number, pageSize: number): Promise<PageData<ModelUsageVo>> {
    const res = await http().get<PageData<ModelUsageVo>>(`${base}/model_usage_record/page`, {
      ...query,
      pageNum,
      pageSize,
      sorts: ['createTime,desc'],
    });
    return res.data;
  }

  /** 同一筛选条件下拉全量，用于指标卡（聚合接口待后端） */
  static async listForStats(query: ModelUsageQuery): Promise<ModelUsageVo[]> {
    const res = await http().get<ModelUsageVo[]>(`${base}/model_usage_record/list`, { ...query });
    return res.data ?? [];
  }

  static async options(): Promise<ModelUsageOption[]> {
    const res = await http().get<ModelUsageOption[]>(`${base}/model_service_profile/options`);
    return res.data ?? [];
  }

  static summarize(rows: ModelUsageVo[]): ModelUsageStats {
    return rows.reduce(
      (acc, row) => {
        acc.totalTokens += row.totalTokens || 0;
        acc.promptTokens += row.promptTokens || 0;
        acc.completionTokens += row.completionTokens || 0;
        acc.callCount += 1;
        return acc;
      },
      { totalTokens: 0, promptTokens: 0, completionTokens: 0, callCount: 0 },
    );
  }
}
