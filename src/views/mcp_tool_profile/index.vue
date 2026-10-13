
<template>
  <div class="mcp_tool_profile-page">
    <!-- 查询表单 -->
    <el-card class="mcp_tool_profile-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item label="机构ID">
          <el-input v-model="queryForm.organId" placeholder="请输入机构ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="Tool名称">
          <el-input v-model="queryForm.name" placeholder="请输入Tool名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="Tool标题">
          <el-input v-model="queryForm.title" placeholder="请输入Tool标题" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="资源类型">
          <el-input v-model="queryForm.resourceType" placeholder="请输入资源类型" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="所属服务编码">
          <el-input v-model="queryForm.serviceCode" placeholder="请输入所属服务编码" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="来源ID">
          <el-input v-model="queryForm.sourceId" placeholder="请输入来源ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="HTTP方法">
          <el-input v-model="queryForm.method" placeholder="请输入HTTP方法" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="HTTP路径">
          <el-input v-model="queryForm.path" placeholder="请输入HTTP路径" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="OpenAPI Operation">
          <el-input v-model="queryForm.openapiOperation" placeholder="请输入OpenAPI Operation" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="MCP inputSchema">
          <el-input v-model="queryForm.inputSchema" placeholder="请输入MCP inputSchema" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-input v-model="queryForm.status" placeholder="请输入状态" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="Tool说明">
          <el-input v-model="queryForm.description" placeholder="请输入Tool说明" clearable style="width: 200px" />
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
    <div class="mcp_tool_profile-page__header">
      <div class="mcp_tool_profile-page__title-group">
        <h2>管理暴露档案表数据</h2>
      </div>
      <el-button type="primary" v-permission="'mcp_tool_profile:add'" @click="handleCreate">新增暴露档案表</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="120" />
      <el-table-column prop="organId" label="机构ID" width="140" />
      <el-table-column prop="name" label="Tool名称" width="180" />
      <el-table-column prop="title" label="Tool标题" width="180" />
      <el-table-column prop="resourceType" label="资源类型" width="180" />
      <el-table-column prop="serviceCode" label="所属服务编码" width="180" />
      <el-table-column prop="sourceId" label="来源ID" width="140" />
      <el-table-column prop="method" label="HTTP方法" width="180" />
      <el-table-column prop="path" label="HTTP路径" width="180" />
      <el-table-column prop="openapiOperation" label="OpenAPI Operation" width="180" />
      <el-table-column prop="inputSchema" label="MCP inputSchema" width="180" />
      <el-table-column prop="status" label="状态" width="180" />
      <el-table-column prop="description" label="Tool说明" width="180" />
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" sortable="custom" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" sortable="custom" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '明细') }}</el-button>
          <el-button type="primary" v-permission="'mcp_tool_profile:edit'" link size="small" @click="handleEdit(row)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
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

    <!-- 分页组件 -->
    <div class="mcp_tool_profile-page__pagination">
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
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑暴露档案表' : '新增暴露档案表'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="机构ID" prop="organId">
          <el-input v-model="editForm.organId" placeholder="请输入机构ID" />
        </el-form-item>
        <el-form-item label="Tool名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入Tool名称" />
        </el-form-item>
        <el-form-item label="Tool标题" prop="title">
          <el-input v-model="editForm.title" placeholder="请输入Tool标题" />
        </el-form-item>
        <el-form-item label="资源类型" prop="resourceType">
          <el-input v-model="editForm.resourceType" placeholder="请输入资源类型" />
        </el-form-item>
        <el-form-item label="所属服务编码" prop="serviceCode">
          <el-input v-model="editForm.serviceCode" placeholder="请输入所属服务编码" />
        </el-form-item>
        <el-form-item label="来源ID" prop="sourceId">
          <el-input v-model="editForm.sourceId" placeholder="请输入来源ID" />
        </el-form-item>
        <el-form-item label="HTTP方法" prop="method">
          <el-input v-model="editForm.method" placeholder="请输入HTTP方法" />
        </el-form-item>
        <el-form-item label="HTTP路径" prop="path">
          <el-input v-model="editForm.path" placeholder="请输入HTTP路径" />
        </el-form-item>
        <el-form-item label="OpenAPI Operation" prop="openapiOperation">
          <el-input v-model="editForm.openapiOperation" placeholder="请输入OpenAPI Operation" />
        </el-form-item>
        <el-form-item label="MCP inputSchema" prop="inputSchema">
          <el-input v-model="editForm.inputSchema" placeholder="请输入MCP inputSchema" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-input v-model="editForm.status" placeholder="请输入状态" />
        </el-form-item>
        <el-form-item label="Tool说明" prop="description">
          <el-input v-model="editForm.description" placeholder="请输入Tool说明" />
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
    <el-dialog v-model="detailDialogVisible" title="暴露档案表明细" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('G2_FIELD_ID', 'ID')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="机构ID">{{ currentRow?.organId }}</el-descriptions-item>
        <el-descriptions-item label="Tool名称">{{ currentRow?.name }}</el-descriptions-item>
        <el-descriptions-item label="Tool标题">{{ currentRow?.title }}</el-descriptions-item>
        <el-descriptions-item label="资源类型">{{ currentRow?.resourceType }}</el-descriptions-item>
        <el-descriptions-item label="所属服务编码">{{ currentRow?.serviceCode }}</el-descriptions-item>
        <el-descriptions-item label="来源ID">{{ currentRow?.sourceId }}</el-descriptions-item>
        <el-descriptions-item label="HTTP方法">{{ currentRow?.method }}</el-descriptions-item>
        <el-descriptions-item label="HTTP路径">{{ currentRow?.path }}</el-descriptions-item>
        <el-descriptions-item label="OpenAPI Operation">{{ currentRow?.openapiOperation }}</el-descriptions-item>
        <el-descriptions-item label="MCP inputSchema">{{ currentRow?.inputSchema }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentRow?.status }}</el-descriptions-item>
        <el-descriptions-item label="Tool说明">{{ currentRow?.description }}</el-descriptions-item>
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
import { McpToolProfileApi } from './api';
import type { McpToolProfile, McpToolProfilePayload, McpToolProfileQuery } from './type';
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
  name: '',
  title: '',
  resourceType: '',
  serviceCode: '',
  sourceId: undefined,
  method: '',
  path: '',
  openapiOperation: '',
  inputSchema: '',
  status: '',
  description: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<McpToolProfile[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as McpToolProfileQuery;

    // 请求分页数据
    const pageData = await McpToolProfileApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & McpToolProfileQuery);

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
  queryForm.name = '';
  queryForm.title = '';
  queryForm.resourceType = '';
  queryForm.serviceCode = '';
  queryForm.sourceId = undefined;
  queryForm.method = '';
  queryForm.path = '';
  queryForm.openapiOperation = '';
  queryForm.inputSchema = '';
  queryForm.status = '';
  queryForm.description = '';

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
const currentRow = ref<McpToolProfile | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细
const handleView = (row: McpToolProfile) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: McpToolProfile) => {
  ElMessageBox.confirm(`确认删除暴露档案表「${row.id}」吗？`, t('G2_LBL_TIP', '提示'), {
    type: 'warning',
  })
    .then(async () => {
      try {
        await McpToolProfileApi.remove(row.id);
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
  name: '',
  title: '',
  resourceType: '',
  serviceCode: '',
  sourceId: undefined as number | undefined,
  method: '',
  path: '',
  openapiOperation: '',
  inputSchema: '',
  status: '',
  description: '',
});

// 表单校验规则
const editRules: FormRules = {
  organId: [{ required: true, message: '请输入机构标识', trigger: 'blur' }],
  name: [{ required: true, message: '请输入Tool名称(MCP tools/call name)', trigger: 'blur' }],
  title: [{ required: true, message: '请输入Tool标题(MCP title)', trigger: 'blur' }],
  resourceType: [{ required: true, message: '请输入资源类型[BUILT_IN:自有系统, EXTENSION:扩展系统, CUSTOMER:客户系统]', trigger: 'blur' }],
  serviceCode: [{ required: true, message: '请输入所属服务编码(BUILT_IN→basis.service_registry; 其余→mcp_external_service.code)', trigger: 'blur' }],
  method: [{ required: true, message: '请输入HTTP方法', trigger: 'blur' }],
  path: [{ required: true, message: '请输入HTTP路径', trigger: 'blur' }],
  openapiOperation: [{ required: true, message: '请输入OpenAPI Operation(compose/decompose)', trigger: 'blur' }],
  inputSchema: [{ required: true, message: '请输入MCP inputSchema', trigger: 'blur' }],
  status: [{ required: true, message: '请输入状态[ACTIVE:启用, INACTIVE:禁用]', trigger: 'blur' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.organId = undefined;
  editForm.name = '';
  editForm.title = '';
  editForm.resourceType = '';
  editForm.serviceCode = '';
  editForm.sourceId = undefined;
  editForm.method = '';
  editForm.path = '';
  editForm.openapiOperation = '';
  editForm.inputSchema = '';
  editForm.status = '';
  editForm.description = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: McpToolProfile) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.organId = row.organId;
  editForm.name = row.name;
  editForm.title = row.title;
  editForm.resourceType = row.resourceType;
  editForm.serviceCode = row.serviceCode;
  editForm.sourceId = row.sourceId;
  editForm.method = row.method;
  editForm.path = row.path;
  editForm.openapiOperation = row.openapiOperation;
  editForm.inputSchema = row.inputSchema;
  editForm.status = row.status;
  editForm.description = row.description;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: McpToolProfilePayload = {
    organId: editForm.organId,
    name: editForm.name,
    title: editForm.title,
    resourceType: editForm.resourceType,
    serviceCode: editForm.serviceCode,
    sourceId: editForm.sourceId,
    method: editForm.method,
    path: editForm.path,
    openapiOperation: editForm.openapiOperation,
    inputSchema: editForm.inputSchema,
    status: editForm.status,
    description: editForm.description,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await McpToolProfileApi.save(payload);
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
.mcp_tool_profile-page {
  padding: 20px;
  background-color: var(--g2-bg-page);
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.mcp_tool_profile-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: var(--g2-bg-container);
  border-radius: 4px;
}

.mcp_tool_profile-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mcp_tool_profile-page__header h2 {
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

.mcp_tool_profile-page__search {
  margin-bottom: 12px;
  background-color: var(--g2-bg-container);
}

.mcp_tool_profile-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
