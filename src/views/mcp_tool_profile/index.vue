
<template>
  <div class="mcp_tool_profile-page">
    <!-- 查询表单 -->
    <el-card class="mcp_tool_profile-page__search" shadow="never">
      <!-- 基础查询表单（BaseSelectListDto） -->
      <QueryForm ref="queryFormRef" v-model="baseQueryForm" @search="handleSearch">
        <!-- 业务特定查询字段 -->
        <el-form-item label="机构ID">
          <el-input v-model="queryForm.organId" placeholder="请输入机构ID" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="Tool名称">
          <el-input v-model="queryForm.name" placeholder="请输入Tool名称" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="所属服务编码">
          <el-input v-model="queryForm.serviceCode" placeholder="请输入所属服务编码" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择状态" clearable style="width: 200px">
            <el-option v-for="item in STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <!-- 操作按钮 -->
        <template #actions>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t('G2_BTN_QUERY', '查询') }}</el-button>
            <el-button @click="handleReset">{{ $t('G2_BTN_RESET', '重置') }}</el-button>
          </el-form-item>
        </template>
      </QueryForm>
    </el-card>

    <!-- 标题和操作按钮 -->
    <div class="mcp_tool_profile-page__header">
      <div class="mcp_tool_profile-page__title-group">
        <h2>{{ pageTitle }}</h2>
      </div>
      <div>
        <el-button
          v-if="resourceType === ResourceType.BUILT_IN"
          v-permission="'mcp_tool:sync'"
          @click="syncOpen = true"
        >
          {{ $t('AGENT_MCP_TOOL_SYNC', '同步平台接口') }}
        </el-button>
        <el-button
          v-else
          v-permission="'mcp_tool_profile:import'"
          @click="importOpen = true"
        >
          {{ $t('AGENT_MCP_SERVICE_IMPORT', '导入接口') }}
        </el-button>
        <el-button type="primary" v-permission="'mcp_tool_profile:add'" @click="openCreate">
          新增工具
        </el-button>
      </div>
    </div>

    <SortableTable :data="tableData" border stripe style="width: 100%" :enable-multi-sort="true" @sort-change="handleSortChange">
      <el-table-column prop="id" :label="$t('G2_FIELD_ID', 'ID')" width="120" />
      <el-table-column prop="organId" label="机构ID" width="140" />
      <el-table-column prop="name" label="Tool名称" width="180" />
      <el-table-column prop="title" label="Tool标题" width="180" />
      <el-table-column prop="serviceCode" label="所属服务编码" width="180" />
      <el-table-column prop="method" label="HTTP方法" width="180" />
      <el-table-column prop="path" label="HTTP路径" width="180" />
      <el-table-column prop="status" label="状态" width="140">
        <template #default="{ row }">
          <StatusSwitch
            :model-value="row.status"
            v-permission="'mcp_tool_profile:edit'"
            active-value="ACTIVE"
            inactive-value="INACTIVE"
            :options="STATUS_OPTIONS"
            :api-method="({ nextValue }) => McpToolProfileApi.updateStatus(row.id, String(nextValue))"
            @update:model-value="(value) => (row.status = String(value))"
            @success="notifyStatusSwitchSuccess"
            @error="(payload) => notifyStatusSwitchError(payload)"
          />
        </template>
      </el-table-column>
      <TableColumn prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="180" sortable="custom" />
      <TableColumn prop="updateTime" :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="180" sortable="custom" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="280">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="handleView(row)">{{ $t('G2_BTN_DETAIL', '详情') }}</el-button>
          <el-button type="primary" v-permission="'mcp_tool_profile:edit'" link size="small" @click="handleEdit(row)">{{ $t('G2_BTN_EDIT', '编辑') }}</el-button>
          <el-button type="danger" v-permission="'mcp_tool_profile:delete'" link size="small" @click="handleDelete(row)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
        </template>
        <template #header>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>{{ $t('G2_FIELD_ACTION', '操作') }}</span>
            <SortManagerButton />
          </div>
        </template>
      </el-table-column>
    </SortableTable>

    <!-- 分页组件 -->
    <div class="mcp_tool_profile-page__pagination">
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

    <ToolDrawer
      :visible="drawerOpen"
      :mode="drawerMode"
      :resource-type="resourceType"
      :row="currentRow"
      @close="drawerOpen = false"
      @done="loadData"
    />

    <OpenApiImport
      :visible="importOpen"
      :resource-type="resourceType"
      @close="importOpen = false"
      @done="loadData"
    />
    <BuiltInSync :visible="syncOpen" @close="syncOpen = false" @done="loadData" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { t } from '@platform/i18n';
import { RecordStatus, ResourceType } from '@runtime/console';
import { McpToolProfileApi } from './api';
import type { McpToolProfile, McpToolProfileQuery } from './type';
import type { BaseSelectListDto, PageSelectListDto } from '@platform/types/api.type';

import { SortableTable, TableColumn, SortManagerButton, QueryForm } from '@g2rain/ui';
import { StatusSwitch } from '@g2rain/ui/platform';
import { notifyStatusSwitchError, notifyStatusSwitchSuccess, showErrorMessage } from '@/components';
import OpenApiImport from './components/OpenApiImport.vue';
import BuiltInSync from './components/BuiltInSync.vue';
import ToolDrawer from './components/ToolDrawer.vue';

