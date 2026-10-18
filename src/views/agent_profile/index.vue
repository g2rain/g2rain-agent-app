<template>
  <div class="agent_profile-page">
    <el-card class="agent_profile-page__search" shadow="never">
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <el-form-item label="所属机构">
          <OrganSelect v-model="queryForm.organId" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="queryForm.agentName" placeholder="名称 / 编码" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 140px">
            <el-option v-for="item in STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <template #actions>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t('G2_BTN_QUERY', '查询') }}</el-button>
            <el-button @click="handleReset">{{ $t('G2_BTN_RESET', '重置') }}</el-button>
          </el-form-item>
        </template>
      </QueryForm>
    </el-card>

    <div class="agent_profile-page__header">
      <div class="agent_profile-page__title-group">
        <h2>{{ pageTitle }}</h2>
      </div>
      <el-button type="primary" v-permission="'agent_profile:add'" @click="handleCreate">新增</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="100" />
      <el-table-column prop="organId" label="所属机构" width="110" />
      <el-table-column label="智能体" min-width="220">
        <template #default="{ row }">
          <div>{{ row.agentName }}</div>
          <div class="agent_profile-page__meta">{{ row.agentCode }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="140">
        <template #default="{ row }">
          <StatusSwitch
            :model-value="row.status"
            v-permission="'agent_profile:status_update'"
            active-value="ACTIVE"
            inactive-value="INACTIVE"
            :options="STATUS_OPTIONS"
            :api-method="({ nextValue }) => AgentProfileApi.updateStatus(row.id, String(nextValue))"
            @update:model-value="(value) => (row.status = String(value))"
            @success="notifyStatusSwitchSuccess"
            @error="(p) => notifyStatusSwitchError(p)"
          />
        </template>
      </el-table-column>
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" sortable="custom" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="180">
        <template #default="{ row }">
          <el-button type="primary" v-permission="'agent_profile:edit'" link size="small" @click="handleEdit(row)">修改</el-button>
          <el-button type="danger" v-permission="'agent_profile:delete'" link size="small" @click="handleDelete(row)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
        </template>
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>{{ $t('G2_FIELD_ACTION', '操作') }}</span>
            <SortManagerButton />
          </div>
        </template>
      </el-table-column>
    </SortableTable>

    <div class="agent_profile-page__pagination">
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { t } from '@platform/i18n';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';
import { SortableTable, TableColumn, SortManagerButton, QueryForm } from '@g2rain/ui';
import { OrganSelect, StatusSwitch } from '@g2rain/ui/platform';
import { RecordStatus, ResourceType } from '@runtime/console';
import { showErrorMessage, notifyStatusSwitchSuccess, notifyStatusSwitchError } from '@/components';
import { agentDetailRoute } from '@/views/agent_detail';
import { AgentProfileApi } from './api';
import type { AgentProfile, AgentProfileQuery } from './type';

type EnumOption = { value: string; label: string };

const STATUS_OPTIONS: EnumOption[] = [
  { value: RecordStatus.ACTIVE, label: '启用' },
  { value: RecordStatus.INACTIVE, label: '禁用' },
];

const route = useRoute();
const router = useRouter();

/** 由菜单入口 path 决定，不读客户端 query */
const resourceType = computed(() =>
  route.path.includes('/platform') ? ResourceType.PLATFORM : ResourceType.CUSTOM,
);

const pageTitle = computed(() =>
  resourceType.value === ResourceType.PLATFORM
    ? t('AGENT_MENU_PLATFORM_AGENT', '平台智能体')
    : t('AGENT_MENU_CUSTOM_AGENT', '租户智能体'),
);

const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);

const baseQueryForm = ref<BaseSelectListDto>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});

const queryForm = reactive({
  organId: undefined as number | null | undefined,
  agentName: '',
  status: '',
});

const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 });
const tableData = ref<AgentProfile[]>([]);

async function loadData(): Promise<void> {
  try {
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm }).filter(([_, v]) => (v ?? '') !== '' && [v].flat().length),
    ) as AgentProfileQuery;
    const pageData = await AgentProfileApi.page(resourceType.value, {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & AgentProfileQuery);
    tableData.value = pageData.records.map((row) => ({ ...row }));
    pagination.total = pageData.total;
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载列表失败'));
  }
}

function handleSortChange(params: Record<string, string>): void {
  queryFormRef.value?.updateSorts(params);
}

function handleSearch(): void {
  pagination.pageNum = 1;
  void loadData();
}

function handleReset(): void {
  baseQueryForm.value.id = undefined;
  baseQueryForm.value.createTime = undefined;
  baseQueryForm.value.updateTime = undefined;
  baseQueryForm.value.sorts = undefined;
  queryForm.organId = undefined;
  queryForm.agentName = '';
  queryForm.status = '';
  pagination.pageNum = 1;
  void loadData();
}

function handleSizeChange(size: number): void {
  pagination.pageSize = size;
  pagination.pageNum = 1;
  void loadData();
}

function handlePageChange(page: number): void {
  pagination.pageNum = page;
  void loadData();
}

function handleCreate(): void {
  void router.push(agentDetailRoute(undefined, 'profile', resourceType.value));
}

function handleEdit(row: AgentProfile): void {
  void router.push(agentDetailRoute(row.id, 'profile', resourceType.value));
}

function handleDelete(row: AgentProfile): void {
  ElMessageBox.confirm(
    `确认删除智能体「${row.agentName}」？将同时删除其下技能与工具绑定。`,
    t('G2_LBL_TIP', '提示'),
    { type: 'warning' },
  )
    .then(async () => {
      try {
        await AgentProfileApi.remove(row.id);
        if (tableData.value.length === 1 && pagination.pageNum > 1) pagination.pageNum--;
        await loadData();
        ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
      } catch (error: unknown) {
        showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_DELETE_FAIL', '删除失败'));
      }
    })
    .catch(() => {});
}

watch(
  () => resourceType.value,
  () => {
    pagination.pageNum = 1;
    void loadData();
  },
);

onMounted(() => {
  void loadData();
});
</script>

<style scoped>
.agent_profile-page {
  padding: 20px;
  background-color: var(--g2-bg-page);
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.agent_profile-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 16px 20px;
  background-color: var(--g2-bg-container);
  border-radius: 4px;
}

.agent_profile-page__title-group h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.agent_profile-page__search {
  margin-bottom: 12px;
  background-color: var(--g2-bg-container);
}

.agent_profile-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.agent_profile-page__meta {
  margin-top: 2px;
  color: var(--g2-text-secondary);
  font-size: var(--g2-font-size-sm);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
</style>
