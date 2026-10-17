/**
 * 用量统计 API（只读分页）
 */

import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';
import type { ModelUsageRecord, ModelUsageRecordQuery, ModelUsageProfileOption } from './type';

const base = Gateway.MODEL;
const http = () => getHttpClient('default');

export class ModelUsageRecordApi {
  static async page(params: ModelUsageRecordQuery & PageSelectListDto): Promise<PageData<ModelUsageRecord>> {
    const res = await http().get<PageData<ModelUsageRecord>>(`${base}/model_usage_record/page`, params);
    return res.data;
  }

  static async options(): Promise<ModelUsageProfileOption[]> {
    const res = await http().get<ModelUsageProfileOption[]>(`${base}/model_service_profile/options`);
    return res.data ?? [];
  }
}
