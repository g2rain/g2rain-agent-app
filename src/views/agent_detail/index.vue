<template>
  <div ref="rootRef" class="agent-detail" :style="frameStyle">
    <el-breadcrumb class="agent-detail__crumb" separator="/">
      <el-breadcrumb-item v-if="hasRoute(listPath)" :to="{ path: listPath }">
        {{ listTitle }}
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
            <span v-if="isPlatform" class="agent-detail__muted">{{ $t('AGENT_PLATFORM_EDITABLE', '运营方可编辑') }}</span>
            <span v-if="readonly" class="agent-detail__muted">{{ $t('AGENT_READONLY_PLATFORM_AGENT', '平台智能体只读') }}</span>
          </div>
        </div>
        <el-button class="agent-detail__back" @click="goBack">{{ $t('G2_BTN_BACK', '返回') }}</el-button>
      </header>

      <el-tabs v-model="tab" class="agent-detail__tabs">
        <el-tab-pane :label="$t('AGENT_TAB_AGENT', '智能体')" name="profile">
          <div class="agent-detail__pane">
            <ProfileSection v-model="form" :readonly="readonly" :creating="!agentId" :locale="locale">
              <template v-if="!readonly" #actions>
                <el-button v-permission="'agent:edit'" type="primary" :loading="saving" @click="saveProfile">
                  {{ $t('G2_BTN_SAVE', '保存') }}
                </el-button>
              </template>
            </ProfileSection>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="`${$t('AGENT_TAB_SKILL', '技能')} ${skills.length}`" name="skill" :disabled="!agentId">
          <SkillList
            :rows="skillRows"
            :readonly="readonly"
            @create="openSkill(null)"
            @open="openSkill"
            @remove="askRemove"
          />
        </el-tab-pane>
      </el-tabs>
    </template>

    <SkillDrawer
      v-if="agentId"
      :visible="drawer.open"
      :skill-id="drawer.skillId"
      :agent-id="agentId"
      :agent-resource-type="entryResourceType"
      :locale="locale"
      :initial-tab="drawer.tab"
      @saved="onSkillSaved"
      @close="drawer.open = false"
    />

    <el-dialog v-model="removal.open" :title="$t('G2_BTN_DELETE', '删除')" width="420px">
      <p>{{ fill($t('AGENT_SKILL_DELETE_CONFIRM', '删除技能「{name}」？将同时删除其工具绑定。'), { name: removal.name }) }}</p>
      <template #footer>
        <el-button @click="removal.open = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
        <el-button type="danger" @click="confirmRemove">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { t } from '@platform/i18n';
import { useLocaleStore } from '@platform/stores/locale.store';
import { PageElementPermission, showErrorMessage } from '@/components';
import { ResourceType, fill } from '@runtime/console';
import ProfileSection from './components/ProfileSection.vue';
import SkillList from './components/SkillList.vue';
import SkillDrawer from './components/SkillDrawer.vue';
import { AgentDetailApi } from './api';
import { contractMode } from './contract';
import { agentDetailRoute, agentListPath, type AgentDetailTab } from './index';
import type { AgentProfile, AgentProfilePayload } from '@/views/agent_profile';
import type {
  SkillProfileVo,
  SkillRow,
  SkillToolBindingVo,
} from './type';

const TABS: AgentDetailTab[] = ['profile', 'skill'];

const route = useRoute();
const router = useRouter();
const localeStore = useLocaleStore();
const locale = computed(() => localeStore.locale || 'zh-CN');

const entryResourceType = computed(() =>
  String(route.query.resourceType || '') === ResourceType.PLATFORM
    ? ResourceType.PLATFORM
    : ResourceType.CUSTOM,
);
const listPath = computed(() => agentListPath(entryResourceType.value));
const listTitle = computed(() =>
  entryResourceType.value === ResourceType.PLATFORM
    ? t('AGENT_MENU_PLATFORM_AGENT', '平台智能体')
    : t('AGENT_MENU_CUSTOM_AGENT', '自建智能体'),
);

