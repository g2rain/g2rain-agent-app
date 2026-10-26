<template>
  <div class="model_service_catalog-page">
    <!-- 查询表单 -->
    <el-card class="model_service_catalog-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item label="模型名称">
          <el-input v-model="queryForm.modelName" placeholder="请输入模型名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="模型类型">
          <el-select v-model="queryForm.modelType" placeholder="请选择模型类型" clearable style="width: 200px">
            <el-option v-for="item in MODEL_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="模型供应商">
          <el-input v-model="queryForm.provider" placeholder="请输入模型供应商" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="模型协议">
          <el-select v-model="queryForm.protocol" placeholder="请选择模型协议" clearable style="width: 200px">
            <el-option v-for="item in PROTOCOL_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择状态" clearable style="width: 200px">
            <el-option v-for="item in STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
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
    <div class="model_service_catalog-page__header">
      <div class="model_service_catalog-page__title-group">
        <h2>管理模型广场</h2>
      </div>
      <el-button type="primary" v-permission="'model_service_catalog:add'" @click="handleCreate">新增模型</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="120" />
      <el-table-column prop="modelName" label="模型名称" width="180" />
      <el-table-column prop="modelType" label="模型类型" width="120">
        <template #default="{ row }">{{ optionLabel(MODEL_TYPE_OPTIONS, row.modelType) }}</template>
      </el-table-column>
      <el-table-column prop="provider" label="模型供应商" width="180" />
      <el-table-column prop="protocol" label="模型协议" width="120">
        <template #default="{ row }">{{ optionLabel(PROTOCOL_OPTIONS, row.protocol) }}</template>
      </el-table-column>
      <el-table-column prop="baseUrl" label="模型服务地址" min-width="200" />
      <el-table-column prop="status" label="状态" width="140">
        <template #default="{ row }">
          <StatusSwitch
            v-model="row.status"
            permission="model_service_catalog:status_update"
            active-value="ACTIVE"
            inactive-value="INACTIVE"
            :options="STATUS_OPTIONS"
            :api-method="({ nextValue }) => ModelServiceCatalogApi.updateStatus(row.id, String(nextValue))"
            @success="notifyStatusSwitchSuccess"
            @error="(p) => notifyStatusSwitchError(p)"
          />
        </template>
      </el-table-column>
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" sortable="custom" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" sortable="custom" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '详情') }}</el-button>
          <el-button type="primary" v-permission="'model_service_catalog:edit'" link size="small" @click="handleEdit(row)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
          <el-button type="danger" v-permission="'model_service_catalog:delete'" link size="small" @click="handleDelete(row)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
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
    <div class="model_service_catalog-page__pagination">
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
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑模型' : '新增模型'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="130px">
        <el-form-item label="模型名称" prop="modelName">
          <el-input v-model="editForm.modelName" placeholder="请输入模型名称" />
        </el-form-item>
        <el-form-item label="模型类型" prop="modelType">
          <el-select v-model="editForm.modelType" placeholder="请选择模型类型" style="width: 100%">
            <el-option v-for="item in MODEL_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="模型供应商" prop="provider">
          <el-input v-model="editForm.provider" placeholder="请输入模型供应商" />
        </el-form-item>
        <el-form-item label="模型协议" prop="protocol">
          <el-select v-model="editForm.protocol" placeholder="请选择模型协议" style="width: 100%">
            <el-option v-for="item in PROTOCOL_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="模型服务地址" prop="baseUrl">
          <el-input v-model="editForm.baseUrl" placeholder="请输入模型服务地址" />
        </el-form-item>
        <el-form-item label="访问密钥" prop="apiKey">
          <el-input
            v-model="editForm.apiKey"
            type="password"
            show-password
            :placeholder="apiKeyPlaceholder"
          />
        </el-form-item>
        <el-form-item label="说明" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入说明" />
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
    <el-dialog v-model="detailDialogVisible" title="模型明细" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('G2_FIELD_ID', 'ID')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="模型名称">{{ currentRow?.modelName }}</el-descriptions-item>
        <el-descriptions-item label="模型类型">{{ optionLabel(MODEL_TYPE_OPTIONS, currentRow?.modelType) }}</el-descriptions-item>
        <el-descriptions-item label="模型供应商">{{ currentRow?.provider }}</el-descriptions-item>
        <el-descriptions-item label="模型协议">{{ optionLabel(PROTOCOL_OPTIONS, currentRow?.protocol) }}</el-descriptions-item>
        <el-descriptions-item label="模型服务地址">{{ currentRow?.baseUrl }}</el-descriptions-item>
        <el-descriptions-item label="访问密钥">{{ currentRow?.apiKeyConfigured ? '已配置' : '未配置' }}</el-descriptions-item>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessageBox, ElMessage } from 'element-plus';
import { t } from '@platform/i18n';
import { ModelServiceCatalogApi } from './api';
import type { ModelServiceCatalog, ModelServiceCatalogPayload, ModelServiceCatalogQuery } from './type';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';

