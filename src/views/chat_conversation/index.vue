
<template>
  <div class="chat_conversation-page">
    <!-- 查询表单 -->
    <el-card class="chat_conversation-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item label="机构ID">
          <el-input v-model="queryForm.organId" placeholder="请输入机构ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="会话唯一ID">
          <el-input v-model="queryForm.conversationId" placeholder="请输入会话唯一ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input v-model="queryForm.userId" placeholder="请输入用户ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="会话标题">
          <el-input v-model="queryForm.title" placeholder="请输入会话标题" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="当前运行或挂起中的任务">
          <el-input v-model="queryForm.activeTaskId" placeholder="请输入当前运行或挂起中的任务" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="会话级共享值">
          <el-input v-model="queryForm.sessionShared" placeholder="请输入会话级共享值" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="本轮栅栏版本；新会话为 0，落库按此单调推进">
          <el-input v-model="queryForm.stateVersion" placeholder="请输入本轮栅栏版本；新会话为 0，落库按此单调推进" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="最近消息时间">
          <el-input v-model="queryForm.lastMessageTime" placeholder="请输入最近消息时间" clearable style="width: 200px" />
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
    <div class="chat_conversation-page__header">
      <div class="chat_conversation-page__title-group">
        <h2>管理聊天会话表数据</h2>
      </div>
      <el-button type="primary" v-permission="'chat_conversation:add'" @click="handleCreate">新增聊天会话表</el-button>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="120" />
      <el-table-column prop="organId" label="机构ID" width="140" />
      <el-table-column prop="conversationId" label="会话唯一ID" width="180" />
      <el-table-column prop="userId" label="用户ID" width="140" />
      <el-table-column prop="title" label="会话标题" width="180" />
      <el-table-column prop="activeTaskId" label="当前运行或挂起中的任务" width="180" />
      <el-table-column prop="sessionShared" label="会话级共享值" width="180" />
      <el-table-column prop="stateVersion" label="本轮栅栏版本；新会话为 0，落库按此单调推进" width="140" />
      <el-table-column prop="lastMessageTime" label="最近消息时间" width="180" />
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" sortable="custom" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" sortable="custom" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '明细') }}</el-button>
          <el-button type="primary" v-permission="'chat_conversation:edit'" link size="small" @click="handleEdit(row)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
          <el-button type="danger" v-permission="'chat_conversation:delete'" link size="small" @click="handleDelete(row)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
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
    <div class="chat_conversation-page__pagination">
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
    <el-dialog v-model="editDialogVisible" :title="isEdit ? '编辑聊天会话表' : '新增聊天会话表'" width="520px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="机构ID" prop="organId">
          <el-input v-model="editForm.organId" placeholder="请输入机构ID" />
        </el-form-item>
        <el-form-item label="会话唯一ID" prop="conversationId">
          <el-input v-model="editForm.conversationId" placeholder="请输入会话唯一ID" />
        </el-form-item>
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="editForm.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="会话标题" prop="title">
          <el-input v-model="editForm.title" placeholder="请输入会话标题" />
        </el-form-item>
        <el-form-item label="当前运行或挂起中的任务" prop="activeTaskId">
          <el-input v-model="editForm.activeTaskId" placeholder="请输入当前运行或挂起中的任务" />
        </el-form-item>
        <el-form-item label="会话级共享值" prop="sessionShared">
          <el-input v-model="editForm.sessionShared" placeholder="请输入会话级共享值" />
        </el-form-item>
        <el-form-item label="本轮栅栏版本；新会话为 0，落库按此单调推进" prop="stateVersion">
          <el-input v-model="editForm.stateVersion" placeholder="请输入本轮栅栏版本；新会话为 0，落库按此单调推进" />
        </el-form-item>
        <el-form-item label="最近消息时间" prop="lastMessageTime">
          <el-input v-model="editForm.lastMessageTime" placeholder="请输入最近消息时间" />
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
    <el-dialog v-model="detailDialogVisible" title="聊天会话表明细" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('G2_FIELD_ID', 'ID')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="机构ID">{{ currentRow?.organId }}</el-descriptions-item>
        <el-descriptions-item label="会话唯一ID">{{ currentRow?.conversationId }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ currentRow?.userId }}</el-descriptions-item>
        <el-descriptions-item label="会话标题">{{ currentRow?.title }}</el-descriptions-item>
        <el-descriptions-item label="当前运行或挂起中的任务">{{ currentRow?.activeTaskId }}</el-descriptions-item>
        <el-descriptions-item label="会话级共享值">{{ currentRow?.sessionShared }}</el-descriptions-item>
        <el-descriptions-item label="本轮栅栏版本；新会话为 0，落库按此单调推进">{{ currentRow?.stateVersion }}</el-descriptions-item>
        <el-descriptions-item label="最近消息时间">{{ currentRow?.lastMessageTime }}</el-descriptions-item>
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
import { ChatConversationApi } from './api';
import type { ChatConversation, ChatConversationPayload, ChatConversationQuery } from './type';
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
  userId: undefined,
  title: '',
  activeTaskId: '',
  sessionShared: '',
  stateVersion: undefined,
  lastMessageTime: '',
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<ChatConversation[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as ChatConversationQuery;

    // 请求分页数据
    const pageData = await ChatConversationApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & ChatConversationQuery);

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
  queryForm.userId = undefined;
  queryForm.title = '';
  queryForm.activeTaskId = '';
  queryForm.sessionShared = '';
  queryForm.stateVersion = undefined;
  queryForm.lastMessageTime = '';

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
const currentRow = ref<ChatConversation | null>(null);
// 明细弹窗引用
const detailDialogVisible = ref(false);

