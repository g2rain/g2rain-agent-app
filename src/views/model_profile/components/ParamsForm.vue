<template>
  <div class="params-form">
    <template v-if="showSampling">
      <el-form-item :label="$t('AGENT_MODEL_TEMPERATURE', 'temperature')">
        <div class="params-form__slider">
          <el-slider v-model="temperature" :min="0" :max="2" :step="0.05" :disabled="disabled" />
          <el-input-number v-model="temperature" :min="0" :max="2" :step="0.05" :disabled="disabled" controls-position="right" />
        </div>
      </el-form-item>
      <el-form-item :label="$t('AGENT_MODEL_TOP_P', 'top_p')">
        <div class="params-form__slider">
          <el-slider v-model="topP" :min="0" :max="1" :step="0.05" :disabled="disabled" />
          <el-input-number v-model="topP" :min="0" :max="1" :step="0.05" :disabled="disabled" controls-position="right" />
        </div>
      </el-form-item>
      <el-form-item :label="$t('AGENT_MODEL_MAX_TOKENS', '最大输出')">
        <el-input-number v-model="maxTokens" :min="1" :max="128000" :disabled="disabled" controls-position="right" />
      </el-form-item>
    </template>
    <el-form-item :label="$t('AGENT_MODEL_TIMEOUT', '超时（秒）')">
      <el-input-number v-model="timeoutSec" :min="1" :max="600" :disabled="disabled" controls-position="right" />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ModelType } from '@runtime/console';

const props = defineProps<{
  modelType: string;
  disabled?: boolean;
}>();

const temperature = defineModel<number>('temperature', { default: 0 });
const topP = defineModel<number>('topP', { default: 1 });
const maxTokens = defineModel<number>('maxTokens', { default: 4096 });
const timeoutMs = defineModel<number>('timeoutMs', { default: 120000 });

const showSampling = computed(() => props.modelType === ModelType.LLM || !props.modelType);

const timeoutSec = computed({
  get: () => Math.round((timeoutMs.value || 0) / 1000) || 1,
  set: (sec: number) => {
    timeoutMs.value = Math.max(1, sec) * 1000;
  },
});
</script>

<style scoped>
.params-form__slider { display: grid; grid-template-columns: 1fr 120px; gap: 12px; align-items: center; width: 100%; }
</style>
