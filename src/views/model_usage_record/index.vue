
<template>
  <div class="model_usage_record-page">
    <!-- 查询表单 -->
    <el-card class="model_usage_record-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item label="机构ID">
          <el-input v-model="queryForm.organId" placeholder="请输入机构ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="模型服务配置ID">
          <el-input v-model="queryForm.profileId" placeholder="请输入模型服务配置ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="模型服务目录ID">
          <el-input v-model="queryForm.catalogId" placeholder="请输入模型服务目录ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="模型协议类型">
          <el-input v-model="queryForm.protocol" placeholder="请输入模型协议类型" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="模型供应商">
          <el-input v-model="queryForm.provider" placeholder="请输入模型供应商" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="调用模型ID">
          <el-input v-model="queryForm.modelName" placeholder="请输入调用模型ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="输入 token 数">
          <el-input v-model="queryForm.promptTokens" placeholder="请输入输入 token 数" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="输出 token 数">
          <el-input v-model="queryForm.completionTokens" placeholder="请输入输出 token 数" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="总 token 数">
          <el-input v-model="queryForm.totalTokens" placeholder="请输入总 token 数" clearable style="width: 200px" />
        </el-form-item>

        <!-- 操作按钮 -->
        <template #actions>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t('G2_BTN_QUERY', '查询') }}</el-button>
            <el-button @click="handleReset">{{ $t('G2_BTN_RESET', '重置') }}</el-button>
          </el-form-item>
        </template>
      </QueryForm>
    </el-card>

    <!-- 标题和操作按钮 -->
    <div class="model_usage_record-page__header">
      <div class="model_usage_record-page__title-group">
        <h2>管理模型用量记录数据</h2>
      </div>
      <el-button type="primary" v-permission="'model_usage_record:add'" @click="handleCreate">新增模型用量记录</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="120" />
      <el-table-column prop="organId" label="机构ID" width="140" />
      <el-table-column prop="profileId" label="模型服务配置ID" width="140" />
      <el-table-column prop="catalogId" label="模型服务目录ID" width="140" />
      <el-table-column prop="protocol" label="模型协议类型" width="180" />
      <el-table-column prop="provider" label="模型供应商" width="180" />
      <el-table-column prop="modelName" label="调用模型ID" width="180" />
      <el-table-column prop="promptTokens" label="输入 token 数" width="140" />
      <el-table-column prop="completionTokens" label="输出 token 数" width="140" />
      <el-table-column prop="totalTokens" label="总 token 数" width="140" />
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" sortable="custom" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" sortable="custom" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '明细') }}</el-button>
          <el-button type="primary" v-permission="'model_usage_record:edit'" link size="small" @click="handleEdit(row)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
          <el-button type="danger" v-permission="'model_usage_record:delete'" link size="small" @click="handleDelete(row)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
        </template>
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>{{ $t('G2_FIELD_ACTION', '操作') }}</span>
            <SortManagerButton />
          </div>
        </template>
      </el-table-column>
    </SortableTable>

    <!-- 分页组件 -->
    <div class="model_usage_record-page__pagination">
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

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑模型用量记录' : '新增模型用量记录'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="机构ID" prop="organId">
          <el-input v-model="editForm.organId" placeholder="请输入机构ID" />
        </el-form-item>
        <el-form-item label="模型服务配置ID" prop="profileId">
          <el-input v-model="editForm.profileId" placeholder="请输入模型服务配置ID" />
        </el-form-item>
        <el-form-item label="模型服务目录ID" prop="catalogId">
          <el-input v-model="editForm.catalogId" placeholder="请输入模型服务目录ID" />
        </el-form-item>
        <el-form-item label="模型协议类型" prop="protocol">
          <el-input v-model="editForm.protocol" placeholder="请输入模型协议类型" />
        </el-form-item>
        <el-form-item label="模型供应商" prop="provider">
          <el-input v-model="editForm.provider" placeholder="请输入模型供应商" />
        </el-form-item>
        <el-form-item label="调用模型ID" prop="modelName">
          <el-input v-model="editForm.modelName" placeholder="请输入调用模型ID" />
        </el-form-item>
        <el-form-item label="输入 token 数" prop="promptTokens">
          <el-input v-model="editForm.promptTokens" placeholder="请输入输入 token 数" />
        </el-form-item>
        <el-form-item label="输出 token 数" prop="completionTokens">
          <el-input v-model="editForm.completionTokens" placeholder="请输入输出 token 数" />
        </el-form-item>
        <el-form-item label="总 token 数" prop="totalTokens">
          <el-input v-model="editForm.totalTokens" placeholder="请输入总 token 数" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
          <el-button type="primary" @click="submitEdit">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 明细弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="模型用量记录明细" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('G2_FIELD_ID', 'ID')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="机构ID">{{ currentRow?.organId }}</el-descriptions-item>
        <el-descriptions-item label="模型服务配置ID">{{ currentRow?.profileId }}</el-descriptions-item>
        <el-descriptions-item label="模型服务目录ID">{{ currentRow?.catalogId }}</el-descriptions-item>
        <el-descriptions-item label="模型协议类型">{{ currentRow?.protocol }}</el-descriptions-item>
        <el-descriptions-item label="模型供应商">{{ currentRow?.provider }}</el-descriptions-item>
        <el-descriptions-item label="调用模型ID">{{ currentRow?.modelName }}</el-descriptions-item>
        <el-descriptions-item label="输入 token 数">{{ currentRow?.promptTokens }}</el-descriptions-item>
        <el-descriptions-item label="输出 token 数">{{ currentRow?.completionTokens }}</el-descriptions-item>
        <el-descriptions-item label="总 token 数">{{ currentRow?.totalTokens }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_CREATE_TIME', '创建时间')">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')">{{ currentRow?.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="detailDialogVisible = false">{{ $t('G2_BTN_CLOSE', '关闭') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { t } from '@platform/i18n';
