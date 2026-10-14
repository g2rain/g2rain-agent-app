<template>
  <div class="mcp-service-page">
    <header class="mcp-service-page__head">
      <div>
        <h2>{{ $t('AGENT_MENU_MCP_SERVICE', '服务接入') }}</h2>
        <p>{{ $t('AGENT_MCP_SERVICE_SUBTITLE', '接入外部系统，再从 OpenAPI 导入工具') }}</p>
      </div>
      <el-button v-permission="'mcp_service:add'" type="primary" @click="openCreate">
        {{ $t('AGENT_MCP_SERVICE_NEW', '新建服务') }}
      </el-button>
    </header>

    <div class="mcp-service-page__filters">
      <el-radio-group v-model="segment" @change="search">
        <el-radio-button v-if="isOperator" :value="ResourceType.EXTENSION">
          {{ $t('AGENT_TOOL_EXTENSION', '扩展系统') }}
        </el-radio-button>
        <el-radio-button :value="ResourceType.CUSTOMER">
          {{ $t('AGENT_TOOL_CUSTOMER', '客户系统') }}
        </el-radio-button>
      </el-radio-group>
      <el-input
        v-model="keyword"
        clearable
        :placeholder="$t('AGENT_MCP_SERVICE_SEARCH', '搜索名称或编码')"
        style="width: 240px"
        @change="search"
        @clear="search"
      />
      <el-select
        v-model="status"
        clearable
        :placeholder="$t('AGENT_LIST_STATUS', '状态')"
        style="width: 120px"
        @change="search"
      >
        <el-option :label="$t('AGENT_STATUS_ACTIVE', '启用')" :value="RecordStatus.ACTIVE" />
        <el-option :label="$t('AGENT_STATUS_INACTIVE', '停用')" :value="RecordStatus.INACTIVE" />
      </el-select>
    </div>

    <el-skeleton v-if="loading && !rows.length" :rows="6" animated />

    <el-result v-else-if="failure" icon="error" :sub-title="failure">
      <template #extra><el-button type="primary" @click="load">{{ $t('G2_BTN_RETRY', '重试') }}</el-button></template>
    </el-result>

    <template v-else>
      <el-table v-loading="loading" :data="rows" class="mcp-service-page__table" @row-click="openEdit">
        <el-table-column :label="$t('AGENT_MCP_SERVICE_COLUMN', '服务')" min-width="220">
          <template #default="{ row }">
            <div class="mcp-service-page__name">{{ row.name }}</div>
            <code class="mcp-service-page__code">{{ row.code }}</code>
          </template>
        </el-table-column>
        <el-table-column :label="$t('AGENT_MCP_SERVICE_ENDPOINT', '调用地址')" min-width="260">
          <template #default="{ row }">
            <code>{{ callUrl(row) }}</code>
          </template>
        </el-table-column>
        <el-table-column :label="$t('AGENT_LIST_TOOLS', '工具')" width="90" prop="toolCount" />
        <el-table-column :label="$t('AGENT_LIST_STATUS', '状态')" width="100">
          <template #default="{ row }">
            <StatusDot :tone="describeStatus(row.status).tone" :label="describeStatus(row.status).label" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="170" prop="updateTime" />
        <el-table-column :label="$t('G2_LBL_ACTION', '操作')" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-permission="'mcp_service:import'"
              link
              type="primary"
              @click.stop="openImport(row)"
            >
              {{ $t('AGENT_MCP_SERVICE_IMPORT', '导入接口') }}
            </el-button>
            <el-dropdown trigger="click" @command="(cmd: string) => onMenu(row, cmd)">
              <el-button link :icon="MoreFilled" @click.stop />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-permission="'mcp_service:edit'" command="edit">
                    {{ $t('G2_BTN_EDIT', '编辑') }}
                  </el-dropdown-item>
                  <el-dropdown-item v-permission="'mcp_service:edit'" command="toggle">
                    {{ row.status === RecordStatus.ACTIVE ? $t('AGENT_STATUS_INACTIVE', '停用') : $t('AGENT_STATUS_ACTIVE', '启用') }}
                  </el-dropdown-item>
                  <el-dropdown-item v-permission="'mcp_service:delete'" command="delete" divided>
                    <span class="mcp-service-page__danger">{{ $t('G2_BTN_DELETE', '删除') }}</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :image-size="72" :description="$t('AGENT_MCP_SERVICE_EMPTY', '还没有外部服务，点击右上角新建')" />
        </template>
      </el-table>

      <div class="mcp-service-page__pagination">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="search"
          @current-change="load"
        />
      </div>
    </template>

    <el-drawer
      v-model="formOpen"
      :title="form.id ? $t('AGENT_MCP_SERVICE_EDIT', '编辑服务') : $t('AGENT_MCP_SERVICE_NEW', '新建服务')"
      size="560px"
      destroy-on-close
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item :label="$t('AGENT_MCP_SERVICE_NAME', '名称')" prop="name">
          <el-input v-model="form.name" maxlength="64" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('AGENT_MCP_SERVICE_CODE', '编码')" prop="code">
          <el-input v-model="form.code" maxlength="64" show-word-limit :disabled="!!form.id" />
        </el-form-item>
        <el-form-item :label="$t('AGENT_MCP_SERVICE_ENDPOINT', '调用地址')" prop="endpoint">
          <el-input v-model="form.endpoint" :placeholder="$t('AGENT_MCP_SERVICE_ENDPOINT_HINT', 'https://api.example.com')" />
        </el-form-item>
        <el-form-item :label="$t('AGENT_MCP_SERVICE_CONTEXT', '上下文路径')" prop="contextPath">
          <el-input v-model="form.contextPath" placeholder="/api" />
        </el-form-item>
        <el-form-item :label="$t('AGENT_FIELD_DESC', '说明')">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formOpen = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
      </template>
    </el-drawer>

    <OpenApiImport
      :visible="importOpen"
      :service-name="importTarget?.name ?? ''"
      :service-code="importTarget?.code ?? ''"
      @close="importOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { MoreFilled } from '@element-plus/icons-vue';