import { SortableTable, TableColumn, SortManagerButton, QueryForm } from '@g2rain/ui';
import { StatusSwitch } from '@g2rain/ui/platform';
import { showErrorMessage, notifyStatusSwitchSuccess, notifyStatusSwitchError } from '@/components';

/** 枚举选项（后期改为字典查询） */
type EnumOption = { value: string; label: string };

const MODEL_TYPE_OPTIONS: EnumOption[] = [
  { value: 'LLM', label: '大语言模型' },
  { value: 'VECTOR', label: '向量模型' },
  { value: 'RERANK', label: '重排序模型' },
];

const PROTOCOL_OPTIONS: EnumOption[] = [
  { value: 'OPENAI', label: 'OpenAI' },
  { value: 'ANTHROPIC', label: 'Anthropic' },
  { value: 'GEMINI', label: 'Gemini' },
];

const STATUS_OPTIONS: EnumOption[] = [
  { value: 'ACTIVE', label: '启用' },
  { value: 'INACTIVE', label: '禁用' },
];

const optionLabel = (options: EnumOption[], value?: string | null): string => {
  if (!value) return '';
  return options.find((item) => item.value === value)?.label ?? value;
};

// 组件引用
const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);

// 基础查询表单（BaseSelectListDto）；用 ref 以匹配 QueryForm defineModel
const baseQueryForm = ref<BaseSelectListDto>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});

// 业务查询状态（resourceType / apiKey 不作为查询条件：后端 list/page 固定 MARKET，密钥不回传）
const queryForm = reactive({
  modelName: '',
  modelType: '',
  provider: '',
  protocol: '',
  status: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<ModelServiceCatalog[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as ModelServiceCatalogQuery;

    // 请求分页数据
    const pageData = await ModelServiceCatalogApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & ModelServiceCatalogQuery);

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
  queryForm.modelName = '';
  queryForm.modelType = '';
  queryForm.provider = '';
  queryForm.protocol = '';
  queryForm.status = '';

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
const currentRow = ref<ModelServiceCatalog | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细
const handleView = (row: ModelServiceCatalog) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: ModelServiceCatalog) => {
  ElMessageBox.confirm(`确认删除模型「${row.modelName || row.id}」吗？`, t('G2_LBL_TIP', '提示'), {
    type: 'warning',
  })
    .then(async () => {
      try {
        await ModelServiceCatalogApi.remove(row.id);
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

// 保存表单状态（resourceType 由后端 catalog/save 强制 MARKET，页面不传）
const editForm = reactive({
  id: undefined as number | undefined,
  modelName: '',
  modelType: '',
  provider: '',
  protocol: '',
  baseUrl: '',
  apiKey: '',
  apiKeyConfigured: false,
  description: '',
});

const apiKeyPlaceholder = computed(() => {
  if (!isEdit.value) return '请输入访问密钥';
  return editForm.apiKeyConfigured ? '已配置，留空表示不修改' : '未配置，请输入访问密钥';
});

// 表单校验规则
const editRules: FormRules = {
  modelName: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  modelType: [{ required: true, message: '请选择模型类型', trigger: 'change' }],
  provider: [{ required: true, message: '请输入模型供应商', trigger: 'blur' }],
  protocol: [{ required: true, message: '请选择模型协议', trigger: 'change' }],
  baseUrl: [{ required: true, message: '请输入模型服务地址', trigger: 'blur' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.id = undefined;
  editForm.modelName = '';
  editForm.modelType = 'LLM';
  editForm.provider = '';
  editForm.protocol = 'OPENAI';
  editForm.baseUrl = '';
  editForm.apiKey = '';
  editForm.apiKeyConfigured = false;
  editForm.description = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗（访问密钥不回填，留空表示不修改）
const handleEdit = (row: ModelServiceCatalog) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.modelName = row.modelName;
  editForm.modelType = row.modelType;
  editForm.provider = row.provider;
  editForm.protocol = row.protocol;
  editForm.baseUrl = row.baseUrl;
  editForm.apiKey = '';
  editForm.apiKeyConfigured = !!row.apiKeyConfigured;
  editForm.description = row.description ?? '';
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: ModelServiceCatalogPayload = {
    modelName: editForm.modelName,
    modelType: editForm.modelType,
    provider: editForm.provider,
    protocol: editForm.protocol,
    baseUrl: editForm.baseUrl,
    description: editForm.description,
  };
  // 有值才带密钥；编辑留空不修改
  if (editForm.apiKey.trim()) {
    payload.apiKey = editForm.apiKey.trim();
  }

  try {
    // 编辑模式下，将 id 添加到 payload 中；新增 status 由服务端默认（MARKET=INACTIVE / CUSTOM=ACTIVE）
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await ModelServiceCatalogApi.save(payload);
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
.model_service_catalog-page {
  padding: 20px;
  background-color: var(--g2-bg-page);
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.model_service_catalog-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: var(--g2-bg-container);
  border-radius: 4px;
}

.model_service_catalog-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.model_service_catalog-page__header h2 {
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

.model_service_catalog-page__search {
  margin-bottom: 12px;
  background-color: var(--g2-bg-container);
}

.model_service_catalog-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
