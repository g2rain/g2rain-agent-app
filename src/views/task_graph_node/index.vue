
<template>
  <div class="task_graph_node-page">
    <!-- 查询表单 -->
    <el-card class="task_graph_node-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item label="机构ID">
          <el-input v-model="queryForm.organId" placeholder="请输入机构ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="所属任务">
          <el-input v-model="queryForm.taskId" placeholder="请输入所属任务" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="步骤业务ID">
          <el-input v-model="queryForm.nodeId" placeholder="请输入步骤业务ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="步骤标题">
          <el-input v-model="queryForm.title" placeholder="请输入步骤标题" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="步骤硬目标">
          <el-input v-model="queryForm.objective" placeholder="请输入步骤硬目标" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="技能键">
          <el-input v-model="queryForm.skillKey" placeholder="请输入技能键" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="完成目标：节点要完成的写工具注册名">
          <el-input v-model="queryForm.target" placeholder="请输入完成目标：节点要完成的写工具注册名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="完成目标是否由首个写调用自动记录">
          <el-input v-model="queryForm.targetClaimed" placeholder="请输入完成目标是否由首个写调用自动记录" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="委派深度">
          <el-input v-model="queryForm.delegateDepth" placeholder="请输入委派深度" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="步骤状态">
          <el-input v-model="queryForm.status" placeholder="请输入步骤状态" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="节点结论：完成时给用户的结论">
          <el-input v-model="queryForm.result" placeholder="请输入节点结论：完成时给用户的结论" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="输入">
          <el-input v-model="queryForm.inputs" placeholder="请输入输入" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="输出">
          <el-input v-model="queryForm.outputs" placeholder="请输入输出" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="节点空间">
          <el-input v-model="queryForm.state" placeholder="请输入节点空间" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="错误码">
          <el-input v-model="queryForm.errorCode" placeholder="请输入错误码" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="错误信息">
          <el-input v-model="queryForm.errorMessage" placeholder="请输入错误信息" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-input v-model="queryForm.startedTime" placeholder="请输入开始时间" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-input v-model="queryForm.finishedTime" placeholder="请输入结束时间" clearable style="width: 200px" />
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
    <div class="task_graph_node-page__header">
      <div class="task_graph_node-page__title-group">
        <h2>管理任务图步骤表数据</h2>
      </div>
      <el-button type="primary" v-permission="'task_graph_node:add'" @click="handleCreate">新增任务图步骤表</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="120" />
      <el-table-column prop="organId" label="机构ID" width="140" />
      <el-table-column prop="taskId" label="所属任务" width="180" />
      <el-table-column prop="nodeId" label="步骤业务ID" width="180" />
      <el-table-column prop="title" label="步骤标题" width="180" />
      <el-table-column prop="objective" label="步骤硬目标" width="180" />
      <el-table-column prop="skillKey" label="技能键" width="180" />
      <el-table-column prop="target" label="完成目标：节点要完成的写工具注册名" width="180" />
      <el-table-column prop="targetClaimed" label="完成目标是否由首个写调用自动记录" width="140" />
      <el-table-column prop="delegateDepth" label="委派深度" width="140" />
      <el-table-column prop="status" label="步骤状态" width="180" />
      <el-table-column prop="result" label="节点结论：完成时给用户的结论" width="180" />
      <el-table-column prop="inputs" label="输入" width="180" />
      <el-table-column prop="outputs" label="输出" width="180" />
      <el-table-column prop="state" label="节点空间" width="180" />
      <el-table-column prop="errorCode" label="错误码" width="180" />
      <el-table-column prop="errorMessage" label="错误信息" width="180" />
      <el-table-column prop="startedTime" label="开始时间" width="180" />
      <el-table-column prop="finishedTime" label="结束时间" width="180" />
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" sortable="custom" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" sortable="custom" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '明细') }}</el-button>
          <el-button type="primary" v-permission="'task_graph_node:edit'" link size="small" @click="handleEdit(row)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
          <el-button type="danger" v-permission="'task_graph_node:delete'" link size="small" @click="handleDelete(row)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
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
    <div class="task_graph_node-page__pagination">
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
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑任务图步骤表' : '新增任务图步骤表'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="机构ID" prop="organId">
          <el-input v-model="editForm.organId" placeholder="请输入机构ID" />
        </el-form-item>
        <el-form-item label="所属任务" prop="taskId">
          <el-input v-model="editForm.taskId" placeholder="请输入所属任务" />
        </el-form-item>
        <el-form-item label="步骤业务ID" prop="nodeId">
          <el-input v-model="editForm.nodeId" placeholder="请输入步骤业务ID" />
        </el-form-item>
        <el-form-item label="步骤标题" prop="title">
          <el-input v-model="editForm.title" placeholder="请输入步骤标题" />
        </el-form-item>
        <el-form-item label="步骤硬目标" prop="objective">
          <el-input v-model="editForm.objective" placeholder="请输入步骤硬目标" />
        </el-form-item>
        <el-form-item label="技能键" prop="skillKey">
          <el-input v-model="editForm.skillKey" placeholder="请输入技能键" />
        </el-form-item>
        <el-form-item label="完成目标：节点要完成的写工具注册名" prop="target">
          <el-input v-model="editForm.target" placeholder="请输入完成目标：节点要完成的写工具注册名" />
        </el-form-item>
        <el-form-item label="完成目标是否由首个写调用自动记录" prop="targetClaimed">
          <el-input v-model="editForm.targetClaimed" placeholder="请输入完成目标是否由首个写调用自动记录" />
        </el-form-item>
        <el-form-item label="委派深度" prop="delegateDepth">
          <el-input v-model="editForm.delegateDepth" placeholder="请输入委派深度" />
        </el-form-item>
        <el-form-item label="步骤状态" prop="status">
          <el-input v-model="editForm.status" placeholder="请输入步骤状态" />
        </el-form-item>
        <el-form-item label="节点结论：完成时给用户的结论" prop="result">
          <el-input v-model="editForm.result" placeholder="请输入节点结论：完成时给用户的结论" />
        </el-form-item>
        <el-form-item label="输入" prop="inputs">
          <el-input v-model="editForm.inputs" placeholder="请输入输入" />
        </el-form-item>
        <el-form-item label="输出" prop="outputs">
          <el-input v-model="editForm.outputs" placeholder="请输入输出" />
        </el-form-item>
        <el-form-item label="节点空间" prop="state">
          <el-input v-model="editForm.state" placeholder="请输入节点空间" />
        </el-form-item>
        <el-form-item label="错误码" prop="errorCode">
          <el-input v-model="editForm.errorCode" placeholder="请输入错误码" />
        </el-form-item>
        <el-form-item label="错误信息" prop="errorMessage">
          <el-input v-model="editForm.errorMessage" placeholder="请输入错误信息" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startedTime">
          <el-input v-model="editForm.startedTime" placeholder="请输入开始时间" />
        </el-form-item>
        <el-form-item label="结束时间" prop="finishedTime">
          <el-input v-model="editForm.finishedTime" placeholder="请输入结束时间" />
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
    <el-dialog v-model="detailDialogVisible" title="任务图步骤表明细" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('G2_FIELD_ID', 'ID')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="机构ID">{{ currentRow?.organId }}</el-descriptions-item>
        <el-descriptions-item label="所属任务">{{ currentRow?.taskId }}</el-descriptions-item>
        <el-descriptions-item label="步骤业务ID">{{ currentRow?.nodeId }}</el-descriptions-item>
        <el-descriptions-item label="步骤标题">{{ currentRow?.title }}</el-descriptions-item>
        <el-descriptions-item label="步骤硬目标">{{ currentRow?.objective }}</el-descriptions-item>
        <el-descriptions-item label="技能键">{{ currentRow?.skillKey }}</el-descriptions-item>
        <el-descriptions-item label="完成目标：节点要完成的写工具注册名">{{ currentRow?.target }}</el-descriptions-item>
        <el-descriptions-item label="完成目标是否由首个写调用自动记录">{{ currentRow?.targetClaimed }}</el-descriptions-item>
        <el-descriptions-item label="委派深度">{{ currentRow?.delegateDepth }}</el-descriptions-item>
        <el-descriptions-item label="步骤状态">{{ currentRow?.status }}</el-descriptions-item>
        <el-descriptions-item label="节点结论：完成时给用户的结论">{{ currentRow?.result }}</el-descriptions-item>
        <el-descriptions-item label="输入">{{ currentRow?.inputs }}</el-descriptions-item>
        <el-descriptions-item label="输出">{{ currentRow?.outputs }}</el-descriptions-item>
        <el-descriptions-item label="节点空间">{{ currentRow?.state }}</el-descriptions-item>
        <el-descriptions-item label="错误码">{{ currentRow?.errorCode }}</el-descriptions-item>
        <el-descriptions-item label="错误信息">{{ currentRow?.errorMessage }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentRow?.startedTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentRow?.finishedTime }}</el-descriptions-item>
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
import { TaskGraphNodeApi } from './api';
import type { TaskGraphNode, TaskGraphNodePayload, TaskGraphNodeQuery } from './type';
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
  taskId: '',
  nodeId: '',
  title: '',
  objective: '',
  skillKey: '',
  target: '',
  targetClaimed: undefined,
  delegateDepth: undefined,
  status: '',
  result: '',
  inputs: '',
  outputs: '',
  state: '',
  errorCode: '',
  errorMessage: '',
  startedTime: '',
  finishedTime: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<TaskGraphNode[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as TaskGraphNodeQuery;

    // 请求分页数据
    const pageData = await TaskGraphNodeApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & TaskGraphNodeQuery);

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
  queryForm.taskId = '';
  queryForm.nodeId = '';
  queryForm.title = '';
  queryForm.objective = '';
  queryForm.skillKey = '';
  queryForm.target = '';
  queryForm.targetClaimed = undefined;
  queryForm.delegateDepth = undefined;
  queryForm.status = '';
  queryForm.result = '';
  queryForm.inputs = '';
  queryForm.outputs = '';
  queryForm.state = '';
  queryForm.errorCode = '';
  queryForm.errorMessage = '';
  queryForm.startedTime = '';
  queryForm.finishedTime = '';

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
const currentRow = ref<TaskGraphNode | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细
const handleView = (row: TaskGraphNode) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: TaskGraphNode) => {
  ElMessageBox.confirm(`确认删除任务图步骤表「${row.id}」吗？`, t('G2_LBL_TIP', '提示'), {
    type: 'warning',
  })
    .then(async () => {
      try {
        await TaskGraphNodeApi.remove(row.id);
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
  taskId: '',
  nodeId: '',
  title: '',
  objective: '',
  skillKey: '',
  target: '',
  targetClaimed: undefined as number | undefined,
  delegateDepth: undefined as number | undefined,
  status: '',
  result: '',
  inputs: '',
  outputs: '',
  state: '',
  errorCode: '',
  errorMessage: '',
  startedTime: '',
  finishedTime: '',
});

// 表单校验规则
const editRules: FormRules = {
  organId: [{ required: true, message: '请输入机构标识', trigger: 'blur' }],
  taskId: [{ required: true, message: '请输入所属任务', trigger: 'blur' }],
  nodeId: [{ required: true, message: '请输入步骤业务标识', trigger: 'blur' }],
  targetClaimed: [{ required: true, message: '请输入完成目标是否由首个写调用自动记录[0:否, 1:是]', trigger: 'blur' }],
  delegateDepth: [{ required: true, message: '请输入委派深度', trigger: 'blur' }],
  status: [{ required: true, message: '请输入步骤状态[PENDING, READY, RUNNING, WAITING_DELEGATE, SUSPENDED, DONE, FAILED, SKIPPED, CANCELLED, TIMEOUT]', trigger: 'blur' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.organId = undefined;
  editForm.taskId = '';
  editForm.nodeId = '';
  editForm.title = '';
  editForm.objective = '';
  editForm.skillKey = '';
  editForm.target = '';
  editForm.targetClaimed = undefined;
  editForm.delegateDepth = undefined;
  editForm.status = '';
  editForm.result = '';
  editForm.inputs = '';
  editForm.outputs = '';
  editForm.state = '';
  editForm.errorCode = '';
  editForm.errorMessage = '';
  editForm.startedTime = '';
  editForm.finishedTime = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: TaskGraphNode) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.organId = row.organId;
  editForm.taskId = row.taskId;
  editForm.nodeId = row.nodeId;
  editForm.title = row.title;
  editForm.objective = row.objective;
  editForm.skillKey = row.skillKey;
  editForm.target = row.target;
  editForm.targetClaimed = row.targetClaimed;
  editForm.delegateDepth = row.delegateDepth;
  editForm.status = row.status;
  editForm.result = row.result;
  editForm.inputs = row.inputs;
  editForm.outputs = row.outputs;
  editForm.state = row.state;
  editForm.errorCode = row.errorCode;
  editForm.errorMessage = row.errorMessage;
  editForm.startedTime = row.startedTime;
  editForm.finishedTime = row.finishedTime;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: TaskGraphNodePayload = {
    organId: editForm.organId,
    taskId: editForm.taskId,
    nodeId: editForm.nodeId,
    title: editForm.title,
    objective: editForm.objective,
    skillKey: editForm.skillKey,
    target: editForm.target,
    targetClaimed: editForm.targetClaimed,
    delegateDepth: editForm.delegateDepth,
    status: editForm.status,
    result: editForm.result,
    inputs: editForm.inputs,
    outputs: editForm.outputs,
    state: editForm.state,
    errorCode: editForm.errorCode,
    errorMessage: editForm.errorMessage,
    startedTime: editForm.startedTime,
    finishedTime: editForm.finishedTime,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await TaskGraphNodeApi.save(payload);
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
.task_graph_node-page {
  padding: 20px;
  background-color: var(--g2-bg-page);
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.task_graph_node-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: var(--g2-bg-container);
  border-radius: 4px;
}

.task_graph_node-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task_graph_node-page__header h2 {
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

.task_graph_node-page__search {
  margin-bottom: 12px;
  background-color: var(--g2-bg-container);
}

.task_graph_node-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
