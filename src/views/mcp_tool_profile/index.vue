<template>
  <div class="mcp_tool_profile-page">
    <ToolTable ref="tableRef" :resource-type="ResourceType.NATIVE" title="平台原生工具">
      <template #actions>
        <el-button v-permission="'mcp_tool:sync'" @click="syncOpen = true">
          {{ $t('AGENT_MCP_TOOL_SYNC', '同步平台接口') }}
        </el-button>
      </template>
    </ToolTable>

    <NativeSync :visible="syncOpen" @close="syncOpen = false" @done="tableRef?.reload()" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ResourceType } from '@runtime/console';
import NativeSync from './components/NativeSync.vue';
import ToolTable from './components/ToolTable.vue';

/** 平台原生工具：只能从服务注册同步，不提供单条新增 */
const tableRef = ref<InstanceType<typeof ToolTable> | null>(null);
const syncOpen = ref(false);
</script>

<style scoped>
.mcp_tool_profile-page {
  padding: 20px;
  background-color: var(--g2-bg-page);
  min-height: 100%;
  height: 100%;
  box-sizing: border-box;
}
</style>
