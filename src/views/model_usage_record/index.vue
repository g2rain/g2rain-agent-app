<template>
  <div class="model_usage_record-page">
    <el-card class="model_usage_record-page__search" shadow="never">
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <el-form-item label="所属机构">
          <OrganSelect v-model="queryForm.organId" />
        </el-form-item>
        <el-form-item label="模型配置">
          <el-select
            v-model="queryForm.profileId"
            clearable
            filterable
            placeholder="请选择模型配置"
            style="width: 220px"
          >
            <el-option
              v-for="opt in profileOptions"
              :key="opt.id"
              :label="opt.label || opt.modelName || String(opt.id)"
              :value="opt.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="模型名称">
          <el-input v-model="queryForm.modelName" placeholder="请输入模型名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="queryForm.provider" placeholder="请输入供应商" clearable style="width: 160px" />
        </el-form-item>
        <template #actions>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t('G2_BTN_QUERY', '查询') }}</el-button>
            <el-button @click="handleReset">{{ $t('G2_BTN_RESET', '重置') }}</el-button>
          </el-form-item>
        </template>
      </QueryForm>
    </el-card>

    <div class="model_usage_record-page__header">
      <div class="model_usage_record-page__title-group">
        <h2>用量统计</h2>
      </div>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="100" />
      <el-table-column prop="organId" label="所属机构" width="110" />
      <TableColumn prop="createTime" label="时间" width="180" sortable="custom" />
      <el-table-column prop="modelName" label="模型" min-width="160" />
      <el-table-column prop="provider" label="供应商" width="120" />
      <el-table-column prop="protocol" label="协议" width="110">
        <template #default="{ row }">{{ optionLabel(PROTOCOL_OPTIONS, row.protocol) }}</template>
      </el-table-column>
      <el-table-column prop="promptTokens" label="输入" width="100" />
      <el-table-column prop="completionTokens" label="输出" width="100" />
      <el-table-column prop="totalTokens" label="合计" width="100" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="100">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '详情') }}</el-button>
        </template>
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>{{ $t('G2_FIELD_ACTION', '操作') }}</span>
            <SortManagerButton />
          </div>
        </template>
      </el-table-column>
    </SortableTable>

    <div class="model_usage_record-page__pagination">
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

    <el-dialog v-model="detailDialogVisible" title="用量明细" width="520px">
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('G2_FIELD_ID', 'ID')">{{ currentRow?.id }}</el-descriptions-item>
        <el-descriptions-item label="所属机构">{{ currentRow?.organId }}</el-descriptions-item>
        <el-descriptions-item label="时间">{{ currentRow?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="模型">{{ currentRow?.modelName }}</el-descriptions-item>
        <el-descriptions-item label="供应商">{{ currentRow?.provider }}</el-descriptions-item>
        <el-descriptions-item label="协议">{{ optionLabel(PROTOCOL_OPTIONS, currentRow?.protocol) }}</el-descriptions-item>
        <el-descriptions-item label="输入 tokens">{{ currentRow?.promptTokens }}</el-descriptions-item>
        <el-descriptions-item label="输出 tokens">{{ currentRow?.completionTokens }}</el-descriptions-item>
        <el-descriptions-item label="合计 tokens">{{ currentRow?.totalTokens }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="detailDialogVisible = false">{{ $t('G2_BTN_CLOSE', '关闭') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { t } from '@platform/i18n';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';
import { QueryForm, SortableTable, TableColumn, SortManagerButton } from '@g2rain/ui';
import { OrganSelect } from '@g2rain/ui/platform';
import { showErrorMessage } from '@/components';
import { ModelUsageRecordApi } from './api';
import type { ModelUsageProfileOption, ModelUsageRecord, ModelUsageRecordQuery } from './type';

type EnumOption = { value: string; label: string };

const PROTOCOL_OPTIONS: EnumOption[] = [
  { value: 'OPENAI', label: 'OpenAI' },
  { value: 'ANTHROPIC', label: 'Anthropic' },
  { value: 'GEMINI', label: 'Gemini' },
];

const optionLabel = (options: EnumOption[], value?: string | null): string => {
  if (!value) return '';
  return options.find((item) => item.value === value)?.label ?? value;
};

const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);

const baseQueryForm = ref<BaseSelectListDto>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});

const queryForm = reactive({
  organId: undefined as number | null | undefined,
  profileId: undefined as number | undefined,
  modelName: '',
  provider: '',
});

const pagination = reactive({ pageNum: 1, pageSize: 10, total: 0 });
const tableData = ref<ModelUsageRecord[]>([]);
const profileOptions = ref<ModelUsageProfileOption[]>([]);
const currentRow = ref<ModelUsageRecord | null>(null);
const detailDialogVisible = ref(false);

const loadData = async () => {
  try {
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm }).filter(([_, v]) => (v ?? '') !== '' && [v].flat().length),
    ) as ModelUsageRecordQuery;
    const pageData = await ModelUsageRecordApi.page({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & ModelUsageRecordQuery);
    tableData.value = pageData.records;
    pagination.total = pageData.total;
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载列表失败'));
  }
};

const handleSortChange = (params: Record<string, string>) => {
  queryFormRef.value?.updateSorts(params);
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
  queryForm.profileId = undefined;
  queryForm.modelName = '';
  queryForm.provider = '';
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

const handleView = (row: ModelUsageRecord) => {
  currentRow.value = { ...row };
  detailDialogVisible.value = true;
};

onMounted(async () => {
  profileOptions.value = await ModelUsageRecordApi.options().catch(() => []);
  void loadData();
});
</script>

<style scoped>
.model_usage_record-page {
  padding: 20px;
  background-color: var(--g2-bg-page);
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.model_usage_record-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: var(--g2-bg-container);
  border-radius: 4px;
}

.model_usage_record-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.model_usage_record-page__header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.model_usage_record-page__search {
  margin-bottom: 12px;
  background-color: var(--g2-bg-container);
}

.model_usage_record-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
