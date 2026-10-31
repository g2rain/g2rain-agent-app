<template>
  <div class="chat_prompt_template-page">
    <el-card class="chat_prompt_template-page__search" shadow="never">
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <el-form-item :label="$t('G2_FIELD_ORGAN', '所属机构')">
          <OrganSelect v-model="queryForm.organId" :placeholder="$t('G2_PH_ORGAN', '请选择所属机构')" />
        </el-form-item>
        <el-form-item :label="$t('G2_FIELD_STATUS', '状态')">
          <DictSelect v-model="queryForm.status" usage-code="ENABLE_STATUS" :placeholder="$t('G2_PH_STATUS', '请选择状态')" clearable width="200px" />
        </el-form-item>
        <template #actions>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t('G2_BTN_QUERY', '查询') }}</el-button>
            <el-button @click="handleReset">{{ $t('G2_BTN_RESET', '重置') }}</el-button>
          </el-form-item>
        </template>
      </QueryForm>
    </el-card>

    <div class="chat_prompt_template-page__header">
      <h2>{{ $t('AGENT_PROMPT_TEMPLATE_TITLE', '问题模板') }}</h2>
      <el-button type="primary" v-permission="'chat_prompt_template:add'" @click="handleCreate">
        {{ $t('AGENT_PROMPT_TEMPLATE_ADD', '新增问题模板') }}
      </el-button>
    </div>

    <SortableTable v-loading="loading" :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="100" />
      <el-table-column :label="$t('G2_FIELD_ORGAN', '所属机构')" width="160">
        <template #default="{ row }">{{ row.organName || row.organId }}</template>
      </el-table-column>
      <el-table-column prop="promptText" :label="$t('AGENT_PROMPT_TEMPLATE_TEXT', '问题内容')" min-width="280" show-overflow-tooltip />
      <el-table-column prop="sortOrder" :label="$t('AGENT_PROMPT_TEMPLATE_SORT', '展示顺序')" width="120" />
      <el-table-column prop="status" :label="$t('G2_FIELD_STATUS', '状态')" width="130">
        <template #default="{ row }">
          <StatusSwitch
            v-model="row.status"
            permission="chat_prompt_template:status_update"
            active-value="ACTIVE"
            inactive-value="INACTIVE"
            usage-code="ENABLE_STATUS"
            :api-method="changeStatus(row)"
            @success="notifyStatusSwitchSuccess"
            @error="(payload) => notifyStatusSwitchError(payload)"
          />
        </template>
      </el-table-column>
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" sortable="custom" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" sortable="custom" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="220">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '详情') }}</el-button>
          <el-button type="primary" v-permission="'chat_prompt_template:edit'" link size="small" @click="handleEdit(row)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
          <el-button type="danger" v-permission="'chat_prompt_template:delete'" link size="small" @click="handleDelete(row)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
        </template>
        <template #header>
          <div class="chat_prompt_template-page__action-header">
            <span>{{ $t('G2_FIELD_ACTION', '操作') }}</span>
            <SortManagerButton />
          </div>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty :image-size="72" :description="$t('AGENT_PROMPT_TEMPLATE_EMPTY', '暂无问题模板')" />
      </template>
    </SortableTable>

    <div class="chat_prompt_template-page__pagination">
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

    <el-dialog v-model="editDialogVisible" :title="isEdit ? $t('AGENT_PROMPT_TEMPLATE_EDIT', '编辑问题模板') : $t('AGENT_PROMPT_TEMPLATE_ADD', '新增问题模板')" width="560px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="120px">
        <el-form-item :label="$t('G2_FIELD_ORGAN', '所属机构')" prop="organId">
          <OrganSelect v-model="editForm.organId" :placeholder="$t('G2_PH_ORGAN', '请选择所属机构')" width="100%" />
        </el-form-item>
        <el-form-item :label="$t('AGENT_PROMPT_TEMPLATE_TEXT', '问题内容')" prop="promptText">
          <el-input v-model="editForm.promptText" type="textarea" :rows="3" :placeholder="$t('AGENT_PROMPT_TEMPLATE_TEXT_PH', '请输入问题内容')" maxlength="1000" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('AGENT_PROMPT_TEMPLATE_SORT', '展示顺序')" prop="sortOrder">
          <el-input-number v-model="editForm.sortOrder" :min="0" :precision="0" controls-position="right" />
          <span class="chat_prompt_template-page__field-hint">{{ $t('AGENT_PROMPT_TEMPLATE_SORT_HINT', '数值越小越靠前') }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
        <el-button type="primary" @click="submitEdit">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" :title="$t('AGENT_PROMPT_TEMPLATE_DETAIL', '问题模板详情')" width="560px">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('G2_FIELD_ID', 'ID')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_ORGAN', '所属机构')">{{ currentRow?.organName || currentRow?.organId }}</el-descriptions-item>
        <el-descriptions-item :label="$t('AGENT_PROMPT_TEMPLATE_TEXT', '问题内容')">{{ currentRow?.promptText }}</el-descriptions-item>
        <el-descriptions-item :label="$t('AGENT_PROMPT_TEMPLATE_SORT', '展示顺序')">{{ currentRow?.sortOrder }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_STATUS', '状态')"><DictText :value="currentRow?.status" usage-code="ENABLE_STATUS" /></el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_CREATE_TIME', '创建时间')">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')">{{ currentRow?.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="detailDialogVisible = false">{{ $t('G2_BTN_CLOSE', '关闭') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
import { t } from '@platform/i18n';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';
import { QueryForm, SortableTable, SortManagerButton, TableColumn } from '@g2rain/ui';
import { DictSelect, DictText, OrganSelect, StatusSwitch } from '@g2rain/ui/platform';
import { notifyStatusSwitchError, notifyStatusSwitchSuccess } from '@/components';
import { ChatPromptTemplateApi } from './api';
import type { ChatPromptTemplate, ChatPromptTemplatePayload, ChatPromptTemplateQuery } from './type';

const changeStatus = (row: ChatPromptTemplate) =>
  ({ nextValue }: { nextValue: string | number | boolean }) => ChatPromptTemplateApi.updateStatus(row.id, String(nextValue));

const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);
const baseQueryForm = ref<BaseSelectListDto>({ id: undefined, createTime: undefined, updateTime: undefined, sorts: undefined });
const queryForm = reactive({ organId: undefined as number | null | undefined, status: '' });
const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 });
const tableData = ref<ChatPromptTemplate[]>([]);
const loading = ref(false);

const loadData = async () => {
  loading.value = true;
  try {
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm }).filter(([_, value]) => (value ?? '') !== '' && [value].flat().length),
    ) as ChatPromptTemplateQuery;
    const pageData = await ChatPromptTemplateApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & ChatPromptTemplateQuery);
    tableData.value = pageData.records;
    pagination.total = pageData.total;
  } catch {
    // 请求失败由 HTTP 层统一提示
  } finally {
    loading.value = false;
  }
};

