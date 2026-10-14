<template>
  <div class="model-usage-page">
    <header class="model-usage-page__head">
      <div>
        <h2>{{ $t('AGENT_MENU_MODEL_USAGE', '用量统计') }}</h2>
        <p>{{ $t('AGENT_MODEL_USAGE_SUBTITLE', '查看本机构的模型调用与 token 消耗') }}</p>
      </div>
    </header>

    <div class="model-usage-page__filters">
      <el-date-picker
        v-model="range"
        type="datetimerange"
        value-format="YYYY-MM-DD HH:mm:ss"
        :start-placeholder="$t('AGENT_CONVERSATION_FROM', '创建时间起')"
        :end-placeholder="$t('AGENT_CONVERSATION_TO', '止')"
        style="width: 360px"
        @change="search"
      />
      <el-select
        v-model="profileId"
        clearable
        filterable
        :placeholder="$t('AGENT_MODEL_PROFILE_FILTER', '模型配置')"
        style="width: 220px"
        @change="search"
      >
        <el-option
          v-for="opt in options"
          :key="opt.id"
          :label="opt.label || opt.modelName || String(opt.id)"
          :value="opt.id"
        />
      </el-select>
    </div>

    <div class="model-usage-page__cards">
      <div class="model-usage-page__card">
        <div class="model-usage-page__card-label">{{ $t('AGENT_USAGE_TOTAL', '总 tokens') }}</div>
        <div class="model-usage-page__card-value">{{ stats.callCount ? stats.totalTokens.toLocaleString() : EMPTY }}</div>
      </div>
      <div class="model-usage-page__card">
        <div class="model-usage-page__card-label">{{ $t('AGENT_USAGE_RATIO', '输入 / 输出') }}</div>
        <div class="model-usage-page__card-value">
          <template v-if="stats.callCount">
            {{ stats.promptTokens.toLocaleString() }} / {{ stats.completionTokens.toLocaleString() }}
          </template>
          <template v-else>{{ EMPTY }}</template>
        </div>
      </div>
      <div class="model-usage-page__card">
        <div class="model-usage-page__card-label">{{ $t('AGENT_USAGE_CALLS', '调用次数') }}</div>
        <div class="model-usage-page__card-value">{{ stats.callCount ? stats.callCount.toLocaleString() : EMPTY }}</div>
      </div>
    </div>

    <el-alert
      class="model-usage-page__tip"
      type="info"
      :closable="false"
      :title="$t('AGENT_USAGE_AGG_PENDING', '按天 / 按模型聚合待后端；指标卡由当前筛选下明细前端汇总')"
    />

    <el-table v-loading="loading" :data="rows">
      <el-table-column :label="$t('G2_FIELD_CREATE_TIME', '时间')" prop="createTime" width="180" />
      <el-table-column :label="$t('AGENT_MODEL_NAME', '模型')" min-width="180" prop="modelName" />
      <el-table-column :label="$t('AGENT_USAGE_PROMPT', '输入')" width="120" prop="promptTokens" />
      <el-table-column :label="$t('AGENT_USAGE_COMPLETION', '输出')" width="120" prop="completionTokens" />
      <el-table-column :label="$t('AGENT_USAGE_SUM', '合计')" width="120" prop="totalTokens" />
      <template #empty>
        <el-empty :image-size="72" :description="$t('AGENT_USAGE_EMPTY', '所选范围内还没有用量记录')" />
      </template>
    </el-table>

    <div class="model-usage-page__pagination">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="search"
        @current-change="load"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { t } from '@platform/i18n';
import { showErrorMessage } from '@/components';
import { EMPTY } from '@runtime/console';
import { ModelUsageApi } from './api';
import type { ModelUsageOption, ModelUsageStats, ModelUsageVo } from './type';

function defaultRange(): [string, string] {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ');
  return [fmt(start), fmt(end)];
}

const range = ref<[string, string] | null>(defaultRange());
const profileId = ref<number | undefined>();
const options = ref<ModelUsageOption[]>([]);
const rows = ref<ModelUsageVo[]>([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const stats = ref<ModelUsageStats>({ totalTokens: 0, promptTokens: 0, completionTokens: 0, callCount: 0 });

function query() {
  return {
    ...(profileId.value ? { profileId: profileId.value } : {}),
    ...(range.value ? { createTime: range.value } : {}),
  };
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const q = query();
    const [page, all] = await Promise.all([
      ModelUsageApi.page(q, pageNum.value, pageSize.value),
      ModelUsageApi.listForStats(q),
    ]);
    rows.value = page.records;
    total.value = page.total;
    stats.value = ModelUsageApi.summarize(all);
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载失败'));
  } finally {
    loading.value = false;
  }
}

function search(): void {
  pageNum.value = 1;
  void load();
}

onMounted(async () => {
  options.value = await ModelUsageApi.options().catch(() => []);
  await load();
});
</script>

<style scoped>
.model-usage-page { padding: 16px 24px 24px; }
.model-usage-page__head h2 { margin: 0; font-size: 18px; font-weight: 600; }
.model-usage-page__head p { margin: 4px 0 0; color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.model-usage-page__filters { display: flex; flex-wrap: wrap; gap: 12px; margin: 16px 0; }
.model-usage-page__cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-bottom: 12px; }
.model-usage-page__card {
  padding: 16px 20px;
  border: 1px solid var(--g2-border-color);
  border-radius: 8px;
  background: var(--g2-bg-container, var(--el-bg-color));
}
.model-usage-page__card-label { color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.model-usage-page__card-value { margin-top: 8px; font-size: 22px; font-weight: 600; color: var(--g2-text-primary); }
.model-usage-page__tip { margin-bottom: 16px; }
.model-usage-page__pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