import { ModelUsageRecordApi } from './api';
import type { ModelUsageRecord, ModelUsageRecordPayload, ModelUsageRecordQuery } from './type';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';

import { SortableTable, TableColumn, SortManagerButton, QueryForm } from '@g2rain/ui';
import { showErrorMessage } from '@/components';


// 组件引用
const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);

// 基础查询表单（BaseSelectListDto）；用 ref 以匹配 QueryForm defineModel
const baseQueryForm = ref<BaseSelectListDto>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});

// 业务查询状态
const queryForm = reactive({
  organId: undefined,
  profileId: undefined,
  catalogId: undefined,
  protocol: '',
  provider: '',
  modelName: '',
  promptTokens: undefined,
  completionTokens: undefined,
  totalTokens: undefined,
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<ModelUsageRecord[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as ModelUsageRecordQuery;

    // 请求分页数据
    const pageData = await ModelUsageRecordApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & ModelUsageRecordQuery);

    // 设置响应结果
    tableData.value = pageData.records;
    pagination.total = pageData.total;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载列表失败');
    showErrorMessage(msg);
  }
};

// 处理排序变化
const handleSortChange = (params: Record<string, string>) => {
  // 更新 QueryForm 的 sorts 字段
  queryFormRef.value?.updateSorts(params);
};

