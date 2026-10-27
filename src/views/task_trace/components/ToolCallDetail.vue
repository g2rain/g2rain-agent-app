<template>
  <el-drawer :model-value="!!call" size="720px" :title="call?.toolName" @close="emit('close')">
    <template v-if="call">
      <div class="call-detail__summary">
        <StatusDot v-bind="describeStatus(call.callStatus)" />
        <span v-if="call.sideEffect === SideEffect.WRITE" class="call-detail__write">{{ $t('AGENT_TRACE_WRITE', '写') }}</span>
        <span>{{ formatDuration(call.durationMs) }}</span>
        <span v-if="call.round !== null">· {{ $t('AGENT_TRACE_ROUND', { n: call.round }, '第 {n} 轮') }}</span>
        <CopyText :text="call.callId" :length="8" :copied-text="$t('AGENT_COPIED', '已复制')" />
      </div>
      <el-tabs v-model="tab">
        <el-tab-pane :label="$t('AGENT_TRACE_TAB_OVERVIEW', '概要')" name="overview">
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item :label="$t('AGENT_TRACE_BUSINESS_OK', '业务结果')">{{ businessText }}</el-descriptions-item>
            <el-descriptions-item :label="$t('AGENT_TRACE_EMPTY_RESULT', '空结果')">{{ call.emptyResult ? $t('G2_LBL_YES', '是') : $t('G2_LBL_NO', '否') }}</el-descriptions-item>
            <el-descriptions-item :label="$t('AGENT_TRACE_FAILURE_KIND', '失败分类')">{{ call.failureKind }}</el-descriptions-item>
            <el-descriptions-item v-if="call.errorCode || call.errorMessage" :label="$t('AGENT_TRACE_ERROR', '错误')">
              {{ call.errorCode }} {{ call.errorMessage }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('AGENT_TRACE_RESULT_SUMMARY', '结果摘要')">{{ call.resultSummary || EMPTY }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        <el-tab-pane :label="$t('AGENT_TRACE_TAB_REQUEST', '请求')" name="request">
          <JsonViewer :value="call.request ?? ''" :collapsed-depth="3" :copy-label="$t('G2_BTN_COPY', '复制')" />
        </el-tab-pane>
        <el-tab-pane :label="$t('AGENT_TRACE_TAB_RESPONSE', '响应')" name="response">
          <JsonViewer :value="response" :collapsed-depth="2" :expand-label="$t('AGENT_EXPAND', '展开')" :copy-label="$t('G2_BTN_COPY', '复制')" />
          <el-button v-if="call.payloadId && !payload" link type="primary" :loading="loadingPayload" @click="loadPayload">
            {{ $t('AGENT_TRACE_LOAD_PAYLOAD', '加载完整报文') }}
          </el-button>
        </el-tab-pane>
        <el-tab-pane :label="$t('AGENT_TRACE_TAB_ENTITIES', '实体')" name="entities">
          <JsonViewer :value="call.entities ?? '[]'" :collapsed-depth="2" />
        </el-tab-pane>
      </el-tabs>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { t } from '@platform/i18n';
import { CopyText, JsonViewer, StatusDot } from '@/components';
import { EMPTY, SideEffect, describeStatus, formatDuration } from '@runtime/console';
import { TaskTraceApi } from '../api';
import type { TaskNodePayloadVo, ToolCallRecordVo } from '../type';

/** 工具调用详情抽屉：概要、请求、响应（大报文按需加载）、实体 */
const props = defineProps<{ call: ToolCallRecordVo | null }>();
const emit = defineEmits<{ close: [] }>();

const tab = ref('overview');
const payload = ref<TaskNodePayloadVo | null>(null);
const loadingPayload = ref(false);

watch(
  () => props.call?.callId,
  () => {
    tab.value = 'overview';
    payload.value = null;
  },
);

const response = computed(() => payload.value?.payloadData ?? props.call?.response ?? '');

const businessText = computed(() => {
  const value = props.call?.businessOk;
  if (value === null || value === undefined) return t('AGENT_TRACE_BUSINESS_UNKNOWN', '无法判断');
  return value ? t('AGENT_TRACE_BUSINESS_PASS', '成功') : t('AGENT_TRACE_BUSINESS_FAIL', '失败');
});

async function loadPayload(): Promise<void> {
  const payloadId = props.call?.payloadId;
  if (!payloadId) return;
  loadingPayload.value = true;
  try {
    payload.value = await TaskTraceApi.payload(payloadId);
  } catch {
    // 请求失败已由 http 层统一提示
  } finally {
    loadingPayload.value = false;
  }
}
</script>

<style scoped>
.call-detail__summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  color: var(--g2-text-secondary);
}
.call-detail__write {
  padding: 0 4px;
  font-size: 11px;
  color: var(--g2-color-warning);
  border: 1px solid var(--g2-color-warning);
  border-radius: 3px;
}
</style>
