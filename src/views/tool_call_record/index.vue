
<template>
  <div class="tool_call_record-page">
    <!-- 查询表单 -->
    <el-card class="tool_call_record-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item label="机构ID">
          <el-input v-model="queryForm.organId" placeholder="请输入机构ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="所属任务">
          <el-input v-model="queryForm.taskId" placeholder="请输入所属任务" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="所属节点">
          <el-input v-model="queryForm.nodeId" placeholder="请输入所属节点" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="调用业务ID">
          <el-input v-model="queryForm.callId" placeholder="请输入调用业务ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="工具名">
          <el-input v-model="queryForm.toolName" placeholder="请输入工具名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="副作用">
          <el-input v-model="queryForm.sideEffect" placeholder="请输入副作用" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="请求内容">
          <el-input v-model="queryForm.request" placeholder="请输入请求内容" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="全量规范化业务入参摘要">
          <el-input v-model="queryForm.argsHash" placeholder="请输入全量规范化业务入参摘要" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="effective 业务幂等键的 SHA-256 十六进制">
          <el-input v-model="queryForm.idempotencyKey" placeholder="请输入effective 业务幂等键的 SHA-256 十六进制" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="ReAct 轮次">
          <el-input v-model="queryForm.round" placeholder="请输入ReAct 轮次" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="响应内容">
          <el-input v-model="queryForm.response" placeholder="请输入响应内容" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="结果摘要">
          <el-input v-model="queryForm.resultSummary" placeholder="请输入结果摘要" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="结果中的实体">
          <el-input v-model="queryForm.entities" placeholder="请输入结果中的实体" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="超长报文在 task_node_payload 中的ID">
          <el-input v-model="queryForm.payloadId" placeholder="请输入超长报文在 task_node_payload 中的ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="调用状态">
          <el-input v-model="queryForm.callStatus" placeholder="请输入调用状态" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="业务是否成功；无法判断为空">
          <el-input v-model="queryForm.businessOk" placeholder="请输入业务是否成功；无法判断为空" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="是否空结果">
          <el-input v-model="queryForm.emptyResult" placeholder="请输入是否空结果" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="失败分类">
          <el-input v-model="queryForm.failureKind" placeholder="请输入失败分类" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="错误码">
          <el-input v-model="queryForm.errorCode" placeholder="请输入错误码" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="错误信息">
          <el-input v-model="queryForm.errorMessage" placeholder="请输入错误信息" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="耗时毫秒">
          <el-input v-model="queryForm.durationMs" placeholder="请输入耗时毫秒" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="追踪号">
          <el-input v-model="queryForm.traceId" placeholder="请输入追踪号" clearable style="width: 200px" />
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
    <div class="tool_call_record-page__header">
      <div class="tool_call_record-page__title-group">
        <h2>管理工具调用记录表数据</h2>
      </div>
      <el-button type="primary" v-permission="'tool_call_record:add'" @click="handleCreate">新增工具调用记录表</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="120" />
      <el-table-column prop="organId" label="机构ID" width="140" />
      <el-table-column prop="taskId" label="所属任务" width="180" />
      <el-table-column prop="nodeId" label="所属节点" width="180" />
      <el-table-column prop="callId" label="调用业务ID" width="180" />
      <el-table-column prop="toolName" label="工具名" width="180" />
      <el-table-column prop="sideEffect" label="副作用" width="180" />
      <el-table-column prop="request" label="请求内容" width="180" />
      <el-table-column prop="argsHash" label="全量规范化业务入参摘要" width="180" />
      <el-table-column prop="idempotencyKey" label="effective 业务幂等键的 SHA-256 十六进制" width="180" />
      <el-table-column prop="round" label="ReAct 轮次" width="140" />
      <el-table-column prop="response" label="响应内容" width="180" />
      <el-table-column prop="resultSummary" label="结果摘要" width="180" />
      <el-table-column prop="entities" label="结果中的实体" width="180" />
      <el-table-column prop="payloadId" label="超长报文在 task_node_payload 中的ID" width="180" />
      <el-table-column prop="callStatus" label="调用状态" width="180" />
      <el-table-column prop="businessOk" label="业务是否成功；无法判断为空" width="140" />
      <el-table-column prop="emptyResult" label="是否空结果" width="140" />
      <el-table-column prop="failureKind" label="失败分类" width="180" />
      <el-table-column prop="errorCode" label="错误码" width="180" />
      <el-table-column prop="errorMessage" label="错误信息" width="180" />
      <el-table-column prop="durationMs" label="耗时毫秒" width="140" />
      <el-table-column prop="traceId" label="追踪号" width="180" />
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" sortable="custom" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" sortable="custom" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '明细') }}</el-button>
          <el-button type="primary" v-permission="'tool_call_record:edit'" link size="small" @click="handleEdit(row)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
          <el-button type="danger" v-permission="'tool_call_record:delete'" link size="small" @click="handleDelete(row)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
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
    <div class="tool_call_record-page__pagination">
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
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑工具调用记录表' : '新增工具调用记录表'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="机构ID" prop="organId">
          <el-input v-model="editForm.organId" placeholder="请输入机构ID" />
        </el-form-item>
        <el-form-item label="所属任务" prop="taskId">
          <el-input v-model="editForm.taskId" placeholder="请输入所属任务" />
        </el-form-item>
        <el-form-item label="所属节点" prop="nodeId">
          <el-input v-model="editForm.nodeId" placeholder="请输入所属节点" />
        </el-form-item>
        <el-form-item label="调用业务ID" prop="callId">
          <el-input v-model="editForm.callId" placeholder="请输入调用业务ID" />
        </el-form-item>
        <el-form-item label="工具名" prop="toolName">
          <el-input v-model="editForm.toolName" placeholder="请输入工具名" />
        </el-form-item>
        <el-form-item label="副作用" prop="sideEffect">
          <el-input v-model="editForm.sideEffect" placeholder="请输入副作用" />
        </el-form-item>
        <el-form-item label="请求内容" prop="request">
          <el-input v-model="editForm.request" placeholder="请输入请求内容" />
        </el-form-item>
        <el-form-item label="全量规范化业务入参摘要" prop="argsHash">
          <el-input v-model="editForm.argsHash" placeholder="请输入全量规范化业务入参摘要" />
        </el-form-item>
        <el-form-item label="effective 业务幂等键的 SHA-256 十六进制" prop="idempotencyKey">
          <el-input v-model="editForm.idempotencyKey" placeholder="请输入effective 业务幂等键的 SHA-256 十六进制" />
        </el-form-item>
        <el-form-item label="ReAct 轮次" prop="round">
          <el-input v-model="editForm.round" placeholder="请输入ReAct 轮次" />
        </el-form-item>
        <el-form-item label="响应内容" prop="response">
          <el-input v-model="editForm.response" placeholder="请输入响应内容" />
        </el-form-item>
        <el-form-item label="结果摘要" prop="resultSummary">
          <el-input v-model="editForm.resultSummary" placeholder="请输入结果摘要" />
        </el-form-item>
        <el-form-item label="结果中的实体" prop="entities">
          <el-input v-model="editForm.entities" placeholder="请输入结果中的实体" />
        </el-form-item>
        <el-form-item label="超长报文在 task_node_payload 中的ID" prop="payloadId">
          <el-input v-model="editForm.payloadId" placeholder="请输入超长报文在 task_node_payload 中的ID" />
        </el-form-item>
        <el-form-item label="调用状态" prop="callStatus">
          <el-input v-model="editForm.callStatus" placeholder="请输入调用状态" />
        </el-form-item>
        <el-form-item label="业务是否成功；无法判断为空" prop="businessOk">
          <el-input v-model="editForm.businessOk" placeholder="请输入业务是否成功；无法判断为空" />
        </el-form-item>
        <el-form-item label="是否空结果" prop="emptyResult">
          <el-input v-model="editForm.emptyResult" placeholder="请输入是否空结果" />
        </el-form-item>
        <el-form-item label="失败分类" prop="failureKind">
          <el-input v-model="editForm.failureKind" placeholder="请输入失败分类" />
        </el-form-item>
        <el-form-item label="错误码" prop="errorCode">
          <el-input v-model="editForm.errorCode" placeholder="请输入错误码" />
        </el-form-item>
        <el-form-item label="错误信息" prop="errorMessage">
          <el-input v-model="editForm.errorMessage" placeholder="请输入错误信息" />
        </el-form-item>
        <el-form-item label="耗时毫秒" prop="durationMs">
          <el-input v-model="editForm.durationMs" placeholder="请输入耗时毫秒" />
        </el-form-item>
        <el-form-item label="追踪号" prop="traceId">
          <el-input v-model="editForm.traceId" placeholder="请输入追踪号" />
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
    <el-dialog v-model="detailDialogVisible" title="工具调用记录表明细" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('G2_FIELD_ID', 'ID')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="机构ID">{{ currentRow?.organId }}</el-descriptions-item>
        <el-descriptions-item label="所属任务">{{ currentRow?.taskId }}</el-descriptions-item>
        <el-descriptions-item label="所属节点">{{ currentRow?.nodeId }}</el-descriptions-item>
        <el-descriptions-item label="调用业务ID">{{ currentRow?.callId }}</el-descriptions-item>
        <el-descriptions-item label="工具名">{{ currentRow?.toolName }}</el-descriptions-item>
        <el-descriptions-item label="副作用">{{ currentRow?.sideEffect }}</el-descriptions-item>
        <el-descriptions-item label="请求内容">{{ currentRow?.request }}</el-descriptions-item>
        <el-descriptions-item label="全量规范化业务入参摘要">{{ currentRow?.argsHash }}</el-descriptions-item>
        <el-descriptions-item label="effective 业务幂等键的 SHA-256 十六进制">{{ currentRow?.idempotencyKey }}</el-descriptions-item>
        <el-descriptions-item label="ReAct 轮次">{{ currentRow?.round }}</el-descriptions-item>
        <el-descriptions-item label="响应内容">{{ currentRow?.response }}</el-descriptions-item>
        <el-descriptions-item label="结果摘要">{{ currentRow?.resultSummary }}</el-descriptions-item>
        <el-descriptions-item label="结果中的实体">{{ currentRow?.entities }}</el-descriptions-item>
        <el-descriptions-item label="超长报文在 task_node_payload 中的ID">{{ currentRow?.payloadId }}</el-descriptions-item>
        <el-descriptions-item label="调用状态">{{ currentRow?.callStatus }}</el-descriptions-item>
        <el-descriptions-item label="业务是否成功；无法判断为空">{{ currentRow?.businessOk }}</el-descriptions-item>
        <el-descriptions-item label="是否空结果">{{ currentRow?.emptyResult }}</el-descriptions-item>
        <el-descriptions-item label="失败分类">{{ currentRow?.failureKind }}</el-descriptions-item>
        <el-descriptions-item label="错误码">{{ currentRow?.errorCode }}</el-descriptions-item>
        <el-descriptions-item label="错误信息">{{ currentRow?.errorMessage }}</el-descriptions-item>
        <el-descriptions-item label="耗时毫秒">{{ currentRow?.durationMs }}</el-descriptions-item>
        <el-descriptions-item label="追踪号">{{ currentRow?.traceId }}</el-descriptions-item>
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
import { ToolCallRecordApi } from './api';
import type { ToolCallRecord, ToolCallRecordPayload, ToolCallRecordQuery } from './type';
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
  callId: '',
  toolName: '',
  sideEffect: '',
  request: '',
  argsHash: '',
  idempotencyKey: '',
  round: undefined,
  response: '',
  resultSummary: '',
  entities: '',
  payloadId: '',
  callStatus: '',
  businessOk: undefined,
  emptyResult: undefined,
  failureKind: '',
  errorCode: '',
  errorMessage: '',
  durationMs: undefined,
  traceId: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<ToolCallRecord[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as ToolCallRecordQuery;

    // 请求分页数据
    const pageData = await ToolCallRecordApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & ToolCallRecordQuery);

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
  queryForm.callId = '';
  queryForm.toolName = '';
  queryForm.sideEffect = '';
  queryForm.request = '';
  queryForm.argsHash = '';
  queryForm.idempotencyKey = '';
  queryForm.round = undefined;
  queryForm.response = '';
  queryForm.resultSummary = '';
  queryForm.entities = '';
  queryForm.payloadId = '';
  queryForm.callStatus = '';
  queryForm.businessOk = undefined;
  queryForm.emptyResult = undefined;
  queryForm.failureKind = '';
  queryForm.errorCode = '';
  queryForm.errorMessage = '';
  queryForm.durationMs = undefined;
  queryForm.traceId = '';

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
const currentRow = ref<ToolCallRecord | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细
const handleView = (row: ToolCallRecord) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: ToolCallRecord) => {
  ElMessageBox.confirm(`确认删除工具调用记录表「${row.id}」吗？`, t('G2_LBL_TIP', '提示'), {
    type: 'warning',
  })
    .then(async () => {
      try {
        await ToolCallRecordApi.remove(row.id);
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
  callId: '',
  toolName: '',
  sideEffect: '',
  request: '',
  argsHash: '',
  idempotencyKey: '',
  round: undefined as number | undefined,
  response: '',
  resultSummary: '',
  entities: '',
  payloadId: '',
  callStatus: '',
  businessOk: undefined as number | undefined,
  emptyResult: undefined as number | undefined,
  failureKind: '',
  errorCode: '',
  errorMessage: '',
  durationMs: undefined as number | undefined,
  traceId: '',
});

// 表单校验规则
const editRules: FormRules = {
  organId: [{ required: true, message: '请输入机构标识', trigger: 'blur' }],
  taskId: [{ required: true, message: '请输入所属任务', trigger: 'blur' }],
  nodeId: [{ required: true, message: '请输入所属节点', trigger: 'blur' }],
  callId: [{ required: true, message: '请输入调用业务标识', trigger: 'blur' }],
  toolName: [{ required: true, message: '请输入工具名', trigger: 'blur' }],
  sideEffect: [{ required: true, message: '请输入副作用[NONE, WRITE]', trigger: 'blur' }],
  argsHash: [{ required: true, message: '请输入全量规范化业务入参摘要', trigger: 'blur' }],
  idempotencyKey: [{ required: true, message: '请输入effective 业务幂等键的 SHA-256 十六进制（契约路径值或 argsHash 兜底）', trigger: 'blur' }],
  callStatus: [{ required: true, message: '请输入调用状态[STARTED, SUCCESS, FAILED, TIMEOUT, CANCELLED, UNKNOWN, UNKNOWN_PRE_CALL]', trigger: 'blur' }],
  emptyResult: [{ required: true, message: '请输入是否空结果[0, 1]', trigger: 'blur' }],
  failureKind: [{ required: true, message: '请输入失败分类[NONE, PARAMETER_FAILURE, AUTH_FAILURE, TIMEOUT, RATE_LIMIT, BUSINESS_FAILURE, TRANSPORT_FAILURE, UNKNOWN]', trigger: 'blur' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.organId = undefined;
  editForm.taskId = '';
  editForm.nodeId = '';
  editForm.callId = '';
  editForm.toolName = '';
  editForm.sideEffect = '';
  editForm.request = '';
  editForm.argsHash = '';
  editForm.idempotencyKey = '';
  editForm.round = undefined;
  editForm.response = '';
  editForm.resultSummary = '';
  editForm.entities = '';
  editForm.payloadId = '';
  editForm.callStatus = '';
  editForm.businessOk = undefined;
  editForm.emptyResult = undefined;
  editForm.failureKind = '';
  editForm.errorCode = '';
  editForm.errorMessage = '';
  editForm.durationMs = undefined;
  editForm.traceId = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: ToolCallRecord) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.organId = row.organId;
  editForm.taskId = row.taskId;
  editForm.nodeId = row.nodeId;
  editForm.callId = row.callId;
  editForm.toolName = row.toolName;
  editForm.sideEffect = row.sideEffect;
  editForm.request = row.request;
  editForm.argsHash = row.argsHash;
  editForm.idempotencyKey = row.idempotencyKey;
  editForm.round = row.round;
  editForm.response = row.response;
  editForm.resultSummary = row.resultSummary;
  editForm.entities = row.entities;
  editForm.payloadId = row.payloadId;
  editForm.callStatus = row.callStatus;
  editForm.businessOk = row.businessOk;
  editForm.emptyResult = row.emptyResult;
  editForm.failureKind = row.failureKind;
  editForm.errorCode = row.errorCode;
  editForm.errorMessage = row.errorMessage;
  editForm.durationMs = row.durationMs;
  editForm.traceId = row.traceId;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: ToolCallRecordPayload = {
    organId: editForm.organId,
    taskId: editForm.taskId,
    nodeId: editForm.nodeId,
    callId: editForm.callId,
    toolName: editForm.toolName,
    sideEffect: editForm.sideEffect,
    request: editForm.request,
    argsHash: editForm.argsHash,
    idempotencyKey: editForm.idempotencyKey,
    round: editForm.round,
    response: editForm.response,
    resultSummary: editForm.resultSummary,
    entities: editForm.entities,
    payloadId: editForm.payloadId,
    callStatus: editForm.callStatus,
    businessOk: editForm.businessOk,
    emptyResult: editForm.emptyResult,
    failureKind: editForm.failureKind,
    errorCode: editForm.errorCode,
    errorMessage: editForm.errorMessage,
    durationMs: editForm.durationMs,
    traceId: editForm.traceId,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await ToolCallRecordApi.save(payload);
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
.tool_call_record-page {
  padding: 20px;
  background-color: var(--g2-bg-page);
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.tool_call_record-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: var(--g2-bg-container);
  border-radius: 4px;
}

.tool_call_record-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tool_call_record-page__header h2 {
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

.tool_call_record-page__search {
  margin-bottom: 12px;
  background-color: var(--g2-bg-container);
}

.tool_call_record-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
