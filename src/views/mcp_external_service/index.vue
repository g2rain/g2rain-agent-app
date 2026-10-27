<template>
  <div class="mcp_external_service-page">
    <el-card class="mcp_external_service-page__search" shadow="never">
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <el-form-item label="所属机构">
          <OrganSelect v-model="queryForm.organId" />
        </el-form-item>
        <el-form-item label="服务名称">
          <el-input v-model="queryForm.name" placeholder="请输入服务名称" clearable style="width: 180px" />
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

    <div class="mcp_external_service-page__header">
      <div class="mcp_external_service-page__title-group">
        <h2>{{ pageTitle }}</h2>
      </div>
      <el-button type="primary" v-permission="'mcp_external_service:add'" @click="handleCreate">新增</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="100" />
      <el-table-column prop="organId" label="所属机构" width="110" />
      <el-table-column prop="name" label="服务名称" min-width="160" />
      <el-table-column label="调用基址" min-width="240">
        <template #default="{ row }">
          <code>{{ row.endpoint }}</code>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="140">
        <template #default="{ row }">
          <StatusSwitch
            :model-value="row.status"
            permission="mcp_external_service:edit"
            active-value="ACTIVE"
            inactive-value="INACTIVE"
            :options="STATUS_OPTIONS"
            :api-method="({ nextValue }) => McpExternalServiceApi.updateStatus(row.id, String(nextValue))"
            @update:model-value="(value) => (row.status = String(value))"
            @success="notifyStatusSwitchSuccess"
            @error="(p) => notifyStatusSwitchError(p)"
          />
        </template>
      </el-table-column>
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" sortable="custom" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="260">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="toolsService = row">工具管理</el-button>
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '详情') }}</el-button>
          <el-button type="primary" v-permission="'mcp_external_service:edit'" link size="small" @click="handleEdit(row)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
          <el-button type="danger" v-permission="'mcp_external_service:delete'" link size="small" @click="handleDelete(row)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
        </template>
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>{{ $t('G2_FIELD_ACTION', '操作') }}</span>
            <SortManagerButton />
          </div>
        </template>
      </el-table-column>
    </SortableTable>

    <div class="mcp_external_service-page__pagination">
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

    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑服务' : '新增服务'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item v-if="!isEdit || editForm.organId != null" label="所属机构" prop="organId">
          <OrganSelect v-model="editForm.organId" :disabled="isEdit" width="100%" />
        </el-form-item>
        <el-form-item label="服务名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入服务名称" />
        </el-form-item>
        <el-form-item label="调用基址" prop="endpoint">
          <el-input v-model="editForm.endpoint" placeholder="完整基址，如 https://erp.example.com/api" />
        </el-form-item>
        <el-form-item label="说明" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="2" placeholder="请输入说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
          <el-button type="primary" @click="submitEdit">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="服务明细" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('G2_FIELD_ID', 'ID')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="所属机构">{{ currentRow?.organId }}</el-descriptions-item>
        <el-descriptions-item label="服务名称">{{ currentRow?.name }}</el-descriptions-item>
        <el-descriptions-item label="调用基址">{{ currentRow?.endpoint }}</el-descriptions-item>
        <el-descriptions-item label="资源类型">{{ pageTitle }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ optionLabel(STATUS_OPTIONS, currentRow?.status) }}</el-descriptions-item>
        <el-descriptions-item label="说明">{{ currentRow?.description }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_CREATE_TIME', '创建时间')">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')">{{ currentRow?.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="detailDialogVisible = false">{{ $t('G2_BTN_CLOSE', '关闭') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <ServiceTools
      v-if="toolsService"
      visible
      :resource-type="resourceType"
      :service-id="toolsService.id"
      :service-name="toolsService.name"
      @close="toolsService = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { t } from '@platform/i18n';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';
import { SortableTable, TableColumn, SortManagerButton, QueryForm } from '@g2rain/ui';
import { OrganSelect, StatusSwitch } from '@g2rain/ui/platform';
import { RecordStatus, ResourceType } from '@runtime/console';
import { notifyStatusSwitchSuccess, notifyStatusSwitchError } from '@/components';
import { ServiceTools } from '@/views/mcp_tool_profile';
import { McpExternalServiceApi } from './api';
import type { McpExternalService, McpExternalServicePayload, McpExternalServiceQuery } from './type';

type EnumOption = { value: string; label: string };

