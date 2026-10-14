<template>
  <div class="preview">
    <p class="preview__hint">{{ $t('AGENT_PREVIEW_HINT', 'runtime 每轮实际加载的内容：只包含启用的技能与工具绑定。下方标出会导致技能被丢弃或工具缺少约束的问题。') }}</p>
    <el-skeleton v-if="loading" :rows="6" animated />
    <el-empty v-else-if="items.length === 0" :image-size="72" :description="$t('AGENT_PREVIEW_EMPTY', '没有可加载的技能，规划会失败')" />
    <ul v-else class="preview__skills">
      <li v-for="item in items" :key="item.skillKey" class="preview__skill">
        <header @click="toggle(item.skillKey)">
          <i class="preview__caret" :class="{ 'is-open': opened.has(item.skillKey) }" />
          <span class="preview__name">{{ item.skillName }}</span>
          <code>{{ item.skillKey }}</code>
          <span class="preview__meta">{{ fill($t('AGENT_SKILL_TOOL_COUNT', '{n} 工具'), { n: item.tools.length }) }}</span>
          <span v-for="problem in item.problems" :key="problem.text" class="preview__problem" :class="`is-${problem.level}`">
            {{ problem.text }}
          </span>
          <el-button link type="primary" @click.stop="emit('open', item.skillKey)">{{ $t('AGENT_SKILL_CONFIGURE', '配置') }}</el-button>
        </header>
        <ul v-if="opened.has(item.skillKey)" class="preview__tools">
          <li v-for="tool in item.tools" :key="tool.name">
            <i class="preview__dot" :class="`is-${tool.state}`" />
            <code>{{ tool.name }}</code>
            <span class="preview__meta">{{ tool.text }}</span>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { t } from '@platform/i18n';
import { fill } from '@runtime/console';
import { parseContract } from '../contract';
import type { CapabilityBundleVo } from '../type';

/** 能力预览：展示 capability_bundle，并标出契约为空 / 非法、工具未配置契约、契约工具未绑定 */
const props = defineProps<{ bundle: CapabilityBundleVo | null; loading: boolean }>();
const emit = defineEmits<{ open: [skillKey: string] }>();

const opened = ref(new Set<string>());

function toggle(key: string): void {
  const next = new Set(opened.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  opened.value = next;
}

const items = computed(() =>
  (props.bundle?.skills ?? []).map((skill) => {
    const parsed = parseContract(skill.skillContract);
    const configured = new Set(parsed.ok ? Object.keys(parsed.contract.tools ?? {}) : []);
    const bound = skill.tools.map((tool) => tool.toolName);
    const problems: { level: 'error' | 'warning'; text: string }[] = [];
    if (!parsed.ok) problems.push({ level: 'error', text: t('AGENT_PREVIEW_CONTRACT_INVALID', '契约为空或不是合法 JSON，技能会被丢弃') });
    const unconfigured = bound.filter((name) => parsed.ok && !configured.has(name));
    const unbound = [...configured].filter((name) => !bound.includes(name));
    if (unconfigured.length) problems.push({ level: 'warning', text: fill(t('AGENT_PREVIEW_UNCONFIGURED', '{n} 个工具未配置契约'), { n: unconfigured.length }) });
    if (unbound.length) problems.push({ level: 'warning', text: fill(t('AGENT_PREVIEW_UNBOUND', '{n} 个契约工具未绑定'), { n: unbound.length }) });
    return {
      skillKey: skill.skillKey,
      skillName: skill.skillName,
      problems,
      tools: [
        ...bound.map((name) => ({
          name,
          state: configured.has(name) ? 'ok' : 'warning',
          text: configured.has(name) ? t('AGENT_CONTRACT_CONFIGURED', '已配置') : t('AGENT_CONTRACT_NOT_CONFIGURED', '未配置'),
        })),
        ...unbound.map((name) => ({ name, state: 'muted', text: t('AGENT_PREVIEW_NOT_CALLABLE', '未绑定，不可调用') })),
      ],
    };
  }),
);
</script>

<style scoped>
.preview__hint { margin: 0 0 12px; color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.preview__skills { margin: 0; padding: 0; list-style: none; border: 1px solid var(--g2-border-color-light); border-radius: var(--g2-border-radius-lg); background: var(--g2-bg-container); }
.preview__skill { border-bottom: 1px solid var(--g2-border-color-light); }
.preview__skill:last-child { border-bottom: none; }
.preview__skill header { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 12px 16px; cursor: pointer; }
.preview__name { font-weight: 600; color: var(--g2-text-primary); }
.preview__skill code, .preview__tools code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; color: var(--g2-text-secondary); }
.preview__meta { color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.preview__problem { font-size: var(--g2-font-size-sm); }
.preview__problem.is-error { color: var(--g2-color-danger); }
.preview__problem.is-warning { color: var(--g2-color-warning); }
.preview__skill header .el-button { margin-left: auto; }
.preview__tools { margin: 0; padding: 0 16px 12px 40px; list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 6px 16px; }
.preview__tools li { display: flex; align-items: center; gap: 8px; }
.preview__dot { width: 7px; height: 7px; border-radius: 50%; flex: none; }
.preview__dot.is-ok { background: var(--g2-color-success); }
.preview__dot.is-warning { background: var(--g2-color-warning); }
.preview__dot.is-muted { background: var(--g2-text-placeholder); }
.preview__caret { width: 0; height: 0; border-left: 5px solid var(--g2-text-secondary); border-top: 5px solid transparent; border-bottom: 5px solid transparent; transition: transform var(--g2-transition-duration); }
.preview__caret.is-open { transform: rotate(90deg); }
</style>
