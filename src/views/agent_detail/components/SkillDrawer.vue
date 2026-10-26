<template>
  <el-drawer
    :model-value="visible"
    size="90%"
    :with-header="false"
    :before-close="beforeClose"
    class="skill-drawer"
    @close="emit('close')"
  >
    <el-skeleton v-if="loading" :rows="10" animated />
    <div v-else class="skill-drawer__body">
      <header class="skill-drawer__head">
        <div class="skill-drawer__title">
          <h3>{{ form.skillName || $t('AGENT_SKILL_NEW', '新技能') }}</h3>
          <code v-if="form.skillKey">{{ form.skillKey }}</code>
          <el-tag size="small" effect="plain" :type="isPlatform ? 'info' : 'primary'">
            {{ isPlatform ? $t('AGENT_RESOURCE_PLATFORM', '平台') : $t('AGENT_RESOURCE_CUSTOM', '私有') }}
          </el-tag>
        </div>
        <div class="skill-drawer__actions">
          <el-button @click="beforeClose(() => emit('close'))">{{ $t('G2_BTN_CLOSE', '关闭') }}</el-button>
          <el-button v-permission="'skill:edit'" type="primary" :loading="saving" @click="save">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
        </div>
      </header>

      <el-tabs v-model="tab" class="skill-drawer__tabs">
        <el-tab-pane :label="$t('AGENT_SKILL_TAB_BASIC', '基本信息')" name="basic">
          <el-form :model="form" label-position="top" class="skill-drawer__form">
            <el-form-item :label="$t('AGENT_SKILL_KEY', '技能键')" required>
              <el-input v-model="form.skillKey" maxlength="128" :disabled="!!skillId" />
            </el-form-item>
            <el-form-item :label="$t('AGENT_SKILL_NAME', '名称')" required>
              <el-input v-model="form.skillName" maxlength="128" />
            </el-form-item>
            <el-form-item :label="$t('AGENT_SKILL_SEMANTIC', '语义描述')" class="skill-drawer__wide">
              <el-input v-model="form.semanticDesc" type="textarea" :rows="4" maxlength="1000" show-word-limit
                :placeholder="$t('AGENT_SKILL_SEMANTIC_HINT', '写清适用什么、不负责什么，供模型选择技能')" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane :label="$t('AGENT_SKILL_TAB_MANUAL', '操作手册')" name="manual">
          <!-- 隐藏 Tab 里挂 CodeMirror 会量到 0 宽，要点一下才 refresh；进入手册 Tab 再挂载 -->
          <MarkdownEditor
            v-if="tab === 'manual'"
            v-model="manual"
            :locale="locale"
            height="calc(100vh - 220px)"
            mode="split"
          />
        </el-tab-pane>

        <el-tab-pane name="contract">
          <template #label>
            {{ $t('AGENT_SKILL_TAB_CONTRACT', '执行契约') }}
            <span v-if="errorCount" class="skill-drawer__badge">⚠ {{ errorCount }}</span>
          </template>
          <ContractPanel v-if="tab === 'contract'" v-model="contract" :tool-names="enabledToolNames" :tools="toolMeta" :issues="issues" />
        </el-tab-pane>

        <el-tab-pane :label="`${$t('AGENT_SKILL_TAB_TOOLS', '工具')} ${toolBindings.length}`" name="tools" :disabled="!skillId">
          <div class="skill-drawer__tools-bar">
            <span class="skill-drawer__muted">{{ $t('AGENT_SKILL_TOOLS_HINT', '技能可调用的业务工具；每个工具建议都在执行契约中配置') }}</span>
            <el-button v-permission="'skill:edit'" @click="pickerOpen = true">{{ $t('AGENT_SKILL_ADD_TOOL', '添加工具') }}</el-button>
          </div>
          <el-table :data="toolBindings" size="small">
            <el-table-column :label="$t('AGENT_TRACE_TOOL', '工具')" min-width="240">
              <template #default="{ row }">
                <code class="skill-drawer__code">{{ row.toolName }}</code>
                <span v-if="isWriteName(row.toolName)" class="skill-drawer__write">{{ $t('AGENT_TRACE_WRITE', '写') }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('AGENT_TOOL_TITLE', '标题')" min-width="160">
              <template #default="{ row }">{{ toolMeta.find((m) => m.name === row.toolName)?.title ?? EMPTY }}</template>
            </el-table-column>
            <el-table-column :label="$t('AGENT_SKILL_TAB_CONTRACT', '执行契约')" width="110">
              <template #default="{ row }">
                <StatusDot v-if="configuredTools.has(row.toolName)" tone="success" :label="$t('AGENT_CONTRACT_CONFIGURED', '已配置')" />
                <StatusDot v-else tone="waiting" :label="$t('AGENT_CONTRACT_NOT_CONFIGURED', '未配置')" />
              </template>
            </el-table-column>
            <el-table-column :label="$t('AGENT_FIELD_ENABLED', '启用')" width="80">
              <template #default="{ row }">
                <el-switch :model-value="row.enabledFlag === 1" size="small"
                  @change="(on: string | number | boolean) => toggleTool(row, !!on)" />
              </template>
            </el-table-column>
            <el-table-column :label="$t('AGENT_FIELD_REMARK', '备注')" min-width="200">
              <template #default="{ row }">
                <el-input v-model="row.description" size="small" @change="saveTool(row)" />
              </template>
            </el-table-column>
            <el-table-column width="70">
              <template #default="{ row }">
                <el-button link type="danger" @click="removeTool(row)">{{ $t('AGENT_SKILL_REMOVE', '移除') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <ToolPicker
      :visible="pickerOpen"
      :hide-customer="isPlatform"
      :excluded="toolBindings.map((b) => b.toolName)"
      :title="$t('AGENT_SKILL_ADD_TOOL', '添加工具')"
      :search-placeholder="$t('AGENT_TOOL_SEARCH', '搜索工具名或标题')"
      :empty-text="$t('AGENT_TOOL_EMPTY', '没有可用的工具')"
      :cancel-text="$t('G2_BTN_CANCEL', '取消')"
      :confirm-text="$t('AGENT_SKILL_ADD_CONFIRM', '添加')"
      @confirm="addTools"
      @close="pickerOpen = false"
    />
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { t } from '@platform/i18n';
import { StatusDot, showErrorMessage } from '@/components';
import { EMPTY, ResourceType } from '@runtime/console';
import { McpToolProfileApi, ToolPicker, type McpToolMetaVo, type McpToolOptionVo } from '@/views/mcp_tool_profile';
import ContractPanel from './ContractPanel.vue';
import { AgentDetailApi } from '../api';
import { parseContract } from '../contract';
import { lintContract } from '../contract-lint';
import type { SkillProfilePayload, SkillToolBindingVo } from '../type';

const MarkdownEditor = defineAsyncComponent(() => import('@/components/markdown').then((m) => m.MarkdownEditor));

/**
 * 技能配置：基本信息、操作手册、执行契约、工具。
 * skillId 为 null 时新建，保存时写入当前 agentId。
 */
const props = defineProps<{
  visible: boolean;
  skillId: number | null;
  agentId: number;
  /** 所属智能体类型；新建技能时写入，后端仍会按智能体再写死 */
  agentResourceType?: string;
  /** 所属智能体的机构；新增技能、绑定工具时带上 */
  organId?: number | null;
  locale: string;
  initialTab?: string;
}>();
const emit = defineEmits<{ close: []; saved: [skillId: number] }>();

const MANUAL_TEMPLATE = '## 目标\n\n## 业务规则\n\n- \n\n## 前置与产出\n\n- ';

const loading = ref(false);
const saving = ref(false);
const tab = ref('basic');
const pickerOpen = ref(false);
const form = ref<SkillProfilePayload>({});
const manual = ref('');
const contract = ref('');
const snapshot = ref('');
const toolBindings = ref<SkillToolBindingVo[]>([]);
const toolMeta = ref<McpToolMetaVo[]>([]);

const isPlatform = computed(() => form.value.resourceType === ResourceType.PLATFORM);

const enabledToolNames = computed(() => toolBindings.value.filter((b) => b.enabledFlag === 1).map((b) => b.toolName));
const issues = computed(() => lintContract(contract.value, enabledToolNames.value));
const errorCount = computed(() => issues.value.filter((i) => i.severity === 'error').length);
const configuredTools = computed(() => {
  const parsed = parseContract(contract.value);
  return new Set(parsed.ok ? Object.keys(parsed.contract.tools ?? {}) : []);
});
const current = () => JSON.stringify([form.value, manual.value, contract.value]);
const dirty = computed(() => !loading.value && current() !== snapshot.value);

function isWriteName(name: string): boolean {
  const meta = toolMeta.value.find((m) => m.name === name);
  return !!meta && meta.method.toUpperCase() !== 'GET';
}

async function load(): Promise<void> {
  loading.value = true;
  tab.value = props.initialTab ?? 'basic';
  try {
    toolMeta.value = [];
    if (props.skillId) {
      const [skill, tools] = await Promise.all([
        AgentDetailApi.skill(props.skillId),
        AgentDetailApi.skillTools(props.skillId),
      ]);
      form.value = skill ? { ...skill } : {};
      manual.value = skill?.skillManual ?? '';
      contract.value = skill?.skillContract ?? '{}';
      toolBindings.value = tools;
      await loadMeta();
    } else {
      form.value = {
        agentId: props.agentId,
        organId: props.organId ?? undefined,
        resourceType: props.agentResourceType || ResourceType.CUSTOM,
      };
      manual.value = MANUAL_TEMPLATE;
      contract.value = JSON.stringify({ mode: 'REACT', delegatable: false, outputs: {}, tools: {} }, null, 2);
      toolBindings.value = [];
    }
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载失败'));
  } finally {
    loading.value = false;
    snapshot.value = current();
  }
}

watch(
  () => [props.visible, props.skillId] as const,
  ([visible]) => {
    if (visible) void load();
  },
  { immediate: true },
);

async function save(): Promise<void> {
  if (!form.value.skillKey || !form.value.skillName) {
    tab.value = 'basic';
    ElMessage.warning(t('AGENT_SKILL_REQUIRED', '请填写技能键与名称'));
    return;
  }
  if (errorCount.value > 0) {
    tab.value = 'contract';
    ElMessage.warning(t('AGENT_CONTRACT_BLOCKED', '执行契约有错误，修正后才能保存'));
    return;
  }
  saving.value = true;
  try {
    const id = await AgentDetailApi.saveSkill({
      ...form.value,
      agentId: form.value.agentId ?? props.agentId,
      organId: form.value.organId ?? props.organId ?? undefined,
      skillManual: manual.value,
      skillContract: contract.value,
    });
    snapshot.value = current();
    ElMessage.success(t('G2_MSG_SAVE_OK', '保存成功'));
    emit('saved', id);
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败'));
  } finally {
    saving.value = false;
  }
}

/** 补查尚未取过元数据的已绑定工具 */
async function loadMeta(): Promise<void> {
  const known = new Set(toolMeta.value.map((m) => m.name));
  const missing = [...new Set(toolBindings.value.map((b) => b.toolName))].filter((name) => !known.has(name));
  if (missing.length === 0) return;
  const metas = await McpToolProfileApi.metas(missing).catch(() => []);
  toolMeta.value = [...toolMeta.value, ...metas];
}

async function refreshTools(): Promise<void> {
  if (!props.skillId) return;
  toolBindings.value = await AgentDetailApi.skillTools(props.skillId);
  await loadMeta();
}

async function addTools(tools: McpToolOptionVo[]): Promise<void> {
  pickerOpen.value = false;
  if (!props.skillId) return;
  // 新增后端固定启用，不必传 enabledFlag
  await Promise.all(tools.map((tool) => AgentDetailApi.saveSkillTool({
    skillId: props.skillId!,
    toolName: tool.name,
    organId: form.value.organId ?? props.organId ?? undefined,
  })));
  await refreshTools();
}

async function toggleTool(binding: SkillToolBindingVo, on: boolean): Promise<void> {
  await AgentDetailApi.updateSkillToolEnabled(binding.id, on ? 1 : 0);
  await refreshTools();
}

async function saveTool(binding: SkillToolBindingVo): Promise<void> {
  await AgentDetailApi.saveSkillTool(binding);
}

async function removeTool(binding: SkillToolBindingVo): Promise<void> {
  const ok = await ElMessageBox.confirm(
    t('AGENT_SKILL_REMOVE_TOOL_CONFIRM', { name: binding.toolName }, '移除工具 {name}？契约中的配置不会被删除。'),
    t('G2_LBL_TIP', '提示'),
    { type: 'warning' },
  ).then(() => true, () => false);
  if (!ok) return;
  await AgentDetailApi.removeSkillTool(binding.id);
  await refreshTools();
}

/** 有未保存修改时关闭需确认 */
async function beforeClose(done: () => void): Promise<void> {
  if (!dirty.value) return done();
  const leave = await ElMessageBox.confirm(t('AGENT_UNSAVED_CONFIRM', '有未保存的修改，确定离开吗？'), t('G2_LBL_TIP', '提示'), {
    type: 'warning',
  }).then(() => true, () => false);
  if (leave) done();
}
</script>

<style scoped>
.skill-drawer__body { display: flex; flex-direction: column; height: 100%; }
.skill-drawer__head { display: flex; align-items: center; gap: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--g2-border-color-light); }
.skill-drawer__title { flex: 1; display: flex; flex-wrap: wrap; align-items: center; gap: 10px; min-width: 0; }
.skill-drawer__title h3 { margin: 0; font-size: 18px; color: var(--g2-text-primary); }
.skill-drawer__title code, .skill-drawer__code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; color: var(--g2-text-secondary); }
.skill-drawer__actions { display: flex; align-items: center; gap: 8px; }
.skill-drawer__muted { color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.skill-drawer__tabs { flex: 1; }
.skill-drawer__form { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; max-width: 880px; }
.skill-drawer__wide { grid-column: 1 / -1; }
.skill-drawer__badge { margin-left: 4px; color: var(--g2-color-danger); font-size: 12px; }
.skill-drawer__tools-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.skill-drawer__write { margin-left: 6px; padding: 0 4px; font-size: 11px; color: var(--g2-color-warning); border: 1px solid var(--g2-color-warning); border-radius: 3px; }
</style>
