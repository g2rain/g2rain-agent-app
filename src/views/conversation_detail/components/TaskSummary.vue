<template>
  <div class="task-summary">
    <div class="task-summary__head">
      <span class="task-summary__label">{{ $t('AGENT_CONVERSATION_TASK', '任务') }}</span>
      <CopyText :text="task.taskId" :length="8" :copied-text="$t('AGENT_COPIED', '已复制')" />
    </div>
    <div class="task-summary__status">
      <StatusDot v-bind="describeStatus(task.status)" />
      <span>{{ formatDuration(elapsed(task.startedTime, task.finishedTime)) }}</span>
    </div>
    <p class="task-summary__goal">{{ task.goalSummary || task.request || task.taskId }}</p>
    <p v-if="task.finalMessage && failed" class="task-summary__failure">{{ task.finalMessage }}</p>

    <section class="task-summary__section">
      <h4>{{ $t('AGENT_CONVERSATION_STEPS', '步骤') }}</h4>
      <div v-if="error" class="task-summary__muted">
        {{ $t('G2_MSG_LOAD_FAIL', '加载失败') }}
        <el-button link type="primary" size="small" @click="emit('retry')">{{ $t('G2_BTN_RETRY', '重试') }}</el-button>
      </div>
      <el-skeleton v-else-if="nodes === null" :rows="2" animated />
      <ol v-else class="task-summary__steps">
        <li v-for="node in nodes" :key="node.nodeId">
          <StatusDot :tone="describeStatus(node.status).tone" />
          <span class="task-summary__step-title">{{ node.title || node.nodeId }}</span>
          <span class="task-summary__muted">{{ formatDuration(elapsed(node.startedTime, node.finishedTime)) }}</span>
        </li>
      </ol>
    </section>

    <section v-if="resumes.length > 0" class="task-summary__section">
      <h4>{{ $t('AGENT_CONVERSATION_APPROVALS', '确认') }}</h4>
      <ul class="task-summary__approvals">
        <li v-for="resume in resumes" :key="resume.resumeId" :class="`is-${approvalOutcome(resume)}`">
          {{ approvalText(resume) }}
          <span class="task-summary__muted">{{ formatClock(resume.actedAt) }}</span>
        </li>
      </ul>
    </section>

    <section v-if="entities.length > 0" class="task-summary__section">
      <h4>{{ $t('AGENT_CONVERSATION_ENTITIES', '产生的对象') }}</h4>
      <div class="task-summary__entities">
        <span v-for="entity in entities" :key="entity.key" class="task-summary__entity">
          <em>{{ entity.type }}</em> {{ entity.name }}
        </span>
      </div>
    </section>

    <router-link class="task-summary__link" :to="taskTraceRoute(task.taskId, embed)">
      {{ $t('AGENT_CONVERSATION_VIEW_TRACE', '查看执行追踪') }} ›
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { t } from '@platform/i18n';
import { CopyText, StatusDot } from '@/components';
import {
  TaskStatus,
  describeStatus,
  elapsed,
  formatClock,
  formatDuration,
  parseJson,
} from '@runtime/console';
import { taskTraceRoute } from '@/views/task_trace';
import { approvalOutcome, type ApprovalOutcome } from '../turns';
import type { TaskGraphNodeVo, TaskInstanceVo, TaskResumeRecordVo } from '../type';

/** 右栏任务摘要：步骤、确认、产生的对象，以及进入执行追踪的入口。nodes 为 null 表示加载中 */
const props = defineProps<{
  task: TaskInstanceVo;
  nodes: TaskGraphNodeVo[] | null;
  /** 明细加载失败 */
  error: boolean;
  resumes: TaskResumeRecordVo[];
  embed: boolean;
}>();
const emit = defineEmits<{ retry: [] }>();

const failed = computed(() => props.task.status === TaskStatus.FAILED || props.task.status === TaskStatus.CANCELED);

const entities = computed(() => {
  const record = parseJson<{ entities?: Record<string, { displayName?: string }> }>(props.task.taskRecord, {});
  return Object.entries(record.entities ?? {})
    .filter(([, entity]) => entity.displayName)
    .map(([key, entity]) => ({ key, type: key.split(':')[0], name: entity.displayName ?? '' }));
});

const APPROVAL_TEXT: Record<ApprovalOutcome, [string, string]> = {
  confirmed: ['AGENT_TRACE_RESUME_CONFIRM', '已确认'],
  rejected: ['AGENT_TRACE_RESUME_REJECT', '已拒绝'],
  replied: ['AGENT_TRACE_RESUME_REPLY', '已回复'],
  canceled: ['AGENT_TRACE_RESUME_CANCEL', '已取消'],
};

function approvalText(resume: TaskResumeRecordVo): string {
  const [code, text] = APPROVAL_TEXT[approvalOutcome(resume)];
  return t(code, text);
}
</script>

<style scoped>
.task-summary { display: flex; flex-direction: column; gap: 10px; }
.task-summary__head { display: flex; align-items: center; justify-content: space-between; }
.task-summary__label { font-size: var(--g2-font-size-sm); color: var(--g2-text-secondary); }
.task-summary__status { display: flex; align-items: center; gap: 10px; color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.task-summary__goal { margin: 0; color: var(--g2-text-primary); font-weight: 600; line-height: 1.5; }
.task-summary__failure { margin: 0; color: var(--g2-color-danger); font-size: var(--g2-font-size-sm); }
.task-summary__section h4 { margin: 4px 0 8px; font-size: var(--g2-font-size-sm); font-weight: 600; color: var(--g2-text-regular); }
.task-summary__steps, .task-summary__approvals { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 6px; }
.task-summary__steps li { display: flex; align-items: center; gap: 8px; }
.task-summary__step-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.task-summary__muted { color: var(--g2-text-placeholder); font-size: var(--g2-font-size-sm); }
.task-summary__approvals li { display: flex; justify-content: space-between; font-size: var(--g2-font-size-sm); }
.task-summary__approvals li.is-confirmed { color: var(--g2-color-success); }
.task-summary__approvals li.is-rejected { color: var(--g2-color-danger); }
.task-summary__entities { display: flex; flex-wrap: wrap; gap: 6px; }
.task-summary__entity {
  padding: 2px 8px;
  border: 1px solid var(--g2-border-color-light);
  border-radius: 12px;
  font-size: var(--g2-font-size-sm);
  color: var(--g2-text-regular);
}
.task-summary__entity em { font-style: normal; color: var(--g2-text-placeholder); margin-right: 2px; }
.task-summary__link { margin-top: 6px; color: var(--g2-color-primary); text-decoration: none; font-weight: 600; }
.task-summary__link:hover { text-decoration: underline; }
</style>
