<template>
  <div class="agent-detail">
    <el-breadcrumb class="agent-detail__crumb" separator="/">
      <el-breadcrumb-item v-if="hasRoute(AGENT_LIST_PATH)" :to="{ path: AGENT_LIST_PATH }">
        {{ $t('AGENT_MENU_AGENT', '智能体配置') }}
      </el-breadcrumb-item>
      <el-breadcrumb-item>{{ agent?.agentName || $t('AGENT_NEW', '新建智能体') }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-skeleton v-if="loading" :rows="10" animated />

    <el-result v-else-if="failure" icon="error" :sub-title="failure">
      <template #extra><el-button type="primary" @click="load">{{ $t('G2_BTN_RETRY', '重试') }}</el-button></template>
    </el-result>

    <el-empty v-else-if="agentId && !agent" :description="$t('AGENT_NOT_FOUND', '没有找到这个智能体')" />

    <template v-else>
      <header class="agent-detail__head">
        <span class="agent-detail__avatar">{{ (form.agentName || '?').slice(0, 1) }}</span>
        <div class="agent-detail__title">
          <h2>{{ form.agentName || $t('AGENT_NEW', '新建智能体') }}</h2>
          <div class="agent-detail__meta">
            <code v-if="form.agentCode">{{ form.agentCode }}</code>
            <el-tag size="small" effect="plain" :type="isPlatform ? 'info' : 'primary'">
              {{ isPlatform ? $t('AGENT_RESOURCE_PLATFORM', '平台') : $t('AGENT_RESOURCE_CUSTOM', '私有') }}
            </el-tag>
            <span v-if="isPlatform" v-permission="'agent:platform'" class="agent-detail__muted">{{ $t('AGENT_PLATFORM_EDITABLE', '运营方可编辑') }}</span>
            <span v-if="readonly" class="agent-detail__muted">{{ $t('AGENT_READONLY_PLATFORM_AGENT', '平台智能体只读') }}</span>
          </div>
        </div>
        <el-switch v-model="active" :disabled="readonly" :active-text="$t('AGENT_STATUS_ACTIVE', '启用')" />
        <el-button v-if="!readonly && tab === 'profile'" v-permission="'agent:edit'" type="primary" :loading="saving" @click="saveProfile">
          {{ $t('G2_BTN_SAVE', '保存') }}
        </el-button>
      </header>

      <el-tabs v-model="tab" class="agent-detail__tabs">
        <el-tab-pane :label="$t('AGENT_TAB_PROFILE', '画像')" name="profile">
          <ProfileSection v-model="form" :readonly="readonly" :creating="!agentId" :locale="locale" />
        </el-tab-pane>
        <el-tab-pane :label="`${$t('AGENT_TAB_SKILL', '技能')} ${bindings.length}`" name="skill" :disabled="!agentId">
          <SkillList
            :rows="skillRows"
            :readonly="readonly"
            @add="addOpen = true"
            @create="openSkill(null)"
            @open="openSkill"
            @toggle="toggleBinding"
            @remove="askRemove"
          />
        </el-tab-pane>
        <el-tab-pane :label="$t('AGENT_TAB_PREVIEW', '能力预览')" name="preview" :disabled="!agentId">
          <CapabilityPreview :bundle="bundle" :loading="bundleLoading" @open="openSkillByKey" />
        </el-tab-pane>
      </el-tabs>
    </template>

    <SkillAdd :visible="addOpen" :skills="skills" :bound-ids="bindings.map((b) => b.skillId)" @confirm="bindSkills" @close="addOpen = false" />

    <SkillDrawer
      v-if="agentId"
      :visible="drawer.open"
      :skill-id="drawer.skillId"
      :agent-id="agentId"
      :locale="locale"
      :initial-tab="drawer.tab"
      @saved="onSkillSaved"
      @close="drawer.open = false"
    />

    <el-dialog v-model="removal.open" :title="$t('AGENT_SKILL_REMOVE', '移除')" width="420px">
      <p>{{ fill($t('AGENT_SKILL_REMOVE_CONFIRM', '从当前智能体移除技能「{name}」？'), { name: removal.name }) }}</p>
      <el-checkbox v-if="removal.deletable" v-model="removal.deleteSkill">
        {{ $t('AGENT_SKILL_DELETE_TOO', '同时删除这个技能（没有其他智能体使用）') }}
      </el-checkbox>
      <template #footer>
        <el-button @click="removal.open = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
        <el-button type="danger" @click="confirmRemove">{{ $t('AGENT_SKILL_REMOVE', '移除') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { t } from '@platform/i18n';
import { useLocaleStore } from '@platform/stores/locale.store';
import { PageElementPermission, showErrorMessage } from '@/components';
import { RecordStatus, ResourceType, fill } from '@runtime/console';
import ProfileSection from './components/ProfileSection.vue';
import SkillList from './components/SkillList.vue';
import SkillAdd from './components/SkillAdd.vue';
import SkillDrawer from './components/SkillDrawer.vue';
import CapabilityPreview from './components/CapabilityPreview.vue';
import { AgentDetailApi } from './api';
import { contractMode } from './contract';
import { agentDetailRoute, type AgentDetailTab } from './index';
import type {
  AgentProfilePayload,
  AgentProfileVo,
  AgentSkillBindingVo,
  CapabilityBundleVo,
  SkillProfileVo,
  SkillRow,
  SkillToolBindingVo,
} from './type';

const AGENT_LIST_PATH = '/agent';
const TABS: AgentDetailTab[] = ['profile', 'skill', 'preview'];

const route = useRoute();
const router = useRouter();
const localeStore = useLocaleStore();
const locale = computed(() => localeStore.locale || 'zh-CN');

const agentId = computed(() => {
  const id = Number(route.query.agentId);
  return Number.isFinite(id) && id > 0 ? id : null;
});

/** 当前 Tab；el-tabs 的 v-model 为字符串，取值限定在 TABS 内 */
const tab = ref<string>('profile');
const agent = ref<AgentProfileVo | null>(null);
const form = ref<AgentProfilePayload>({});
const snapshot = ref('');
const loading = ref(false);
const saving = ref(false);
const failure = ref('');

const bindings = ref<AgentSkillBindingVo[]>([]);
const skills = ref<SkillProfileVo[]>([]);
const skillTools = ref<SkillToolBindingVo[]>([]);
const bundle = ref<CapabilityBundleVo | null>(null);
const bundleLoading = ref(false);

const addOpen = ref(false);
const drawer = reactive<{ open: boolean; skillId: number | null; tab: string }>({ open: false, skillId: null, tab: 'basic' });
const removal = reactive({ open: false, name: '', deletable: false, deleteSkill: false, binding: null as AgentSkillBindingVo | null });

const isPlatform = computed(() => form.value.resourceType === ResourceType.PLATFORM);
const readonly = computed(() => isPlatform.value && !PageElementPermission.has('agent:platform'));
const active = computed({
  get: () => form.value.status !== RecordStatus.INACTIVE,
  set: (on: boolean) => (form.value = { ...form.value, status: on ? RecordStatus.ACTIVE : RecordStatus.INACTIVE }),
});
const dirty = computed(() => JSON.stringify(form.value) !== snapshot.value);

const skillRows = computed<SkillRow[]>(() =>
  bindings.value.map((binding) => {
    const skill = skills.value.find((s) => s.id === binding.skillId);
    return {
      binding,
      skill,
      mode: contractMode(skill?.skillContract),
      toolCount: skillTools.value.filter((b) => b.skillId === binding.skillId).length,
    };
  }),
);

function hasRoute(path: string): boolean {
  return router.resolve(path).matched.length > 0;
}

async function loadSkills(): Promise<void> {
  if (!agentId.value) return;
  const [binds, all, tools] = await Promise.all([
    AgentDetailApi.agentSkills(agentId.value),
    AgentDetailApi.skills(),
    AgentDetailApi.skillToolsAll(),
  ]);
  bindings.value = binds;
  skills.value = all;
  skillTools.value = tools;
}

async function load(): Promise<void> {
  loading.value = true;
  failure.value = '';
  try {
    if (agentId.value) {
      agent.value = await AgentDetailApi.agent(agentId.value);
      form.value = agent.value ? { ...agent.value } : {};
      await loadSkills();
    } else {
      agent.value = null;
      form.value = { resourceType: ResourceType.CUSTOM, status: RecordStatus.ACTIVE };
    }
    snapshot.value = JSON.stringify(form.value);
  } catch (error: unknown) {
    failure.value = error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载失败');
  } finally {
    loading.value = false;
  }
}

async function loadBundle(): Promise<void> {
  if (!agentId.value) return;
  bundleLoading.value = true;
  try {
    bundle.value = await AgentDetailApi.bundle(agentId.value);
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载失败'));
  } finally {
    bundleLoading.value = false;
  }
}

async function saveProfile(): Promise<void> {
  if (!form.value.agentName || !form.value.agentCode) {
    ElMessage.warning(t('AGENT_REQUIRED', '请填写名称与编码'));
    return;
  }
  saving.value = true;
  try {
    const id = await AgentDetailApi.saveAgent(form.value);
    snapshot.value = JSON.stringify(form.value);
    ElMessage.success(t('G2_MSG_SAVE_OK', '保存成功'));
    if (!agentId.value) await router.replace(agentDetailRoute(id, 'skill'));
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败'));
  } finally {
    saving.value = false;
  }
}

// ---------------------------------------------------------------- 技能

function openSkill(skillId: number | null, skillTab = 'basic'): void {
  Object.assign(drawer, { open: true, skillId, tab: skillTab });
}

function openSkillByKey(skillKey: string): void {
  const skill = skills.value.find((s) => s.skillKey === skillKey);
  if (skill) openSkill(skill.id, 'contract');
}

async function onSkillSaved(skillId: number): Promise<void> {
  drawer.skillId = skillId;
  await loadSkills();
}

async function bindSkills(skillIds: number[]): Promise<void> {
  addOpen.value = false;
  if (!agentId.value) return;
  try {
    await Promise.all(skillIds.map((skillId) => AgentDetailApi.saveAgentSkill({ agentId: agentId.value!, skillId, enabledFlag: 1 })));
    await loadSkills();
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败'));
  }
}

async function toggleBinding(binding: AgentSkillBindingVo, enabled: boolean): Promise<void> {
  await AgentDetailApi.saveAgentSkill({ ...binding, enabledFlag: enabled ? 1 : 0 });
  await loadSkills();
}

async function askRemove(binding: AgentSkillBindingVo): Promise<void> {
  const skill = skills.value.find((s) => s.id === binding.skillId);
  const usages = await AgentDetailApi.skillUsages(binding.skillId).catch(() => []);
  Object.assign(removal, {
    open: true,
    binding,
    name: skill?.skillName ?? String(binding.skillId),
    deletable: skill?.resourceType !== ResourceType.PLATFORM && usages.length <= 1,
    deleteSkill: false,
  });
}

async function confirmRemove(): Promise<void> {
  const binding = removal.binding;
  removal.open = false;
  if (!binding) return;
  try {
    await AgentDetailApi.removeAgentSkill(binding.id);
    if (removal.deletable && removal.deleteSkill) await AgentDetailApi.removeSkill(binding.skillId);
    await loadSkills();
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_DELETE_FAIL', '删除失败'));
  }
}

// ---------------------------------------------------------------- 路由同步

watch(
  () => route.query.tab,
  (value) => {
    const next = TABS.find((name) => name === value) ?? 'profile';
    tab.value = agentId.value ? next : 'profile';
  },
  { immediate: true },
);

watch(tab, (value) => {
  if (route.query.tab !== value) void router.replace({ query: { ...route.query, tab: value } });
  if (value === 'preview') void loadBundle();
});

watch(agentId, () => void load(), { immediate: true });

onBeforeRouteLeave(async () => {
  if (!dirty.value || readonly.value) return true;
  return ElMessageBox.confirm(t('AGENT_UNSAVED_CONFIRM', '有未保存的修改，确定离开吗？'), t('G2_LBL_TIP', '提示'), {
    type: 'warning',
  }).then(() => true, () => false);
});
</script>

<style scoped>
.agent-detail { padding: 16px 24px 24px; min-width: 0; }
.agent-detail__crumb { margin-bottom: 12px; }
.agent-detail__head { display: flex; align-items: center; gap: 14px; margin-bottom: 8px; }
.agent-detail__avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--g2-color-primary);
  background: color-mix(in srgb, var(--g2-color-primary) 12%, transparent);
  flex: none;
}
.agent-detail__title { flex: 1; min-width: 0; }
.agent-detail__title h2 { margin: 0; font-size: 18px; font-weight: 600; color: var(--g2-text-primary); }
.agent-detail__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 4px; }
.agent-detail__meta code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; color: var(--g2-text-secondary); }
.agent-detail__muted { color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
</style>