/** 按父容器 clientHeight 定高；禁止用 ResizeObserver 盯自身/宿主，避免高度越测越小 */
const rootRef = ref<HTMLElement | null>(null);
const frameH = ref(0);
const frameStyle = computed(() =>
  frameH.value > 0 ? { height: `${frameH.value}px`, maxHeight: `${frameH.value}px` } : undefined,
);
let frameRaf = 0;
/** 本页期间锁住会晃的滚动层（多为 workspace），离开时还原 */
const lockedHosts: { el: HTMLElement; overflow: string; scrollTop: number }[] = [];

function findShellNodes(el: HTMLElement): {
  microSlot: HTMLElement | null;
  microContainer: HTMLElement | null;
  workspace: HTMLElement | null;
} {
  let node: HTMLElement | null = el.parentElement;
  let microSlot: HTMLElement | null = null;
  let microContainer: HTMLElement | null = null;
  let workspace: HTMLElement | null = null;
  while (node) {
    if (node.classList.contains('micro-slot')) microSlot = node;
    if (node.classList.contains('micro-container')) microContainer = node;
    if (node.classList.contains('workspace')) workspace = node;
    node = node.parentElement;
  }
  return { microSlot, microContainer, workspace };
}

function resolveFrameHost(el: HTMLElement): HTMLElement {
  const { microSlot, microContainer, workspace } = findShellNodes(el);
  // 定高用 micro-slot（含 padding）；勿用 workspace，否则会偏高
  return microSlot ?? microContainer ?? workspace ?? document.documentElement;
}

function lockHostScroll(el: HTMLElement): void {
  const { workspace, microSlot } = findShellNodes(el);
  // workspace 才是 overflow:auto 的晃动源；micro-slot 一并锁死
  for (const host of [workspace, microSlot]) {
    if (!host || lockedHosts.some((item) => item.el === host)) continue;
    lockedHosts.push({ el: host, overflow: host.style.overflow, scrollTop: host.scrollTop });
    host.scrollTop = 0;
    host.style.overflow = 'hidden';
  }
}

function unlockHostScroll(): void {
  while (lockedHosts.length) {
    const item = lockedHosts.pop()!;
    item.el.style.overflow = item.overflow;
    item.el.scrollTop = item.scrollTop;
  }
}

function syncFrameHeight(): void {
  const el = rootRef.value;
  if (!el) return;
  lockHostScroll(el);
  const host = resolveFrameHost(el);
  const relTop = el.getBoundingClientRect().top - host.getBoundingClientRect().top;
  const padBottom = Number.parseFloat(getComputedStyle(host).paddingBottom) || 0;
  const next = Math.max(320, Math.floor(host.clientHeight - relTop - padBottom) - 4);
  if (Math.abs(next - frameH.value) > 2) frameH.value = next;
}

function scheduleFrameHeight(): void {
  if (frameRaf) cancelAnimationFrame(frameRaf);
  frameRaf = requestAnimationFrame(() => {
    frameRaf = 0;
    syncFrameHeight();
  });
}

onMounted(() => {
  scheduleFrameHeight();
  window.addEventListener('resize', scheduleFrameHeight);
});

onBeforeUnmount(() => {
  if (frameRaf) cancelAnimationFrame(frameRaf);
  window.removeEventListener('resize', scheduleFrameHeight);
  unlockHostScroll();
});

const agentId = computed(() => {
  const id = Number(route.query.agentId);
  return Number.isFinite(id) && id > 0 ? id : null;
});

const tab = ref<string>('profile');
const agent = ref<AgentProfile | null>(null);
const form = ref<AgentProfilePayload>({});
const snapshot = ref('');
const loading = ref(false);
const saving = ref(false);
const failure = ref('');

const skills = ref<SkillProfileVo[]>([]);
const skillTools = ref<SkillToolBindingVo[]>([]);

const drawer = reactive<{ open: boolean; skillId: number | null; tab: string }>({ open: false, skillId: null, tab: 'basic' });
const removal = reactive({ open: false, name: '', skill: null as SkillProfileVo | null });

const isPlatform = computed(() => form.value.resourceType === ResourceType.PLATFORM);
const readonly = computed(() => isPlatform.value && !PageElementPermission.has('agent:platform'));
const dirty = computed(() => JSON.stringify(form.value) !== snapshot.value);

const skillRows = computed<SkillRow[]>(() =>
  skills.value.map((skill) => ({
    skill,
    mode: contractMode(skill.skillContract),
    toolCount: skillTools.value.filter((b) => b.skillId === skill.id).length,
  })),
);