import { t } from '@platform/i18n';
import { PageElementPermission, StatusDot, showErrorMessage } from '@/components';
import { EMPTY, RecordStatus, ResourceType, describeStatus, fill } from '@runtime/console';
import OpenApiImport from './components/OpenApiImport.vue';
import { McpServiceApi } from './api';
import type { McpServicePayload, McpServiceVo } from './type';

const route = useRoute();
const router = useRouter();

/** 有导入权限的视为可看扩展系统（运营方） */
const isOperator = computed(() => PageElementPermission.has('mcp_service:import'));

const segment = ref(ResourceType.CUSTOMER);
const keyword = ref('');
const status = ref('');
const rows = ref<McpServiceVo[]>([]);
const loading = ref(false);
const failure = ref('');
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

const formOpen = ref(false);
const saving = ref(false);
const formRef = ref<FormInstance>();
const form = reactive<McpServicePayload>({
  name: '',
  code: '',
  endpoint: '',
  contextPath: '',
  description: '',
  status: RecordStatus.ACTIVE,
});

const rules: FormRules = {
  name: [{ required: true, message: () => t('AGENT_REQUIRED_NAME', '请填写名称'), trigger: 'blur' }],
  code: [{ required: true, message: () => t('AGENT_REQUIRED_CODE', '请填写编码'), trigger: 'blur' }],
  endpoint: [{ required: true, message: () => t('AGENT_MCP_SERVICE_ENDPOINT_REQUIRED', '请填写调用地址'), trigger: 'blur' }],
};

const importOpen = ref(false);
const importTarget = ref<McpServiceVo | null>(null);

