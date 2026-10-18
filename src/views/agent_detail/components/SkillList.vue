<template>
  <div class="skill-list">
    <div class="skill-list__bar">
      <span class="skill-list__count">{{ fill($t('AGENT_SKILL_COUNT', '{n} 个技能'), { n: rows.length }) }}</span>
      <el-button v-permission="'skill:add'" type="primary" @click="emit('create')">
        {{ $t('G2_BTN_ADD', '添加') }}
      </el-button>
    </div>

    <el-empty v-if="rows.length === 0" :image-size="72" :description="$t('AGENT_SKILL_EMPTY', '还没有技能')" />

    <ul v-else class="skill-list__items">
      <li
        v-for="row in rows"
        :key="row.skill.id"
        class="skill-list__item"
        :class="{ 'is-off': row.skill.status !== RecordStatus.ACTIVE }"
      >
        <div class="skill-list__main">
          <div class="skill-list__head">
            <span class="skill-list__name">{{ row.skill.skillName }}</span>
            <code>{{ row.skill.skillKey }}</code>
            <el-tag size="small" effect="plain" :type="row.skill.resourceType === ResourceType.PLATFORM ? 'info' : 'primary'">
              {{ resourceText(row.skill.resourceType) }}
            </el-tag>
            <span class="skill-list__meta">{{ row.mode ?? $t('AGENT_SKILL_CONTRACT_ERROR', '契约错误') }}</span>
            <span class="skill-list__meta">{{ fill($t('AGENT_SKILL_TOOL_COUNT', '{n} 工具'), { n: row.toolCount }) }}</span>
          </div>
          <p class="skill-list__desc">{{ firstLine(row.skill.semanticDesc) }}</p>
        </div>
        <div class="skill-list__actions" @click.stop>
          <StatusSwitch
            :model-value="row.skill.status"
            v-permission="'skill:edit'"
            active-value="ACTIVE"
            inactive-value="INACTIVE"
            :options="STATUS_OPTIONS"
            :api-method="({ nextValue }) => AgentDetailApi.updateSkillStatus(row.skill, String(nextValue))"
            @update:model-value="(value) => (row.skill.status = String(value))"
            @success="notifyStatusSwitchSuccess"
            @error="(p) => notifyStatusSwitchError(p)"
          />
          <el-button link type="primary" @click="emit('open', row.skill.id)">修改</el-button>
          <el-button link type="danger" @click="emit('remove', row.skill)">{{ $t('G2_BTN_DELETE', '删除') }}</el-button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { t } from '@platform/i18n';
import { StatusSwitch } from '@g2rain/ui/platform';
import { RecordStatus, ResourceType, fill } from '@runtime/console';
import { notifyStatusSwitchSuccess, notifyStatusSwitchError } from '@/components';
import { AgentDetailApi } from '../api';
import type { SkillProfileVo, SkillRow } from '../type';

const STATUS_OPTIONS = [
  { value: RecordStatus.ACTIVE, label: t('AGENT_STATUS_ACTIVE', '启用') },
  { value: RecordStatus.INACTIVE, label: t('AGENT_STATUS_INACTIVE', '禁用') },
];

defineProps<{ rows: SkillRow[] }>();
const emit = defineEmits<{
  create: [];
  open: [skillId: number];
  remove: [skill: SkillProfileVo];
}>();

function resourceText(type: string): string {
  return type === ResourceType.PLATFORM ? t('AGENT_RESOURCE_PLATFORM', '平台') : t('AGENT_RESOURCE_CUSTOM', '私有');
}

function firstLine(text: string | null | undefined): string {
  return (text ?? '').split('\n').find((line) => line.trim()) ?? '';
}
</script>

<style scoped>
.skill-list__bar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.skill-list__count { flex: 1; color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.skill-list__items { margin: 0; padding: 0; list-style: none; border: 1px solid var(--g2-border-color-light); border-radius: var(--g2-border-radius-lg); background: var(--g2-bg-container); }
.skill-list__item { display: flex; gap: 16px; align-items: center; padding: 14px 18px; border-bottom: 1px solid var(--g2-border-color-light); }
.skill-list__item:last-child { border-bottom: none; }
.skill-list__item.is-off .skill-list__main { opacity: 0.55; }
.skill-list__main { flex: 1; min-width: 0; }
.skill-list__head { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.skill-list__name { font-weight: 600; color: var(--g2-text-primary); }
.skill-list__head code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; color: var(--g2-text-secondary); }
.skill-list__meta { color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.skill-list__desc { margin: 6px 0 0; color: var(--g2-text-regular); font-size: var(--g2-font-size-sm); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.skill-list__actions { display: flex; align-items: center; gap: 8px; flex: none; }
</style>
