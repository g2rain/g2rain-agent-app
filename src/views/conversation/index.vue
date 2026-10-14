<template>
  <div class="conversation-page">
    <header class="conversation-page__head">
      <div>
        <h2>{{ $t('AGENT_MENU_CONVERSATION', '会话观测') }}</h2>
        <p>{{ $t('AGENT_CONVERSATION_SUBTITLE', '查看用户与智能体的对话，以及每个任务的执行过程') }}</p>
      </div>
    </header>

    <div class="conversation-page__filters">
      <el-input
        v-model="keyword"
        clearable
        :placeholder="$t('AGENT_CONVERSATION_SEARCH', '搜索会话标题')"
        style="width: 280px"
        @change="search"
        @clear="search"
      />
      <el-date-picker
        v-model="range"
        type="datetimerange"
        value-format="YYYY-MM-DD HH:mm:ss"
        :start-placeholder="$t('AGENT_CONVERSATION_FROM', '创建时间起')"
        :end-placeholder="$t('AGENT_CONVERSATION_TO', '止')"
        style="width: 360px"
        @change="search"
      />
    </div>

    <el-table v-loading="loading" :data="rows" class="conversation-page__table" @row-click="open">
      <el-table-column :label="$t('AGENT_CONVERSATION_COLUMN', '会话')" min-width="320">
        <template #default="{ row }">
          <div class="conversation-page__title">{{ row.title || $t('AGENT_CONVERSATION_UNTITLED', '未命名会话') }}</div>
          <CopyText :text="row.conversationId" :length="8" :copied-text="copiedText" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('AGENT_CONVERSATION_USER', '用户')" prop="userId" width="120" />
      <el-table-column :label="$t('AGENT_CONVERSATION_CURRENT', '当前任务')" width="140">
        <template #default="{ row }">
          <StatusDot v-if="row.activeTaskId" tone="running" :label="$t('AGENT_STATUS_RUNNING', '进行中')" />
          <span v-else class="conversation-page__muted">{{ EMPTY }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('AGENT_CONVERSATION_LAST_MESSAGE', '最近消息')" width="160">
        <template #default="{ row }">
          <el-tooltip :content="row.lastMessageTime ?? ''" :disabled="!row.lastMessageTime" placement="top">
            <span>{{ fromNow(row.lastMessageTime) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" prop="createTime" width="180" />
      <template #empty>
        <el-empty :image-size="72" :description="$t('AGENT_CONVERSATION_EMPTY', '还没有会话')" />
      </template>
    </el-table>

    <div class="conversation-page__pagination">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="search"
        @current-change="load"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { t } from '@platform/i18n';
import { CopyText, StatusDot, showErrorMessage } from '@/components';
import { EMPTY, fromNow } from '@runtime/console';
import { conversationDetailRoute } from '@/views/conversation_detail';
import { ConversationApi } from './api';
import type { ChatConversationVo, ConversationQuery } from './type';

const router = useRouter();
const copiedText = computed(() => t('AGENT_COPIED', '已复制'));

const keyword = ref('');
const range = ref<[string, string] | null>(null);
const rows = ref<ChatConversationVo[]>([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

function query(): ConversationQuery {
  return {
    ...(keyword.value ? { title: keyword.value } : {}),
    ...(range.value ? { createTime: range.value } : {}),
  };
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const page = await ConversationApi.page(query(), pageNum.value, pageSize.value);
    rows.value = page.records;
    total.value = page.total;
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载列表失败'));
  } finally {
    loading.value = false;
  }
}

function search(): void {
  pageNum.value = 1;
  void load();
}

function open(row: ChatConversationVo): void {
  void router.push(conversationDetailRoute(row.conversationId));
}

onMounted(load);
</script>

<style scoped>
.conversation-page { padding: 16px 24px 24px; }
.conversation-page__head h2 { margin: 0; font-size: 18px; font-weight: 600; color: var(--g2-text-primary); }
.conversation-page__head p { margin: 4px 0 0; color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.conversation-page__filters { display: flex; flex-wrap: wrap; gap: 12px; margin: 16px 0; }
.conversation-page__table :deep(.el-table__row) { cursor: pointer; }
.conversation-page__title { color: var(--g2-text-primary); font-weight: 500; margin-bottom: 2px; }
.conversation-page__muted { color: var(--g2-text-placeholder); }
.conversation-page__pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