function hasRoute(path: string): boolean {
  return router.resolve(path).matched.length > 0;
}

function goBack(): void {
  if (hasRoute(listPath.value)) void router.push(listPath.value);
  else void router.back();
}

async function loadSkills(): Promise<void> {
  if (!agentId.value) return;
  const [list, tools] = await Promise.all([
    AgentDetailApi.agentSkills(agentId.value),
    AgentDetailApi.skillToolsAll(),
  ]);
  // 拷贝行数据，避免 mock Object.assign 与 StatusSwitch 抢同一引用导致「成功了但开关不跳」
  skills.value = list.map((row) => ({ ...row }));
  skillTools.value = tools.map((row) => ({ ...row }));
}

async function load(): Promise<void> {
  loading.value = true;
  failure.value = '';
  try {
    if (agentId.value) {
      agent.value = await AgentDetailApi.agent(agentId.value, entryResourceType.value);
      form.value = agent.value ? { ...agent.value } : {};
      await loadSkills();
    } else {
      agent.value = null;
      form.value = { resourceType: entryResourceType.value };
    }
    snapshot.value = JSON.stringify(form.value);
  } catch (error: unknown) {
    failure.value = error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载失败');
  } finally {
    loading.value = false;
  }
}

async function saveProfile(): Promise<void> {
  if (!agentId.value && entryResourceType.value === ResourceType.PLATFORM && !form.value.agentName) {
    form.value.agentName = form.value.agentCode;
  }
  if (!form.value.agentName || !form.value.agentCode) {
    ElMessage.warning(t('AGENT_REQUIRED', '请填写名称与编码'));
    return;
  }
  if (!agentId.value && form.value.organId == null) {
    ElMessage.warning(t('G2_PH_ORGAN', '请选择所属机构'));
    return;
  }
  saving.value = true;
  try {
    form.value.resourceType = entryResourceType.value;
    const id = await AgentDetailApi.saveAgent(form.value);
    snapshot.value = JSON.stringify(form.value);
    ElMessage.success(t('G2_MSG_SAVE_OK', '保存成功'));
    if (!agentId.value) await router.replace(agentDetailRoute(id, 'profile', entryResourceType.value));
    else await load();
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败'));
  } finally {
    saving.value = false;
  }
}

function openSkill(skillId: number | null, skillTab = 'basic'): void {
  Object.assign(drawer, { open: true, skillId, tab: skillTab });
}

async function onSkillSaved(skillId: number): Promise<void> {
  drawer.skillId = skillId;
  await loadSkills();
}

async function askRemove(skill: SkillProfileVo): Promise<void> {
  Object.assign(removal, { open: true, skill, name: skill.skillName });
}

async function confirmRemove(): Promise<void> {
  const skill = removal.skill;
  removal.open = false;
  if (!skill) return;
  try {
    await AgentDetailApi.removeSkill(skill.id);
    await loadSkills();
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_DELETE_FAIL', '删除失败'));
  }
}

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
});

watch(agentId, () => void load(), { immediate: true });

watch([loading, tab, failure], () => void nextTick(scheduleFrameHeight));

onBeforeRouteLeave(async () => {
  if (!dirty.value || readonly.value) return true;
  return ElMessageBox.confirm(t('AGENT_UNSAVED_CONFIRM', '有未保存的修改，确定离开吗？'), t('G2_LBL_TIP', '提示'), {
    type: 'warning',
  }).then(() => true, () => false);
});
</script>

<style scoped>
.agent-detail {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 16px 20px 20px;
  overflow: hidden;
  overscroll-behavior: none;
}
.agent-detail__crumb { flex: none; margin-bottom: 12px; }
.agent-detail__head { flex: none; display: flex; align-items: center; gap: 14px; margin-bottom: 8px; }
/* 与标题区 meta 行（如「运营方可编辑」）底对齐，不随头像垂直居中 */
.agent-detail__back { flex: none; align-self: flex-end; margin-left: auto; }
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
.agent-detail__tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.agent-detail__tabs :deep(.el-tabs__header) { flex: none; margin-bottom: 8px; }
.agent-detail__tabs :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.agent-detail__tabs :deep(.el-tab-pane) {
  flex: 1;
  min-height: 0;
  height: auto !important;
  overflow: auto;
}
.agent-detail__pane {
  height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}
</style>
