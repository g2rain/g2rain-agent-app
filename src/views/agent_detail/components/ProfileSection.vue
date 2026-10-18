<template>
  <div class="profile">
    <div class="profile__main">
      <section class="profile__card">
        <h3>{{ $t('AGENT_PROFILE_BASIC', '基本信息') }}</h3>
        <el-form :model="form" label-position="top" :disabled="readonly" class="profile__basic">
          <el-form-item v-if="creating || form.organId != null" :label="$t('G2_FIELD_ORGAN', '所属机构')" required>
            <OrganSelect v-model="form.organId" :disabled="!creating || readonly" width="100%" />
          </el-form-item>
          <el-form-item :label="$t('AGENT_FIELD_NAME', '名称')" required>
            <el-input v-model="form.agentName" maxlength="128" :disabled="codeOnly" />
          </el-form-item>
          <el-form-item :label="$t('AGENT_FIELD_CODE', '编码')" required>
            <el-input v-model="form.agentCode" maxlength="64" :disabled="!creating" />
          </el-form-item>
          <el-form-item :label="$t('AGENT_FIELD_REMARK', '备注')" class="profile__wide">
            <el-input v-model="form.description" maxlength="500" :disabled="codeOnly" />
          </el-form-item>
        </el-form>
      </section>

      <section
        v-for="section in sections"
        :key="section.key"
        class="profile__card"
        :class="{ 'is-active': active === section.key }"
        @focusin="active = section.key"
        @click="active = section.key"
      >
        <header class="profile__section-head" @click.stop="toggle(section.key)">
          <i class="profile__caret" :class="{ 'is-open': opened.has(section.key) }" />
          <h3>{{ section.title }}</h3>
          <span class="profile__purpose">{{ section.purpose }}</span>
          <span class="profile__count" :class="{ 'is-over': length(section.key) > section.max }">
            {{ length(section.key) }} / {{ section.max }}
          </span>
        </header>
        <MarkdownEditor
          v-if="opened.has(section.key)"
          v-model="sectionModel(section.key).value"
          :locale="locale"
          mode="tab"
          height="220px"
          :readonly="readonly || codeOnly"
        />
      </section>
    </div>

    <aside class="profile__side">
      <div v-if="$slots.actions" class="profile__actions">
        <slot name="actions" />
      </div>
      <div class="profile__hint">
        <h4>{{ activeSection.title }}</h4>
        <p>{{ activeSection.hint }}</p>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, type WritableComputedRef } from 'vue';
import { OrganSelect } from '@g2rain/ui/platform';
import { t } from '@platform/i18n';
import { ResourceType } from '@runtime/console';
import type { AgentProfilePayload } from '@/views/agent_profile';
import { PROFILE_SECTIONS, type ProfileSectionKey } from '../type';

const MarkdownEditor = defineAsyncComponent(() => import('@/components/markdown').then((m) => m.MarkdownEditor));

/** 智能体画像：基本信息 + 五段描述。五段描述会进入规划与节点提示词 */
const props = defineProps<{ readonly: boolean; creating: boolean; locale: string }>();
const form = defineModel<AgentProfilePayload>({ required: true });

/** 平台智能体新建只填编码，名称/备注/画像创建后再改 */
const codeOnly = computed(
  () => props.creating && form.value.resourceType === ResourceType.PLATFORM,
);

const TEXT: Record<ProfileSectionKey, [title: [string, string], purpose: [string, string], hint: [string, string]]> = {
  identityDesc: [
    ['AGENT_PROFILE_IDENTITY', '身份定义'],
    ['AGENT_PROFILE_IDENTITY_PURPOSE', '你是谁，服务于什么场景'],
    ['AGENT_PROFILE_IDENTITY_HINT', '一句话说明身份与服务对象。任务使命为空时，路由会改用身份定义来选择智能体。'],
  ],
  missionDesc: [
    ['AGENT_PROFILE_MISSION', '任务使命'],
    ['AGENT_PROFILE_MISSION_PURPOSE', '路由时用它选择智能体'],
    ['AGENT_PROFILE_MISSION_HINT', '写清职责边界，不写能力清单。多个智能体之间的使命要能明显区分，路由才不会选错。'],
  ],
  boundaryDesc: [
    ['AGENT_PROFILE_BOUNDARY', '边界约束'],
    ['AGENT_PROFILE_BOUNDARY_PURPOSE', '不做什么、何时需要确认'],
    ['AGENT_PROFILE_BOUNDARY_HINT', '写清不承接的请求、需要用户确认的操作（删除、批量变更、对外发布），以及不得编造的内容。'],
  ],
  styleDesc: [
    ['AGENT_PROFILE_STYLE', '交互风格'],
    ['AGENT_PROFILE_STYLE_PURPOSE', '语气与回复方式'],
    ['AGENT_PROFILE_STYLE_HINT', '说明语气、回复结构与语言，例如先给结论再补关键字段、空结果只陈述事实。'],
  ],
  principleDesc: [
    ['AGENT_PROFILE_PRINCIPLE', '行为原则'],
    ['AGENT_PROFILE_PRINCIPLE_PURPOSE', '规划与执行必须遵守的规则'],
    ['AGENT_PROFILE_PRINCIPLE_HINT', '例如只规划本轮立即要做的事、写入必须用户本轮明确要求、平台注入的字段不展示原值。'],
  ],
};

