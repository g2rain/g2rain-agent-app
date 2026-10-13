
<template>
  <div class="chat_message-page">
    <!-- 查询表单 -->
    <el-card class="chat_message-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item label="机构ID">
          <el-input v-model="queryForm.organId" placeholder="请输入机构ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="所属会话">
          <el-input v-model="queryForm.conversationId" placeholder="请输入所属会话" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="关联任务；可空">
          <el-input v-model="queryForm.taskId" placeholder="请输入关联任务；可空" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="中间文字所属节点">
          <el-input v-model="queryForm.nodeId" placeholder="请输入中间文字所属节点" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="中间文字所属 ReAct 轮次">
          <el-input v-model="queryForm.round" placeholder="请输入中间文字所属 ReAct 轮次" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="消息业务ID">
          <el-input v-model="queryForm.messageId" placeholder="请输入消息业务ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="来源渠道/客户端应用">
          <el-input v-model="queryForm.channel" placeholder="请输入来源渠道/客户端应用" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="本轮选用的模型名">
          <el-input v-model="queryForm.model" placeholder="请输入本轮选用的模型名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="角色">
          <el-input v-model="queryForm.role" placeholder="请输入角色" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="消息类型">
          <el-input v-model="queryForm.messageType" placeholder="请输入消息类型" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="消息内容">
          <el-input v-model="queryForm.content" placeholder="请输入消息内容" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="本条消息追踪号">
          <el-input v-model="queryForm.traceId" placeholder="请输入本条消息追踪号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="业务发言时间 epoch ms">
          <el-input v-model="queryForm.createdAtMs" placeholder="请输入业务发言时间 epoch ms" clearable style="width: 200px" />
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
    <div class="chat_message-page__header">
      <div class="chat_message-page__title-group">
        <h2>管理聊天消息表数据</h2>
      </div>
      <el-button type="primary" v-permission="'chat_message:add'" @click="handleCreate">新增聊天消息表</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="120" />
      <el-table-column prop="organId" label="机构ID" width="140" />
      <el-table-column prop="conversationId" label="所属会话" width="180" />
      <el-table-column prop="taskId" label="关联任务；可空" width="180" />
      <el-table-column prop="nodeId" label="中间文字所属节点" width="180" />
      <el-table-column prop="round" label="中间文字所属 ReAct 轮次" width="140" />
      <el-table-column prop="messageId" label="消息业务ID" width="180" />
      <el-table-column prop="channel" label="来源渠道/客户端应用" width="180" />
      <el-table-column prop="model" label="本轮选用的模型名" width="180" />
      <el-table-column prop="role" label="角色" width="180" />
      <el-table-column prop="messageType" label="消息类型" width="180" />
      <el-table-column prop="content" label="消息内容" width="180" />
      <el-table-column prop="traceId" label="本条消息追踪号" width="180" />
      <el-table-column prop="createdAtMs" label="业务发言时间 epoch ms" width="140" />
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" sortable="custom" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" sortable="custom" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '明细') }}</el-button>
          <el-button type="primary" v-permission="'chat_message:edit'" link size="small" @click="handleEdit(row)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
          <el-button type="danger" v-permission="'chat_message:delete'" link size="small" @click="handleDelete(row)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
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
    <div class="chat_message-page__pagination">
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
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑聊天消息表' : '新增聊天消息表'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="机构ID" prop="organId">
          <el-input v-model="editForm.organId" placeholder="请输入机构ID" />
        </el-form-item>
        <el-form-item label="所属会话" prop="conversationId">
          <el-input v-model="editForm.conversationId" placeholder="请输入所属会话" />
        </el-form-item>
        <el-form-item label="关联任务；可空" prop="taskId">
          <el-input v-model="editForm.taskId" placeholder="请输入关联任务；可空" />
        </el-form-item>
        <el-form-item label="中间文字所属节点" prop="nodeId">
          <el-input v-model="editForm.nodeId" placeholder="请输入中间文字所属节点" />
        </el-form-item>
        <el-form-item label="中间文字所属 ReAct 轮次" prop="round">
          <el-input v-model="editForm.round" placeholder="请输入中间文字所属 ReAct 轮次" />
        </el-form-item>
        <el-form-item label="消息业务ID" prop="messageId">
          <el-input v-model="editForm.messageId" placeholder="请输入消息业务ID" />
        </el-form-item>
        <el-form-item label="来源渠道/客户端应用" prop="channel">
          <el-input v-model="editForm.channel" placeholder="请输入来源渠道/客户端应用" />
        </el-form-item>
        <el-form-item label="本轮选用的模型名" prop="model">
          <el-input v-model="editForm.model" placeholder="请输入本轮选用的模型名" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-input v-model="editForm.role" placeholder="请输入角色" />
        </el-form-item>
        <el-form-item label="消息类型" prop="messageType">
          <el-input v-model="editForm.messageType" placeholder="请输入消息类型" />
        </el-form-item>
        <el-form-item label="消息内容" prop="content">
          <el-input v-model="editForm.content" placeholder="请输入消息内容" />
        </el-form-item>
        <el-form-item label="本条消息追踪号" prop="traceId">
          <el-input v-model="editForm.traceId" placeholder="请输入本条消息追踪号" />
        </el-form-item>
        <el-form-item label="业务发言时间 epoch ms" prop="createdAtMs">
          <el-input v-model="editForm.createdAtMs" placeholder="请输入业务发言时间 epoch ms" />
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
    <el-dialog v-model="detailDialogVisible" title="聊天消息表明细" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('G2_FIELD_ID', 'ID')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="机构ID">{{ currentRow?.organId }}</el-descriptions-item>
        <el-descriptions-item label="所属会话">{{ currentRow?.conversationId }}</el-descriptions-item>
        <el-descriptions-item label="关联任务；可空">{{ currentRow?.taskId }}</el-descriptions-item>
        <el-descriptions-item label="中间文字所属节点">{{ currentRow?.nodeId }}</el-descriptions-item>
        <el-descriptions-item label="中间文字所属 ReAct 轮次">{{ currentRow?.round }}</el-descriptions-item>
        <el-descriptions-item label="消息业务ID">{{ currentRow?.messageId }}</el-descriptions-item>
        <el-descriptions-item label="来源渠道/客户端应用">{{ currentRow?.channel }}</el-descriptions-item>
        <el-descriptions-item label="本轮选用的模型名">{{ currentRow?.model }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ currentRow?.role }}</el-descriptions-item>
        <el-descriptions-item label="消息类型">{{ currentRow?.messageType }}</el-descriptions-item>
        <el-descriptions-item label="消息内容">{{ currentRow?.content }}</el-descriptions-item>
        <el-descriptions-item label="本条消息追踪号">{{ currentRow?.traceId }}</el-descriptions-item>
        <el-descriptions-item label="业务发言时间 epoch ms">{{ currentRow?.createdAtMs }}</el-descriptions-item>
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
import { ChatMessageApi } from './api';
import type { ChatMessage, ChatMessagePayload, ChatMessageQuery } from './type';
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
  nodeId: '',
  round: undefined,
  messageId: '',
  channel: '',
  model: '',
  role: '',
  messageType: '',
  content: '',
  traceId: '',
  createdAtMs: undefined,
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<ChatMessage[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as ChatMessageQuery;

    // 请求分页数据
    const pageData = await ChatMessageApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & ChatMessageQuery);

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
  queryForm.nodeId = '';
  queryForm.round = undefined;
  queryForm.messageId = '';
  queryForm.channel = '';
  queryForm.model = '';
  queryForm.role = '';
  queryForm.messageType = '';
  queryForm.content = '';
  queryForm.traceId = '';
  queryForm.createdAtMs = undefined;

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
const currentRow = ref<ChatMessage | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细
const handleView = (row: ChatMessage) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: ChatMessage) => {
  ElMessageBox.confirm(`确认删除聊天消息表「${row.id}」吗？`, t('G2_LBL_TIP', '提示'), {
    type: 'warning',
  })
    .then(async () => {
      try {
        await ChatMessageApi.remove(row.id);
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
  nodeId: '',
  round: undefined as number | undefined,
  messageId: '',
  channel: '',
  model: '',
  role: '',
  messageType: '',
  content: '',
  traceId: '',
  createdAtMs: undefined as number | undefined,
});

// 表单校验规则
const editRules: FormRules = {
  organId: [{ required: true, message: '请输入机构标识', trigger: 'blur' }],
  conversationId: [{ required: true, message: '请输入所属会话', trigger: 'blur' }],
  messageId: [{ required: true, message: '请输入消息业务标识', trigger: 'blur' }],
  role: [{ required: true, message: '请输入角色[USER, AGENT]', trigger: 'blur' }],
  messageType: [{ required: true, message: '请输入消息类型[USER_TEXT, AGENT_REPLY]', trigger: 'blur' }],
  content: [{ required: true, message: '请输入消息内容', trigger: 'blur' }],
  createdAtMs: [{ required: true, message: '请输入业务发言时间 epoch ms', trigger: 'blur' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.organId = undefined;
  editForm.conversationId = '';
  editForm.taskId = '';
  editForm.nodeId = '';
  editForm.round = undefined;
  editForm.messageId = '';
  editForm.channel = '';
  editForm.model = '';
  editForm.role = '';
  editForm.messageType = '';
  editForm.content = '';
  editForm.traceId = '';
  editForm.createdAtMs = undefined;
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: ChatMessage) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.organId = row.organId;
  editForm.conversationId = row.conversationId;
  editForm.taskId = row.taskId;
  editForm.nodeId = row.nodeId;
  editForm.round = row.round;
  editForm.messageId = row.messageId;
  editForm.channel = row.channel;
  editForm.model = row.model;
  editForm.role = row.role;
  editForm.messageType = row.messageType;
  editForm.content = row.content;
  editForm.traceId = row.traceId;
  editForm.createdAtMs = row.createdAtMs;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: ChatMessagePayload = {
    organId: editForm.organId,
    conversationId: editForm.conversationId,
    taskId: editForm.taskId,
    nodeId: editForm.nodeId,
    round: editForm.round,
    messageId: editForm.messageId,
    channel: editForm.channel,
    model: editForm.model,
    role: editForm.role,
    messageType: editForm.messageType,
    content: editForm.content,
    traceId: editForm.traceId,
    createdAtMs: editForm.createdAtMs,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await ChatMessageApi.save(payload);
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
.chat_message-page {
  padding: 20px;
  background-color: var(--g2-bg-page);
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.chat_message-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: var(--g2-bg-container);
  border-radius: 4px;
}

.chat_message-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat_message-page__header h2 {
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

.chat_message-page__search {
  margin-bottom: 12px;
  background-color: var(--g2-bg-container);
}

.chat_message-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
