<template>
  <el-drawer :model-value="visible" size="80%" :title="`工具管理 · ${serviceName}`" destroy-on-close @close="emit('close')">
    <ToolTable ref="tableRef" :resource-type="resourceType" :service-id="serviceId">
      <template #actions>
        <el-button type="primary" v-permission="'mcp_tool_profile:import'" @click="importOpen = true">
          {{ $t('AGENT_MCP_SERVICE_IMPORT', '导入接口') }}
        </el-button>
      </template>
    </ToolTable>

    <OpenApiImport
      :visible="importOpen"
      :service-id="serviceId"
      :service-name="serviceName"
      @close="importOpen = false"
      @done="tableRef?.reload()"
    />
  </el-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import OpenApiImport from './OpenApiImport.vue';
import ToolTable from './ToolTable.vue';

/** 扩展 / 租户服务的工具管理：工具一律由 OpenAPI 导入生成 */
defineProps<{
  visible: boolean;
  resourceType: string;
  serviceId: number;
  serviceName: string;
}>();

const emit = defineEmits<{ close: [] }>();

const tableRef = ref<InstanceType<typeof ToolTable> | null>(null);
const importOpen = ref(false);
</script>