const sections = computed(() =>
  PROFILE_SECTIONS.map((section) => {
    const [title, purpose, hint] = TEXT[section.key];
    return { ...section, title: t(...title), purpose: t(...purpose), hint: t(...hint) };
  }),
);

const active = ref<ProfileSectionKey>('identityDesc');
const activeSection = computed(() => sections.value.find((s) => s.key === active.value) ?? sections.value[0]);
const opened = ref(new Set<ProfileSectionKey>(['identityDesc', 'missionDesc']));

function toggle(key: ProfileSectionKey): void {
  const next = new Set(opened.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  opened.value = next;
  active.value = key;
}

function length(key: ProfileSectionKey): number {
  return form.value[key]?.length ?? 0;
}

const models = new Map<ProfileSectionKey, WritableComputedRef<string>>();
/** 每段描述的双向绑定（空值视为空串） */
function sectionModel(key: ProfileSectionKey): WritableComputedRef<string> {
  if (!models.has(key)) {
    models.set(
      key,
      computed({
        get: () => form.value[key] ?? '',
        set: (value: string) => (form.value = { ...form.value, [key]: value }),
      }),
    );
  }
  return models.get(key)!;
}

</script>

<style scoped>
.profile {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 16px;
  height: 100%;
  min-height: 0;
}
.profile__main {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding-bottom: 8px;
}
.profile__card {
  padding: 14px 18px;
  border: 1px solid var(--g2-border-color-light);
  border-radius: var(--g2-border-radius-lg);
  background: var(--g2-bg-container);
  transition: border-color var(--g2-transition-duration);
}
.profile__card.is-active { border-color: color-mix(in srgb, var(--g2-color-primary) 50%, var(--g2-border-color-light)); }
.profile__card h3 { margin: 0; font-size: var(--g2-font-size-base); font-weight: 600; color: var(--g2-text-primary); }
.profile__basic { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; margin-top: 12px; }
.profile__wide { grid-column: 1 / -1; }
.profile__section-head { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.profile__section-head + * { margin-top: 12px; }
.profile__purpose { flex: 1; color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.profile__count { color: var(--g2-text-placeholder); font-size: var(--g2-font-size-sm); font-variant-numeric: tabular-nums; }
.profile__count.is-over { color: var(--g2-color-danger); }
.profile__caret {
  width: 0;
  height: 0;
  border-left: 5px solid var(--g2-text-secondary);
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  transition: transform var(--g2-transition-duration);
}
.profile__caret.is-open { transform: rotate(90deg); }
.profile__side {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  height: 100%;
}
.profile__hint {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 14px 16px;
  border-radius: var(--g2-border-radius-lg);
  background: color-mix(in srgb, var(--g2-color-primary) 6%, var(--g2-bg-container));
  color: var(--g2-text-regular);
  font-size: var(--g2-font-size-sm);
  line-height: 1.7;
}
.profile__hint h4 { margin: 0 0 6px; font-size: var(--g2-font-size-base); color: var(--g2-text-primary); }
.profile__hint p { margin: 0; }
.profile__actions {
  flex: none;
  display: flex;
  justify-content: flex-end;
  padding: 0 0 4px;
}
@media (max-width: 1200px) {
  .profile { grid-template-columns: minmax(0, 1fr); }
  .profile__hint { display: none; }
  .profile__side { height: auto; }
}
</style>
