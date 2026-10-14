<template>
  <div class="request-detail">
    <div class="request-detail__head">
      <span class="request-detail__title">{{ $t('AGENT_TRACE_REQUEST', '用户请求') }}</span>
      <span class="request-detail__meta">{{ task.startedTime || EMPTY }}</span>
    </div>
    <el-tabs v-model="tab">
      <el-tab-pane :label="$t('AGENT_TRACE_TAB_REQUEST', '请求')" name="request">
        <div class="request-detail__text">{{ task.request || EMPTY }}</div>
      </el-tab-pane>
      <el-tab-pane :label="`${$t('AGENT_TRACE_TAB_PRIOR', '前情')} ${prior.length}`" name="prior">
        <el-empty v-if="prior.length === 0" :image-size="64" :description="$t('AGENT_TRACE_NO_PRIOR', '没有前序任务')" />
        <el-table v-else :data="prior" size="small">
          <el-table-column :label="$t('AGENT_TRACE_GOAL', '目标')" prop="goal" min-width="240" show-overflow-tooltip />
          <el-table-column :label="$t('AGENT_TRACE_STATUS', '状态')" width="110">
            <template #default="{ row }"><StatusDot v-bind="describeStatus(row.status)" /></template>
          </el-table-column>
          <el-table-column :label="$t('AGENT_TRACE_SUMMARY', '摘要')" prop="summary" min-width="240" show-overflow-tooltip />
        </el-table>
      </el-tab-pane>
      <el-tab-pane :label="$t('AGENT_TRACE_TAB_SHARED', '共享值')" name="shared">
        <JsonViewer :value="task.shared || '{}'" :collapsed-depth="2" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { JsonViewer, StatusDot } from '@/components';
import { EMPTY, describeStatus, parseJson } from '@runtime/console';
import type { TaskInstanceVo } from '../type';

/** 「用户请求」节点详情：原文、前情（前序任务摘要）、任务共享值 */
const props = defineProps<{ task: TaskInstanceVo }>();
const tab = ref('request');

interface PriorTask {
  taskId: string;
  goal?: string;
  status?: string;
  summary?: string;
}

const prior = computed(() => parseJson<{ tasks?: PriorTask[] }>(props.task.prior, {}).tasks ?? []);
</script>

<style scoped>
.request-detail__head { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.request-detail__title { font-size: var(--g2-font-size-lg); font-weight: 600; color: var(--g2-text-primary); }
.request-detail__meta { color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.request-detail__text { white-space: pre-wrap; line-height: var(--g2-line-height-base); color: var(--g2-text-primary); }
</style>
