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
        <el-form-item label="工具名">
          <el-input :model-value="form.name" disabled />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" :disabled="mode === 'detail'" maxlength="128" placeholder="给人看的标题" />
        </el-form-item>
        <el-form-item label="所属服务">
          <el-input :model-value="form.serviceName" disabled />
        </el-form-item>
        <el-form-item label="方法">
          <el-input :model-value="form.method" disabled />
        </el-form-item>
        <el-form-item class="tool-drawer__full" label="路径">
          <el-input :model-value="form.path" disabled />
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
        <JsonEditor v-if="mode !== 'detail'" v-model="form.openapiDocument" height="320px" />
        <JsonViewer v-else-if="form.openapiDocument" :value="form.openapiDocument" :collapsed-depth="2" />
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
import { JsonViewer } from '@/components';
import { McpToolProfileApi } from '../api';
import type { McpToolProfile } from '../type';

const JsonEditor = defineAsyncComponent(() => import('@/components/json-editor').then((m) => m.JsonEditor));

/**
 * 工具详情 / 编辑：工具由导入生成，名称、服务、方法、路径只读。
 */
const props = defineProps<{
  visible: boolean;
  mode: 'edit' | 'detail';
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
  serviceName: '',
  method: '',
  path: '',
  description: '',
  inputSchema: '{}',
  openapiDocument: '{}',
});

const title = computed(() => (props.mode === 'edit' ? `编辑工具 · ${form.name}` : form.title || form.name || '工具详情'));

const rules = computed<FormRules>(() =>
  props.mode === 'edit' ? { title: [{ required: true, message: '请输入标题', trigger: 'blur' }] } : {},
);

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return;
    tab.value = 'schema';
    const row = props.row;
    form.id = row?.id;
    form.name = row?.name ?? '';
    form.title = row?.title ?? '';
    form.serviceName = row?.serviceName ?? '';
    form.method = row?.method ?? '';
    form.path = row?.path ?? '';
    form.description = row?.description ?? '';
    form.inputSchema = row?.inputSchema || '{}';
    form.openapiDocument = row?.openapiDocument || '{}';
    formRef.value?.clearValidate();
  },
);

async function submit(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid || form.id == null) return;
  saving.value = true;
  try {
    await McpToolProfileApi.save(props.resourceType, {
      id: form.id,
      title: form.title,
      description: form.description,
      inputSchema: form.inputSchema,
      openapiDocument: form.openapiDocument,
    });
    ElMessage.success(t('G2_MSG_UPDATE_OK', '更新成功'));
    emit('done');
    emit('close');
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
