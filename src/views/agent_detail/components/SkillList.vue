<template>
  <div class="skill-list">
    <div class="skill-list__bar">
      <span class="skill-list__count">{{ fill($t('AGENT_SKILL_BOUND', '已绑定 {n} 个技能'), { n: rows.length }) }}</span>
      <template v-if="!readonly">
        <el-button v-permission="'agent:edit'" @click="emit('add')">{{ $t('AGENT_SKILL_ADD_EXISTING', '添加已有技能') }}</el-button>
        <el-button v-permission="'skill:add'" type="primary" @click="emit('create')">{{ $t('AGENT_SKILL_CREATE', '新建技能') }}</el-button>
      </template>
    </div>

    <el-empty v-if="rows.length === 0" :image-size="72" :description="$t('AGENT_SKILL_EMPTY', '还没有绑定技能')" />

    <ul v-else class="skill-list__items">
      <li v-for="row in rows" :key="row.binding.id" class="skill-list__item" :class="{ 'is-off': row.binding.enabledFlag !== 1 }">
        <div class="skill-list__main">
          <div class="skill-list__head">
            <span class="skill-list__name">{{ row.skill?.skillName ?? $t('AGENT_SKILL_MISSING', '技能不存在') }}</span>
            <code v-if="row.skill">{{ row.skill.skillKey }}</code>
            <el-tag v-if="row.skill" size="small" effect="plain" :type="row.skill.resourceType === ResourceType.PLATFORM ? 'info' : 'primary'">
              {{ resourceText(row.skill.resourceType) }}
            </el-tag>
            <span class="skill-list__meta">{{ row.mode ?? $t('AGENT_SKILL_CONTRACT_ERROR', '契约错误') }}</span>
            <span class="skill-list__meta">{{ fill($t('AGENT_SKILL_TOOL_COUNT', '{n} 工具'), { n: row.toolCount }) }}</span>
          </div>
          <p class="skill-list__desc">{{ firstLine(row.skill?.semanticDesc) }}</p>
        </div>
        <div class="skill-list__actions" @click.stop>
          <el-switch
            :model-value="row.binding.enabledFlag === 1"
            :disabled="readonly"
            size="small"
            @change="(on: string | number | boolean) => emit('toggle', row.binding, !!on)"
          />
          <el-button v-if="row.skill" link type="primary" @click="emit('open', row.skill.id)">
            {{ $t('AGENT_SKILL_CONFIGURE', '配置') }}
          </el-button>
          <el-dropdown v-if="!readonly" trigger="click" @command="() => emit('remove', row.binding)">
            <el-button link>⋯</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="remove" class="skill-list__danger">{{ $t('AGENT_SKILL_REMOVE', '移除') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { t } from '@platform/i18n';
import { ResourceType, fill } from '@runtime/console';
import type { AgentSkillBindingVo, SkillRow } from '../type';

/** 智能体绑定的技能列表；移除只解绑，删除技能由父组件在确认框中处理 */
defineProps<{ rows: SkillRow[]; readonly: boolean }>();
const emit = defineEmits<{
  add: [];
  create: [];
  open: [skillId: number];
  toggle: [binding: AgentSkillBindingVo, enabled: boolean];
  remove: [binding: AgentSkillBindingVo];
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
.skill-list__danger { color: var(--g2-color-danger); }
</style>