const STATUS_OPTIONS: EnumOption[] = [
  { value: RecordStatus.ACTIVE, label: '启用' },
  { value: RecordStatus.INACTIVE, label: '禁用' },
];

const optionLabel = (options: EnumOption[], value?: string | null): string => {
  if (!value) return '';
  return options.find((item) => item.value === value)?.label ?? value;
};

const route = useRoute();

/** 由菜单入口 path 决定，不读客户端 query */
const resourceType = computed(() =>
  route.path.includes('/extension') ? ResourceType.EXTENSION : ResourceType.CUSTOMER,
);

const pageTitle = computed(() =>
  resourceType.value === ResourceType.EXTENSION
    ? t('AGENT_MENU_EXTENSION_TOOL', '平台扩展工具')
    : t('AGENT_MENU_CUSTOMER_TOOL', '租户系统工具'),
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
  name: '',
  status: '',
});

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

const tableData = ref<McpExternalService[]>([]);

async function loadData(): Promise<void> {
  try {
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm }).filter(([_, v]) => (v ?? '') !== '' && [v].flat().length),
    ) as McpExternalServiceQuery;
    const pageData = await McpExternalServiceApi.page(resourceType.value, {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & McpExternalServiceQuery);
    tableData.value = pageData.records.map((row) => ({ ...row }));
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

const currentRow = ref<McpExternalService | null>(null);
/** 正在管理工具的服务 */
const toolsService = ref<McpExternalService | null>(null);
const detailDialogVisible = ref(false);

function handleView(row: McpExternalService): void {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
}

function handleDelete(row: McpExternalService): void {
  ElMessageBox.confirm(`确认删除服务「${row.name}」吗？`, t('G2_LBL_TIP', '提示'), {
    type: 'warning',
  })
    .then(async () => {
      await McpExternalServiceApi.remove(row.id);
      if (tableData.value.length === 1 && pagination.pageNum > 1) {
        pagination.pageNum--;
      }
      await loadData();
      ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
    })
    .catch(() => {});
}

const editDialogVisible = ref(false);
const isEdit = ref(false);
const editFormRef = ref<FormInstance | null>(null);

const editForm = reactive({
  id: undefined as number | undefined,
  organId: undefined as number | null | undefined,
  name: '',
  endpoint: '',
  description: '',
});

const editRules: FormRules = {
  organId: [{
    validator: (_rule, value, callback) => {
      if (isEdit.value || value != null) callback();
      else callback(new Error('请选择所属机构'));
    },
    trigger: 'change',
  }],
  name: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
  endpoint: [{ required: true, message: '请输入调用基址', trigger: 'blur' }],
};

function handleCreate(): void {
  isEdit.value = false;
  editFormRef.value?.clearValidate();
  editForm.id = undefined;
  editForm.organId = undefined;
  editForm.name = '';
  editForm.endpoint = '';
  editForm.description = '';
  editDialogVisible.value = true;
}

function handleEdit(row: McpExternalService): void {
  isEdit.value = true;
  editFormRef.value?.clearValidate();
  editForm.id = row.id;
  editForm.organId = row.organId ?? undefined;
  editForm.name = row.name;
  editForm.endpoint = row.endpoint;
  editForm.description = row.description ?? '';
  editDialogVisible.value = true;
}

async function submitEdit(): Promise<void> {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate().catch(() => false);
  if (!valid) return;

  const payload: McpExternalServicePayload = {
    organId: editForm.organId ?? undefined,
    name: editForm.name.trim(),
    endpoint: editForm.endpoint.trim(),
    description: editForm.description,
  };
  if (isEdit.value) {
    payload.id = editForm.id;
  }

  await McpExternalServiceApi.save(resourceType.value, payload);
  ElMessage.success(isEdit.value ? t('G2_MSG_UPDATE_OK', '更新成功') : t('G2_MSG_ADD_OK', '新增成功'));
  await loadData();
  editDialogVisible.value = false;
}

watch(
  () => route.path,
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
.mcp_external_service-page {
  padding: 20px;
  background-color: var(--g2-bg-page);
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.mcp_external_service-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: var(--g2-bg-container);
  border-radius: 4px;
}

.mcp_external_service-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mcp_external_service-page__header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.mcp_external_service-page__search {
  margin-bottom: 12px;
  background-color: var(--g2-bg-container);
}

.mcp_external_service-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.mcp_external_service-page code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  color: var(--g2-text-secondary);
}
</style>