const STATUS_OPTIONS = [
  { value: RecordStatus.ACTIVE, label: '启用' },
  { value: RecordStatus.INACTIVE, label: '禁用' },
];

const route = useRoute();
const importOpen = ref(false);
const syncOpen = ref(false);

const resourceType = computed(() => {
  if (route.path.includes('/built_in')) {
    return ResourceType.BUILT_IN;
  }
  if (route.path.includes('/extension')) {
    return ResourceType.EXTENSION;
  }
  return ResourceType.CUSTOMER;
});

const pageTitle = computed(() => {
  if (resourceType.value === ResourceType.BUILT_IN) {
    return '自有系统工具';
  }
  if (resourceType.value === ResourceType.EXTENSION) {
    return '扩展系统工具';
  }
  return '客户系统工具';
});

// 组件引用
const queryFormRef = ref<InstanceType<typeof QueryForm> | null>(null);

// 基础查询表单（BaseSelectListDto）；用 ref 以匹配 QueryForm defineModel
const baseQueryForm = ref<BaseSelectListDto>({
  id: undefined,
  createTime: undefined,
  updateTime: undefined,
  sorts: undefined,
});

// 业务查询状态
const queryForm = reactive({
  organId: undefined as number | undefined,
  name: '',
  serviceCode: '',
  status: '' as string | null | undefined,
});

// 分页相关状态
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 定义列表引用
const tableData = ref<McpToolProfile[]>([]);

// 加载列表数据
const loadData = async () => {
  try {
    // 合并基础查询 + 业务查询，并过滤空值
    const query = Object.fromEntries(
      Object.entries({ ...baseQueryForm.value, ...queryForm })
        .filter(([_, v]) => (v ?? '') !== '' && [v].flat().length)
    ) as McpToolProfileQuery;

    // 请求分页数据；resourceType 由菜单入口写死
    const pageData = await McpToolProfileApi.page(resourceType.value, {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...query,
    } as PageSelectListDto & McpToolProfileQuery);

    // 设置响应结果
    tableData.value = pageData.records;
    pagination.total = pageData.total;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载列表失败');
    showErrorMessage(msg);
  }
};

// 处理排序变化
const handleSortChange = (params: Record<string, string>) => {
  // 更新 QueryForm 的 sorts 字段
  queryFormRef.value?.updateSorts(params);
};

// 查询
const handleSearch = () => {
  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 重置查询条件
const handleReset = () => {
  // 重置基础查询表单
  baseQueryForm.value.id = undefined;
  baseQueryForm.value.createTime = undefined;
  baseQueryForm.value.updateTime = undefined;
  baseQueryForm.value.sorts = undefined;
  // 重置业务特定查询表单
  queryForm.organId = undefined;
  queryForm.name = '';
  queryForm.serviceCode = '';
  queryForm.status = '';

  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.pageNum = 1; // 重置到第一页
  loadData();
};

// 页码变化
const handlePageChange = (page: number) => {
  pagination.pageNum = page;
  loadData();
};

// 当前记录引用
const currentRow = ref<McpToolProfile | null>(null);
const drawerOpen = ref(false);
const drawerMode = ref<'create' | 'edit' | 'detail'>('detail');

const openCreate = () => {
  currentRow.value = null;
  drawerMode.value = 'create';
  drawerOpen.value = true;
};

const handleView = (row: McpToolProfile) => {
  currentRow.value = { ...row };
  drawerMode.value = 'detail';
  drawerOpen.value = true;
};

// 删除数据记录
const handleDelete = (row: McpToolProfile) => {
  ElMessageBox.confirm(`确认删除工具「${row.name || row.id}」吗？`, t('G2_LBL_TIP', '提示'), {
    type: 'warning',
  })
    .then(async () => {
      try {
        await McpToolProfileApi.remove(row.id);
        // 如果当前页只有一条数据，删除后应该跳转到上一页
        if (tableData.value.length === 1 && pagination.pageNum > 1) {
          pagination.pageNum--;
        }
        await loadData();
        ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : t('G2_MSG_DELETE_FAIL', '删除失败');
        showErrorMessage(msg);
      }
    })
    .catch(() => {});
};

// 保存弹窗引用
const handleEdit = (row: McpToolProfile) => {
  currentRow.value = { ...row };
  drawerMode.value = 'edit';
  drawerOpen.value = true;
};

watch(
  () => route.path,
  () => {
    pagination.pageNum = 1;
    void loadData();
  },
);

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.mcp_tool_profile-page {
  padding: 20px;
  background-color: var(--g2-bg-page);
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}

.mcp_tool_profile-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  margin-top: 0;
  padding: 16px 20px;
  background-color: var(--g2-bg-container);
  border-radius: 4px;
}

.mcp_tool_profile-page__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mcp_tool_profile-page__header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.mcp_tool_profile-page__search {
  margin-bottom: 12px;
  background-color: var(--g2-bg-container);
}

.mcp_tool_profile-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