function callUrl(row: McpServiceVo): string {
  const path = (row.contextPath || '').trim();
  if (!row.endpoint) return EMPTY;
  if (!path) return row.endpoint;
  return `${row.endpoint.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

function syncQuery(): void {
  void router.replace({
    query: {
      resourceType: segment.value,
      ...(keyword.value ? { name: keyword.value } : {}),
      ...(status.value ? { status: status.value } : {}),
      ...(pageNum.value > 1 ? { pageNum: String(pageNum.value) } : {}),
    },
  });
}

function readQuery(): void {
  const q = route.query;
  const type = typeof q.resourceType === 'string' ? q.resourceType : '';
  if (type === ResourceType.EXTENSION && isOperator.value) segment.value = ResourceType.EXTENSION;
  else if (type === ResourceType.CUSTOMER) segment.value = ResourceType.CUSTOMER;
  else segment.value = isOperator.value ? ResourceType.EXTENSION : ResourceType.CUSTOMER;
  keyword.value = typeof q.name === 'string' ? q.name : '';
  status.value = typeof q.status === 'string' ? q.status : '';
  const n = Number(q.pageNum);
  pageNum.value = Number.isFinite(n) && n > 0 ? n : 1;
}

async function load(): Promise<void> {
  loading.value = true;
  failure.value = '';
  syncQuery();
  try {
    const page = await McpServiceApi.pageWithToolCount(
      {
        resourceType: segment.value,
        ...(keyword.value ? { name: keyword.value } : {}),
        ...(status.value ? { status: status.value } : {}),
      },
      pageNum.value,
      pageSize.value,
    );
    rows.value = page.records;
    total.value = page.total;
  } catch (error: unknown) {
    failure.value = error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载列表失败');
  } finally {
    loading.value = false;
  }
}

function search(): void {
  pageNum.value = 1;
  void load();
}

function openCreate(): void {
  Object.assign(form, {
    id: undefined,
    name: '',
    code: '',
    endpoint: '',
    contextPath: '',
    description: '',
    status: RecordStatus.ACTIVE,
    resourceType: segment.value,
  });
  formOpen.value = true;
}

function openEdit(row: McpServiceVo): void {
  Object.assign(form, {
    id: row.id,
    name: row.name,
    code: row.code,
    endpoint: row.endpoint,
    contextPath: row.contextPath ?? '',
    description: row.description ?? '',
    status: row.status,
    resourceType: row.resourceType,
  });
  formOpen.value = true;
}

function resetForm(): void {
  formRef.value?.clearValidate();
}

function openImport(row: McpServiceVo): void {
  importTarget.value = row;
  importOpen.value = true;
}

async function submitForm(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  saving.value = true;
  try {
    await McpServiceApi.save({
      ...form,
      resourceType: form.id ? form.resourceType : segment.value,
      name: form.name?.trim(),
      code: form.code?.trim(),
      endpoint: form.endpoint?.trim(),
      contextPath: form.contextPath?.trim() || '',
    });
    ElMessage.success(t('G2_MSG_SAVE_OK', '保存成功'));
    formOpen.value = false;
    await load();
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败'));
  } finally {
    saving.value = false;
  }
}

async function onMenu(row: McpServiceVo, cmd: string): Promise<void> {
  if (cmd === 'edit') {
    openEdit(row);
    return;
  }
  if (cmd === 'toggle') {
    const next = row.status === RecordStatus.ACTIVE ? RecordStatus.INACTIVE : RecordStatus.ACTIVE;
    try {
      await McpServiceApi.save({ ...row, status: next });
      ElMessage.success(t('G2_MSG_SAVE_OK', '保存成功'));
      await load();
    } catch (error: unknown) {
      showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败'));
    }
    return;
  }
  if (cmd === 'delete') {
    try {
      await ElMessageBox.confirm(
        fill(t('AGENT_MCP_SERVICE_DELETE_CONFIRM', '确定删除服务「{name}」？'), { name: row.name }),
        t('G2_LBL_TIP', '提示'),
        { type: 'warning' },
      );
      await McpServiceApi.remove(row.id);
      ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
      await load();
    } catch (error: unknown) {
      if (error === 'cancel' || error === 'close') return;
      showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_DELETE_FAIL', '删除失败'));
    }
  }
}

onMounted(() => {
  readQuery();
  void load();
});
</script>

<style scoped>
.mcp-service-page { padding: 16px 24px 24px; }
.mcp-service-page__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.mcp-service-page__head h2 { margin: 0; font-size: 18px; font-weight: 600; color: var(--g2-text-primary); }
.mcp-service-page__head p { margin: 4px 0 0; color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.mcp-service-page__filters { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin: 16px 0; }
.mcp-service-page__table :deep(.el-table__row) { cursor: pointer; }
.mcp-service-page__name { font-weight: 500; color: var(--g2-text-primary); }
.mcp-service-page__code,
.mcp-service-page__table code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  color: var(--g2-text-secondary);
}
.mcp-service-page__pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
.mcp-service-page__danger { color: var(--el-color-danger); }
</style>
