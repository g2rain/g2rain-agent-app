<template>
  <el-drawer :model-value="visible" size="960px" :title="$t('AGENT_MCP_TOOL_SYNC', '同步平台接口')" destroy-on-close @close="emit('close')">
    <el-form label-width="140px">
      <el-form-item :label="$t('AGENT_FIELD_MICROSERVICE', '微服务')">
        <el-select
          v-model="serviceId"
          filterable
          clearable
          style="width: 100%"
          :loading="servicesLoading"
          :placeholder="$t('AGENT_PH_SERVICE_REGISTRY', '选择 service_registry')"
          @change="onServiceChange"
        >
          <el-option
            v-for="item in services"
            :key="item.id"
            :label="`${item.name || item.serviceCode}（${item.serviceCode}）`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('AGENT_FIELD_SCOPE', '范围')">
        <el-checkbox v-model="importAll" :disabled="serviceId == null">{{ $t('AGENT_SYNC_IMPORT_ALL', '导入该服务全部接口') }}</el-checkbox>
      </el-form-item>
    </el-form>

    <el-table
      v-if="!importAll"
      ref="tableRef"
      v-loading="loading"
      :data="rows"
      border
      row-key="id"
      @selection-change="onSelect"
    >
      <el-table-column type="selection" width="48" />
      <el-table-column prop="method" :label="$t('AGENT_FIELD_HTTP_METHOD', 'HTTP方法')" width="120" />
      <el-table-column prop="path" :label="$t('AGENT_FIELD_HTTP_PATH', 'HTTP路径')" min-width="220" />
      <el-table-column prop="name" :label="$t('G2_FIELD_NAME', '名称')" min-width="160" />
    </el-table>
    <div v-if="!importAll" class="native-sync__pager">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="loadApis"
      />
    </div>

    <template #footer>
      <el-button @click="emit('close')">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
      <el-button type="primary" :loading="submitting" :disabled="!canSubmit" @click="submit">{{ $t('G2_BTN_SYNC', '同步') }}</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { getHttpClient } from '@runtime/http';
import { McpToolProfileApi } from '../api';

interface ServiceRow {
  id: number;
  serviceCode: string;
  name?: string;
}

interface ApiRow {
  id: number;
  method: string;
  path: string;
  name: string;
}

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{ close: []; done: [] }>();

const services = ref<ServiceRow[]>([]);
const servicesLoading = ref(false);
const serviceId = ref<number | undefined>();
const importAll = ref(false);
const rows = ref<ApiRow[]>([]);
const selected = ref<ApiRow[]>([]);
const loading = ref(false);
const submitting = ref(false);
const pageNum = ref(1);
const pageSize = ref(20);
const total = ref(0);

const canSubmit = computed(() => {
  if (serviceId.value == null) return false;
  return importAll.value || selected.value.length > 0;
});

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return;
    serviceId.value = undefined;
    importAll.value = false;
    rows.value = [];
    selected.value = [];
    pageNum.value = 1;
    total.value = 0;
    void loadServices();
  },
);

async function loadServices(): Promise<void> {
  servicesLoading.value = true;
  try {
    const http = getHttpClient('default');
    const res = await http.get<ServiceRow[]>('/basis/service_registry/list');
    services.value = res.data || [];
  } finally {
    servicesLoading.value = false;
  }
}

function onServiceChange(): void {
  pageNum.value = 1;
  selected.value = [];
  void loadApis();
}

function onSelect(value: ApiRow[]): void {
  selected.value = value;
}

async function loadApis(): Promise<void> {
  const service = services.value.find((item) => item.id === serviceId.value);
  if (!service) {
    rows.value = [];
    total.value = 0;
    return;
  }
  loading.value = true;
  try {
    const http = getHttpClient('default');
    const res = await http.get<{ records: ApiRow[]; total: number }>('/basis/resource_api/page', {
      serviceCode: service.serviceCode,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    });
    rows.value = res.data?.records || [];
    total.value = res.data?.total || 0;
  } finally {
    loading.value = false;
  }
}

async function submit(): Promise<void> {
  submitting.value = true;
  try {
    const result = await McpToolProfileApi.syncNative({
      serviceId: serviceId.value!,
      importAll: importAll.value,
      resourceApiIds: importAll.value ? undefined : selected.value.map((row) => row.id),
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
.native-sync__pager { margin-top: 12px; display: flex; justify-content: flex-end; }
</style>
