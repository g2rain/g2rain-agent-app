<template>
  <el-drawer :model-value="!!block" size="720px" :title="block?.toolName" @close="emit('close')">
    <template v-if="block">
      <div class="block-detail__summary">
        <span class="block-detail__tag">{{ $t('AGENT_TRACE_OUTCOME_BLOCKED', '被拦截') }}</span>
        <span>{{ block.blockedBy }}</span>
        <span v-if="block.round !== null">· {{ $t('AGENT_TRACE_ROUND', { n: block.round }, '第 {n} 轮') }}</span>
        <CopyText :text="block.callId" :length="8" />
      </div>
      <el-tabs v-model="tab">
        <el-tab-pane :label="$t('AGENT_TRACE_TAB_OVERVIEW', '概要')" name="overview">
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item :label="$t('AGENT_TRACE_CALL_ID', '调用标识')">{{ block.callId }}</el-descriptions-item>
            <el-descriptions-item :label="$t('AGENT_TRACE_SKILL', '技能')">{{ block.skillKey }}</el-descriptions-item>
            <el-descriptions-item :label="$t('AGENT_TRACE_SKILL_PIN', '技能标记')">
              {{ block.skillPin || $t('AGENT_TRACE_CONTRACT_MODE', '契约模式') }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('AGENT_TRACE_BLOCKED_BY', '拦截器')">{{ block.blockedBy }}</el-descriptions-item>
            <el-descriptions-item :label="$t('AGENT_TRACE_ERROR', '错误')">{{ block.errorCode }}</el-descriptions-item>
            <el-descriptions-item :label="$t('AGENT_TRACE_REASON_CODE', '原因编码')">{{ block.reasonCode || EMPTY }}</el-descriptions-item>
            <el-descriptions-item :label="$t('AGENT_TRACE_BLOCK_MESSAGE', '拒绝说明')">{{ block.message || EMPTY }}</el-descriptions-item>
            <el-descriptions-item :label="$t('AGENT_TRACE_NEXT_STEP', '下一步')">{{ block.nextStep || EMPTY }}</el-descriptions-item>
            <el-descriptions-item v-if="block.traceId" :label="$t('AGENT_TRACE_TRACE_ID', '追踪号')">{{ block.traceId }}</el-descriptions-item>
            <el-descriptions-item :label="$t('G2_FIELD_CREATE_TIME', '创建时间')">{{ formatClock(block.createTime) }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        <el-tab-pane :label="$t('AGENT_TRACE_ARGS', '入参')" name="args">
          <JsonViewer :value="block.args ?? ''" :collapsed-depth="3" :copy-label="$t('G2_BTN_COPY', '复制')" />
        </el-tab-pane>
      </el-tabs>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { CopyText, JsonViewer } from '@/components';
import { EMPTY, formatClock } from '@runtime/console';
import type { ToolBlockRecordVo } from '../type';

/** 拦截记录详情抽屉：概要字段与脱敏入参 */
const props = defineProps<{ block: ToolBlockRecordVo | null }>();
const emit = defineEmits<{ close: [] }>();

const tab = ref('overview');

watch(
  () => props.block?.callId,
  () => {
    tab.value = 'overview';
  },
);
</script>

<style scoped>
.block-detail__summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  color: var(--g2-text-secondary);
}
.block-detail__tag {
  padding: 0 6px;
  font-size: 11px;
  line-height: 18px;
  border-radius: 3px;
  color: var(--g2-color-warning);
  border: 1px solid var(--g2-color-warning);
}
</style>
