<template>
  <el-drawer :model-value="visible" size="720px" :title="$t('AGENT_SKILL_ADD_EXISTING', '添加已有技能')" @close="emit('close')">
    <div class="skill-add">
      <div class="skill-add__list">
        <el-input v-model="keyword" clearable :placeholder="$t('AGENT_SKILL_SEARCH', '搜索技能名称或技能键')" />
        <section v-for="group in groups" :key="group.type">
          <h4>{{ group.title }}</h4>
          <div
            v-for="skill in group.skills"
            :key="skill.id"
            class="skill-add__item"
            :class="{ 'is-disabled': bound.has(skill.id), 'is-focused': focused?.id === skill.id }"
            @click="pick(skill)"
          >
            <el-checkbox class="skill-add__check" :model-value="bound.has(skill.id) || selected.has(skill.id)" :disabled="bound.has(skill.id)" />
            <div class="skill-add__text">
              <span>{{ skill.skillName }}</span>
              <code>{{ skill.skillKey }}</code>
            </div>
          </div>
        </section>
        <el-empty v-if="groups.length === 0" :image-size="64" :description="$t('AGENT_SKILL_NONE', '没有可添加的技能')" />
      </div>
      <div class="skill-add__preview">
        <template v-if="focused">
          <h4>{{ focused.skillName }}</h4>
          <p>{{ focused.semanticDesc || EMPTY }}</p>
        </template>
        <p v-else class="skill-add__muted">{{ $t('AGENT_SKILL_PREVIEW_HINT', '点击左侧技能查看说明') }}</p>
      </div>
    </div>
    <template #footer>
      <el-button @click="emit('close')">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
      <el-button type="primary" :disabled="selected.size === 0" @click="emit('confirm', [...selected])">
        {{ $t('AGENT_SKILL_ADD_CONFIRM', '添加') }} {{ selected.size || '' }}
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { t } from '@platform/i18n';
import { EMPTY, RecordStatus, ResourceType } from '@runtime/console';
import type { SkillProfileVo } from '../type';

/** 从平台技能与本机构私有技能中多选，已绑定的置灰；确认后只建绑定 */
const props = defineProps<{ visible: boolean; skills: SkillProfileVo[]; boundIds: number[] }>();
const emit = defineEmits<{ confirm: [skillIds: number[]]; close: [] }>();

const keyword = ref('');
const selected = ref(new Set<number>());
const focused = ref<SkillProfileVo | null>(null);
const bound = computed(() => new Set(props.boundIds));

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return;
    keyword.value = '';
    selected.value = new Set();
    focused.value = null;
  },
);

const groups = computed(() => {
  const word = keyword.value.trim().toLowerCase();
  const active = props.skills.filter(
    (s) =>
      s.status === RecordStatus.ACTIVE &&
      (!word || s.skillName.toLowerCase().includes(word) || s.skillKey.toLowerCase().includes(word)),
  );
  return [
    { type: ResourceType.PLATFORM, title: t('AGENT_RESOURCE_PLATFORM', '平台'), skills: active.filter((s) => s.resourceType === ResourceType.PLATFORM) },
    { type: ResourceType.CUSTOM, title: t('AGENT_RESOURCE_CUSTOM', '私有'), skills: active.filter((s) => s.resourceType !== ResourceType.PLATFORM) },
  ].filter((group) => group.skills.length > 0);
});

function pick(skill: SkillProfileVo): void {
  focused.value = skill;
  if (bound.value.has(skill.id)) return;
  const next = new Set(selected.value);
  if (next.has(skill.id)) next.delete(skill.id);
  else next.add(skill.id);
  selected.value = next;
}
</script>

<style scoped>
.skill-add { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; height: 100%; }
.skill-add__list { display: flex; flex-direction: column; gap: 8px; overflow: auto; }
.skill-add__list h4 { margin: 12px 0 4px; font-size: var(--g2-font-size-sm); color: var(--g2-text-secondary); }
.skill-add__item { display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: var(--g2-border-radius-base); cursor: pointer; }
.skill-add__item:hover, .skill-add__item.is-focused { background: var(--g2-fill-light); }
.skill-add__item.is-disabled { opacity: 0.5; }
.skill-add__check { pointer-events: none; }
.skill-add__text { display: flex; flex-direction: column; min-width: 0; }
.skill-add__text code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; color: var(--g2-text-secondary); }
.skill-add__preview { padding: 12px 16px; border-radius: var(--g2-border-radius-lg); background: var(--g2-fill-light); line-height: 1.7; font-size: var(--g2-font-size-sm); }
.skill-add__preview h4 { margin: 0 0 6px; }
.skill-add__muted { color: var(--g2-text-placeholder); }
</style>