// 查询
const handleSearch = () => {
  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 重置查询条件
const handleReset = () => {
  // 重置基础查询表单
  baseQueryForm.value.id = undefined;
  baseQueryForm.value.createTime = undefined;
  baseQueryForm.value.updateTime = undefined;
  baseQueryForm.value.sorts = undefined;
  // 重置业务特定查询表单
  queryForm.organId = undefined;
  queryForm.profileId = undefined;
  queryForm.catalogId = undefined;
  queryForm.protocol = '';
  queryForm.provider = '';
  queryForm.modelName = '';
  queryForm.promptTokens = undefined;
  queryForm.completionTokens = undefined;
  queryForm.totalTokens = undefined;

  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 页码变化
const handlePageChange = (page: number) => {
  pagination.pageNum = page;
  loadData();
};

// 当前记录引用
const currentRow = ref<ModelUsageRecord | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细
const handleView = (row: ModelUsageRecord) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: ModelUsageRecord) => {
  ElMessageBox.confirm(`确认删除模型用量记录「${row.id}」吗？`, t('G2_LBL_TIP', '提示'), {
    type: 'warning',
  })
    .then(async () => {
      try {
        await ModelUsageRecordApi.remove(row.id);
        // 如果当前页只有一条数据，删除后应该跳转到上一页
        if (tableData.value.length === 1 && pagination.pageNum > 1) {
          pagination.pageNum--;
        }
        await loadData();
        ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : t('G2_MSG_DELETE_FAIL', '删除失败');
        showErrorMessage(msg);
      }
    })
    .catch(() => {});
};

// 保存弹窗引用
const editDialogVisible = ref(false);

// 修改标记状态
const isEdit = ref(false);

// 修改组件引用
const editFormRef = ref<FormInstance | null>(null);

// 保存表单状态
const editForm = reactive({
  id: undefined as number | undefined,
  organId: undefined as number | undefined,
  profileId: undefined as number | undefined,
  catalogId: undefined as number | undefined,
  protocol: '',
  provider: '',
  modelName: '',
  promptTokens: undefined as number | undefined,
  completionTokens: undefined as number | undefined,
  totalTokens: undefined as number | undefined,
});

// 表单校验规则
const editRules: FormRules = {
  organId: [{ required: true, message: '请输入机构标识', trigger: 'blur' }],
  profileId: [{ required: true, message: '请输入模型服务配置标识', trigger: 'blur' }],
  catalogId: [{ required: true, message: '请输入模型服务目录标识', trigger: 'blur' }],
  protocol: [{ required: true, message: '请输入模型协议类型', trigger: 'blur' }],
  provider: [{ required: true, message: '请输入模型供应商', trigger: 'blur' }],
  modelName: [{ required: true, message: '请输入调用模型标识', trigger: 'blur' }],
  promptTokens: [{ required: true, message: '请输入输入 token 数', trigger: 'blur' }],
  completionTokens: [{ required: true, message: '请输入输出 token 数', trigger: 'blur' }],
  totalTokens: [{ required: true, message: '请输入总 token 数', trigger: 'blur' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.organId = undefined;
  editForm.profileId = undefined;
  editForm.catalogId = undefined;
  editForm.protocol = '';
  editForm.provider = '';
  editForm.modelName = '';
  editForm.promptTokens = undefined;
  editForm.completionTokens = undefined;
  editForm.totalTokens = undefined;
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: ModelUsageRecord) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.organId = row.organId;
  editForm.profileId = row.profileId;
  editForm.catalogId = row.catalogId;
  editForm.protocol = row.protocol;
  editForm.provider = row.provider;
  editForm.modelName = row.modelName;
  editForm.promptTokens = row.promptTokens;
  editForm.completionTokens = row.completionTokens;
  editForm.totalTokens = row.totalTokens;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: ModelUsageRecordPayload = {
    organId: editForm.organId,
    profileId: editForm.profileId,
    catalogId: editForm.catalogId,
    protocol: editForm.protocol,
    provider: editForm.provider,
    modelName: editForm.modelName,
    promptTokens: editForm.promptTokens,
    completionTokens: editForm.completionTokens,
    totalTokens: editForm.totalTokens,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await ModelUsageRecordApi.save(payload);
    ElMessage.success(isEdit.value ? t('G2_MSG_UPDATE_OK', '更新成功') : t('G2_MSG_ADD_OK', '新增成功'));
    await loadData();
    editDialogVisible.value = false;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败');
    showErrorMessage(msg);
  }
};

// 挂载回调
onMounted(() => {
  // 查询列表
  loadData();
});
</script>

<style scoped>
.model_usage_record-page {
  padding: 20px;
  background-color: var(--g2-bg-page);
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.model_usage_record-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: var(--g2-bg-container);
  border-radius: 4px;
}

.model_usage_record-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.model_usage_record-page__header h2 {
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

.model_usage_record-page__search {
  margin-bottom: 12px;
  background-color: var(--g2-bg-container);
}

.model_usage_record-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
