<template>
  <div class="task-detail">
    <div class="task-detail__head">
      <StatusDot v-bind="describeStatus(bundle.task.status)" />
      <span class="task-detail__title">{{ $t('AGENT_TRACE_RESULT', '结果') }}</span>
      <span class="task-detail__meta">{{ formatDuration(elapsed(bundle.task.startedTime, bundle.task.finishedTime)) }}</span>
    </div>
    <el-tabs v-model="tab">
      <el-tab-pane :label="$t('AGENT_TRACE_TAB_TASK', '任务')" name="task">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item :label="$t('AGENT_TRACE_GOAL', '目标')">{{ bundle.task.goalSummary || EMPTY }}</el-descriptions-item>
          <el-descriptions-item :label="$t('AGENT_TRACE_AGENT', '智能体')">{{ agentName || EMPTY }}</el-descriptions-item>
          <el-descriptions-item :label="$t('AGENT_TRACE_TIME', '起止时间')">
            {{ bundle.task.startedTime || EMPTY }} – {{ formatClock(bundle.task.finishedTime) }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('AGENT_TRACE_FINAL_MESSAGE', '对外回复')">
            <MarkdownViewer v-if="bundle.task.finalMessage" :content="bundle.task.finalMessage" :locale="locale" />
            <span v-else>{{ EMPTY }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <el-tab-pane :label="`${$t('AGENT_TRACE_TAB_ENTITIES', '产生的对象')} ${entities.length}`" name="entities">
        <el-empty v-if="entities.length === 0" :image-size="64" :description="$t('AGENT_TRACE_NO_ENTITY', '没有产生对象')" />
        <div v-else class="task-detail__entities">
          <div v-for="entity in entities" :key="entity.key" class="task-detail__entity">
            <span class="task-detail__entity-type">{{ entity.type }}</span>
            <span class="task-detail__entity-name">{{ entity.name }}</span>
            <code>{{ entity.id }}</code>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="`${$t('AGENT_TRACE_TAB_APPROVALS', '确认记录')} ${approvals.length}`" name="approvals">
        <el-empty v-if="approvals.length === 0" :image-size="64" :description="$t('AGENT_TRACE_NO_APPROVAL', '没有确认记录')" />
        <el-timeline v-else>
          <el-timeline-item v-for="item in approvals" :key="item.key" :timestamp="item.time" :type="item.type">
            <div class="task-detail__approval">
              <strong>{{ item.action }}</strong>
              <span>{{ item.step }}</span>
            </div>
            <div v-if="item.question" class="task-detail__question">{{ item.question }}</div>
          </el-timeline-item>
        </el-timeline>
      </el-tab-pane>

      <el-tab-pane :label="`${$t('AGENT_TRACE_TAB_MESSAGES', '消息')} ${bundle.messages.length}`" name="messages">
        <div v-for="message in bundle.messages" :key="message.messageId" class="task-detail__message">
          <span class="task-detail__role">{{ message.role === MessageRole.USER ? '👤' : '🤖' }}</span>
          <MarkdownViewer :content="message.content" :locale="locale" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue';
import { t } from '@platform/i18n';
import { StatusDot } from '@/components';
import {
  EMPTY,
  MessageRole,
  ResumeAction,
  describeStatus,
  elapsed,
  formatClock,
  formatDuration,
  parseJson,
} from '@runtime/console';
import type { TraceBundle } from '../type';

const MarkdownViewer = defineAsyncComponent(() => import('@/components/markdown').then((m) => m.MarkdownViewer));

/** 任务级详情：选中「结果」节点或点击画布空白处时显示 */
const props = defineProps<{ bundle: TraceBundle; agentName: string; locale: string }>();
const tab = ref('task');

interface RecordEntity {
  displayName?: string;
  attrs?: Record<string, unknown>;
}

const entities = computed(() => {
  const record = parseJson<{ entities?: Record<string, RecordEntity> }>(props.bundle.task.taskRecord, {});
  return Object.entries(record.entities ?? {}).map(([key, entity]) => {
    const [type, id] = key.split(':');
    return { key, type, id, name: entity.displayName ?? '' };
  });
});

type ActionMeta = [code: string, text: string, type: 'success' | 'danger' | 'info'];

const ACTION_TEXT: Record<string, ActionMeta> = {
  [ResumeAction.CONFIRM]: ['AGENT_TRACE_RESUME_CONFIRM', '已确认', 'success'],
  [ResumeAction.REJECT]: ['AGENT_TRACE_RESUME_REJECT', '已拒绝', 'danger'],
  [ResumeAction.REPLY]: ['AGENT_TRACE_RESUME_REPLY', '已回复', 'info'],
  [ResumeAction.CANCEL]: ['AGENT_TRACE_RESUME_CANCEL', '已取消', 'info'],
};

const approvals = computed(() =>
  props.bundle.resumes.map((resume) => {
    const fallback: ActionMeta = ['', resume.resumeAction, 'info'];
    const [code, text, type] = ACTION_TEXT[resume.resumeAction] ?? fallback;
    const node = props.bundle.nodes.find((n) => n.nodeId === resume.nodeId);
    const checkpoint = props.bundle.checkpoints.find((c) => c.checkpointId === resume.checkpointId);
    return {
      key: resume.resumeId,
      time: resume.actedAt ?? '',
      action: code ? t(code, text) : text,
      type,
      step: node?.title ?? '',
      question: checkpoint?.question ?? '',
    };
  }),
);
</script>

<style scoped>
.task-detail__head { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.task-detail__title { font-size: var(--g2-font-size-lg); font-weight: 600; color: var(--g2-text-primary); }
.task-detail__meta { color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.task-detail__entities { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.task-detail__entity {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid var(--g2-border-color-light);
  border-radius: var(--g2-border-radius-base);
}
.task-detail__entity-type { font-size: 11px; color: var(--g2-text-secondary); text-transform: uppercase; }
.task-detail__entity-name { font-weight: 600; color: var(--g2-text-primary); }
.task-detail__entity code { font-size: 12px; color: var(--g2-text-secondary); }
.task-detail__approval { display: flex; gap: 8px; }
.task-detail__question { margin-top: 4px; color: var(--g2-text-secondary); white-space: pre-wrap; }
.task-detail__message { display: grid; grid-template-columns: 24px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px dashed var(--g2-border-color-light); }
</style>