const handleSortChange = (params: Record<string, string>) => queryFormRef.value?.updateSorts(params);
const handleSearch = () => { pagination.pageNum = 1; void loadData(); };
const handleReset = () => {
  baseQueryForm.value.id = undefined;
  baseQueryForm.value.createTime = undefined;
  baseQueryForm.value.updateTime = undefined;
  baseQueryForm.value.sorts = undefined;
  queryForm.organId = undefined;
  queryForm.status = '';
  pagination.pageNum = 1;
  void loadData();
};
const handleSizeChange = (size: number) => { pagination.pageSize = size; pagination.pageNum = 1; void loadData(); };
const handlePageChange = (page: number) => { pagination.pageNum = page; void loadData(); };

const currentRow = ref<ChatPromptTemplate | null>(null);
const detailDialogVisible = ref(false);
const handleView = (row: ChatPromptTemplate) => { currentRow.value = { ...row }; detailDialogVisible.value = true; };

const handleDelete = (row: ChatPromptTemplate) => {
  ElMessageBox.confirm(
    t('AGENT_PROMPT_TEMPLATE_DELETE_CONFIRM', { id: row.id }, '确认删除问题模板「{id}」吗？'),
    t('G2_LBL_TIP', '提示'),
    { type: 'warning' },
  ).then(async () => {
    await ChatPromptTemplateApi.remove(row.id);
    if (tableData.value.length === 1 && pagination.pageNum > 1) pagination.pageNum--;
    await loadData();
    ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
  }).catch(() => {});
};

const editDialogVisible = ref(false);
const isEdit = ref(false);
const editFormRef = ref<FormInstance | null>(null);
const editForm = reactive({ id: undefined as number | undefined, organId: undefined as number | undefined, promptText: '', sortOrder: 0 });
const editRules: FormRules = {
  organId: [{ required: true, message: t('G2_PH_ORGAN', '请选择所属机构'), trigger: 'change' }],
  promptText: [{ required: true, message: t('AGENT_PROMPT_TEMPLATE_TEXT_PH', '请输入问题内容'), trigger: 'blur' }],
  sortOrder: [{ required: true, message: t('AGENT_PROMPT_TEMPLATE_SORT_PH', '请输入展示顺序'), trigger: 'change' }],
};
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();
  editForm.id = undefined;
  editForm.organId = undefined;
  editForm.promptText = '';
  editForm.sortOrder = 0;
  editDialogVisible.value = true;
};
const handleEdit = (row: ChatPromptTemplate) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();
  editForm.id = row.id;
  editForm.organId = row.organId;
  editForm.promptText = row.promptText;
  editForm.sortOrder = row.sortOrder;
  editDialogVisible.value = true;
};
const submitEdit = async () => {
  if (!editFormRef.value || !(await editFormRef.value.validate().catch(() => false))) return;
  const payload: ChatPromptTemplatePayload = {
    organId: editForm.organId,
    promptText: editForm.promptText,
    sortOrder: editForm.sortOrder,
  };
  if (isEdit.value) payload.id = editForm.id;
  else payload.status = 'ACTIVE';
  await ChatPromptTemplateApi.save(payload);
  ElMessage.success(isEdit.value ? t('G2_MSG_UPDATE_OK', '更新成功') : t('G2_MSG_ADD_OK', '新增成功'));
  await loadData();
  editDialogVisible.value = false;
};

onMounted(() => { void loadData(); });
</script>

<style scoped>
.chat_prompt_template-page { padding: 20px; background-color: var(--g2-bg-page); min-height: 100%; height: 100%; box-sizing: border-box; }
.chat_prompt_template-page__search { margin-bottom: 12px; background-color: var(--g2-bg-container); }
.chat_prompt_template-page__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding: 16px 20px; background-color: var(--g2-bg-container); border-radius: 4px; }
.chat_prompt_template-page__header h2 { margin: 0; font-size: 18px; font-weight: 600; line-height: 1.4; }
.chat_prompt_template-page__action-header { display: flex; align-items: center; gap: 8px; }
.chat_prompt_template-page__field-hint { margin-left: 10px; color: var(--g2-text-secondary); }
.chat_prompt_template-page__pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
