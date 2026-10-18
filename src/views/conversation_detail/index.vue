<template>
  <div class="conversation-detail" :class="{ 'is-embed': embed }">
    <el-breadcrumb v-if="!embed" class="conversation-detail__crumb" separator="/">
      <el-breadcrumb-item v-if="hasRoute(CONVERSATION_PATH)" :to="{ path: CONVERSATION_PATH }">
        {{ $t('AGENT_MENU_CONVERSATION', '会话观测') }}
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t('AGENT_PAGE_CONVERSATION_DETAIL', '会话详情') }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-skeleton v-if="loading && !bundle" :rows="8" animated />

    <el-result v-else-if="failure" icon="error" :sub-title="failure">
      <template #extra><el-button type="primary" @click="load()">{{ $t('G2_BTN_RETRY', '重试') }}</el-button></template>
    </el-result>

    <el-empty v-else-if="!bundle" :description="$t('AGENT_CONVERSATION_NOT_FOUND', '没有找到这个会话')" />

    <template v-else>
      <header class="conversation-detail__head">
        <h2 class="conversation-detail__title">{{ bundle.conversation.title || $t('AGENT_CONVERSATION_UNTITLED', '未命名会话') }}</h2>
        <div class="conversation-detail__meta">
          <CopyText :text="bundle.conversation.conversationId" :length="8" :copied-text="$t('AGENT_COPIED', '已复制')" />
          <span>{{ $t('AGENT_CONVERSATION_USER', '用户') }} {{ bundle.conversation.userId }}</span>
          <span v-if="span">{{ span }}</span>
          <span>{{ $t('AGENT_CONVERSATION_TASK_COUNT', { n: bundle.tasks.length }, '{n} 个任务') }}</span>
          <span class="conversation-detail__spacer" />
          <div class="conversation-detail__actions">
            <el-button v-if="!embed" size="small" @click="goBack">{{ $t('G2_BTN_BACK', '返回') }}</el-button>
            <el-button size="small" :loading="loading" @click="load(true)">{{ $t('G2_BTN_REFRESH', '刷新') }}</el-button>
          </div>
        </div>
        <div v-if="statusCounts.length > 0" class="conversation-detail__filters">
          <button
            v-for="item in statusCounts"
            :key="item.status"
            type="button"
            class="conversation-detail__chip"
            :class="{ 'is-active': statusFilter === item.status }"
            @click="statusFilter = statusFilter === item.status ? null : item.status"
          >
            <StatusDot :tone="describeStatus(item.status).tone" :label="`${describeStatus(item.status).label} ${item.count}`" />
          </button>
        </div>
      </header>

      <div class="conversation-detail__body">
        <section v-loading="messagesLoading" class="conversation-detail__timeline">
          <TurnList
            :turns="visibleTurns"
            :resumes="bundle.resumes"
            :write-tasks="writeTasks"
            :selected-task-id="selectedTaskId"
            :locale="locale"
            @select="selectTask"
          />
          <div class="conversation-detail__pagination">
            <el-pagination
              v-model:current-page="messagePage.pageNum"
              v-model:page-size="messagePage.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="bundle.messageTotal"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleMessageSizeChange"
              @current-change="handleMessagePageChange"
            />
          </div>
        </section>
        <aside class="conversation-detail__aside">
          <TaskSummary
            v-if="selectedTask"
            :task="selectedTask"
            :nodes="nodeCache[selectedTask.taskId] ?? null"
            :resumes="bundle.resumes[selectedTask.taskId] ?? []"
            :embed="embed"
          />
          <el-empty v-else :image-size="64" :description="$t('AGENT_CONVERSATION_NO_TASK', '这个会话还没有任务')" />
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { t } from '@platform/i18n';
import { useLocaleStore } from '@platform/stores/locale.store';
import { CopyText, StatusDot } from '@/components';
import { ResumeAction, describeStatus, formatClock } from '@runtime/console';
import TurnList from './components/TurnList.vue';
import TaskSummary from './components/TaskSummary.vue';
import { ConversationDetailApi } from './api';
import { buildTurns } from './turns';
import type { ConversationBundle, TaskGraphNodeVo } from './type';

const CONVERSATION_PATH = '/chat_conversation';

const route = useRoute();
const router = useRouter();
const localeStore = useLocaleStore();

const conversationId = computed(() => (typeof route.query.conversationId === 'string' ? route.query.conversationId : ''));
const embed = computed(() => route.query.embed === '1');
const locale = computed(() => localeStore.locale || 'zh-CN');

const bundle = ref<ConversationBundle | null>(null);
const loading = ref(false);
const messagesLoading = ref(false);
const failure = ref('');
const selectedTaskId = ref<string | null>(null);
const statusFilter = ref<string | null>(null);
const nodeCache = reactive<Record<string, TaskGraphNodeVo[]>>({});
const messagePage = reactive({ pageNum: 1, pageSize: 20 });

const turns = computed(() => (bundle.value ? buildTurns(bundle.value.messages, bundle.value.tasks) : []));
const visibleTurns = computed(() =>
  statusFilter.value ? turns.value.filter((turn) => turn.tasks.some((task) => task.status === statusFilter.value)) : turns.value,
);
const selectedTask = computed(() => bundle.value?.tasks.find((task) => task.taskId === selectedTaskId.value) ?? null);

