<template>
  <div class="mcp-tool-page">
    <header class="mcp-tool-page__head">
      <div>
        <h2>{{ $t('AGENT_MENU_MCP_TOOL', '工具目录') }}</h2>
        <p>{{ $t('AGENT_MCP_TOOL_SUBTITLE', '智能体可调用的接口') }}</p>
      </div>
      <div class="mcp-tool-page__actions">
        <el-button
          v-permission="'mcp_tool:sync'"
          disabled
          :title="$t('AGENT_MCP_TOOL_SYNC_PENDING', '同步平台接口（待后端）')"
        >
          {{ $t('AGENT_MCP_TOOL_SYNC', '同步平台接口') }}
        </el-button>
      </div>
    </header>

    <div class="mcp-tool-page__filters">
      <el-radio-group v-model="segment" @change="search">
        <el-radio-button :value="ResourceType.BUILT_IN">{{ $t('AGENT_TOOL_BUILT_IN', '平台内置') }}</el-radio-button>
        <el-radio-button :value="ResourceType.EXTENSION">{{ $t('AGENT_TOOL_EXTENSION', '扩展系统') }}</el-radio-button>
        <el-radio-button :value="ResourceType.CUSTOMER">{{ $t('AGENT_TOOL_CUSTOMER', '客户系统') }}</el-radio-button>
      </el-radio-group>
      <el-input
        v-model="keyword"
        clearable
        :placeholder="$t('AGENT_MCP_TOOL_SEARCH', '搜索名称/标题')"
        style="width: 220px"
        @change="search"
        @clear="search"
      />
      <el-select
        v-model="serviceCode"
        clearable
        filterable
        :placeholder="$t('AGENT_TOOL_SERVICE', '所属服务')"
        style="width: 180px"
        @change="search"
      >
        <el-option v-for="code in services" :key="code" :label="code" :value="code" />
      </el-select>
      <el-select
        v-model="method"
        clearable
        :placeholder="$t('AGENT_TOOL_METHOD', '方法')"
        style="width: 120px"
        @change="search"
      >
        <el-option v-for="m in METHODS" :key="m" :label="m" :value="m" />
      </el-select>
      <el-select
        v-model="status"
        clearable
        :placeholder="$t('AGENT_LIST_STATUS', '状态')"
        style="width: 120px"
        @change="search"
      >
        <el-option :label="$t('AGENT_STATUS_ACTIVE', '启用')" :value="RecordStatus.ACTIVE" />
        <el-option :label="$t('AGENT_STATUS_INACTIVE', '停用')" :value="RecordStatus.INACTIVE" />
      </el-select>
    </div>

    <el-skeleton v-if="loading && !rows.length" :rows="8" animated />

    <el-result v-else-if="failure" icon="error" :sub-title="failure">
      <template #extra><el-button type="primary" @click="load">{{ $t('G2_BTN_RETRY', '重试') }}</el-button></template>
    </el-result>

    <template v-else>
      <el-table v-loading="loading" :data="rows" class="mcp-tool-page__table" @row-click="open">
        <el-table-column :label="$t('AGENT_MENU_MCP_TOOL', '工具')" min-width="280">
          <template #default="{ row }">
            <div class="mcp-tool-page__name">
              <code>{{ row.name }}</code>
              <el-tag v-if="isWrite(row.method)" size="small" type="warning" effect="plain">{{ $t('AGENT_WRITE_MARK', '写') }}</el-tag>
            </div>
            <div class="mcp-tool-page__title">{{ row.title || EMPTY }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('AGENT_TOOL_METHOD', '方法')" width="100">
          <template #default="{ row }">
            <span class="mcp-tool-page__method" :class="`is-${row.method.toLowerCase()}`">{{ row.method }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('AGENT_TOOL_PATH', '路径')" min-width="180">
          <template #default="{ row }"><code class="mcp-tool-page__path">{{ row.path }}</code></template>
        </el-table-column>
        <el-table-column :label="$t('AGENT_TOOL_SERVICE', '服务')" width="160">
          <template #default="{ row }"><code>{{ row.serviceCode }}</code></template>
        </el-table-column>
        <el-table-column :label="$t('AGENT_LIST_STATUS', '状态')" width="100">
          <template #default="{ row }">
            <StatusDot :tone="describeStatus(row.status).tone" :label="describeStatus(row.status).label" />
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :image-size="72" :description="$t('AGENT_MCP_TOOL_EMPTY', '这个分段下还没有工具')" />
        </template>
      </el-table>

      <div class="mcp-tool-page__pagination">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="search"
          @current-change="load"
        />
      </div>
    </template>

    <ToolDetail
      :visible="detailOpen"
      :tool="current"
      :is-operator="isOperator"
      @saved="load"
      @close="detailOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { t } from '@platform/i18n';
import { PageElementPermission, StatusDot, showErrorMessage } from '@/components';
import { EMPTY, RecordStatus, ResourceType, describeStatus } from '@runtime/console';
import ToolDetail from './components/ToolDetail.vue';
import { McpToolProfileApi } from './api';
import type { McpToolProfileVo } from './type';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const route = useRoute();
const router = useRouter();

const segment = ref<string>(ResourceType.BUILT_IN);
const keyword = ref('');
const serviceCode = ref('');
const method = ref('');
const status = ref('');
const rows = ref<McpToolProfileVo[]>([]);
const services = ref<string[]>([]);
const loading = ref(false);
const failure = ref('');
const pageNum = ref(1);
const pageSize = ref(20);
const total = ref(0);

const detailOpen = ref(false);
const current = ref<McpToolProfileVo | null>(null);

/** 运营方专属同步权限，用于公共工具是否可改说明/启停 */
const isOperator = computed(() => PageElementPermission.has('mcp_tool:sync'));

function isWrite(m: string): boolean {
  return WRITE_METHODS.has(m.toUpperCase());
}

function syncQuery(): void {
  void router.replace({
    query: {
      resourceType: segment.value,
      ...(keyword.value ? { name: keyword.value } : {}),
      ...(serviceCode.value ? { serviceCode: serviceCode.value } : {}),
      ...(method.value ? { method: method.value } : {}),
      ...(status.value ? { status: status.value } : {}),
      ...(pageNum.value > 1 ? { pageNum: String(pageNum.value) } : {}),
    },
  });
}

function readQuery(): void {
  const q = route.query;
  const type = typeof q.resourceType === 'string' ? q.resourceType : ResourceType.BUILT_IN;
  segment.value =
    type === ResourceType.EXTENSION || type === ResourceType.CUSTOMER || type === ResourceType.BUILT_IN
      ? type
      : ResourceType.BUILT_IN;
  keyword.value = typeof q.name === 'string' ? q.name : '';
  serviceCode.value = typeof q.serviceCode === 'string' ? q.serviceCode : '';
  method.value = typeof q.method === 'string' ? q.method : '';
  status.value = typeof q.status === 'string' ? q.status : '';
  const n = Number(q.pageNum);
  pageNum.value = Number.isFinite(n) && n > 0 ? n : 1;
}

async function loadServices(): Promise<void> {
  try {
    const all = await McpToolProfileApi.list({ resourceType: segment.value });
    services.value = [...new Set(all.map((row) => row.serviceCode).filter(Boolean))].sort();
  } catch {
    services.value = [];
  }
}

async function load(): Promise<void> {
  loading.value = true;
  failure.value = '';
  syncQuery();
  try {
    const page = await McpToolProfileApi.page(
      {
        resourceType: segment.value,
        ...(keyword.value ? { name: keyword.value } : {}),
        ...(serviceCode.value ? { serviceCode: serviceCode.value } : {}),
        ...(method.value ? { method: method.value } : {}),
        ...(status.value ? { status: status.value } : {}),
      },
      pageNum.value,
      pageSize.value,
    );
    rows.value = page.records;
    total.value = page.total;
  } catch (error: unknown) {
    failure.value = error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载列表失败');
    showErrorMessage(failure.value);
  } finally {
    loading.value = false;
  }
}

function search(): void {
  pageNum.value = 1;
  void load();
}

function open(row: McpToolProfileVo): void {
  current.value = row;
  detailOpen.value = true;
}

watch(segment, () => {
  serviceCode.value = '';
  void loadServices();
});

onMounted(() => {
  readQuery();
  void loadServices();
  void load();
});
</script>

<style scoped>
.mcp-tool-page { padding: 16px 24px 24px; }
.mcp-tool-page__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.mcp-tool-page__head h2 { margin: 0; font-size: 18px; font-weight: 600; color: var(--g2-text-primary); }
.mcp-tool-page__head p { margin: 4px 0 0; color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.mcp-tool-page__filters { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin: 16px 0; }
.mcp-tool-page__table :deep(.el-table__row) { cursor: pointer; }
.mcp-tool-page__name { display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
.mcp-tool-page__name code,
.mcp-tool-page__path,
.mcp-tool-page__table code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
}
.mcp-tool-page__title { color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.mcp-tool-page__method {
  display: inline-block;
  min-width: 52px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  border-radius: 3px;
  padding: 1px 6px;
}
.mcp-tool-page__method.is-get { color: var(--g2-color-primary); background: color-mix(in srgb, var(--g2-color-primary) 10%, transparent); }
.mcp-tool-page__method.is-post,
.mcp-tool-page__method.is-put,
.mcp-tool-page__method.is-patch { color: var(--g2-color-success); background: color-mix(in srgb, var(--g2-color-success) 10%, transparent); }
.mcp-tool-page__method.is-delete { color: var(--g2-color-danger); background: color-mix(in srgb, var(--g2-color-danger) 10%, transparent); }
.mcp-tool-page__pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
