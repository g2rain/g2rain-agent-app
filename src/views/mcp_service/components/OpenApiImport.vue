<template>
  <el-drawer
    :model-value="visible"
    size="960px"
    :title="title"
    destroy-on-close
    @close="emit('close')"
  >
    <el-steps :active="step" finish-status="success" align-center class="openapi-import__steps">
      <el-step :title="$t('AGENT_IMPORT_STEP_SOURCE', '来源')" />
      <el-step :title="$t('AGENT_IMPORT_STEP_SELECT', '选择')" />
      <el-step :title="$t('AGENT_IMPORT_STEP_CONFIRM', '确认')" />
    </el-steps>

    <!-- 1 来源 -->
    <div v-show="step === 0" class="openapi-import__pane">
      <el-radio-group v-model="sourceType" class="openapi-import__source">
        <el-radio value="file">{{ $t('AGENT_IMPORT_FILE', '上传 OpenAPI 文件') }}</el-radio>
        <el-radio value="url">{{ $t('AGENT_IMPORT_URL', '填写文档地址') }}</el-radio>
      </el-radio-group>
      <el-upload
        v-if="sourceType === 'file'"
        drag
        :auto-upload="false"
        :limit="1"
        accept=".json,.yaml,.yml"
        :on-change="onFile"
      >
        <div class="el-upload__text">
          {{ $t('AGENT_IMPORT_DROP', '拖拽文件到此处，或点击选择') }}
        </div>
      </el-upload>
      <el-input
        v-else
        v-model="docUrl"
        clearable
        :placeholder="$t('AGENT_IMPORT_URL_HINT', 'https://example.com/openapi.json')"
      />
      <el-alert
        class="openapi-import__tip"
        type="info"
        :closable="false"
        :title="$t('AGENT_IMPORT_PENDING', 'OpenAPI 解析与导入待后端接口，当前仅可预览向导步骤，不会写入数据')"
      />
    </div>

    <!-- 2 选择 -->
    <div v-show="step === 1" class="openapi-import__pane">
      <el-empty
        :image-size="72"
        :description="$t('AGENT_IMPORT_SELECT_EMPTY', '待后端解析后，此处按 tag 分组列出接口')"
      />
    </div>

    <!-- 3 确认 -->
    <div v-show="step === 2" class="openapi-import__pane">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('AGENT_IMPORT_NEW', '新增')">0</el-descriptions-item>
        <el-descriptions-item :label="$t('AGENT_IMPORT_UPDATE', '更新')">0</el-descriptions-item>
        <el-descriptions-item :label="$t('AGENT_IMPORT_SKIP', '跳过')">0</el-descriptions-item>
      </el-descriptions>
      <el-alert
        class="openapi-import__tip"
        type="warning"
        :closable="false"
        :title="$t('AGENT_IMPORT_CONFIRM_PENDING', '确认导入待后端；当前不会写入任何数据')"
      />
    </div>

    <template #footer>
      <el-button @click="emit('close')">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
      <el-button v-if="step > 0" @click="step -= 1">{{ $t('AGENT_IMPORT_PREV', '上一步') }}</el-button>
      <el-button v-if="step < 2" type="primary" :disabled="!canNext" @click="step += 1">
        {{ $t('AGENT_IMPORT_NEXT', '下一步') }}
      </el-button>
      <el-button
        v-else
        type="primary"
        disabled
        :title="$t('AGENT_IMPORT_CONFIRM_PENDING', '确认导入待后端；当前不会写入任何数据')"
      >
        {{ $t('AGENT_IMPORT_CONFIRM', '确认导入') }}
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { fill } from '@runtime/console';
import type { UploadFile } from 'element-plus';

const props = defineProps<{
  visible: boolean;
  serviceName: string;
  serviceCode: string;
}>();

const emit = defineEmits<{ close: [] }>();

const step = ref(0);
const sourceType = ref<'file' | 'url'>('file');
const fileName = ref('');
const docUrl = ref('');

const title = computed(() =>
  fill('{name}（{code}）', { name: props.serviceName || '—', code: props.serviceCode || '—' }),
);

const canNext = computed(() => {
  if (step.value !== 0) return true;
  return sourceType.value === 'file' ? !!fileName.value : !!docUrl.value.trim();
});

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return;
    step.value = 0;
    sourceType.value = 'file';
    fileName.value = '';
    docUrl.value = '';
  },
);

function onFile(file: UploadFile): void {
  fileName.value = file.name ?? '';
}
</script>

<style scoped>
.openapi-import__steps { margin-bottom: 24px; }
.openapi-import__pane { min-height: 280px; }
.openapi-import__source { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin-bottom: 16px; }
.openapi-import__tip { margin-top: 16px; }
</style>
