<template>
  <div class="model-profile-page">
    <header class="model-profile-page__head">
      <div>
        <h2>{{ $t('AGENT_MENU_MODEL_PROFILE', '模型配置') }}</h2>
        <p>{{ $t('AGENT_MODEL_PROFILE_SUBTITLE', '配置后即可在智能体和对话中使用') }}</p>
      </div>
      <el-dropdown v-permission="'model_profile:add'" trigger="click" @command="openCreate">
        <el-button type="primary">
          {{ $t('AGENT_MODEL_PROFILE_NEW', '新增模型') }}
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="market">{{ $t('AGENT_MODEL_FROM_MARKET', '从广场选择') }}</el-dropdown-item>
            <el-dropdown-item command="custom">{{ $t('AGENT_MODEL_FROM_CUSTOM', '接入私有模型') }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </header>

    <div class="model-profile-page__filters">
      <el-radio-group v-model="modelType" @change="search">
        <el-radio-button value="">{{ $t('AGENT_FILTER_ALL', '全部') }}</el-radio-button>
        <el-radio-button :value="ModelType.LLM">{{ $t('AGENT_MODEL_TYPE_LLM', '大语言') }}</el-radio-button>
        <el-radio-button :value="ModelType.VECTOR">{{ $t('AGENT_MODEL_TYPE_VECTOR', '向量') }}</el-radio-button>
        <el-radio-button :value="ModelType.RERANK">{{ $t('AGENT_MODEL_TYPE_RERANK', '重排序') }}</el-radio-button>
      </el-radio-group>
      <el-input v-model="keyword" clearable :placeholder="$t('AGENT_MODEL_SEARCH', '搜索模型名')" style="width: 200px" @change="search" @clear="search" />
      <el-select v-model="resourceType" clearable :placeholder="$t('AGENT_LIST_SOURCE', '来源')" style="width: 120px" @change="search">
        <el-option :label="$t('AGENT_RESOURCE_MARKET', '广场')" :value="ResourceType.MARKET" />
        <el-option :label="$t('AGENT_RESOURCE_CUSTOM', '私有')" :value="ResourceType.CUSTOM" />
      </el-select>
      <el-select v-model="status" clearable :placeholder="$t('AGENT_LIST_STATUS', '状态')" style="width: 120px" @change="search">
        <el-option :label="$t('AGENT_STATUS_ACTIVE', '启用')" :value="RecordStatus.ACTIVE" />
        <el-option :label="$t('AGENT_STATUS_INACTIVE', '停用')" :value="RecordStatus.INACTIVE" />
      </el-select>
    </div>

    <el-table v-loading="loading" :data="rows" @row-click="openDetail">
      <el-table-column :label="$t('AGENT_MODEL_NAME', '模型')" min-width="220">
        <template #default="{ row }">
          <div class="model-profile-page__name">{{ row.modelName }}</div>
          <div class="model-profile-page__meta">{{ row.provider }} · {{ row.protocol }}</div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('AGENT_LIST_SOURCE', '来源')" width="90">
        <template #default="{ row }">
          <el-tag size="small" effect="plain" :type="row.resourceType === ResourceType.MARKET ? 'info' : 'primary'">
            {{ row.resourceType === ResourceType.MARKET ? $t('AGENT_RESOURCE_MARKET', '广场') : $t('AGENT_RESOURCE_CUSTOM', '私有') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('AGENT_MODEL_TYPE', '类型')" width="90">
        <template #default="{ row }">{{ typeLabel(row.modelType) }}</template>
      </el-table-column>
      <el-table-column :label="$t('AGENT_MODEL_PARAMS', '参数')" min-width="180">
        <template #default="{ row }">
          <span v-if="row.modelType === ModelType.LLM">
            T {{ row.temperature ?? EMPTY }} · P {{ row.topP ?? EMPTY }} · {{ row.maxTokens ?? EMPTY }} tokens
          </span>
          <span v-else class="model-profile-page__muted">{{ EMPTY }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('AGENT_MODEL_TIMEOUT_COL', '超时')" width="90">
        <template #default="{ row }">{{ Math.round((row.timeoutMs || 0) / 1000) }} s</template>
      </el-table-column>
      <el-table-column :label="$t('AGENT_LIST_STATUS', '状态')" width="110">
        <template #default="{ row }">
          <el-switch
            :model-value="row.status === RecordStatus.ACTIVE"
            v-permission="'model_profile:edit'"
            @click.stop
            @change="(on: boolean) => toggle(row, on)"
          />
        </template>
      </el-table-column>
      <el-table-column width="70" fixed="right">
        <template #default="{ row }">
          <el-dropdown trigger="click" @command="(cmd: string) => onMenu(row, cmd)">
            <el-button link :icon="MoreFilled" @click.stop />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-permission="'model_profile:edit'" command="edit">{{ $t('G2_BTN_EDIT', '编辑') }}</el-dropdown-item>
                <el-dropdown-item v-permission="'model_profile:delete'" command="delete" divided>
                  <span class="model-profile-page__danger">{{ $t('G2_BTN_DELETE', '删除') }}</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty :image-size="72" :description="$t('AGENT_MODEL_PROFILE_EMPTY', '还没有私有模型，请新增模型')" />
      </template>
    </el-table>

    <div class="model-profile-page__pagination">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="search"
        @current-change="load"
      />
    </div>

    <!-- 新增 / 编辑抽屉 -->
    <el-drawer v-model="drawer.open" size="720px" :title="drawerTitle" destroy-on-close>
      <div class="model-profile-page__drawer">
        <div class="model-profile-page__main">
          <!-- 从广场选择 -->
          <template v-if="drawer.mode === 'market' || (drawer.mode === 'edit' && drawer.row?.resourceType === ResourceType.MARKET)">
            <template v-if="drawer.mode === 'market'">
              <h4>{{ $t('AGENT_MODEL_PICK', '① 选择模型') }}</h4>
              <el-radio-group v-model="pickType" size="small" class="model-profile-page__gap" @change="loadMarket">
                <el-radio-button value="">{{ $t('AGENT_FILTER_ALL', '全部') }}</el-radio-button>
                <el-radio-button :value="ModelType.LLM">{{ $t('AGENT_MODEL_TYPE_LLM', '大语言') }}</el-radio-button>
                <el-radio-button :value="ModelType.VECTOR">{{ $t('AGENT_MODEL_TYPE_VECTOR', '向量') }}</el-radio-button>
                <el-radio-button :value="ModelType.RERANK">{{ $t('AGENT_MODEL_TYPE_RERANK', '重排序') }}</el-radio-button>
              </el-radio-group>
              <el-input v-model="pickKeyword" clearable class="model-profile-page__gap" :placeholder="$t('AGENT_MODEL_SEARCH', '搜索模型名')" />
              <el-radio-group v-model="selectedCatalogId" class="model-profile-page__pick">
                <el-radio
                  v-for="item in filteredMarket"
                  :key="item.id"
                  :value="item.id"
                  :disabled="configuredIds.has(item.id)"
                  class="model-profile-page__pick-item"
                >
                  <span>{{ item.modelName }}</span>
                  <span class="model-profile-page__meta">{{ item.provider }} · {{ typeLabel(item.modelType) }}</span>
                  <el-tag v-if="configuredIds.has(item.id)" size="small" type="info">{{ $t('AGENT_MODEL_CONFIGURED', '已配置') }}</el-tag>
                </el-radio>
              </el-radio-group>
            </template>
            <template v-else>
              <el-descriptions :column="1" border class="model-profile-page__gap">
                <el-descriptions-item :label="$t('AGENT_MODEL_NAME', '模型')">{{ drawer.row?.modelName }}</el-descriptions-item>
                <el-descriptions-item :label="$t('AGENT_MODEL_PROVIDER', '供应商')">{{ drawer.row?.provider }} · {{ drawer.row?.protocol }}</el-descriptions-item>
              </el-descriptions>
            </template>
            <h4>{{ $t('AGENT_MODEL_PARAMS_SECTION', '② 参数') }}</h4>
            <ParamsForm
              v-model:temperature="params.temperature"
              v-model:top-p="params.topP"
              v-model:max-tokens="params.maxTokens"
              v-model:timeout-ms="params.timeoutMs"
              :model-type="currentModelType"
            />
          </template>

          <!-- 接入私有 / 编辑私有 -->
          <template v-else>
            <el-alert
              v-if="drawer.mode === 'custom'"
              type="warning"
              :closable="false"
              class="model-profile-page__gap"
              :title="$t('AGENT_MODEL_CUSTOM_PENDING', '接入私有模型需后端同事务保存目录与配置；当前仅可填写，保存已禁用')"
            />
            <h4>{{ $t('AGENT_MODEL_SECTION_MODEL', '模型') }}</h4>
            <el-form label-position="top" :disabled="drawer.mode === 'edit' && drawer.row?.resourceType === ResourceType.MARKET">
              <el-form-item :label="$t('AGENT_MODEL_NAME', '调用标识')">
                <el-input v-model="custom.modelName" :disabled="drawer.mode === 'edit' && drawer.row?.resourceType === ResourceType.MARKET" />
              </el-form-item>
              <el-form-item :label="$t('AGENT_MODEL_TYPE', '类型')">
                <el-select v-model="custom.modelType" style="width: 100%" :disabled="drawer.mode === 'edit' && drawer.row?.resourceType === ResourceType.MARKET">
                  <el-option :label="$t('AGENT_MODEL_TYPE_LLM', '大语言')" :value="ModelType.LLM" />
                  <el-option :label="$t('AGENT_MODEL_TYPE_VECTOR', '向量')" :value="ModelType.VECTOR" />
                  <el-option :label="$t('AGENT_MODEL_TYPE_RERANK', '重排序')" :value="ModelType.RERANK" />
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('AGENT_MODEL_PROVIDER', '供应商')">
                <el-input v-model="custom.provider" />
              </el-form-item>
              <h4>{{ $t('AGENT_MODEL_SECTION_CONN', '连接') }}</h4>
              <el-form-item :label="$t('AGENT_MODEL_PROTOCOL', '协议')">
                <el-select v-model="custom.protocol" style="width: 100%">
                  <el-option v-for="p in PROTOCOLS" :key="p" :label="p" :value="p" />
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('AGENT_MODEL_BASE_URL', '服务地址')">
                <el-input v-model="custom.baseUrl" />
              </el-form-item>
              <el-form-item :label="$t('AGENT_MODEL_API_KEY', '访问密钥')">
                <SecretInput v-model="custom.apiKey" :masked="drawer.mode === 'edit'" :masked-placeholder="$t('AGENT_MODEL_API_KEY_KEEP', '留空表示不修改')" />
              </el-form-item>
            </el-form>
            <h4>{{ $t('AGENT_MODEL_PARAMS_SECTION', '参数') }}</h4>
            <ParamsForm
              v-model:temperature="params.temperature"
              v-model:top-p="params.topP"
              v-model:max-tokens="params.maxTokens"
              v-model:timeout-ms="params.timeoutMs"
              :model-type="custom.modelType"
            />
          </template>
        </div>
        <aside v-if="drawer.mode === 'edit' && drawer.row" class="model-profile-page__side">
          <TryPanel :row="drawer.row" :model-type="drawer.row.modelType" />
        </aside>
      </div>
      <template #footer>
        <el-button @click="drawer.open = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
        <el-button
          type="primary"
          :loading="saving"
          :disabled="drawer.mode === 'custom'"
          :title="drawer.mode === 'custom' ? $t('AGENT_MODEL_CUSTOM_PENDING', '接入私有模型需后端同事务保存') : undefined"
          @click="saveDrawer"
        >
          {{ $t('G2_BTN_SAVE', '保存') }}
        </el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown, MoreFilled } from '@element-plus/icons-vue';
import { t } from '@platform/i18n';
import { SecretInput, showErrorMessage } from '@/components';
import {
  EMPTY,
  ModelProtocol,
  ModelType,
  RecordStatus,
  ResourceType,
  fill,
} from '@runtime/console';
import ParamsForm from './components/ParamsForm.vue';
import TryPanel from './components/TryPanel.vue';
import { ModelProfileApi } from './api';
import type { MarketCatalogOption, ModelProfileVo } from './type';

const PROTOCOLS = [ModelProtocol.OPENAI, ModelProtocol.ANTHROPIC, ModelProtocol.GEMINI];

const modelType = ref('');
const keyword = ref('');
const resourceType = ref('');
const status = ref('');
const rows = ref<ModelProfileVo[]>([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const saving = ref(false);

const drawer = reactive<{
  open: boolean;
  mode: 'market' | 'custom' | 'edit';
  row: ModelProfileVo | null;
}>({ open: false, mode: 'market', row: null });

const market = ref<MarketCatalogOption[]>([]);
const configuredIds = ref(new Set<number>());
const pickType = ref('');
const pickKeyword = ref('');
const selectedCatalogId = ref<number | null>(null);

const params = reactive({ temperature: 0, topP: 1, maxTokens: 4096, timeoutMs: 120000 });
const custom = reactive({
  modelName: '',
  modelType: ModelType.LLM as string,
  provider: '',
  protocol: ModelProtocol.OPENAI as string,
  baseUrl: '',
  apiKey: '',
});

const drawerTitle = computed(() => {
  if (drawer.mode === 'market') return t('AGENT_MODEL_FROM_MARKET', '从广场选择');
  if (drawer.mode === 'custom') return t('AGENT_MODEL_FROM_CUSTOM', '接入私有模型');
  return t('G2_BTN_EDIT', '编辑');
});

const filteredMarket = computed(() => {
  const word = pickKeyword.value.trim().toLowerCase();
  return market.value.filter((item) => {
    if (pickType.value && item.modelType !== pickType.value) return false;
    if (word && !item.modelName.toLowerCase().includes(word) && !item.provider.toLowerCase().includes(word)) return false;
    return true;
  });
});

const currentModelType = computed(() => {
  if (drawer.mode === 'edit' && drawer.row) return drawer.row.modelType;
  const picked = market.value.find((m) => m.id === selectedCatalogId.value);
  return picked?.modelType || ModelType.LLM;
});

function typeLabel(type: string): string {
  if (type === ModelType.VECTOR) return t('AGENT_MODEL_TYPE_VECTOR', '向量');
  if (type === ModelType.RERANK) return t('AGENT_MODEL_TYPE_RERANK', '重排序');
  return t('AGENT_MODEL_TYPE_LLM', '大语言');
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const page = await ModelProfileApi.page(
      {
        ...(modelType.value ? { modelType: modelType.value } : {}),
        ...(keyword.value ? { modelName: keyword.value } : {}),
        ...(resourceType.value ? { resourceType: resourceType.value } : {}),
        ...(status.value ? { status: status.value } : {}),
      },
      pageNum.value,
      pageSize.value,
    );
    rows.value = page.records;
    total.value = page.total;
    configuredIds.value = new Set(page.records.map((r) => r.catalogId));
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载失败'));
  } finally {
    loading.value = false;
  }
}

function search(): void {
  pageNum.value = 1;
  void load();
}

async function loadMarket(): Promise<void> {
  market.value = await ModelProfileApi.marketCatalogs();
}

async function openCreate(mode: 'market' | 'custom'): Promise<void> {
  drawer.mode = mode;
  drawer.row = null;
  selectedCatalogId.value = null;
  Object.assign(params, { temperature: 0, topP: 1, maxTokens: 4096, timeoutMs: 120000 });
  Object.assign(custom, {
    modelName: '',
    modelType: ModelType.LLM,
    provider: '',
    protocol: ModelProtocol.OPENAI,
    baseUrl: '',
    apiKey: '',
  });
  if (mode === 'market') await loadMarket();
  // 刷新已配置集合
  const page = await ModelProfileApi.page({}, 1, 200);
  configuredIds.value = new Set(page.records.map((r) => r.catalogId));
  drawer.open = true;
}

function openDetail(row: ModelProfileVo): void {
  drawer.mode = 'edit';
  drawer.row = row;
  Object.assign(params, {
    temperature: Number(row.temperature ?? 0),
    topP: Number(row.topP ?? 1),
    maxTokens: row.maxTokens ?? 4096,
    timeoutMs: row.timeoutMs || 120000,
  });
  Object.assign(custom, {
    modelName: row.modelName,
    modelType: row.modelType,
    provider: row.provider,
    protocol: row.protocol,
    baseUrl: row.baseUrl,
    apiKey: '',
  });
  drawer.open = true;
}

async function toggle(row: ModelProfileVo, on: boolean): Promise<void> {
  try {
    await ModelProfileApi.save({
      id: row.id,
      catalogId: row.catalogId,
      temperature: row.temperature,
      topP: row.topP,
      maxTokens: row.maxTokens,
      timeoutMs: row.timeoutMs,
      status: on ? RecordStatus.ACTIVE : RecordStatus.INACTIVE,
    });
    await load();
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败'));
  }
}

async function saveDrawer(): Promise<void> {
  if (drawer.mode === 'custom') return;
  saving.value = true;
  try {
    if (drawer.mode === 'market') {
      if (!selectedCatalogId.value) {
        ElMessage.warning(t('AGENT_MODEL_PICK_REQUIRED', '请选择广场模型'));
        return;
      }
      await ModelProfileApi.save({
        catalogId: selectedCatalogId.value,
        temperature: String(params.temperature),
        topP: String(params.topP),
        maxTokens: params.maxTokens,
        timeoutMs: params.timeoutMs,
        status: RecordStatus.ACTIVE,
      });
    } else if (drawer.row) {
      if (drawer.row.resourceType === ResourceType.CUSTOM) {
        await ModelProfileApi.saveCatalog({
          id: drawer.row.catalogId,
          modelName: custom.modelName,
          modelType: custom.modelType,
          provider: custom.provider,
          protocol: custom.protocol,
          baseUrl: custom.baseUrl,
          resourceType: ResourceType.CUSTOM,
          status: drawer.row.status,
          ...(custom.apiKey ? { apiKey: custom.apiKey } : {}),
        });
      }
      await ModelProfileApi.save({
        id: drawer.row.id,
        catalogId: drawer.row.catalogId,
        temperature: String(params.temperature),
        topP: String(params.topP),
        maxTokens: params.maxTokens,
        timeoutMs: params.timeoutMs,
        status: drawer.row.status,
      });
    }
    ElMessage.success(t('G2_MSG_SAVE_OK', '保存成功'));
    drawer.open = false;
    await load();
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败'));
  } finally {
    saving.value = false;
  }
}

async function onMenu(row: ModelProfileVo, cmd: string): Promise<void> {
  if (cmd === 'edit') {
    openDetail(row);
    return;
  }
  if (cmd === 'delete') {
    const tip =
      row.resourceType === ResourceType.CUSTOM
        ? t('AGENT_MODEL_DELETE_CUSTOM', '将删除配置；级联删除私有目录待后端')
        : fill(t('AGENT_MODEL_DELETE_CONFIRM', '确定删除「{name}」？'), { name: row.modelName });
    try {
      await ElMessageBox.confirm(tip, t('G2_LBL_TIP', '提示'), { type: 'warning' });
      await ModelProfileApi.remove(row.id);
      ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
      await load();
    } catch (error: unknown) {
      if (error === 'cancel' || error === 'close') return;
      showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_DELETE_FAIL', '删除失败'));
    }
  }
}

onMounted(load);
</script>

<style scoped>
.model-profile-page { padding: 16px 24px 24px; }
.model-profile-page__head { display: flex; justify-content: space-between; gap: 16px; }
.model-profile-page__head h2 { margin: 0; font-size: 18px; font-weight: 600; }
.model-profile-page__head p { margin: 4px 0 0; color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.model-profile-page__filters { display: flex; flex-wrap: wrap; gap: 12px; margin: 16px 0; }
.model-profile-page__name { font-weight: 500; }
.model-profile-page__meta { color: var(--g2-text-secondary); font-size: 12px; }
.model-profile-page__muted { color: var(--g2-text-placeholder); }
.model-profile-page__pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
.model-profile-page__danger { color: var(--el-color-danger); }
.model-profile-page__drawer { display: flex; gap: 16px; min-height: 420px; }
.model-profile-page__main { flex: 1; min-width: 0; }
.model-profile-page__side { width: 280px; flex: none; border-left: 1px solid var(--g2-border-color); padding-left: 16px; }
.model-profile-page__gap { margin-bottom: 12px; display: block; }
.model-profile-page__pick { display: flex; flex-direction: column; align-items: stretch; gap: 8px; max-height: 240px; overflow: auto; margin-bottom: 16px; }
.model-profile-page__pick-item { display: flex; align-items: center; gap: 8px; margin-right: 0 !important; height: auto; padding: 8px; border: 1px solid var(--g2-border-color); border-radius: 6px; }
.model-profile-page h4 { margin: 8px 0 12px; font-size: 13px; color: var(--g2-text-secondary); }
</style>
