<template>
  <el-dialog
    v-model="visible"
    :title="$t('AGENT_DLG_ACCESS_GRANT', { name: agent?.agentName ?? '' }, '访问授权 · {name}')"
    width="480px"
    @closed="reset"
  >
    <div v-loading="loading">
      <p class="access-grant__tip">
        {{ $t('AGENT_TIP_ACCESS_GRANT', '勾选允许在对话中使用该智能体的会话类型；均不勾选则任何人都无法使用。') }}
      </p>
      <el-checkbox-group v-model="selected">
        <el-checkbox v-for="item in options" :key="item.code" :value="item.code">
          {{ item.name }}
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <template #footer>
      <el-button @click="visible = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
      <el-button type="primary" :loading="saving" :disabled="loading" @click="submit">
        {{ $t('G2_BTN_SAVE', '保存') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { t } from '@platform/i18n';
import { DictItemApi } from '@/views/dict/api';
import { AgentSessionBindingApi } from '@/views/agent_session_binding/api';
import type { AgentProfile } from './type';

type SessionOption = { code: string; name: string };

const visible = ref(false);
const loading = ref(false);
const saving = ref(false);
const agent = ref<AgentProfile | null>(null);
const options = ref<SessionOption[]>([]);
const selected = ref<string[]>([]);

/** 打开弹窗：并行加载会话类型字典与当前授权 */
async function open(row: AgentProfile): Promise<void> {
  agent.value = row;
  visible.value = true;
  loading.value = true;
  try {
    const [items, bindings] = await Promise.all([
      DictItemApi.loadByUsageCode('SESSION_TYPE'),
      AgentSessionBindingApi.list({ agentId: row.id }),
    ]);
    options.value = items.map((item) => ({ code: String(item.code ?? ''), name: String(item.name ?? '') }));
    selected.value = bindings.map((binding) => binding.sessionType);
  } catch {
    // 请求失败已由 http 层统一提示
  } finally {
    loading.value = false;
  }
}

async function submit(): Promise<void> {
  if (!agent.value) return;
  saving.value = true;
  try {
    await AgentSessionBindingApi.assign({ agentId: agent.value.id, sessionTypes: selected.value });
    ElMessage.success(t('G2_MSG_SAVE_OK', '保存成功'));
    visible.value = false;
  } catch {
    // 请求失败已由 http 层统一提示
  } finally {
    saving.value = false;
  }
}

function reset(): void {
  agent.value = null;
  options.value = [];
  selected.value = [];
}

defineExpose({ open });
</script>

<style scoped>
.access-grant__tip {
  margin: 0 0 12px;
  color: var(--g2-text-secondary);
  font-size: 13px;
}
</style>
