<template>
  <div class="params-form">
    <template v-if="showSampling">
      <el-form-item :label="$t('AGENT_MODEL_TEMPERATURE', '采样温度')">
        <div class="params-form__slider">
          <el-slider v-model="temperature" :min="0" :max="2" :step="0.05" :disabled="disabled" />
          <el-input-number
            v-model="temperature"
            class="params-form__number"
            :min="0"
            :max="2"
            :step="0.05"
            :disabled="disabled"
            controls-position="right"
          />
        </div>
      </el-form-item>
      <el-form-item :label="$t('AGENT_MODEL_TOP_P', 'Top P')">
        <div class="params-form__slider">
          <el-slider v-model="topP" :min="0" :max="1" :step="0.05" :disabled="disabled" />
          <el-input-number
            v-model="topP"
            class="params-form__number"
            :min="0"
            :max="1"
            :step="0.05"
            :disabled="disabled"
            controls-position="right"
          />
        </div>
      </el-form-item>
      <div class="params-form__row">
        <el-form-item :label="$t('AGENT_MODEL_MAX_TOKENS', '最大输出')" class="params-form__half">
          <el-input-number
            v-model="maxTokens"
            :min="1"
            :max="128000"
            :disabled="disabled"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="$t('AGENT_MODEL_TIMEOUT', '超时（秒）')" class="params-form__half">
          <el-input-number
            v-model="timeoutSec"
            :min="1"
            :max="600"
            :disabled="disabled"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
      </div>
    </template>
    <el-form-item v-else :label="$t('AGENT_MODEL_TIMEOUT', '超时（秒）')">
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
.params-form {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.params-form__slider {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 110px;
  gap: 12px;
  align-items: center;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.params-form__slider :deep(.el-slider) {
  min-width: 0;
  width: 100%;
}

.params-form__number {
  width: 110px;
}

.params-form__row {
  display: flex;
  gap: 16px;
  width: 100%;
}

.params-form__half {
  flex: 1;
  min-width: 0;
  margin-right: 0 !important;
}
</style>
