<template>
  <el-drawer
    :model-value="visible"
    size="880px"
    :title="title"
    destroy-on-close
    @close="emit('close')"
  >
    <div v-if="mode === 'detail'" class="tool-drawer__head">
      <span class="tool-drawer__method" :class="`is-${(form.method || '').toLowerCase()}`">{{ form.method }}</span>
      <code class="tool-drawer__path">{{ form.path }}</code>
      <span class="tool-drawer__headline">{{ form.title }}</span>
    </div>

    <div class="tool-drawer__section">基本信息</div>
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <div class="tool-drawer__grid">
        <el-form-item label="工具名" prop="name">
          <el-input v-model="form.name" :disabled="locked" maxlength="256" placeholder="MCP tools/call 名称" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" :disabled="mode === 'detail'" maxlength="128" placeholder="给人看的标题" />
        </el-form-item>
        <el-form-item label="服务编码" prop="serviceCode">
          <el-input v-model="form.serviceCode" :disabled="locked" maxlength="64" placeholder="所属服务编码" />
        </el-form-item>
        <el-form-item label="方法" prop="method">
          <el-select v-model="form.method" :disabled="locked" placeholder="请选择" style="width: 100%">
            <el-option v-for="item in METHODS" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item class="tool-drawer__full" label="路径" prop="path">
          <el-input v-model="form.path" :disabled="locked" maxlength="512" placeholder="/resource/action" />
        </el-form-item>
        <el-form-item class="tool-drawer__full" label="说明" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            :disabled="mode === 'detail'"
            maxlength="500"
            placeholder="给模型看的说明"
          />
        </el-form-item>
      </div>
    </el-form>

    <div class="tool-drawer__section">契约</div>
    <el-tabs v-model="tab">
      <el-tab-pane label="inputSchema" name="schema">
        <JsonEditor v-if="mode !== 'detail'" v-model="form.inputSchema" height="320px" />
        <JsonViewer v-else-if="form.inputSchema" :value="form.inputSchema" :collapsed-depth="2" />
        <el-empty v-else :image-size="48" description="没有 inputSchema" />
      </el-tab-pane>
      <el-tab-pane label="OpenAPI" name="openapi">
        <JsonEditor v-if="mode !== 'detail'" v-model="form.openapiOperation" height="320px" />
        <JsonViewer v-else-if="form.openapiOperation" :value="form.openapiOperation" :collapsed-depth="2" />
        <el-empty v-else :image-size="48" description="没有 OpenAPI" />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="emit('close')">{{ mode === 'detail' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="mode !== 'detail'" type="primary" :loading="saving" @click="submit">保存</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, reactive, ref, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { t } from '@platform/i18n';
import { JsonViewer, showErrorMessage } from '@/components';
import { McpToolProfileApi } from '../api';
import type { McpToolProfile } from '../type';

const JsonEditor = defineAsyncComponent(() => import('@/components/json-editor').then((m) => m.JsonEditor));

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD', 'TRACE'];

const props = defineProps<{
  visible: boolean;
  mode: 'create' | 'edit' | 'detail';
  resourceType: string;
  row: McpToolProfile | null;
}>();

const emit = defineEmits<{ close: []; done: [] }>();

const formRef = ref<FormInstance | null>(null);
const tab = ref('schema');
const saving = ref(false);
const form = reactive({
  id: undefined as number | undefined,
  name: '',
  title: '',
  serviceCode: '',
  method: 'GET',
  path: '',
  description: '',
  inputSchema: '{}',
  openapiOperation: '{}',
});

const locked = computed(() => props.mode !== 'create');
const title = computed(() => {
  if (props.mode === 'create') return '新增工具';
  if (props.mode === 'edit') return `编辑工具 · ${form.name}`;
  return form.title || form.name || '工具详情';
});

const rules = computed<FormRules>(() => {
  if (props.mode === 'detail') return {};
  const required = (message: string) => [{ required: true, message, trigger: 'blur' }];
  if (props.mode === 'edit') {
    return { title: required('请输入标题') };
  }
  return {
    name: required('请输入工具名'),
    title: required('请输入标题'),
    serviceCode: required('请输入服务编码'),
    method: [{ required: true, message: '请选择方法', trigger: 'change' }],
    path: required('请输入路径'),
  };
});

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return;
    tab.value = 'schema';
    const row = props.row;
    form.id = props.mode === 'create' ? undefined : row?.id;
    form.name = row?.name ?? '';
    form.title = row?.title ?? '';
    form.serviceCode = row?.serviceCode ?? '';
    form.method = row?.method || 'GET';
    form.path = row?.path ?? '';
    form.description = row?.description ?? '';
    form.inputSchema = row?.inputSchema || '{}';
    form.openapiOperation = row?.openapiOperation || '{}';
    formRef.value?.clearValidate();
  },
);

async function submit(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  saving.value = true;
  try {
    if (props.mode === 'create') {
      await McpToolProfileApi.save(props.resourceType, {
        name: form.name,
        title: form.title,
        serviceCode: form.serviceCode,
        method: form.method,
        path: form.path,
        description: form.description,
        inputSchema: form.inputSchema,
        openapiOperation: form.openapiOperation,
      });
      ElMessage.success(t('G2_MSG_ADD_OK', '新增成功'));
    } else {
      await McpToolProfileApi.save(props.resourceType, {
        id: form.id,
        title: form.title,
        description: form.description,
        inputSchema: form.inputSchema,
        openapiOperation: form.openapiOperation,
      });
      ElMessage.success(t('G2_MSG_UPDATE_OK', '更新成功'));
    }
    emit('done');
    emit('close');
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败'));
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.tool-drawer__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.tool-drawer__method {
  display: inline-block;
  min-width: 52px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  border-radius: 3px;
  padding: 1px 6px;
}
.tool-drawer__method.is-get { color: var(--g2-color-primary); background: color-mix(in srgb, var(--g2-color-primary) 10%, transparent); }
.tool-drawer__method.is-post,
.tool-drawer__method.is-put,
.tool-drawer__method.is-patch { color: var(--g2-color-success); background: color-mix(in srgb, var(--g2-color-success) 10%, transparent); }
.tool-drawer__method.is-delete { color: var(--g2-color-danger); background: color-mix(in srgb, var(--g2-color-danger) 10%, transparent); }
.tool-drawer__path { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
.tool-drawer__headline { font-weight: 600; }
.tool-drawer__section { margin: 4px 0 12px; font-weight: 600; }
.tool-drawer__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 16px;
}
.tool-drawer__full { grid-column: 1 / -1; }
</style>
