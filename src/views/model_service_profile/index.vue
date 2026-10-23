
<template>
  <div class="model_service_profile-page">
    <el-card class="model_service_profile-page__search" shadow="never">
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <el-form-item label="所属机构">
          <OrganSelect v-model="queryForm.organId" />
        </el-form-item>
        <el-form-item label="模型名称">
          <el-input v-model="queryForm.modelName" placeholder="请输入模型名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="模型类型">
          <el-select v-model="queryForm.modelType" placeholder="请选择模型类型" clearable style="width: 200px">
            <el-option v-for="item in MODEL_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源">
          <el-select v-model="queryForm.resourceType" placeholder="请选择来源" clearable style="width: 160px">
            <el-option v-for="item in RESOURCE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择状态" clearable style="width: 160px">
            <el-option v-for="item in STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <template #actions>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t('G2_BTN_QUERY', '查询') }}</el-button>
            <el-button @click="handleReset">{{ $t('G2_BTN_RESET', '重置') }}</el-button>
          </el-form-item>
        </template>
      </QueryForm>
    </el-card>

    <div class="model_service_profile-page__header">
      <div class="model_service_profile-page__title-group">
        <h2>模型配置</h2>
      </div>
      <div class="model_service_profile-page__actions">
        <el-button type="primary" v-permission="'model_service_profile:add'" @click="openCreate('market')">模型广场</el-button>
        <el-button v-permission="'model_service_profile:add'" @click="openCreate('custom')">私有模型</el-button>
      </div>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="100" />
      <el-table-column prop="organId" label="所属机构" width="110" />
      <el-table-column label="模型" min-width="280">
        <template #default="{ row }">
          <div>
            {{ row.displayName }}
            <el-tag v-if="row.defaultFlag" size="small" type="success" effect="plain">默认</el-tag>
          </div>
          <div class="model_service_profile-page__meta">{{ row.modelName }} · {{ row.provider }} · {{ optionLabel(PROTOCOL_OPTIONS, row.protocol) }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="resourceType" label="来源" width="110">
        <template #default="{ row }">
          <el-tag size="small" effect="plain" :type="row.resourceType === 'MARKET' ? 'info' : 'primary'">
            {{ optionLabel(RESOURCE_OPTIONS, row.resourceType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="modelType" label="类型" width="120">
        <template #default="{ row }">{{ optionLabel(MODEL_TYPE_OPTIONS, row.modelType) }}</template>
      </el-table-column>
      <el-table-column prop="selectable" label="对话可选" width="100">
        <template #default="{ row }">{{ row.selectable ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <StatusSwitch
            v-model="row.status"
            v-permission="'model_service_profile:status_update'"
            active-value="ACTIVE"
            inactive-value="INACTIVE"
            :options="STATUS_OPTIONS"
            :api-method="changeStatus(row)"
            @success="notifyStatusSwitchSuccess"
            @error="(p) => notifyStatusSwitchError(p)"
          />
        </template>
      </el-table-column>
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" sortable="custom" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" sortable="custom" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="260">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '详情') }}</el-button>
          <el-button type="primary" v-permission="'model_service_profile:edit'" link size="small" @click="openEdit(row)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
          <el-button v-if="!row.defaultFlag" type="primary" v-permission="'model_service_profile:default_update'" link size="small" @click="handleDefault(row)">设为默认</el-button>
          <el-button type="danger" v-permission="'model_service_profile:delete'" link size="small" @click="handleDelete(row)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
        </template>
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>{{ $t('G2_FIELD_ACTION', '操作') }}</span>
            <SortManagerButton />
          </div>
        </template>
      </el-table-column>
    </SortableTable>

    <div class="model_service_profile-page__pagination">
      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 从广场选择 / 编辑广场来源：先选模型，再配参数 -->
    <el-drawer
      v-model="marketDialogVisible"
      :title="marketDrawerTitle"
      size="720px"
      destroy-on-close
    >
      <div class="model_service_profile-page__drawer">
        <!-- 步骤一：只选模型 -->
        <template v-if="!isEdit && marketStep === 'pick'">
          <div class="model_service_profile-page__pick-bar">
            <el-select
              v-model="pickType"
              clearable
              placeholder="模型类型"
              class="model_service_profile-page__pick-type"
              @change="onPickFilterChange"
            >
              <el-option
                v-for="item in MODEL_TYPE_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-input
              v-model="pickKeyword"
              clearable
              class="model_service_profile-page__pick-search"
              placeholder="搜索模型名"
              @change="onPickFilterChange"
              @clear="onPickFilterChange"
            />
          </div>
          <el-radio-group
            v-model="selectedCatalogId"
            v-loading="pickLoading"
            class="model_service_profile-page__pick"
            @change="onPickSelect"
          >
            <el-radio
              v-for="item in market"
              :key="item.id"
              :value="item.id"
              :disabled="configuredIds.has(item.id)"
              class="model_service_profile-page__pick-item"
            >
              <div class="model_service_profile-page__pick-main">
                <span>{{ item.modelName }}</span>
                <span class="model_service_profile-page__meta">
                  {{ item.provider }} · {{ optionLabel(MODEL_TYPE_OPTIONS, item.modelType) }}
                </span>
              </div>
              <el-tag
                size="small"
                :type="configuredIds.has(item.id) ? 'info' : 'success'"
                effect="plain"
                class="model_service_profile-page__pick-status"
              >
                {{ configuredIds.has(item.id) ? '已配置' : '未配置' }}
              </el-tag>
            </el-radio>
          </el-radio-group>
          <div class="model_service_profile-page__pick-pager">
            <el-pagination
              v-model:current-page="pickPagination.pageNum"
              v-model:page-size="pickPagination.pageSize"
              :total="pickPagination.total"
              layout="total, prev, pager, next"
              small
              @current-change="loadMarketPage"
              @size-change="onPickPageSizeChange"
            />
          </div>
        </template>

        <!-- 步骤二 / 编辑：已选模型摘要 + 参数（一屏看完） -->
        <template v-else>
          <div class="model_service_profile-page__picked">
            <div>
              <div class="model_service_profile-page__picked-name">
                {{ isEdit ? editRow?.modelName : selectedMarket?.modelName }}
              </div>
              <div class="model_service_profile-page__meta">
                <template v-if="isEdit">
                  {{ optionLabel(RESOURCE_OPTIONS, editRow?.resourceType) }}
                  · {{ optionLabel(MODEL_TYPE_OPTIONS, editRow?.modelType) }}
                </template>
                <template v-else>
                  {{ selectedMarket?.provider }}
                  · {{ optionLabel(MODEL_TYPE_OPTIONS, selectedMarket?.modelType) }}
                </template>
              </div>
            </div>
            <el-button v-if="!isEdit" link type="primary" @click="marketStep = 'pick'">重选</el-button>
          </div>
          <el-form label-width="140px">
            <el-form-item v-if="!isEdit || formOrganId != null" label="所属机构" required>
              <OrganSelect v-model="formOrganId" :disabled="isEdit" width="100%" />
            </el-form-item>
            <el-form-item label="展示名称" required>
              <el-input v-model="profile.displayName" maxlength="64" placeholder="对话中展示的名称" />
            </el-form-item>
            <el-form-item v-if="currentModelType === 'LLM'" label="对话可选">
              <el-switch v-model="profile.selectable" />
            </el-form-item>
            <h4>参数</h4>
            <ParamsForm
              v-model:temperature="params.temperature"
              v-model:top-p="params.topP"
              v-model:max-tokens="params.maxTokens"
              v-model:timeout-ms="params.timeoutMs"
              :model-type="currentModelType"
            />
          </el-form>
        </template>
      </div>
      <template #footer>
        <el-button @click="marketDialogVisible = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
        <el-button v-if="!isEdit && marketStep === 'params'" @click="marketStep = 'pick'">上一步</el-button>
        <el-button
          v-if="!isEdit && marketStep === 'pick'"
          type="primary"
          :disabled="!selectedCatalogId || configuredIds.has(Number(selectedCatalogId))"
          @click="goMarketParams"
        >
          下一步
        </el-button>
        <el-button
          v-else
          type="primary"
          :loading="saving"
          @click="submitMarket"
        >
          {{ $t('G2_BTN_SAVE', '保存') }}
        </el-button>
      </template>
    </el-drawer>

    <!-- 私有模型 -->
    <el-drawer
      v-model="customDialogVisible"
      :title="isEdit ? '编辑私有模型' : '接入私有模型'"
      size="720px"
      destroy-on-close
    >
      <div class="model_service_profile-page__drawer">
        <el-form ref="customFormRef" :model="custom" :rules="customRules" label-width="100px">
          <el-form-item v-if="!isEdit || formOrganId != null" label="所属机构" required>
            <OrganSelect v-model="formOrganId" :disabled="isEdit" width="100%" />
          </el-form-item>
          <h4>模型</h4>
          <el-form-item label="模型名称" prop="modelName">
            <el-input v-model="custom.modelName" placeholder="请输入模型名称" />
          </el-form-item>
          <el-form-item label="展示名称" prop="displayName">
            <el-input v-model="profile.displayName" maxlength="64" placeholder="对话中展示的名称" />
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="模型类型" prop="modelType">
                <el-select v-model="custom.modelType" style="width: 100%">
                  <el-option v-for="item in MODEL_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="供应商" prop="provider">
                <el-input v-model="custom.provider" placeholder="请输入供应商" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item v-if="custom.modelType === 'LLM'" label="对话可选">
            <el-switch v-model="profile.selectable" />
          </el-form-item>
          <h4>连接</h4>
          <el-form-item label="协议" prop="protocol">
            <el-select v-model="custom.protocol" style="width: 100%">
              <el-option v-for="item in PROTOCOL_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="服务地址" prop="baseUrl">
            <el-input v-model="custom.baseUrl" placeholder="请输入服务地址" />
          </el-form-item>
          <el-form-item label="访问密钥" prop="apiKey">
            <el-input
              v-model="custom.apiKey"
              type="password"
              show-password
              :placeholder="isEdit && custom.apiKeyConfigured ? '已配置，留空表示不修改' : '请输入访问密钥'"
            />
          </el-form-item>
          <el-form-item label="说明" prop="description">
            <el-input v-model="custom.description" type="textarea" :rows="1" placeholder="请输入说明" />
          </el-form-item>
          <h4>参数</h4>
          <ParamsForm
            v-model:temperature="params.temperature"
            v-model:top-p="params.topP"
            v-model:max-tokens="params.maxTokens"
            v-model:timeout-ms="params.timeoutMs"
            :model-type="custom.modelType"
          />
        </el-form>
      </div>
      <template #footer>
        <el-button @click="customDialogVisible = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
        <el-button type="primary" :loading="saving" @click="submitCustom">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
      </template>
    </el-drawer>

    <el-dialog v-model="detailDialogVisible" title="模型配置明细" width="560px">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('G2_FIELD_ID', 'ID')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="所属机构">{{ currentRow?.organId }}</el-descriptions-item>
        <el-descriptions-item label="展示名称">{{ currentRow?.displayName }}</el-descriptions-item>
        <el-descriptions-item label="模型名称">{{ currentRow?.modelName }}</el-descriptions-item>
        <el-descriptions-item label="对话可选">{{ currentRow?.selectable ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="默认">{{ currentRow?.defaultFlag ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="来源">{{ optionLabel(RESOURCE_OPTIONS, currentRow?.resourceType) }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ optionLabel(MODEL_TYPE_OPTIONS, currentRow?.modelType) }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ currentRow?.provider }}</el-descriptions-item>
        <el-descriptions-item label="协议">{{ optionLabel(PROTOCOL_OPTIONS, currentRow?.protocol) }}</el-descriptions-item>
        <el-descriptions-item label="服务地址">{{ currentRow?.baseUrl }}</el-descriptions-item>
        <el-descriptions-item label="访问密钥">{{ currentRow?.apiKeyConfigured ? '已配置' : '未配置' }}</el-descriptions-item>
        <el-descriptions-item label="采样温度">{{ currentRow?.temperature ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="Top P">{{ currentRow?.topP ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="最大 Token">{{ currentRow?.maxTokens ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="超时">{{ Math.round((currentRow?.timeoutMs || 0) / 1000) }} s</el-descriptions-item>
        <el-descriptions-item label="状态">{{ optionLabel(STATUS_OPTIONS, currentRow?.status) }}</el-descriptions-item>
        <el-descriptions-item label="说明">{{ currentRow?.description }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="detailDialogVisible = false">{{ $t('G2_BTN_CLOSE', '关闭') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
import { t } from '@platform/i18n';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';
import { SortableTable, TableColumn, SortManagerButton, QueryForm } from '@g2rain/ui';
import { OrganSelect, StatusSwitch } from '@g2rain/ui/platform';
import { showErrorMessage, notifyStatusSwitchSuccess, notifyStatusSwitchError } from '@/components';
import ParamsForm from './components/ParamsForm.vue';
import { ModelServiceProfileApi } from './api';
import type {
  MarketCatalogOption,
  ModelServiceProfile,
  ModelServiceProfilePayload,
  ModelServiceProfileQuery,
} from './type';

type EnumOption = { value: string; label: string };

const MODEL_TYPE_OPTIONS: EnumOption[] = [
  { value: 'LLM', label: '大语言模型' },
  { value: 'VECTOR', label: '向量模型' },
  { value: 'RERANK', label: '重排序模型' },
];

const PROTOCOL_OPTIONS: EnumOption[] = [
  { value: 'OPENAI', label: 'OpenAI' },
  { value: 'ANTHROPIC', label: 'Anthropic' },
  { value: 'GEMINI', label: 'Gemini' },
];

const STATUS_OPTIONS: EnumOption[] = [
  { value: 'ACTIVE', label: '启用' },
  { value: 'INACTIVE', label: '禁用' },
];

const RESOURCE_OPTIONS: EnumOption[] = [
  { value: 'MARKET', label: '模型广场' },
  { value: 'CUSTOM', label: '私有模型' },
];

const optionLabel = (options: EnumOption[], value?: string | null): string => {
  if (!value) return '';
  return options.find((item) => item.value === value)?.label ?? value;
};

const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);
const customFormRef = ref<FormInstance | null>(null);

const baseQueryForm = ref<BaseSelectListDto>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});

const queryForm = reactive({
  organId: undefined as number | null | undefined,
  modelName: '',
  modelType: '',
  resourceType: '',
  status: '',
});

/** 新增/编辑抽屉的机构（编辑时只读展示） */
const formOrganId = ref<number | null | undefined>(undefined);

const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 });
const tableData = ref<ModelServiceProfile[]>([]);

const marketDialogVisible = ref(false);
const customDialogVisible = ref(false);
const detailDialogVisible = ref(false);
const isEdit = ref(false);
const saving = ref(false);
const currentRow = ref<ModelServiceProfile | null>(null);
const editRow = ref<ModelServiceProfile | null>(null);

const market = ref<MarketCatalogOption[]>([]);
const configuredIds = ref(new Set<number>());
const pickType = ref('');
const pickKeyword = ref('');
const selectedCatalogId = ref<number | undefined>(undefined);
const selectedMarket = ref<MarketCatalogOption | null>(null);
const marketStep = ref<'pick' | 'params'>('pick');
const pickPagination = reactive({ pageNum: 1, pageSize: 7, total: 0 });
const pickLoading = ref(false);

const marketDrawerTitle = computed(() => {
  if (isEdit.value) return '编辑模型配置';
  return marketStep.value === 'pick' ? '选择广场模型' : '配置参数';
});

const params = reactive({ temperature: 0, topP: 1, maxTokens: 4096, timeoutMs: 120000 });
/** 广场 / 私有共用的展示字段 */
const profile = reactive({ displayName: '', selectable: true });
const custom = reactive({
  catalogId: undefined as number | undefined,
  modelName: '',
  modelType: 'LLM',
  provider: '',
  protocol: 'OPENAI',
  baseUrl: '',
  apiKey: '',
  apiKeyConfigured: false,
  description: '',
});

const customRules: FormRules = {
  modelName: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  displayName: [
    {
      required: true,
      trigger: 'blur',
      validator: (_rule, _value, callback) =>
        profile.displayName.trim() ? callback() : callback(new Error('请输入展示名称')),
    },
  ],
  modelType: [{ required: true, message: '请选择模型类型', trigger: 'change' }],
  provider: [{ required: true, message: '请输入供应商', trigger: 'blur' }],
  protocol: [{ required: true, message: '请选择协议', trigger: 'change' }],
  baseUrl: [{ required: true, message: '请输入服务地址', trigger: 'blur' }],
};

const currentModelType = computed(() => {
  if (isEdit.value && editRow.value) return editRow.value.modelType || 'LLM';
  return selectedMarket.value?.modelType || 'LLM';
});

const loadConfiguredIds = async () => {
  const page = await ModelServiceProfileApi.page({
    pageNum: 1,
    pageSize: 500,
  } as PageSelectListDto & ModelServiceProfileQuery);
  configuredIds.value = new Set(page.records.map((r) => r.catalogId));
};

const loadMarketPage = async () => {
  pickLoading.value = true;
  try {
    const pageData = await ModelServiceProfileApi.marketCatalogPage({
      pageNum: pickPagination.pageNum,
      pageSize: pickPagination.pageSize,
      modelType: pickType.value || undefined,
      modelName: pickKeyword.value.trim() || undefined,
    });
    market.value = pageData.records || [];
    pickPagination.total = pageData.total || 0;
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载列表失败'));
  } finally {
    pickLoading.value = false;
  }
};

const onPickFilterChange = () => {
  pickPagination.pageNum = 1;
  void loadMarketPage();
};

const onPickPageSizeChange = () => {
  pickPagination.pageNum = 1;
  void loadMarketPage();
};

const onPickSelect = (id: number | string | undefined) => {
  const catalogId = typeof id === 'number' ? id : Number(id);
  selectedMarket.value = market.value.find((item) => item.id === catalogId) || null;
};

const goMarketParams = () => {
  if (!selectedCatalogId.value || !selectedMarket.value) {
    ElMessage.warning('请先选择广场模型');
    return;
  }
  if (configuredIds.value.has(selectedCatalogId.value)) {
    ElMessage.warning('该模型已配置');
    return;
  }
  if (!profile.displayName.trim()) profile.displayName = selectedMarket.value.modelName;
  marketStep.value = 'params';
};

const loadData = async () => {
  try {
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm }).filter(([_, v]) => (v ?? '') !== '' && [v].flat().length),
    ) as ModelServiceProfileQuery;
    const pageData = await ModelServiceProfileApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & ModelServiceProfileQuery);
    tableData.value = pageData.records;
    pagination.total = pageData.total;
    configuredIds.value = new Set(pageData.records.map((r) => r.catalogId));
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载列表失败'));
  }
};

const handleSortChange = (paramsMap: Record<string, string>) => {
  queryFormRef.value?.updateSorts(paramsMap);
};

const handleSearch = () => {
  pagination.pageNum = 1;
  void loadData();
};

const handleReset = () => {
  baseQueryForm.value.id = undefined;
  baseQueryForm.value.createTime = undefined;
  baseQueryForm.value.updateTime = undefined;
  baseQueryForm.value.sorts = undefined;
  queryForm.organId = undefined;
  queryForm.modelName = '';
  queryForm.modelType = '';
  queryForm.resourceType = '';
  queryForm.status = '';
  pagination.pageNum = 1;
  void loadData();
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.pageNum = 1;
  void loadData();
};

const handlePageChange = (page: number) => {
  pagination.pageNum = page;
  void loadData();
};

const resetParams = () => {
  Object.assign(params, { temperature: 0, topP: 1, maxTokens: 4096, timeoutMs: 120000 });
};

const openCreate = async (mode: 'market' | 'custom') => {
  isEdit.value = false;
  editRow.value = null;
  formOrganId.value = undefined;
  resetParams();
  Object.assign(profile, { displayName: '', selectable: true });
  if (mode === 'market') {
    selectedCatalogId.value = undefined;
    selectedMarket.value = null;
    marketStep.value = 'pick';
    pickType.value = '';
    pickKeyword.value = '';
    pickPagination.pageNum = 1;
    pickPagination.pageSize = 7;
    try {
      await loadConfiguredIds();
      await loadMarketPage();
      marketDialogVisible.value = true;
    } catch (error: unknown) {
      showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载列表失败'));
    }
  } else {
    Object.assign(custom, {
      catalogId: undefined,
      modelName: '',
      modelType: 'LLM',
      provider: '',
      protocol: 'OPENAI',
      baseUrl: '',
      apiKey: '',
      apiKeyConfigured: false,
      description: '',
    });
    customDialogVisible.value = true;
  }
};

const openEdit = (row: ModelServiceProfile) => {
  isEdit.value = true;
  editRow.value = row;
  formOrganId.value = row.organId ?? undefined;
  Object.assign(profile, { displayName: row.displayName || '', selectable: row.selectable !== false });
  Object.assign(params, {
    temperature: Number(row.temperature ?? 0),
    topP: Number(row.topP ?? 1),
    maxTokens: row.maxTokens ?? 4096,
    timeoutMs: row.timeoutMs || 120000,
  });
  if (row.resourceType === 'CUSTOM') {
    Object.assign(custom, {
      catalogId: row.catalogId,
      modelName: row.modelName || '',
      modelType: row.modelType || 'LLM',
      provider: row.provider || '',
      protocol: row.protocol || 'OPENAI',
      baseUrl: row.baseUrl || '',
      apiKey: '',
      apiKeyConfigured: !!row.apiKeyConfigured,
      description: row.description || '',
    });
    customDialogVisible.value = true;
  } else {
    marketStep.value = 'params';
    marketDialogVisible.value = true;
  }
};

const handleView = (row: ModelServiceProfile) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

const handleDelete = (row: ModelServiceProfile) => {
  const tip =
    row.resourceType === 'CUSTOM'
      ? `确认删除私有模型「${row.modelName || row.id}」？将同时删除对应目录。`
      : `确认删除配置「${row.modelName || row.id}」吗？`;
  ElMessageBox.confirm(tip, t('G2_LBL_TIP', '提示'), { type: 'warning' })
    .then(async () => {
      try {
        await ModelServiceProfileApi.remove(row.id);
        if (tableData.value.length === 1 && pagination.pageNum > 1) pagination.pageNum--;
        await loadData();
        ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
      } catch (error: unknown) {
        showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_DELETE_FAIL', '删除失败'));
      }
    })
    .catch(() => {});
};

const changeStatus = (row: ModelServiceProfile) =>
  ({ nextValue }: { nextValue: string | number | boolean }) =>
    ModelServiceProfileApi.updateStatus(row.id, String(nextValue));

const handleDefault = (row: ModelServiceProfile) => {
  ElMessageBox.confirm(
    `确认将「${row.displayName || row.id}」设为默认？同类型原默认将被替换。`,
    t('G2_LBL_TIP', '提示'),
    { type: 'warning' },
  )
    .then(async () => {
      try {
        await ModelServiceProfileApi.updateDefault(row.id);
        await loadData();
        ElMessage.success(t('G2_MSG_SAVE_OK', '保存成功'));
      } catch (error: unknown) {
        showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败'));
      }
    })
    .catch(() => {});
};

const submitMarket = async () => {
  const displayName = profile.displayName.trim();
  if (!displayName) {
    ElMessage.warning('请输入展示名称');
    return;
  }
  saving.value = true;
  try {
    if (isEdit.value && editRow.value) {
      await ModelServiceProfileApi.save({
        id: editRow.value.id,
        catalogId: editRow.value.catalogId,
        displayName,
        selectable: profile.selectable,
        temperature: params.temperature,
        topP: params.topP,
        maxTokens: params.maxTokens,
        timeoutMs: params.timeoutMs,
      });
    } else {
      if (!selectedCatalogId.value) {
        ElMessage.warning('请选择广场模型');
        return;
      }
      if (formOrganId.value == null) {
        ElMessage.warning('请选择所属机构');
        return;
      }
      await ModelServiceProfileApi.save({
        organId: formOrganId.value,
        catalogId: selectedCatalogId.value,
        displayName,
        selectable: profile.selectable,
        temperature: params.temperature,
        topP: params.topP,
        maxTokens: params.maxTokens,
        timeoutMs: params.timeoutMs,
      });
    }
    ElMessage.success(t('G2_MSG_SAVE_OK', '保存成功'));
    marketDialogVisible.value = false;
    await loadData();
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败'));
  } finally {
    saving.value = false;
  }
};

const submitCustom = async () => {
  if (!customFormRef.value) return;
  const valid = await customFormRef.value.validate().catch(() => false);
  if (!valid) return;
  if (!isEdit.value && formOrganId.value == null) {
    ElMessage.warning('请选择所属机构');
    return;
  }

  saving.value = true;
  try {
    const payload: ModelServiceProfilePayload = {
      organId: formOrganId.value ?? undefined,
      displayName: profile.displayName.trim(),
      selectable: profile.selectable,
      modelName: custom.modelName,
      modelType: custom.modelType,
      provider: custom.provider,
      protocol: custom.protocol,
      baseUrl: custom.baseUrl,
      description: custom.description,
      temperature: params.temperature,
      topP: params.topP,
      maxTokens: params.maxTokens,
      timeoutMs: params.timeoutMs,
    };
    if (custom.apiKey.trim()) payload.apiKey = custom.apiKey.trim();
    if (isEdit.value && editRow.value) {
      payload.id = editRow.value.id;
      payload.catalogId = custom.catalogId;
    }
    await ModelServiceProfileApi.save(payload);
    ElMessage.success(t('G2_MSG_SAVE_OK', '保存成功'));
    customDialogVisible.value = false;
    await loadData();
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败'));
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  void loadData();
});
</script>

<style scoped>
.model_service_profile-page {
  padding: 20px;
  background-color: var(--g2-bg-page);
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.model_service_profile-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: var(--g2-bg-container);
  border-radius: 4px;
}

.model_service_profile-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.model_service_profile-page__header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.model_service_profile-page__actions {
  display: flex;
  gap: 8px;
}

.model_service_profile-page__search {
  margin-bottom: 12px;
  background-color: var(--g2-bg-container);
}

.model_service_profile-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.model_service_profile-page__meta {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.model_service_profile-page__drawer h4 {
  margin: 8px 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.model_service_profile-page__gap {
  margin-bottom: 12px;
  display: block;
}

.model_service_profile-page__pick-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  min-width: 0;
}

.model_service_profile-page__pick-type {
  width: 140px;
  flex: none;
}

.model_service_profile-page__pick-search {
  flex: 1;
  min-width: 0;
}

.model_service_profile-page__pick {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  margin-bottom: 8px;
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
}

.model_service_profile-page__pick-item {
  display: flex;
  align-items: flex-start;
  width: 100%;
  margin-right: 0 !important;
  height: auto !important;
  min-height: 56px;
  padding: 10px 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  box-sizing: border-box;
  background: var(--el-bg-color);
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
  white-space: normal;
}

.model_service_profile-page__pick-item:hover {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}

.model_service_profile-page__pick-item.is-checked {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.model_service_profile-page__pick-item.is-disabled {
  cursor: not-allowed;
  background: var(--el-fill-color-light);
  border-color: var(--el-border-color-lighter);
  opacity: 0.65;
}

.model_service_profile-page__pick-item.is-disabled:hover {
  border-color: var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
}

.model_service_profile-page__pick-item :deep(.el-radio__input) {
  margin-top: 4px;
}

.model_service_profile-page__pick-item :deep(.el-radio__label) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex: 1;
  min-width: 0;
  padding-left: 8px;
  white-space: normal;
  line-height: 1.4;
}

.model_service_profile-page__pick-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  overflow: hidden;
}

.model_service_profile-page__pick-status {
  flex: none;
  margin-left: auto;
}

.model_service_profile-page__pick-pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.model_service_profile-page__picked {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: var(--el-fill-color-blank);
}

.model_service_profile-page__picked-name {
  font-weight: 600;
  margin-bottom: 4px;
}
</style>
