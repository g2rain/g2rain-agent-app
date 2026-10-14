<template>
  <div class="model-catalog-page">
    <header class="model-catalog-page__head">
      <div>
        <h2>{{ $t('AGENT_MENU_MODEL_CATALOG', '模型目录') }}</h2>
        <p>{{ $t('AGENT_MODEL_CATALOG_SUBTITLE', '广场模型供所有租户引用；私有模型由租户在模型配置中接入') }}</p>
      </div>
      <el-button
        v-if="segment === ResourceType.MARKET"
        v-permission="'model_catalog:add'"
        type="primary"
        @click="openCreate"
      >
        {{ $t('AGENT_MODEL_CATALOG_NEW', '新增广场模型') }}
      </el-button>
    </header>

    <div class="model-catalog-page__filters">
      <el-radio-group v-model="segment" @change="search">
        <el-radio-button :value="ResourceType.MARKET">{{ $t('AGENT_RESOURCE_MARKET', '广场') }}</el-radio-button>
        <el-radio-button :value="ResourceType.CUSTOM">{{ $t('AGENT_RESOURCE_CUSTOM', '私有') }}</el-radio-button>
      </el-radio-group>
      <el-radio-group v-model="modelType" @change="search">
        <el-radio-button value="">{{ $t('AGENT_FILTER_ALL_TYPE', '全部类型') }}</el-radio-button>
        <el-radio-button :value="ModelType.LLM">{{ $t('AGENT_MODEL_TYPE_LLM', '大语言') }}</el-radio-button>
        <el-radio-button :value="ModelType.VECTOR">{{ $t('AGENT_MODEL_TYPE_VECTOR', '向量') }}</el-radio-button>
        <el-radio-button :value="ModelType.RERANK">{{ $t('AGENT_MODEL_TYPE_RERANK', '重排序') }}</el-radio-button>
      </el-radio-group>
      <el-input
        v-model="keyword"
        clearable
        :placeholder="$t('AGENT_MODEL_SEARCH', '搜索模型名')"
        style="width: 200px"
        @change="search"
        @clear="search"
      />
      <el-select v-model="provider" clearable filterable :placeholder="$t('AGENT_MODEL_PROVIDER', '供应商')" style="width: 140px" @change="search">
        <el-option v-for="p in providers" :key="p" :label="p" :value="p" />
      </el-select>
    </div>

    <el-skeleton v-if="loading && !rows.length" :rows="6" animated />
    <el-result v-else-if="failure" icon="error" :sub-title="failure">
      <template #extra><el-button type="primary" @click="load">{{ $t('G2_BTN_RETRY', '重试') }}</el-button></template>
    </el-result>

    <template v-else>
      <!-- 广场：卡片 -->
      <div v-if="segment === ResourceType.MARKET" v-loading="loading" class="model-catalog-page__grid">
        <article v-for="row in rows" :key="row.id" class="model-card">
          <div class="model-card__top">
            <span class="model-card__avatar">{{ (row.provider || '?').slice(0, 1) }}</span>
            <div class="model-card__title">
              <h3>{{ row.modelName }}</h3>
              <div class="model-card__meta">{{ row.provider }} · {{ row.protocol }}</div>
            </div>
            <el-dropdown trigger="click" @command="(cmd: string) => onMenu(row, cmd)">
              <el-button text :icon="MoreFilled" @click.stop />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-permission="'model_catalog:edit'" command="edit">{{ $t('G2_BTN_EDIT', '编辑') }}</el-dropdown-item>
                  <el-dropdown-item v-permission="'model_catalog:edit'" command="toggle">
                    {{ row.status === RecordStatus.ACTIVE ? $t('AGENT_STATUS_INACTIVE', '停用') : $t('AGENT_STATUS_ACTIVE', '启用') }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-permission="'model_catalog:delete'"
                    command="delete"
                    divided
                    :disabled="(row.refCount ?? 0) > 0"
                  >
                    <span :class="{ 'model-catalog-page__danger': !(row.refCount ?? 0) }">
                      {{ (row.refCount ?? 0) > 0 ? $t('AGENT_MODEL_DELETE_BLOCKED', '有引用，请先停用') : $t('G2_BTN_DELETE', '删除') }}
                    </span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="model-card__tags">
            <el-tag size="small" effect="plain">{{ typeLabel(row.modelType) }}</el-tag>
            <StatusDot :tone="describeStatus(row.status).tone" :label="describeStatus(row.status).label" />
          </div>
          <p class="model-card__desc">{{ row.description || EMPTY }}</p>
          <div class="model-card__ref">
            {{
              (row.refCount ?? 0) > 0
                ? fill($t('AGENT_MODEL_REF_COUNT', '被 {n} 个配置引用'), { n: row.refCount ?? 0 })
                : $t('AGENT_MODEL_REF_NONE', '未被引用')
            }}
            <span class="model-card__pending">{{ $t('AGENT_MODEL_REF_PENDING', '（机构数待后端）') }}</span>
          </div>
        </article>
        <el-empty v-if="!rows.length" :image-size="72" :description="$t('AGENT_MODEL_CATALOG_EMPTY', '还没有广场模型')" />
      </div>

      <!-- 私有：只读表 -->
      <el-table v-else v-loading="loading" :data="rows">
        <el-table-column :label="$t('AGENT_MODEL_NAME', '模型')" min-width="200" prop="modelName" />
        <el-table-column :label="$t('AGENT_MODEL_TYPE', '类型')" width="100">
          <template #default="{ row }">{{ typeLabel(row.modelType) }}</template>
        </el-table-column>
        <el-table-column :label="$t('AGENT_MODEL_PROTOCOL', '协议')" width="110" prop="protocol" />
        <el-table-column :label="$t('AGENT_MODEL_BASE_URL', '服务地址')" min-width="220" prop="baseUrl" show-overflow-tooltip />
        <el-table-column :label="$t('AGENT_MODEL_ORGAN', '所属机构')" width="140">
          <template #default>
            <span class="model-catalog-page__muted">{{ $t('AGENT_MODEL_ORGAN_PENDING', '待后端') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('AGENT_LIST_STATUS', '状态')" width="100">
          <template #default="{ row }">
            <StatusDot :tone="describeStatus(row.status).tone" :label="describeStatus(row.status).label" />
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :image-size="72" :description="$t('AGENT_MODEL_CUSTOM_EMPTY', '还没有私有模型')" />
        </template>
      </el-table>

      <div class="model-catalog-page__pagination">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="search"
          @current-change="load"
        />
      </div>
    </template>

    <el-drawer
      v-model="formOpen"
      :title="form.id ? $t('AGENT_MODEL_CATALOG_EDIT', '编辑广场模型') : $t('AGENT_MODEL_CATALOG_NEW', '新增广场模型')"
      size="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <h4>{{ $t('AGENT_MODEL_SECTION_MODEL', '模型') }}</h4>
        <el-form-item :label="$t('AGENT_MODEL_NAME', '调用标识')" prop="modelName">
          <el-input v-model="form.modelName" />
        </el-form-item>
        <el-form-item :label="$t('AGENT_MODEL_TYPE', '类型')" prop="modelType">
          <el-select v-model="form.modelType" style="width: 100%">
            <el-option :label="$t('AGENT_MODEL_TYPE_LLM', '大语言')" :value="ModelType.LLM" />
            <el-option :label="$t('AGENT_MODEL_TYPE_VECTOR', '向量')" :value="ModelType.VECTOR" />
            <el-option :label="$t('AGENT_MODEL_TYPE_RERANK', '重排序')" :value="ModelType.RERANK" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('AGENT_MODEL_PROVIDER', '供应商')" prop="provider">
          <el-input v-model="form.provider" />
        </el-form-item>
        <el-form-item :label="$t('AGENT_FIELD_DESC', '说明')">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
        <h4>{{ $t('AGENT_MODEL_SECTION_CONN', '连接') }}</h4>
        <el-form-item :label="$t('AGENT_MODEL_PROTOCOL', '协议')" prop="protocol">
          <el-select v-model="form.protocol" style="width: 100%">
            <el-option v-for="p in PROTOCOLS" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('AGENT_MODEL_BASE_URL', '服务地址')" prop="baseUrl">
          <el-input v-model="form.baseUrl" />
        </el-form-item>
        <el-form-item :label="$t('AGENT_MODEL_API_KEY', '访问密钥')">
          <SecretInput v-model="apiKey" :masked="!!form.id" :masked-placeholder="$t('AGENT_MODEL_API_KEY_KEEP', '留空表示不修改')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :loading="testing" @click="test">{{ $t('AGENT_MODEL_TEST', '测试连接') }}</el-button>
        <el-button @click="formOpen = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
        <el-button v-permission="'model_catalog:edit'" type="primary" :loading="saving" @click="submit">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { MoreFilled } from '@element-plus/icons-vue';
import { t } from '@platform/i18n';
import { SecretInput, StatusDot, showErrorMessage } from '@/components';
import {
  EMPTY,
  ModelProtocol,
  ModelType,
  RecordStatus,
  ResourceType,
  describeStatus,
  fill,
} from '@runtime/console';
import { ModelCatalogApi } from './api';
import type { ModelCatalogPayload, ModelCatalogVo } from './type';

const PROTOCOLS = [ModelProtocol.OPENAI, ModelProtocol.ANTHROPIC, ModelProtocol.GEMINI];

const route = useRoute();
const router = useRouter();

const segment = ref(ResourceType.MARKET);
const modelType = ref('');
const keyword = ref('');
const provider = ref('');
const providers = ref<string[]>([]);
const rows = ref<ModelCatalogVo[]>([]);
const loading = ref(false);
const failure = ref('');
const pageNum = ref(1);
const pageSize = ref(12);
const total = ref(0);

const formOpen = ref(false);
const saving = ref(false);
const testing = ref(false);
const formRef = ref<FormInstance>();
const apiKey = ref('');
const form = reactive<ModelCatalogPayload>({
  modelName: '',
  modelType: ModelType.LLM,
  provider: '',
  protocol: ModelProtocol.OPENAI,
  baseUrl: '',
  description: '',
  status: RecordStatus.ACTIVE,
  resourceType: ResourceType.MARKET,
});

const rules: FormRules = {
  modelName: [{ required: true, message: () => t('AGENT_REQUIRED_NAME', '请填写名称'), trigger: 'blur' }],
  modelType: [{ required: true, message: () => t('AGENT_MODEL_TYPE_REQUIRED', '请选择类型'), trigger: 'change' }],
  provider: [{ required: true, message: () => t('AGENT_MODEL_PROVIDER_REQUIRED', '请填写供应商'), trigger: 'blur' }],
  protocol: [{ required: true, message: () => t('AGENT_MODEL_PROTOCOL_REQUIRED', '请选择协议'), trigger: 'change' }],
  baseUrl: [{ required: true, message: () => t('AGENT_MODEL_BASE_URL_REQUIRED', '请填写服务地址'), trigger: 'blur' }],
};

function typeLabel(type: string): string {
  if (type === ModelType.VECTOR) return t('AGENT_MODEL_TYPE_VECTOR', '向量');
  if (type === ModelType.RERANK) return t('AGENT_MODEL_TYPE_RERANK', '重排序');
  return t('AGENT_MODEL_TYPE_LLM', '大语言');
}

function syncQuery(): void {
  void router.replace({
    query: {
      resourceType: segment.value,
      ...(modelType.value ? { modelType: modelType.value } : {}),
      ...(keyword.value ? { modelName: keyword.value } : {}),
      ...(provider.value ? { provider: provider.value } : {}),
    },
  });
}

async function load(): Promise<void> {
  loading.value = true;
  failure.value = '';
  syncQuery();
  try {
    const [page, refs] = await Promise.all([
      ModelCatalogApi.page(
        {
          resourceType: segment.value,
          ...(modelType.value ? { modelType: modelType.value } : {}),
          ...(keyword.value ? { modelName: keyword.value } : {}),
          ...(provider.value ? { provider: provider.value } : {}),
        },
        pageNum.value,
        pageSize.value,
      ),
      ModelCatalogApi.refCounts(),
    ]);
    rows.value = page.records.map((row) => ({
      ...row,
      refCount: refs.get(row.id) ?? 0,
      apiKey: undefined,
    }));
    total.value = page.total;
    providers.value = [...new Set(page.records.map((r) => r.provider).filter(Boolean))];
  } catch (error: unknown) {
    failure.value = error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载失败');
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
    modelName: '',
    modelType: ModelType.LLM,
    provider: '',
    protocol: ModelProtocol.OPENAI,
    baseUrl: '',
    description: '',
    status: RecordStatus.ACTIVE,
    resourceType: ResourceType.MARKET,
  });
  apiKey.value = '';
  formOpen.value = true;
}

function openEdit(row: ModelCatalogVo): void {
  Object.assign(form, { ...row, resourceType: ResourceType.MARKET });
  apiKey.value = '';
  formOpen.value = true;
}

async function submit(): Promise<void> {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  saving.value = true;
  try {
    await ModelCatalogApi.save({
      ...form,
      resourceType: ResourceType.MARKET,
      ...(apiKey.value ? { apiKey: apiKey.value } : form.id ? {} : { apiKey: '' }),
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

async function test(): Promise<void> {
  testing.value = true;
  try {
    await ModelCatalogApi.testConnection({
      modelName: form.modelName || 'test',
      modelType: form.modelType || ModelType.LLM,
      baseUrl: form.baseUrl || '',
    });
    ElMessage.success(t('AGENT_MODEL_TEST_OK', '连接正常'));
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('AGENT_MODEL_TEST_FAIL', '连接失败'));
  } finally {
    testing.value = false;
  }
}

async function onMenu(row: ModelCatalogVo, cmd: string): Promise<void> {
  if (cmd === 'edit') {
    openEdit(row);
    return;
  }
  if (cmd === 'toggle') {
    await ModelCatalogApi.save({
      ...row,
      status: row.status === RecordStatus.ACTIVE ? RecordStatus.INACTIVE : RecordStatus.ACTIVE,
    });
    ElMessage.success(t('G2_MSG_SAVE_OK', '保存成功'));
    await load();
    return;
  }
  if (cmd === 'delete') {
    if ((row.refCount ?? 0) > 0) return;
    try {
      await ElMessageBox.confirm(fill(t('AGENT_MODEL_DELETE_CONFIRM', '确定删除「{name}」？'), { name: row.modelName }), t('G2_LBL_TIP', '提示'), {
        type: 'warning',
      });
      await ModelCatalogApi.remove(row.id);
      ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
      await load();
    } catch (error: unknown) {
      if (error === 'cancel' || error === 'close') return;
      showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_DELETE_FAIL', '删除失败'));
    }
  }
}

onMounted(() => {
  const q = route.query;
  if (q.resourceType === ResourceType.CUSTOM) segment.value = ResourceType.CUSTOM;
  void load();
});
</script>

<style scoped>
.model-catalog-page { padding: 16px 24px 24px; }
.model-catalog-page__head { display: flex; justify-content: space-between; gap: 16px; }
.model-catalog-page__head h2 { margin: 0; font-size: 18px; font-weight: 600; }
.model-catalog-page__head p { margin: 4px 0 0; color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.model-catalog-page__filters { display: flex; flex-wrap: wrap; gap: 12px; margin: 16px 0; }
.model-catalog-page__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.model-card { padding: 16px 20px; border: 1px solid var(--g2-border-color); border-radius: 8px; display: flex; flex-direction: column; gap: 10px; }
.model-card__top { display: flex; gap: 12px; }
.model-card__avatar {
  width: 40px; height: 40px; border-radius: 10px; display: grid; place-items: center;
  font-weight: 600; color: var(--g2-color-primary);
  background: color-mix(in srgb, var(--g2-color-primary) 12%, transparent); flex: none;
}
.model-card__title { flex: 1; min-width: 0; }
.model-card__title h3 { margin: 0; font-size: 15px; }
.model-card__meta { margin-top: 2px; color: var(--g2-text-secondary); font-size: 12px; }
.model-card__tags { display: flex; gap: 8px; align-items: center; }
.model-card__desc { margin: 0; color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); min-height: 2.4em; }
.model-card__ref { font-size: var(--g2-font-size-sm); color: var(--g2-text-secondary); }
.model-card__pending { color: var(--g2-text-placeholder); }
.model-catalog-page__pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
.model-catalog-page__danger { color: var(--el-color-danger); }
.model-catalog-page__muted { color: var(--g2-text-placeholder); }
.model-catalog-page h4 { margin: 8px 0 12px; font-size: 13px; color: var(--g2-text-secondary); }
</style>