/** 有确认执行记录的任务视为发生过写操作（会话页不加载工具调用明细） */
const writeTasks = computed(() => {
  const ids = new Set<string>();
  for (const [taskId, resumes] of Object.entries(bundle.value?.resumes ?? {})) {
    if (resumes.some((r) => r.resumeAction === ResumeAction.CONFIRM)) ids.add(taskId);
  }
  return ids;
});

const statusCounts = computed(() => {
  const counts = new Map<string, number>();
  for (const task of bundle.value?.tasks ?? []) counts.set(task.status, (counts.get(task.status) ?? 0) + 1);
  return [...counts].map(([status, count]) => ({ status, count }));
});

/** 会话起止时间：首条与末条消息 */
const span = computed(() => {
  const times = (bundle.value?.messages ?? []).map((m) => m.createdAtMs).sort((a, b) => a - b);
  if (times.length === 0) return '';
  const day = new Date(times[0]).toLocaleDateString();
  const clock = (ms: number) => formatClock(new Date(ms).toTimeString());
  return `${day} ${clock(times[0])} – ${clock(times[times.length - 1])}`;
});

function hasRoute(path: string): boolean {
  return router.resolve(path).matched.length > 0;
}

function goBack(): void {
  void router.push({ path: CONVERSATION_PATH });
}

async function selectTask(taskId: string): Promise<void> {
  selectedTaskId.value = taskId;
  if (nodeCache[taskId]) return;
  try {
    nodeCache[taskId] = await ConversationDetailApi.nodes(taskId);
  } catch {
    nodeCache[taskId] = [];
  }
}

/** 加载会话；silent 为 true 时保留当前选中任务 */
async function load(silent = false): Promise<void> {
  if (!conversationId.value) {
    bundle.value = null;
    return;
  }
  loading.value = true;
  failure.value = '';
  try {
    const next = await ConversationDetailApi.load(
      conversationId.value,
      messagePage.pageNum,
      messagePage.pageSize,
    );
    bundle.value = next;
    if (silent) Object.keys(nodeCache).forEach((key) => delete nodeCache[key]);
    const keep = silent && next?.tasks.some((task) => task.taskId === selectedTaskId.value);
    const fallback = next?.tasks[next.tasks.length - 1]?.taskId ?? null;
    const target = keep ? selectedTaskId.value : fallback;
    selectedTaskId.value = null;
    if (target) await selectTask(target);
  } catch (error: unknown) {
    failure.value = error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载失败');
  } finally {
    loading.value = false;
  }
}

/** 只翻消息页，不重拉任务 */
async function loadMessages(): Promise<void> {
  if (!conversationId.value || !bundle.value) return;
  messagesLoading.value = true;
  try {
    const page = await ConversationDetailApi.pageMessages(
      conversationId.value,
      messagePage.pageNum,
      messagePage.pageSize,
    );
    bundle.value = {
      ...bundle.value,
      messages: page.records,
      messageTotal: page.total,
    };
  } catch (error: unknown) {
    failure.value = error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载失败');
  } finally {
    messagesLoading.value = false;
  }
}

function handleMessageSizeChange(size: number): void {
  messagePage.pageSize = size;
  messagePage.pageNum = 1;
  void loadMessages();
}

function handleMessagePageChange(page: number): void {
  messagePage.pageNum = page;
  void loadMessages();
}

watch(conversationId, () => {
  statusFilter.value = null;
  messagePage.pageNum = 1;
  void load();
}, { immediate: true });
</script>

<style scoped>
.conversation-detail { display: flex; flex-direction: column; padding: 16px 24px 24px; min-width: 0; }
.conversation-detail.is-embed { padding: 12px 16px; }
.conversation-detail__crumb { margin-bottom: 12px; }
.conversation-detail__head { margin-bottom: 16px; }
.conversation-detail__title { margin: 0 0 8px; font-size: 18px; font-weight: 600; color: var(--g2-text-primary); }
.conversation-detail__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.conversation-detail__spacer { flex: 1; }
.conversation-detail__actions { display: inline-flex; align-items: center; gap: 8px; }
.conversation-detail__actions :deep(.el-button + .el-button) { margin-left: 0; }
.conversation-detail__filters { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.conversation-detail__chip {
  padding: 4px 10px;
  border: 1px solid var(--g2-border-color-light);
  border-radius: 14px;
  background: var(--g2-bg-container);
  cursor: pointer;
}
.conversation-detail__chip.is-active { border-color: var(--g2-color-primary); }
.conversation-detail__body { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 16px; align-items: start; }
.conversation-detail__timeline,
.conversation-detail__aside {
  padding: 4px 20px;
  border: 1px solid var(--g2-border-color-light);
  border-radius: var(--g2-border-radius-lg);
  background: var(--g2-bg-container);
}
.conversation-detail__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  padding-bottom: 8px;
}
.conversation-detail__aside { position: sticky; top: 16px; padding: 16px 20px; }
@media (max-width: 1100px) {
  .conversation-detail__body { grid-template-columns: minmax(0, 1fr); }
  .conversation-detail__aside { position: static; order: -1; }
}
</style>
