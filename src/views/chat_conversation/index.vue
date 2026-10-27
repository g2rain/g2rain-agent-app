<template>
  <div class="chat_conversation-page">
    <el-card class="chat_conversation-page__search" shadow="never">
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <el-form-item label="所属机构">
          <OrganSelect v-model="queryForm.organId" />
        </el-form-item>
        <el-form-item :label="$t('AGENT_CONVERSATION_COLUMN', '会话')">
          <el-input
            v-model="queryForm.title"
            clearable
            :placeholder="$t('AGENT_CONVERSATION_SEARCH', '搜索会话标题')"
            style="width: 240px"
          />
        </el-form-item>
        <template #actions>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t('G2_BTN_QUERY', '查询') }}</el-button>
            <el-button @click="handleReset">{{ $t('G2_BTN_RESET', '重置') }}</el-button>
          </el-form-item>
        </template>
      </QueryForm>
    </el-card>

    <SortableTable
      v-loading="loading"
      :data="tableData"
      border
      stripe
      style="width: 100%"
      :enable-multi-sort="true"
      @sort-change="handleSortChange"
    >
      <el-table-column :label="$t('AGENT_CONVERSATION_COLUMN', '会话')" min-width="320">
        <template #default="{ row }">
          <div class="chat_conversation-page__title">
            {{ row.title || $t('AGENT_CONVERSATION_UNTITLED', '未命名会话') }}
          </div>
          <CopyText :text="row.conversationId" :length="8" :copied-text="copiedText" />
        </template>
      </el-table-column>
      <el-table-column prop="organId" label="所属机构" width="110" />
      <el-table-column :label="$t('AGENT_CONVERSATION_USER', '用户')" prop="userId" width="120" />
      <el-table-column :label="$t('AGENT_CONVERSATION_CURRENT', '当前任务')" width="140">
        <template #default="{ row }">
          <StatusDot v-if="row.activeTaskId && row.activeTaskStatus" v-bind="describeStatus(row.activeTaskStatus)" />
          <span v-else class="chat_conversation-page__muted">{{ EMPTY }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('AGENT_CONVERSATION_LAST_MESSAGE', '最近消息')" width="160">
        <template #default="{ row }">
          <el-tooltip :content="row.lastMessageTime ?? ''" :disabled="!row.lastMessageTime" placement="top">
            <span>{{ fromNow(row.lastMessageTime) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" sortable="custom" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="120">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="openDetail(row)">
            {{ $t('AGENT_PAGE_CONVERSATION_DETAIL', '会话详情') }}
          </el-button>
        </template>
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>{{ $t('G2_FIELD_ACTION', '操作') }}</span>
            <SortManagerButton />
          </div>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty :image-size="72" :description="$t('AGENT_CONVERSATION_EMPTY', '还没有会话')" />
      </template>
    </SortableTable>

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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { t } from '@platform/i18n';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';
import { QueryForm, SortableTable, TableColumn, SortManagerButton } from '@g2rain/ui';
import { OrganSelect } from '@g2rain/ui/platform';
import { CopyText, StatusDot } from '@/components';
import { EMPTY, describeStatus, fromNow } from '@runtime/console';
import { conversationDetailRoute } from '@/views/conversation_detail';
import { ChatConversationApi } from './api';
import type { ChatConversation, ChatConversationQuery } from './type';

const router = useRouter();
const copiedText = computed(() => t('AGENT_COPIED', '已复制'));

const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);

const baseQueryForm = ref<BaseSelectListDto>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});

const queryForm = reactive({
  organId: undefined as number | null | undefined,
  title: '',
});

const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 });
const tableData = ref<ChatConversation[]>([]);
const loading = ref(false);

const loadData = async () => {
  loading.value = true;
  try {
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm }).filter(([_, v]) => (v ?? '') !== '' && [v].flat().length),
    ) as ChatConversationQuery;
    const pageData = await ChatConversationApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & ChatConversationQuery);
    tableData.value = pageData.records;
    pagination.total = pageData.total;
  } catch {
    // 请求失败已由 http 层统一提示
  } finally {
    loading.value = false;
  }
};

const handleSortChange = (params: Record<string, string>) => {
  queryFormRef.value?.updateSorts(params);
};

const handleSearch = () => {
  pagination.pageNum = 1;
  void loadData();
};

const handleReset = () => {
  baseQueryForm.value.id = undefined;
  baseQueryForm.value.createTime = undefined;
  baseQueryForm.value.updateTime = undefined;
  queryForm.organId = undefined;
  queryForm.title = '';
  pagination.pageNum = 1;
  void loadData();
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.pageNum = 1;
  void loadData();
};

const handlePageChange = (page: number) => {
  pagination.pageNum = page;
  void loadData();
};

function openDetail(row: ChatConversation): void {
  void router.push(conversationDetailRoute(row.conversationId));
}

onMounted(() => {
  void loadData();
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

.chat_conversation-page__search {
  margin-bottom: 12px;
  background-color: var(--g2-bg-container);
}

.chat_conversation-page__title {
  color: var(--g2-text-primary);
  font-weight: 500;
  margin-bottom: 2px;
}

.chat_conversation-page__muted {
  color: var(--g2-text-placeholder);
}

.chat_conversation-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
