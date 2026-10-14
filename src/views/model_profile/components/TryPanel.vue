<template>
  <div class="try-panel">
    <h4>{{ $t('AGENT_MODEL_TRY', '试一试') }}</h4>
    <template v-if="modelType === ModelType.LLM">
      <el-input v-model="prompt" type="textarea" :rows="3" :placeholder="$t('AGENT_MODEL_TRY_PROMPT', '输入一句短消息')" />
    </template>
    <template v-else-if="modelType === ModelType.VECTOR">
      <el-input v-model="prompt" type="textarea" :rows="3" :placeholder="$t('AGENT_MODEL_TRY_TEXT', '输入一段文本')" />
    </template>
    <template v-else>
      <el-input v-model="query" :placeholder="$t('AGENT_MODEL_TRY_QUERY', '查询')" class="try-panel__gap" />
      <el-input v-model="docA" type="textarea" :rows="2" :placeholder="$t('AGENT_MODEL_TRY_DOC_A', '候选文本 A')" class="try-panel__gap" />
      <el-input v-model="docB" type="textarea" :rows="2" :placeholder="$t('AGENT_MODEL_TRY_DOC_B', '候选文本 B')" />
    </template>
    <el-button
      v-permission="'model_profile:test'"
      type="primary"
      class="try-panel__btn"
      :loading="loading"
      @click="run"
    >
      {{ $t('AGENT_MODEL_TRY_RUN', '调用') }}
    </el-button>
    <div v-if="result" class="try-panel__result">
      <div class="try-panel__meta">{{ fill($t('AGENT_MODEL_TRY_MS', '耗时 {ms} ms'), { ms }) }}</div>
      <JsonViewer :value="result" :collapsed-depth="2" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { t } from '@platform/i18n';
import { JsonViewer, showErrorMessage } from '@/components';
import { ModelType, fill } from '@runtime/console';
import { ModelProfileApi } from '../api';
import type { ModelProfileVo } from '../type';

const props = defineProps<{ row: ModelProfileVo; modelType: string }>();

const prompt = ref('你好');
const query = ref('快速入门');
const docA = ref('这是一篇入门介绍');
const docB = ref('无关内容');
const loading = ref(false);
const result = ref<unknown>(null);
const ms = ref(0);

async function run(): Promise<void> {
  loading.value = true;
  result.value = null;
  try {
    const res = await ModelProfileApi.tryCall(props.row, {
      prompt: prompt.value,
      query: query.value,
      docs: [docA.value, docB.value],
    });
    result.value = res.data;
    ms.value = res.ms;
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '调用失败'));
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.try-panel h4 { margin: 0 0 12px; font-size: 14px; }
.try-panel__gap { margin-bottom: 8px; }
.try-panel__btn { margin-top: 12px; }
.try-panel__result { margin-top: 16px; }
.try-panel__meta { margin-bottom: 8px; color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
</style>
