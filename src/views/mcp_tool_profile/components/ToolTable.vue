<template>
  <div class="tool-table">
    <el-card class="tool-table__search" shadow="never">
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <el-form-item v-if="serviceId == null" :label="$t('G2_FIELD_ORGAN', '所属机构')">
          <OrganSelect v-model="queryForm.organId" />
        </el-form-item>
        <el-form-item :label="$t('AGENT_FIELD_TOOL_NAME', '工具名称')">
          <el-input v-model="queryForm.name" :placeholder="$t('AGENT_FIELD_TOOL_NAME', '工具名称')" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item :label="$t('G2_FIELD_STATUS', '状态')">
          <DictSelect
            v-model="queryForm.status"
            usage-code="ENABLE_STATUS"
            :placeholder="$t('G2_PH_STATUS', '请选择状态')"
            clearable
            width="200px"
          />
        </el-form-item>
        <template #actions>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t('G2_BTN_QUERY', '查询') }}</el-button>
            <el-button @click="handleReset">{{ $t('G2_BTN_RESET', '重置') }}</el-button>
          </el-form-item>
        </template>
      </QueryForm>
    </el-card>

    <div class="tool-table__header">
      <h2>{{ title }}</h2>
      <div><slot name="actions" /></div>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="120" />
      <el-table-column v-if="serviceId == null" :label="$t('G2_FIELD_ORGAN', '所属机构')" width="120">
        <template #default="{ row }">
          {{ row.organName || row.organId }}
        </template>
      </el-table-column>
      <el-table-column prop="name" :label="$t('AGENT_FIELD_TOOL_NAME', '工具名称')" min-width="220" />
      <el-table-column prop="title" :label="$t('G2_FIELD_TITLE', '标题')" min-width="160" />
      <el-table-column v-if="serviceId == null" prop="serviceName" :label="$t('G2_FIELD_SERVICE_NAME', '服务名称')" width="160" />
      <el-table-column prop="method" :label="$t('AGENT_FIELD_HTTP_METHOD', 'HTTP方法')" width="120" />
      <el-table-column prop="path" :label="$t('AGENT_FIELD_HTTP_PATH', 'HTTP路径')" min-width="200" />
      <el-table-column prop="status" :label="$t('G2_FIELD_STATUS', '状态')" width="140">
        <template #default="{ row }">
          <StatusSwitch
            :model-value="row.status"
            permission="mcp_tool_profile:edit"
            active-value="ACTIVE"
            inactive-value="INACTIVE"
            usage-code="ENABLE_STATUS"
            :api-method="changeStatus(row)"
            @update:model-value="(value) => (row.status = String(value))"
            @success="notifyStatusSwitchSuccess"
            @error="(payload) => notifyStatusSwitchError(payload)"
          />
        </template>
      </el-table-column>
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" sortable="custom" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" sortable="custom" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="200">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="openDrawer(row, 'detail')">{{ $t('G2_BTN_DETAIL', '详情') }}</el-button>
          <el-button
            type="primary"
            v-permission="'mcp_tool_profile:edit'"
            link
            size="small"
            @click="openDrawer(row, 'edit')"
          >
            {{ $t('G2_BTN_EDIT', '编辑') }}
          </el-button>
          <el-button type="danger" v-permission="'mcp_tool_profile:delete'" link size="small" @click="handleDelete(row)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
        </template>
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>{{ $t('G2_FIELD_ACTION', '操作') }}</span>
            <SortManagerButton />
          </div>
        </template>
      </el-table-column>
    </SortableTable>

    <div class="tool-table__pagination">
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

    <ToolDrawer
      :visible="drawerOpen"
      :mode="drawerMode"
      :resource-type="resourceType"
      :row="currentRow"
      @close="drawerOpen = false"
      @done="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { t } from '@platform/i18n';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';
import { QueryForm, SortableTable, SortManagerButton, TableColumn } from '@g2rain/ui';
import { OrganSelect, DictSelect, StatusSwitch } from '@g2rain/ui/platform';
import { notifyStatusSwitchError, notifyStatusSwitchSuccess } from '@/components';
import { McpToolProfileApi } from '../api';
import type { McpToolProfile, McpToolProfileQuery } from '../type';
import ToolDrawer from './ToolDrawer.vue';

/**
 * 工具列表：原生工具页与服务"工具管理"抽屉共用；传 serviceId 时只看该服务的工具。
 */
const props = defineProps<{
  resourceType: string;
  serviceId?: number;
  title?: string;
}>();

// 状态开关回调：放在 script 里，避免模板内直接引用类导致 IDE 类型误报
const changeStatus = (row: McpToolProfile) =>
  ({ nextValue }: { nextValue: string | number | boolean }) =>
    McpToolProfileApi.updateStatus(row.id, String(nextValue));

const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);
const baseQueryForm = ref<BaseSelectListDto>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});
const queryForm = reactive({
  organId: undefined as number | null | undefined,
  name: '',
  status: '' as string | null | undefined,
});
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 });
const tableData = ref<McpToolProfile[]>([]);

async function loadData(): Promise<void> {
  try {
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm, serviceId: props.serviceId })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length),
    ) as McpToolProfileQuery;
    const pageData = await McpToolProfileApi.page(props.resourceType, {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & McpToolProfileQuery);
    tableData.value = pageData.records;
    pagination.total = pageData.total;
  } catch {
    // 请求失败已由 http 层统一提示
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
  queryForm.organId = undefined;
  queryForm.name = '';
  queryForm.status = '';
  handleSearch();
}

function handleSizeChange(size: number): void {
  pagination.pageSize = size;
  handleSearch();
}

function handlePageChange(page: number): void {
  pagination.pageNum = page;
  void loadData();
}

const currentRow = ref<McpToolProfile | null>(null);
const drawerOpen = ref(false);
const drawerMode = ref<'edit' | 'detail'>('detail');

function openDrawer(row: McpToolProfile, mode: 'edit' | 'detail'): void {
  currentRow.value = { ...row };
  drawerMode.value = mode;
  drawerOpen.value = true;
}

function handleDelete(row: McpToolProfile): void {
  ElMessageBox.confirm(t('AGENT_DEL_CONFIRM_TOOL', { name: row.name || row.id }, '确认删除工具「{name}」吗？'), t('G2_LBL_TIP', '提示'), { type: 'warning' })
    .then(async () => {
      await McpToolProfileApi.remove(row.id);
      if (tableData.value.length === 1 && pagination.pageNum > 1) {
        pagination.pageNum--;
      }
      await loadData();
      ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
    })
    .catch(() => {});
}

watch(
  () => [props.resourceType, props.serviceId],
  () => handleSearch(),
);

onMounted(() => {
  void loadData();
});

defineExpose({ reload: handleSearch });
</script>

<style scoped>
.tool-table__search {
  margin-bottom: 12px;
  background-color: var(--g2-bg-container);
}

.tool-table__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 16px 20px;
  background-color: var(--g2-bg-container);
  border-radius: 4px;
}

.tool-table__header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.tool-table__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
