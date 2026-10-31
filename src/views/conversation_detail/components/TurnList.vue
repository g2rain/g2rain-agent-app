<template>
  <el-empty v-if="turns.length === 0" :description="$t('AGENT_CONVERSATION_NO_MESSAGE', '这个会话还没有消息')" />
  <ol v-else class="turns">
    <li v-for="(turn, turnIndex) in turns" :key="turn.key" class="turn">
      <div class="turn__time">
        {{ clock(turn.time) }}
        <span v-if="!turn.user && turnIndex === 0 && continued" class="turn__continued">
          {{ $t('AGENT_CONVERSATION_CONTINUED', '接上页') }}
        </span>
      </div>

      <div v-if="turn.user" class="turn__user" :data-mid="turn.user.messageId">
        <div class="turn__bubble">{{ turn.user.content }}</div>
      </div>

      <template v-for="(reply, index) in turn.replies" :key="reply.messageId">
        <div class="turn__reply" :data-mid="reply.messageId">
          <span class="turn__avatar">AI</span>
          <MarkdownViewer :content="reply.content" :locale="locale" />
        </div>
        <button
          v-if="isFinal(reply)"
          type="button"
          class="turn__task turn__progress"
          :class="{ 'is-active': reply.traceId === selectedTraceId }"
          @click="emit('trace', reply.traceId!)"
        >
          <span class="turn__progress-icon" aria-hidden="true">⏱</span>
          <span class="turn__task-goal">{{ $t('G2_LBL_PROGRESS', '执行过程') }}</span>
          <span class="turn__task-meta">{{ formatDuration(reply.elapsedMs) }}</span>
          <span class="turn__task-arrow">›</span>
        </button>
        <div v-if="markerAt(turn, index)" class="turn__marker" :class="`is-${markerAt(turn, index)}`">
          {{ markerText(markerAt(turn, index)!) }}
        </div>
      </template>

      <button
        v-for="task in turn.tasks"
        :key="task.taskId"
        type="button"
        class="turn__task"
        :class="{ 'is-active': task.taskId === selectedTaskId }"
        @click="emit('select', task.taskId)"
      >
        <StatusDot v-bind="describeStatus(task.status)" />
        <span class="turn__task-goal">{{ task.goalSummary || shortId(task.taskId) }}</span>
        <span v-if="hasWrite(task.taskId)" class="turn__write">{{ $t('AGENT_TRACE_WRITE', '写') }}</span>
        <span class="turn__task-meta">{{ formatDuration(elapsed(task.startedTime, task.finishedTime)) }}</span>
        <span class="turn__task-arrow">›</span>
      </button>
    </li>
  </ol>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { t } from '@platform/i18n';
import { StatusDot } from '@/components';
import { describeStatus, elapsed, formatDuration, shortId } from '@runtime/console';
import { approvalOutcome, type ApprovalOutcome, type Turn } from '../turns';
import type { ChatMessageVo, TaskResumeRecordVo } from '../type';

const MarkdownViewer = defineAsyncComponent(() => import('@/components/markdown').then((m) => m.MarkdownViewer));

/**
 * 按轮展示对话。审批提示与后续回复之间用细虚线标出用户的确认结果；
 * 任务卡片挂在触发它的轮次下，点击后在右栏查看摘要。
 */
const props = defineProps<{
  turns: Turn[];
  /** 窗口之前还有更早的消息：首轮没有用户消息时标注「接上页」 */
  continued: boolean;
  resumes: Record<string, TaskResumeRecordVo[]>;
  writeTasks: Set<string>;
  selectedTaskId: string | null;
  /** 选中查看执行过程的轮次追踪号 */
  selectedTraceId: string | null;
  locale: string;
}>();
const emit = defineEmits<{ select: [taskId: string]; trace: [traceId: string] }>();

/** 带追踪号的最终回复才有执行过程入口；节点内的中间文字不算 */
function isFinal(reply: ChatMessageVo): boolean {
  return !!reply.traceId && !reply.nodeId && reply.messageType === 'AGENT_REPLY';
}

function clock(ms: number): string {
  const date = new Date(ms);
  return [date.getHours(), date.getMinutes(), date.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':');
}

function hasWrite(taskId: string): boolean {
  return props.writeTasks.has(taskId);
}

/** 第 index 条回复之后的确认标记：第 i 次恢复动作发生在第 i 条回复（审批提示）之后 */
function markerAt(turn: Turn, index: number): ApprovalOutcome | null {
  if (index >= turn.replies.length - 1) return null;
  const resumes = turn.tasks.flatMap((task) => props.resumes[task.taskId] ?? []);
  const resume = resumes[index];
  return resume ? approvalOutcome(resume) : null;
}

const MARKER_TEXT: Record<ApprovalOutcome, [string, string]> = {
  confirmed: ['AGENT_CONVERSATION_MARKER_CONFIRMED', '等待确认 → 已确认'],
  rejected: ['AGENT_CONVERSATION_MARKER_REJECTED', '等待确认 → 已拒绝'],
  replied: ['AGENT_CONVERSATION_MARKER_REPLIED', '追问 → 已回复'],
  canceled: ['AGENT_CONVERSATION_MARKER_CANCELED', '等待确认 → 已取消'],
};

function markerText(outcome: ApprovalOutcome): string {
  const [code, text] = MARKER_TEXT[outcome];
  return t(code, text);
}
</script>

<style scoped>
.turns { margin: 0; padding: 0; list-style: none; }
.turn { padding: 16px 0; border-bottom: 1px solid var(--g2-border-color-light); display: flex; flex-direction: column; gap: 10px; }
.turn:last-child { border-bottom: none; }
.turn__time { font-size: var(--g2-font-size-sm); color: var(--g2-text-placeholder); font-variant-numeric: tabular-nums; }
.turn__continued { margin-left: 8px; }
.turn__user { display: flex; justify-content: flex-end; }
.turn__bubble {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 12px 12px 2px 12px;
  background: color-mix(in srgb, var(--g2-color-primary) 10%, var(--g2-bg-container));
  color: var(--g2-text-primary);
  white-space: pre-wrap;
  line-height: var(--g2-line-height-base);
}
.turn__reply { display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 10px; }
.turn__avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--g2-color-primary);
  background: color-mix(in srgb, var(--g2-color-primary) 12%, transparent);
}
.turn__marker {
  margin-left: 38px;
  padding-left: 10px;
  border-left: 2px dashed var(--g2-border-color);
  font-size: var(--g2-font-size-sm);
  color: var(--g2-text-secondary);
}
.turn__marker.is-confirmed { color: var(--g2-color-success); }
.turn__marker.is-rejected { color: var(--g2-color-danger); }
.turn__task {
  margin-left: 38px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid var(--g2-border-color-light);
  border-radius: var(--g2-border-radius-base);
  background: var(--g2-bg-container);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color var(--g2-transition-duration), box-shadow var(--g2-transition-duration);
}
.turn__task:hover { box-shadow: var(--g2-shadow-sm); }
.turn__task.is-active { border-color: var(--g2-color-primary); box-shadow: var(--g2-shadow-sm); }
.turn__task-goal { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--g2-text-primary); }
.turn__task-meta { color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.turn__task-arrow { color: var(--g2-text-placeholder); }
.turn__write {
  padding: 0 4px;
  font-size: 11px;
  color: var(--g2-color-warning);
  border: 1px solid var(--g2-color-warning);
  border-radius: 3px;
}
.turn__progress-icon { flex-shrink: 0; font-size: 12px; color: var(--g2-text-placeholder); }
</style>