// 查询数据明细
const handleView = (row: ChatConversation) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

// 删除数据记录
const handleDelete = (row: ChatConversation) => {
  ElMessageBox.confirm(`确认删除聊天会话表「${row.id}」吗？`, t('G2_LBL_TIP', '提示'), {
    type: 'warning',
  })
    .then(async () => {
      try {
        await ChatConversationApi.remove(row.id);
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
  userId: undefined as number | undefined,
  title: '',
  activeTaskId: '',
  sessionShared: '',
  stateVersion: undefined as number | undefined,
  lastMessageTime: '',
});

// 表单校验规则
const editRules: FormRules = {
  organId: [{ required: true, message: '请输入机构标识', trigger: 'blur' }],
  conversationId: [{ required: true, message: '请输入会话唯一标识', trigger: 'blur' }],
  userId: [{ required: true, message: '请输入用户标识', trigger: 'blur' }],
  stateVersion: [{ required: true, message: '请输入本轮栅栏版本；新会话为 0，落库按此单调推进', trigger: 'blur' }],
};

// 打开创建弹窗
const handleCreate = () => {
  isEdit.value = false;
  editFormRef.value?.clearValidate();

  editForm.organId = undefined;
  editForm.conversationId = '';
  editForm.userId = undefined;
  editForm.title = '';
  editForm.activeTaskId = '';
  editForm.sessionShared = '';
  editForm.stateVersion = undefined;
  editForm.lastMessageTime = '';
  editDialogVisible.value = true;
};

// 打开修改弹窗
const handleEdit = (row: ChatConversation) => {
  isEdit.value = true;
  editFormRef.value?.clearValidate();

  editForm.id = row.id;
  editForm.organId = row.organId;
  editForm.conversationId = row.conversationId;
  editForm.userId = row.userId;
  editForm.title = row.title;
  editForm.activeTaskId = row.activeTaskId;
  editForm.sessionShared = row.sessionShared;
  editForm.stateVersion = row.stateVersion;
  editForm.lastMessageTime = row.lastMessageTime;
  editDialogVisible.value = true;
};

// 提交数据表单
const submitEdit = async () => {
  if (!editFormRef.value) return;
  const valid = await editFormRef.value.validate();
  if (!valid) return;

  const payload: ChatConversationPayload = {
    organId: editForm.organId,
    conversationId: editForm.conversationId,
    userId: editForm.userId,
    title: editForm.title,
    activeTaskId: editForm.activeTaskId,
    sessionShared: editForm.sessionShared,
    stateVersion: editForm.stateVersion,
    lastMessageTime: editForm.lastMessageTime,
  };

  try {
    // 编辑模式下，将 id 添加到 payload 中
    if (isEdit.value) {
      payload.id = editForm.id;
    }
    await ChatConversationApi.save(payload);
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
.chat_conversation-page {
  padding: 20px;
  background-color: var(--g2-bg-page);
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.chat_conversation-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: var(--g2-bg-container);
  border-radius: 4px;
}

.chat_conversation-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat_conversation-page__header h2 {
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

.chat_conversation-page__search {
  margin-bottom: 12px;
  background-color: var(--g2-bg-container);
}

.chat_conversation-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
