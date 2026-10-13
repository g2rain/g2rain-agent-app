
<template>
  <div class="task_checkpoint-page">
    <!-- 查询表单 -->
    <el-card class="task_checkpoint-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item label="机构ID">
          <el-input v-model="queryForm.organId" placeholder="请输入机构ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="所属任务；每任务至多一条，恢复/终态逻辑删除">
          <el-input v-model="queryForm.taskId" placeholder="请输入所属任务；每任务至多一条，恢复/终态逻辑删除" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="挂起的节点">
          <el-input v-model="queryForm.nodeId" placeholder="请输入挂起的节点" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="检查点业务ID">
          <el-input v-model="queryForm.checkpointId" placeholder="请输入检查点业务ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="检查点类型">
          <el-input v-model="queryForm.type" placeholder="请输入检查点类型" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="追问/确认文案">
          <el-input v-model="queryForm.question" placeholder="请输入追问/确认文案" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="追问期望补充的字段">
          <el-input v-model="queryForm.expectedFields" placeholder="请输入追问期望补充的字段" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="恢复动作">
          <el-input v-model="queryForm.allowedActions" placeholder="请输入恢复动作" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="快捷建议文案">
          <el-input v-model="queryForm.suggestions" placeholder="请输入快捷建议文案" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="待审批动作">
          <el-input v-model="queryForm.pendingAction" placeholder="请输入待审批动作" clearable style="width: 200px" />
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
    <div class="task_checkpoint-page__header">
      <div class="task_checkpoint-page__title-group">
        <h2>管理任务检查点表数据</h2>
      </div>
      <el-button type="primary" v-permission="'task_checkpoint:add'" @click="handleCreate">新增任务检查点表</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="120" />
      <el-table-column prop="organId" label="机构ID" width="140" />
      <el-table-column prop="taskId" label="所属任务；每任务至多一条，恢复/终态逻辑删除" width="180" />
      <el-table-column prop="nodeId" label="挂起的节点" width="180" />
      <el-table-column prop="checkpointId" label="检查点业务ID" width="180" />
      <el-table-column prop="type" label="检查点类型" width="180" />
      <el-table-column prop="question" label="追问/确认文案" width="180" />
      <el-table-column prop="expectedFields" label="追问期望补充的字段" width="180" />
      <el-table-column prop="allowedActions" label="恢复动作" width="180" />
      <el-table-column prop="suggestions" label="快捷建议文案" width="180" />
      <el-table-column prop="pendingAction" label="待审批动作" width="180" />
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" sortable="custom" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" sortable="custom" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '明细') }}</el-button>
          <el-button type="primary" v-permission="'task_checkpoint:edit'" link size="small" @click="handleEdit(row)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
          <el-button type="danger" v-permission="'task_checkpoint:delete'" link size="small" @click="handleDelete(row)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
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
    <div class="task_checkpoint-page__pagination">
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
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑任务检查点表' : '新增任务检查点表'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="机构ID" prop="organId">
          <el-input v-model="editForm.organId" placeholder="请输入机构ID" />
        </el-form-item>
        <el-form-item label="所属任务；每任务至多一条，恢复/终态逻辑删除" prop="taskId">
          <el-input v-model="editForm.taskId" placeholder="请输入所属任务；每任务至多一条，恢复/终态逻辑删除" />
        </el-form-item>
        <el-form-item label="挂起的节点" prop="nodeId">
          <el-input v-model="editForm.nodeId" placeholder="请输入挂起的节点" />
        </el-form-item>
        <el-form-item label="检查点业务ID" prop="checkpointId">
          <el-input v-model="editForm.checkpointId" placeholder="请输入检查点业务ID" />
        </el-form-item>
        <el-form-item label="检查点类型" prop="type">
          <el-input v-model="editForm.type" placeholder="请输入检查点类型" />
        </el-form-item>
        <el-form-item label="追问/确认文案" prop="question">
          <el-input v-model="editForm.question" placeholder="请输入追问/确认文案" />
        </el-form-item>
        <el-form-item label="追问期望补充的字段" prop="expectedFields">
          <el-input v-model="editForm.expectedFields" placeholder="请输入追问期望补充的字段" />
        </el-form-item>
        <el-form-item label="恢复动作" prop="allowedActions">
          <el-input v-model="editForm.allowedActions" placeholder="请输入恢复动作" />
        </el-form-item>
        <el-form-item label="快捷建议文案" prop="suggestions">
          <el-input v-model="editForm.suggestions" placeholder="请输入快捷建议文案" />
        </el-form-item>
        <el-form-item label="待审批动作" prop="pendingAction">
          <el-input v-model="editForm.pendingAction" placeholder="请输入待审批动作" />
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
    <el-dialog v-model="detailDialogVisible" title="任务检查点表明细" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('G2_FIELD_ID', 'ID')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="机构ID">{{ currentRow?.organId }}</el-descriptions-item>
        <el-descriptions-item label="所属任务；每任务至多一条，恢复/终态逻辑删除">{{ currentRow?.taskId }}</el-descriptions-item>
        <el-descriptions-item label="挂起的节点">{{ currentRow?.nodeId }}</el-descriptions-item>
        <el-descriptions-item label="检查点业务ID">{{ currentRow?.checkpointId }}</el-descriptions-item>
        <el-descriptions-item label="检查点类型">{{ currentRow?.type }}</el-descriptions-item>
        <el-descriptions-item label="追问/确认文案">{{ currentRow?.question }}</el-descriptions-item>
        <el-descriptions-item label="追问期望补充的字段">{{ currentRow?.expectedFields }}</el-descriptions-item>
        <el-descriptions-item label="恢复动作">{{ currentRow?.allowedActions }}</el-descriptions-item>
        <el-descriptions-item label="快捷建议文案">{{ currentRow?.suggestions }}</el-descriptions-item>
        <el-descriptions-item label="待审批动作">{{ currentRow?.pendingAction }}</el-descriptions-item>
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
import { TaskCheckpointApi } from './api';
import type { TaskCheckpoint, TaskCheckpointPayload, TaskCheckpointQuery } from './type';
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
  checkpointId: '',
  type: '',
  question: '',
  expectedFields: '',
  allowedActions: '',
  suggestions: '',
  pendingAction: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<TaskCheckpoint[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as TaskCheckpointQuery;

    // 请求分页数据
    const pageData = await TaskCheckpointApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & TaskCheckpointQuery);

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
  queryForm.checkpointId = '';
  queryForm.type = '';
  queryForm.question = '';
  queryForm.expectedFields = '';
  queryForm.allowedActions = '';
  queryForm.suggestions = '';
  queryForm.pendingAction = '';

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
const currentRow = ref<TaskCheckpoint | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细
const handleView = (row: TaskCheckpoint) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: TaskCheckpoint) => {
  ElMessageBox.confirm(`确认删除任务检查点表「${row.id}」吗？`, t('G2_LBL_TIP', '提示'), {
    type: 'warning',
  })
    .then(async () => {
      try {
        await TaskCheckpointApi.remove(row.id);
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
  checkpointId: '',
  type: '',
  question: '',
  expectedFields: '',
  allowedActions: '',
  suggestions: '',
  pendingAction: '',
});

// 表单校验规则
const editRules: FormRules = {
  organId: [{ required: true, message: '请输入机构标识', trigger: 'blur' }],
  taskId: [{ required: true, message: '请输入所属任务；每任务至多一条，恢复/终态逻辑删除', trigger: 'blur' }],
  checkpointId: [{ required: true, message: '请输入检查点业务标识', trigger: 'blur' }],
  type: [{ required: true, message: '请输入检查点类型[FOLLOW_UP, APPROVAL, VERIFY]', trigger: 'blur' }],
  allowedActions: [{ required: true, message: '请输入恢复动作', trigger: 'blur' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.organId = undefined;
  editForm.taskId = '';
  editForm.nodeId = '';
  editForm.checkpointId = '';
  editForm.type = '';
  editForm.question = '';
  editForm.expectedFields = '';
  editForm.allowedActions = '';
  editForm.suggestions = '';
  editForm.pendingAction = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: TaskCheckpoint) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.organId = row.organId;
  editForm.taskId = row.taskId;
  editForm.nodeId = row.nodeId;
  editForm.checkpointId = row.checkpointId;
  editForm.type = row.type;
  editForm.question = row.question;
  editForm.expectedFields = row.expectedFields;
  editForm.allowedActions = row.allowedActions;
  editForm.suggestions = row.suggestions;
  editForm.pendingAction = row.pendingAction;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: TaskCheckpointPayload = {
    organId: editForm.organId,
    taskId: editForm.taskId,
    nodeId: editForm.nodeId,
    checkpointId: editForm.checkpointId,
    type: editForm.type,
    question: editForm.question,
    expectedFields: editForm.expectedFields,
    allowedActions: editForm.allowedActions,
    suggestions: editForm.suggestions,
    pendingAction: editForm.pendingAction,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await TaskCheckpointApi.save(payload);
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
.task_checkpoint-page {
  padding: 20px;
  background-color: var(--g2-bg-page);
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.task_checkpoint-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: var(--g2-bg-container);
  border-radius: 4px;
}

.task_checkpoint-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task_checkpoint-page__header h2 {
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

.task_checkpoint-page__search {
  margin-bottom: 12px;
  background-color: var(--g2-bg-container);
}

.task_checkpoint-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
