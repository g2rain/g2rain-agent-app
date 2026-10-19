<template>
  <el-drawer
    :model-value="visible"
    size="960px"
    :title="title"
    destroy-on-close
    @close="emit('close')"
  >
    <el-steps :active="step" finish-status="success" align-center class="openapi-import__steps">
      <el-step :title="$t('AGENT_IMPORT_STEP_SERVICE', '服务')" />
      <el-step :title="$t('AGENT_IMPORT_STEP_SOURCE', '来源')" />
      <el-step :title="$t('AGENT_IMPORT_STEP_SELECT', '选择')" />
      <el-step :title="$t('AGENT_IMPORT_STEP_CONFIRM', '确认')" />
    </el-steps>

    <div v-show="step === 0" class="openapi-import__pane">
      <el-select
        v-model="selectedCode"
        filterable
        clearable
        style="width: 100%"
        :loading="servicesLoading"
        :placeholder="$t('AGENT_IMPORT_PICK_SERVICE', '选择已接入的系统服务')"
      >
        <el-option
          v-for="item in services"
          :key="item.code"
          :label="`${item.name}（${item.code}）`"
          :value="item.code"
        />
      </el-select>
      <el-alert
        class="openapi-import__tip"
        type="info"
        :closable="false"
        :title="$t('AGENT_IMPORT_SERVICE_TIP', '导入的接口将写入所选服务下的工具配置')"
      />
    </div>

    <div v-show="step === 1" class="openapi-import__pane">
      <el-upload drag :auto-upload="false" :limit="1" accept=".json,.yaml,.yml" :on-change="onFile">
        <div class="el-upload__text">
          {{ fileName || $t('AGENT_IMPORT_DROP', '拖拽文件到此处，或点击选择') }}
        </div>
      </el-upload>
    </div>

    <div v-show="step === 2" class="openapi-import__pane">
      <el-table :data="operations" border row-key="key" @selection-change="onSelect">
        <el-table-column type="selection" width="48" :selectable="selectable" />
        <el-table-column prop="method" label="方法" width="90" />
        <el-table-column prop="path" label="路径" min-width="220" />
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column prop="problem" label="问题" min-width="180" />
      </el-table>
    </div>

    <div v-show="step === 3" class="openapi-import__pane">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('AGENT_IMPORT_TARGET_SERVICE', '目标服务')">
          {{ selectedLabel }}
        </el-descriptions-item>
        <el-descriptions-item label="已选">{{ selected.length }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button @click="emit('close')">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
      <el-button v-if="step > 0" @click="step -= 1">{{ $t('AGENT_IMPORT_PREV', '上一步') }}</el-button>
      <el-button v-if="step < 3" type="primary" :loading="previewing" :disabled="!canNext" @click="next">
        {{ $t('AGENT_IMPORT_NEXT', '下一步') }}
      </el-button>
      <el-button v-else type="primary" :loading="submitting" :disabled="selected.length === 0" @click="confirm">
        {{ $t('AGENT_IMPORT_CONFIRM', '确认导入') }}
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { UploadFile } from 'element-plus';
import { ElMessage } from 'element-plus';
import { ResourceType } from '@runtime/console';
import { McpExternalServiceApi, type McpExternalService, type McpExternalServiceKind } from '@/views/mcp_external_service';
import { McpToolProfileApi, type ConvertedOperation } from '../api';

const props = defineProps<{
  visible: boolean;
  resourceType: string;
}>();

const emit = defineEmits<{ close: []; done: [] }>();

type Row = ConvertedOperation & { key: string };

const step = ref(0);
const fileName = ref('');
const documentText = ref('');
const selectedCode = ref('');
const services = ref<McpExternalService[]>([]);
const servicesLoading = ref(false);
const operations = ref<Row[]>([]);
const selected = ref<Row[]>([]);
const previewing = ref(false);
const submitting = ref(false);

const selectedService = computed(() => services.value.find((item) => item.code === selectedCode.value));
const selectedLabel = computed(() =>
  selectedService.value ? `${selectedService.value.name}（${selectedService.value.code}）` : '—',
);
const title = computed(() => (selectedService.value ? `导入接口 · ${selectedLabel.value}` : '导入接口'));

const canNext = computed(() => {
  if (step.value === 0) return !!selectedCode.value;
  if (step.value === 1) return !!documentText.value;
  return selected.value.length > 0;
});

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return;
    step.value = 0;
    fileName.value = '';
    documentText.value = '';
    selectedCode.value = '';
    operations.value = [];
    selected.value = [];
    void loadServices();
  },
);

async function loadServices(): Promise<void> {
  servicesLoading.value = true;
  try {
    const kind: McpExternalServiceKind = props.resourceType === ResourceType.EXTENSION ? 'extension' : 'customer';
    services.value = await McpExternalServiceApi.list(kind);
  } finally {
    servicesLoading.value = false;
  }
}

function onFile(file: UploadFile): void {
  fileName.value = file.name ?? '';
  const raw = file.raw;
  if (!raw) {
    documentText.value = '';
    return;
  }
  void raw.text().then((text) => {
    documentText.value = text;
  });
}

function selectable(row: Row): boolean {
  return !row.problem;
}

function onSelect(value: Row[]): void {
  selected.value = value;
}

async function next(): Promise<void> {
  if (step.value !== 1) {
    step.value += 1;
    return;
  }
  previewing.value = true;
  try {
    const parsed = await McpToolProfileApi.preview({
      document: documentText.value,
      resourceType: props.resourceType,
      serviceCode: selectedCode.value,
    });
    operations.value = parsed.map((item, index) => ({
      ...item,
      key: `${item.method}:${item.path}:${index}`,
    }));
    selected.value = [];
    step.value = 2;
  } finally {
    previewing.value = false;
  }
}

async function confirm(): Promise<void> {
  submitting.value = true;
  try {
    const result = await McpToolProfileApi.confirmImport({
      serviceCode: selectedCode.value,
      resourceType: props.resourceType,
      operations: selected.value,
    });
    ElMessage.success(`新增 ${result.created}，更新 ${result.updated}，跳过 ${result.skipped}`);
    emit('done');
    emit('close');
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.openapi-import__steps { margin-bottom: 24px; }
.openapi-import__pane { min-height: 280px; }
.openapi-import__tip { margin-top: 16px; }
</style>
