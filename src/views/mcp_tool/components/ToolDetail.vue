<template>
  <el-drawer
    :model-value="visible"
    size="720px"
    :title="tool?.title || tool?.name || $t('AGENT_TOOL_DETAIL', '工具详情')"
    destroy-on-close
    @close="onClose"
  >
    <template v-if="tool">
      <el-tabs v-model="tab">
        <el-tab-pane :label="$t('AGENT_TOOL_TAB_SUMMARY', '概要')" name="summary">
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="$t('AGENT_TOOL_NAME', '工具名')">
              <code>{{ tool.name }}</code>
              <el-tag v-if="isWrite(tool.method)" size="small" type="warning" effect="plain" class="tool-detail__write">
                {{ $t('AGENT_WRITE_MARK', '写') }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('AGENT_TOOL_TITLE', '标题')">{{ tool.title || EMPTY }}</el-descriptions-item>
            <el-descriptions-item :label="$t('AGENT_TOOL_SERVICE', '服务')">
              <code>{{ tool.serviceCode }}</code>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('AGENT_TOOL_METHOD_PATH', '方法与路径')">
              <span class="tool-detail__method" :class="`is-${tool.method.toLowerCase()}`">{{ tool.method }}</span>
              <code class="tool-detail__path">{{ tool.path }}</code>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('AGENT_LIST_STATUS', '状态')">
              <StatusDot :tone="describeStatus(form.status).tone" :label="describeStatus(form.status).label" />
              <el-switch
                v-if="canEditMeta"
                v-model="active"
                class="tool-detail__switch"
                :active-text="$t('AGENT_STATUS_ACTIVE', '启用')"
              />
            </el-descriptions-item>
          </el-descriptions>

          <div class="tool-detail__desc">
            <div class="tool-detail__desc-head">{{ $t('AGENT_TOOL_DESCRIPTION', '给模型的说明') }}</div>
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="5"
              :disabled="!canEditMeta"
              :placeholder="$t('AGENT_TOOL_DESCRIPTION_HINT', '说明这个工具做什么，供模型选用')"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('AGENT_TOOL_TAB_PARAMS', '参数')" name="params">
          <div class="tool-detail__params-head">
            <el-radio-group v-model="paramView" size="small">
              <el-radio-button value="table">{{ $t('AGENT_TOOL_PARAM_TABLE', '参数表') }}</el-radio-button>
              <el-radio-button value="json">{{ $t('AGENT_TOOL_PARAM_JSON', 'JSON 原文') }}</el-radio-button>
            </el-radio-group>
          </div>
          <el-table v-if="paramView === 'table'" :data="params" size="small">
            <el-table-column :label="$t('AGENT_TOOL_PARAM_NAME', '名称')" prop="name" min-width="120">
              <template #default="{ row }"><code>{{ row.name }}</code></template>
            </el-table-column>
            <el-table-column :label="$t('AGENT_TOOL_PARAM_TYPE', '类型')" prop="type" width="100" />
            <el-table-column :label="$t('AGENT_TOOL_PARAM_REQUIRED', '必填')" width="80">
              <template #default="{ row }">{{ row.required ? $t('G2_LBL_YES', '是') : $t('G2_LBL_NO', '否') }}</template>
            </el-table-column>
            <el-table-column :label="$t('AGENT_TOOL_PARAM_DESC', '说明')" prop="description" min-width="160" />
            <template #empty>
              <el-empty :image-size="48" :description="$t('AGENT_TOOL_NO_PARAMS', '没有参数定义')" />
            </template>
          </el-table>
          <JsonEditor
            v-else
            v-model="schemaText"
            :readonly="!canEditSchema"
            height="360px"
          />
        </el-tab-pane>

        <el-tab-pane :label="$t('AGENT_TOOL_TAB_OPENAPI', 'OpenAPI')" name="openapi">
          <JsonViewer v-if="tool.openapiOperation" :value="tool.openapiOperation" :collapsed-depth="2" />
          <el-empty v-else :image-size="48" :description="$t('AGENT_TOOL_NO_OPENAPI', '没有 OpenAPI 原文')" />
        </el-tab-pane>

        <el-tab-pane :label="$t('AGENT_TOOL_TAB_REFS', '被引用')" name="refs">
          <el-skeleton v-if="refsLoading" :rows="4" animated />
          <el-table v-else :data="refs" size="small">
            <el-table-column :label="$t('AGENT_TAB_SKILL', '技能')" min-width="180">
              <template #default="{ row }">
                <div>{{ row.skillName }}</div>
                <code class="tool-detail__muted">{{ row.skillKey }}</code>
              </template>
            </el-table-column>
            <template #empty>
              <el-empty :image-size="48" :description="$t('AGENT_TOOL_NO_REFS', '还没有技能绑定这个工具')" />
            </template>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </template>

    <template #footer>
      <el-button @click="onClose">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
      <el-button
        v-if="canDelete"
        v-permission="'mcp_tool:delete'"
        type="danger"
        plain
        @click="askDelete"
      >
        {{ $t('G2_BTN_DELETE', '删除') }}
      </el-button>
      <el-button v-if="canEditMeta" v-permission="'mcp_tool:edit'" type="primary" :loading="saving" @click="save">
        {{ $t('G2_BTN_SAVE', '保存') }}
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { t } from '@platform/i18n';
import { JsonViewer, StatusDot, showErrorMessage } from '@/components';
import { EMPTY, RecordStatus, ResourceType, describeStatus, parseJson } from '@runtime/console';
import { McpToolProfileApi } from '../api';
import type { McpToolProfileVo, SchemaParam, ToolSkillRef } from '../type';

const JsonEditor = defineAsyncComponent(() => import('@/components/json-editor').then((m) => m.JsonEditor));

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const props = defineProps<{
  visible: boolean;
  tool: McpToolProfileVo | null;
  /** 运营方（有同步权限）可改公共工具说明与启停 */
  isOperator: boolean;
}>();

const emit = defineEmits<{ saved: []; close: [] }>();

const tab = ref('summary');
const paramView = ref<'table' | 'json'>('table');
const saving = ref(false);
const refsLoading = ref(false);
const refs = ref<ToolSkillRef[]>([]);
const form = reactive<{ description: string; status: string; inputSchema: string }>({
  description: '',
  status: RecordStatus.ACTIVE,
  inputSchema: '',
});
const schemaText = ref('{}');

const isCustomer = computed(() => props.tool?.resourceType === ResourceType.CUSTOMER);
const canEditMeta = computed(() => !!props.tool && (isCustomer.value || props.isOperator));
const canEditSchema = computed(() => isCustomer.value);
const canDelete = computed(() => isCustomer.value);

const active = computed({
  get: () => form.status !== RecordStatus.INACTIVE,
  set: (on: boolean) => {
    form.status = on ? RecordStatus.ACTIVE : RecordStatus.INACTIVE;
  },
});

const params = computed<SchemaParam[]>(() => {
  const schema = parseJson<{
    properties?: Record<string, { type?: string; description?: string }>;
    required?: string[];
  }>(schemaText.value || form.inputSchema, {});
  const required = new Set(schema.required ?? []);
  return Object.entries(schema.properties ?? {}).map(([name, def]) => ({
    name,
    type: def.type ?? 'any',
    required: required.has(name),
    description: def.description ?? '',
  }));
});

function isWrite(method: string): boolean {
  return WRITE_METHODS.has(method.toUpperCase());
}

watch(
  () => [props.visible, props.tool] as const,
  async ([visible, tool]) => {
    if (!visible || !tool) return;
    tab.value = 'summary';
    paramView.value = 'table';
    form.description = tool.description ?? '';
    form.status = tool.status || RecordStatus.ACTIVE;
    form.inputSchema = tool.inputSchema ?? '{}';
    schemaText.value = tool.inputSchema || '{}';
    refsLoading.value = true;
    try {
      refs.value = await McpToolProfileApi.skillRefs(tool.name);
    } catch {
      refs.value = [];
    } finally {
      refsLoading.value = false;
    }
  },
);

function onClose(): void {
  emit('close');
}

async function save(): Promise<void> {
  if (!props.tool) return;
  saving.value = true;
  try {
    await McpToolProfileApi.save({
      ...props.tool,
      description: form.description,
      status: form.status,
      ...(canEditSchema.value ? { inputSchema: schemaText.value } : {}),
    });
    ElMessage.success(t('G2_MSG_SAVE_OK', '保存成功'));
    emit('saved');
    emit('close');
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败'));
  } finally {
    saving.value = false;
  }
}

async function askDelete(): Promise<void> {
  if (!props.tool) return;
  try {
    await ElMessageBox.confirm(
      t('AGENT_TOOL_DELETE_CONFIRM', '确定删除这个客户工具？'),
      t('G2_LBL_TIP', '提示'),
      { type: 'warning' },
    );
    await McpToolProfileApi.remove(props.tool.id);
    ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
    emit('saved');
    emit('close');
  } catch (error: unknown) {
    if (error === 'cancel' || error === 'close') return;
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_DELETE_FAIL', '删除失败'));
  }
}
</script>

<style scoped>
.tool-detail__write { margin-left: 8px; vertical-align: middle; }
.tool-detail__method {
  display: inline-block;
  min-width: 52px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  border-radius: 3px;
  padding: 1px 6px;
  margin-right: 8px;
}
.tool-detail__method.is-get { color: var(--g2-color-primary); background: color-mix(in srgb, var(--g2-color-primary) 10%, transparent); }
.tool-detail__method.is-post,
.tool-detail__method.is-put,
.tool-detail__method.is-patch { color: var(--g2-color-success); background: color-mix(in srgb, var(--g2-color-success) 10%, transparent); }
.tool-detail__method.is-delete { color: var(--g2-color-danger); background: color-mix(in srgb, var(--g2-color-danger) 10%, transparent); }
.tool-detail__path { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
.tool-detail__switch { margin-left: 12px; }
.tool-detail__desc { margin-top: 16px; }
.tool-detail__desc-head { margin-bottom: 8px; font-weight: 500; color: var(--g2-text-primary); }
.tool-detail__params-head { display: flex; justify-content: flex-end; margin-bottom: 12px; }
.tool-detail__muted { font-size: 12px; color: var(--g2-text-secondary); }
code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
</style>
