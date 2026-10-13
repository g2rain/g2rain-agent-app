
<template>
  <div class="task_instance-page">
    <!-- 查询表单 -->
    <el-card class="task_instance-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item label="机构ID">
          <el-input v-model="queryForm.organId" placeholder="请输入机构ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="所属会话">
          <el-input v-model="queryForm.conversationId" placeholder="请输入所属会话" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="任务业务ID">
          <el-input v-model="queryForm.taskId" placeholder="请输入任务业务ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="绑定的 Agent 主键">
          <el-input v-model="queryForm.agentId" placeholder="请输入绑定的 Agent 主键" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="任务目标摘要">
          <el-input v-model="queryForm.goalSummary" placeholder="请输入任务目标摘要" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="开任务时的用户原文">
          <el-input v-model="queryForm.request" placeholder="请输入开任务时的用户原文" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="开跑时固定的 skill 版本">
          <el-input v-model="queryForm.skillVersions" placeholder="请输入开跑时固定的 skill 版本" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="任务级共享值">
          <el-input v-model="queryForm.shared" placeholder="请输入任务级共享值" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="前情">
          <el-input v-model="queryForm.prior" placeholder="请输入前情" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="结束时的任务记录">
          <el-input v-model="queryForm.record" placeholder="请输入结束时的任务记录" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="触发开任务的消息ID">
          <el-input v-model="queryForm.sourceMessageId" placeholder="请输入触发开任务的消息ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="任务状态">
          <el-input v-model="queryForm.status" placeholder="请输入任务状态" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="当前节点">
          <el-input v-model="queryForm.currentNodeId" placeholder="请输入当前节点" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="终态对外文案">
          <el-input v-model="queryForm.finalMessage" placeholder="请输入终态对外文案" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-input v-model="queryForm.startedTime" placeholder="请输入开始时间" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="最近一次挂起时间">
          <el-input v-model="queryForm.suspendedTime" placeholder="请输入最近一次挂起时间" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-input v-model="queryForm.finishedTime" placeholder="请输入结束时间" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="开任务入站追踪号">
          <el-input v-model="queryForm.traceId" placeholder="请输入开任务入站追踪号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="本轮栅栏版本，落库按此单调推进">
          <el-input v-model="queryForm.stateVersion" placeholder="请输入本轮栅栏版本，落库按此单调推进" clearable style="width: 200px" />
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
    <div class="task_instance-page__header">
      <div class="task_instance-page__title-group">
        <h2>管理任务实例表数据</h2>
      </div>
      <el-button type="primary" v-permission="'task_instance:add'" @click="handleCreate">新增任务实例表</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="120" />
      <el-table-column prop="organId" label="机构ID" width="140" />
      <el-table-column prop="conversationId" label="所属会话" width="180" />
      <el-table-column prop="taskId" label="任务业务ID" width="180" />
      <el-table-column prop="agentId" label="绑定的 Agent 主键" width="140" />
      <el-table-column prop="goalSummary" label="任务目标摘要" width="180" />
      <el-table-column prop="request" label="开任务时的用户原文" width="180" />
      <el-table-column prop="skillVersions" label="开跑时固定的 skill 版本" width="180" />
      <el-table-column prop="shared" label="任务级共享值" width="180" />
      <el-table-column prop="prior" label="前情" width="180" />
      <el-table-column prop="record" label="结束时的任务记录" width="180" />
      <el-table-column prop="sourceMessageId" label="触发开任务的消息ID" width="180" />
      <el-table-column prop="status" label="任务状态" width="180" />
      <el-table-column prop="currentNodeId" label="当前节点" width="180" />
      <el-table-column prop="finalMessage" label="终态对外文案" width="180" />
      <el-table-column prop="startedTime" label="开始时间" width="180" />
      <el-table-column prop="suspendedTime" label="最近一次挂起时间" width="180" />
      <el-table-column prop="finishedTime" label="结束时间" width="180" />
      <el-table-column prop="traceId" label="开任务入站追踪号" width="180" />
      <el-table-column prop="stateVersion" label="本轮栅栏版本，落库按此单调推进" width="140" />
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" sortable="custom" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" sortable="custom" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '明细') }}</el-button>
          <el-button type="primary" v-permission="'task_instance:edit'" link size="small" @click="handleEdit(row)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
          <el-button type="danger" v-permission="'task_instance:delete'" link size="small" @click="handleDelete(row)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
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
    <div class="task_instance-page__pagination">
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
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑任务实例表' : '新增任务实例表'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="机构ID" prop="organId">
          <el-input v-model="editForm.organId" placeholder="请输入机构ID" />
        </el-form-item>
        <el-form-item label="所属会话" prop="conversationId">
          <el-input v-model="editForm.conversationId" placeholder="请输入所属会话" />
        </el-form-item>
        <el-form-item label="任务业务ID" prop="taskId">
          <el-input v-model="editForm.taskId" placeholder="请输入任务业务ID" />
        </el-form-item>
        <el-form-item label="绑定的 Agent 主键" prop="agentId">
          <el-input v-model="editForm.agentId" placeholder="请输入绑定的 Agent 主键" />
        </el-form-item>
        <el-form-item label="任务目标摘要" prop="goalSummary">
          <el-input v-model="editForm.goalSummary" placeholder="请输入任务目标摘要" />
        </el-form-item>
        <el-form-item label="开任务时的用户原文" prop="request">
          <el-input v-model="editForm.request" placeholder="请输入开任务时的用户原文" />
        </el-form-item>
        <el-form-item label="开跑时固定的 skill 版本" prop="skillVersions">
          <el-input v-model="editForm.skillVersions" placeholder="请输入开跑时固定的 skill 版本" />
        </el-form-item>
        <el-form-item label="任务级共享值" prop="shared">
          <el-input v-model="editForm.shared" placeholder="请输入任务级共享值" />
        </el-form-item>
        <el-form-item label="前情" prop="prior">
          <el-input v-model="editForm.prior" placeholder="请输入前情" />
        </el-form-item>
        <el-form-item label="结束时的任务记录" prop="record">
          <el-input v-model="editForm.record" placeholder="请输入结束时的任务记录" />
        </el-form-item>
        <el-form-item label="触发开任务的消息ID" prop="sourceMessageId">
          <el-input v-model="editForm.sourceMessageId" placeholder="请输入触发开任务的消息ID" />
        </el-form-item>
        <el-form-item label="任务状态" prop="status">
          <el-input v-model="editForm.status" placeholder="请输入任务状态" />
        </el-form-item>
        <el-form-item label="当前节点" prop="currentNodeId">
          <el-input v-model="editForm.currentNodeId" placeholder="请输入当前节点" />
        </el-form-item>
        <el-form-item label="终态对外文案" prop="finalMessage">
          <el-input v-model="editForm.finalMessage" placeholder="请输入终态对外文案" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startedTime">
          <el-input v-model="editForm.startedTime" placeholder="请输入开始时间" />
        </el-form-item>
        <el-form-item label="最近一次挂起时间" prop="suspendedTime">
          <el-input v-model="editForm.suspendedTime" placeholder="请输入最近一次挂起时间" />
        </el-form-item>
        <el-form-item label="结束时间" prop="finishedTime">
          <el-input v-model="editForm.finishedTime" placeholder="请输入结束时间" />
        </el-form-item>
        <el-form-item label="开任务入站追踪号" prop="traceId">
          <el-input v-model="editForm.traceId" placeholder="请输入开任务入站追踪号" />
        </el-form-item>
        <el-form-item label="本轮栅栏版本，落库按此单调推进" prop="stateVersion">
          <el-input v-model="editForm.stateVersion" placeholder="请输入本轮栅栏版本，落库按此单调推进" />
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
    <el-dialog v-model="detailDialogVisible" title="任务实例表明细" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('G2_FIELD_ID', 'ID')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="机构ID">{{ currentRow?.organId }}</el-descriptions-item>
        <el-descriptions-item label="所属会话">{{ currentRow?.conversationId }}</el-descriptions-item>
        <el-descriptions-item label="任务业务ID">{{ currentRow?.taskId }}</el-descriptions-item>
        <el-descriptions-item label="绑定的 Agent 主键">{{ currentRow?.agentId }}</el-descriptions-item>
        <el-descriptions-item label="任务目标摘要">{{ currentRow?.goalSummary }}</el-descriptions-item>
        <el-descriptions-item label="开任务时的用户原文">{{ currentRow?.request }}</el-descriptions-item>
        <el-descriptions-item label="开跑时固定的 skill 版本">{{ currentRow?.skillVersions }}</el-descriptions-item>
        <el-descriptions-item label="任务级共享值">{{ currentRow?.shared }}</el-descriptions-item>
        <el-descriptions-item label="前情">{{ currentRow?.prior }}</el-descriptions-item>
        <el-descriptions-item label="结束时的任务记录">{{ currentRow?.record }}</el-descriptions-item>
        <el-descriptions-item label="触发开任务的消息ID">{{ currentRow?.sourceMessageId }}</el-descriptions-item>
        <el-descriptions-item label="任务状态">{{ currentRow?.status }}</el-descriptions-item>
        <el-descriptions-item label="当前节点">{{ currentRow?.currentNodeId }}</el-descriptions-item>
        <el-descriptions-item label="终态对外文案">{{ currentRow?.finalMessage }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentRow?.startedTime }}</el-descriptions-item>
        <el-descriptions-item label="最近一次挂起时间">{{ currentRow?.suspendedTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentRow?.finishedTime }}</el-descriptions-item>
        <el-descriptions-item label="开任务入站追踪号">{{ currentRow?.traceId }}</el-descriptions-item>
        <el-descriptions-item label="本轮栅栏版本，落库按此单调推进">{{ currentRow?.stateVersion }}</el-descriptions-item>
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
import { TaskInstanceApi } from './api';
import type { TaskInstance, TaskInstancePayload, TaskInstanceQuery } from './type';
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
  conversationId: '',
  taskId: '',
  agentId: undefined,
  goalSummary: '',
  request: '',
  skillVersions: '',
  shared: '',
  prior: '',
  record: '',
  sourceMessageId: '',
  status: '',
  currentNodeId: '',
  finalMessage: '',
  startedTime: '',
  suspendedTime: '',
  finishedTime: '',
  traceId: '',
  stateVersion: undefined,
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<TaskInstance[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as TaskInstanceQuery;

    // 请求分页数据
    const pageData = await TaskInstanceApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & TaskInstanceQuery);

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
  queryForm.conversationId = '';
  queryForm.taskId = '';
  queryForm.agentId = undefined;
  queryForm.goalSummary = '';
  queryForm.request = '';
  queryForm.skillVersions = '';
  queryForm.shared = '';
  queryForm.prior = '';
  queryForm.record = '';
  queryForm.sourceMessageId = '';
  queryForm.status = '';
  queryForm.currentNodeId = '';
  queryForm.finalMessage = '';
  queryForm.startedTime = '';
  queryForm.suspendedTime = '';
  queryForm.finishedTime = '';
  queryForm.traceId = '';
  queryForm.stateVersion = undefined;

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
const currentRow = ref<TaskInstance | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细
const handleView = (row: TaskInstance) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: TaskInstance) => {
  ElMessageBox.confirm(`确认删除任务实例表「${row.id}」吗？`, t('G2_LBL_TIP', '提示'), {
    type: 'warning',
  })
    .then(async () => {
      try {
        await TaskInstanceApi.remove(row.id);
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
  conversationId: '',
  taskId: '',
  agentId: undefined as number | undefined,
  goalSummary: '',
  request: '',
  skillVersions: '',
  shared: '',
  prior: '',
  record: '',
  sourceMessageId: '',
  status: '',
  currentNodeId: '',
  finalMessage: '',
  startedTime: '',
  suspendedTime: '',
  finishedTime: '',
  traceId: '',
  stateVersion: undefined as number | undefined,
});

// 表单校验规则
const editRules: FormRules = {
  organId: [{ required: true, message: '请输入机构标识', trigger: 'blur' }],
  conversationId: [{ required: true, message: '请输入所属会话', trigger: 'blur' }],
  taskId: [{ required: true, message: '请输入任务业务标识', trigger: 'blur' }],
  status: [{ required: true, message: '请输入任务状态[RUNNING, SUSPENDED, SUCCEEDED, FAILED, CANCELED]', trigger: 'blur' }],
  stateVersion: [{ required: true, message: '请输入本轮栅栏版本，落库按此单调推进', trigger: 'blur' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.organId = undefined;
  editForm.conversationId = '';
  editForm.taskId = '';
  editForm.agentId = undefined;
  editForm.goalSummary = '';
  editForm.request = '';
  editForm.skillVersions = '';
  editForm.shared = '';
  editForm.prior = '';
  editForm.record = '';
  editForm.sourceMessageId = '';
  editForm.status = '';
  editForm.currentNodeId = '';
  editForm.finalMessage = '';
  editForm.startedTime = '';
  editForm.suspendedTime = '';
  editForm.finishedTime = '';
  editForm.traceId = '';
  editForm.stateVersion = undefined;
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: TaskInstance) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.organId = row.organId;
  editForm.conversationId = row.conversationId;
  editForm.taskId = row.taskId;
  editForm.agentId = row.agentId;
  editForm.goalSummary = row.goalSummary;
  editForm.request = row.request;
  editForm.skillVersions = row.skillVersions;
  editForm.shared = row.shared;
  editForm.prior = row.prior;
  editForm.record = row.record;
  editForm.sourceMessageId = row.sourceMessageId;
  editForm.status = row.status;
  editForm.currentNodeId = row.currentNodeId;
  editForm.finalMessage = row.finalMessage;
  editForm.startedTime = row.startedTime;
  editForm.suspendedTime = row.suspendedTime;
  editForm.finishedTime = row.finishedTime;
  editForm.traceId = row.traceId;
  editForm.stateVersion = row.stateVersion;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: TaskInstancePayload = {
    organId: editForm.organId,
    conversationId: editForm.conversationId,
    taskId: editForm.taskId,
    agentId: editForm.agentId,
    goalSummary: editForm.goalSummary,
    request: editForm.request,
    skillVersions: editForm.skillVersions,
    shared: editForm.shared,
    prior: editForm.prior,
    record: editForm.record,
    sourceMessageId: editForm.sourceMessageId,
    status: editForm.status,
    currentNodeId: editForm.currentNodeId,
    finalMessage: editForm.finalMessage,
    startedTime: editForm.startedTime,
    suspendedTime: editForm.suspendedTime,
    finishedTime: editForm.finishedTime,
    traceId: editForm.traceId,
    stateVersion: editForm.stateVersion,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await TaskInstanceApi.save(payload);
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
.task_instance-page {
  padding: 20px;
  background-color: var(--g2-bg-page);
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.task_instance-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: var(--g2-bg-container);
  border-radius: 4px;
}

.task_instance-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task_instance-page__header h2 {
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

.task_instance-page__search {
  margin-bottom: 12px;
  background-color: var(--g2-bg-container);
}

.task_instance-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
