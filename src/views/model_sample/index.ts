/**
 * 模型配置相关页面共用 Mock。
 *
 * @example
 * import { registerModelSample } from '@/views/model_sample';
 * registerModelSample();
 */
import type { AxiosRequestConfig } from 'axios';
import type { Result } from '@g2rain/http';
import { mockManager, type MockDataMap } from '@runtime/http';
import { Gateway, RecordStatus } from '@runtime/console';
import { MODEL_SAMPLE, type SampleRow } from './data';

const FILTER_KEYS = ['id', 'catalogId', 'profileId', 'resourceType', 'modelType', 'provider', 'protocol', 'status'] as const;

const tables: Record<string, SampleRow[]> = Object.fromEntries(
  Object.entries(MODEL_SAMPLE).map(([name, rows]) => [name, rows.map((row) => ({ ...row }))]),
);

let nextId = 80000;

function ok<T>(data: T): Result<T> {
  return { requestId: 'mock', requestTime: '', status: 200, errorCode: '', errorMessage: '', data };
}

function params(config: AxiosRequestConfig): Record<string, unknown> {
  return (config.params as Record<string, unknown> | undefined) ?? {};
}

function body(config: AxiosRequestConfig): SampleRow {
  const data = config.data;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as SampleRow;
    } catch {
      return {};
    }
  }
  return (data as SampleRow | undefined) ?? {};
}

function filterRows(rows: readonly SampleRow[], query: Record<string, unknown>): SampleRow[] {
  return rows.filter((row) => {
    if (!FILTER_KEYS.every((key) => query[key] === undefined || query[key] === '' || String(row[key]) === String(query[key]))) {
      return false;
    }
    const modelName = query.modelName;
    if (modelName !== undefined && modelName !== '') {
      const keyword = String(modelName).toLowerCase();
      const hay = `${row.modelName ?? ''} ${row.provider ?? ''}`.toLowerCase();
      if (!hay.includes(keyword)) return false;
    }
    // 用量时间范围：createTime 区间 [from, to]
    const createTime = query.createTime;
    if (Array.isArray(createTime) && createTime.length === 2) {
      const [from, to] = createTime.map(String);
      const at = String(row.createTime ?? '');
      if (from && at < from) return false;
      if (to && at > to) return false;
    }
    return true;
  });
}

function now(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function enrichProfile(payload: SampleRow): SampleRow {
  const catalog = tables.catalogs.find((c) => c.id === payload.catalogId);
  if (!catalog) return payload;
  return {
    ...payload,
    modelName: catalog.modelName,
    modelType: catalog.modelType,
    resourceType: catalog.resourceType,
    provider: catalog.provider,
    protocol: catalog.protocol,
    baseUrl: catalog.baseUrl,
  };
}

function crud(prefix: string, table: string, enrich?: (row: SampleRow) => SampleRow): MockDataMap {
  const rows = () => tables[table];
  return {
    [`${prefix}/list`]: (config: AxiosRequestConfig) => {
      const all = filterRows(rows(), params(config)).map((row) => (enrich ? enrich(row) : row));
      return ok(all);
    },
    [`${prefix}/page`]: (config: AxiosRequestConfig) => {
      const query = params(config);
      const pageNum = Number(query.pageNum ?? 1);
      const pageSize = Number(query.pageSize ?? 10);
      const all = filterRows(rows(), query).map((row) => (enrich ? enrich(row) : row));
      return ok({
        pageNum,
        pageSize,
        total: all.length,
        totalPages: Math.ceil(all.length / pageSize),
        records: all.slice((pageNum - 1) * pageSize, pageNum * pageSize),
      });
    },
    [`${prefix}/save`]: (config: AxiosRequestConfig) => {
      const payload = body(config);
      const existing = rows().find((row) => payload.id !== undefined && row.id === payload.id);
      if (existing) {
        Object.assign(existing, payload, { updateTime: now() });
        return ok(existing.id);
      }
      const id = nextId++;
      const created = {
        ...payload,
        id,
        status: payload.status ?? RecordStatus.ACTIVE,
        createTime: now(),
        updateTime: now(),
      };
      rows().push(created);
      return ok(id);
    },
    [`${prefix}/*`]: (config: AxiosRequestConfig) => {
      const id = Number(String(config.url ?? '').split('/').pop());
      const index = rows().findIndex((row) => row.id === id);
      if (index >= 0) rows().splice(index, 1);
      return ok(index >= 0 ? 1 : 0);
    },
  };
}

function options() {
  const active = tables.profiles
    .filter((p) => p.status === RecordStatus.ACTIVE)
    .map((p) => enrichProfile(p))
    .map((p) => ({ id: p.id, label: p.modelName, modelName: p.modelName }));
  return ok(active);
}

function tryCall() {
  return ok({
    id: 'mock-try',
    choices: [{ message: { role: 'assistant', content: '连接正常（Mock）' } }],
    data: [{ embedding: [0.1, 0.2, 0.3], index: 0 }],
    results: [{ index: 0, relevance_score: 0.92 }],
    usage: { prompt_tokens: 12, completion_tokens: 8, total_tokens: 20 },
  });
}

let registered = false;

export function registerModelSample(): void {
  if (registered) return;
  registered = true;
  const model = Gateway.MODEL;
  mockManager.registerAll({
    ...crud(`${model}/model_service_catalog`, 'catalogs'),
    ...crud(`${model}/model_service_profile`, 'profiles', enrichProfile),
    ...crud(`${model}/model_usage_record`, 'usages'),
    [`${model}/model_service_profile/options`]: options,
    [`${model}/v1/chat/completions`]: tryCall,
    [`${model}/v1/embeddings`]: tryCall,
    [`${model}/v1/rerank`]: tryCall,
  });
}
