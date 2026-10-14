<template>
  <el-drawer :model-value="visible" size="720px" :title="title" @close="emit('close')">
    <div class="tool-picker">
      <el-input v-model="keyword" clearable :placeholder="searchPlaceholder" class="tool-picker__search" />
      <el-skeleton v-if="loading" :rows="6" animated />
      <el-empty v-else-if="groups.length === 0" :image-size="64" :description="emptyText" />
      <section v-for="group in groups" :key="group.service" class="tool-picker__group">
        <h4>{{ group.service }}</h4>
        <div
          v-for="tool in group.tools"
          :key="tool.name"
          class="tool-picker__item"
          :class="{ 'is-disabled': excluded.includes(tool.name) }"
          @click="toggle(tool.name)"
        >
          <el-checkbox
            class="tool-picker__check"
            :model-value="excluded.includes(tool.name) || selected.has(tool.name)"
            :disabled="excluded.includes(tool.name)"
          />
          <span class="tool-picker__method" :class="`is-${tool.method.toLowerCase()}`">{{ tool.method }}</span>
          <code class="tool-picker__name">{{ tool.name }}</code>
          <span class="tool-picker__title">{{ tool.title }}</span>
        </div>
      </section>
    </div>
    <template #footer>
      <el-button @click="emit('close')">{{ cancelText }}</el-button>
      <el-button type="primary" :disabled="selected.size === 0" @click="confirm">{{ confirmText }} {{ selected.size || '' }}</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { McpToolProfileApi } from '../api';
import type { McpToolProfileVo } from '../type';

/**
 * 按服务分组多选工具，已绑定的置灰。文案由调用方传入。
 *
 * @example
 * <ToolPicker :visible="open" :excluded="boundNames" title="添加工具" @confirm="bind" @close="open = false" />
 */
const props = withDefaults(
  defineProps<{
    visible: boolean;
    excluded?: string[];
    title?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    cancelText?: string;
    confirmText?: string;
  }>(),
  {
    excluded: () => [],
    title: '',
    searchPlaceholder: '',
    emptyText: '',
    cancelText: 'Cancel',
    confirmText: 'Add',
  },
);
const emit = defineEmits<{ confirm: [tools: McpToolProfileVo[]]; close: [] }>();

const tools = ref<McpToolProfileVo[]>([]);
const loading = ref(false);
const keyword = ref('');
const selected = ref(new Set<string>());

const groups = computed(() => {
  const word = keyword.value.trim().toLowerCase();
  const matched = tools.value.filter(
    (tool) => !word || tool.name.toLowerCase().includes(word) || tool.title.toLowerCase().includes(word),
  );
  const byService = new Map<string, McpToolProfileVo[]>();
  for (const tool of matched) byService.set(tool.serviceCode, [...(byService.get(tool.serviceCode) ?? []), tool]);
  return [...byService].map(([service, list]) => ({ service, tools: list }));
});

watch(
  () => props.visible,
  async (visible) => {
    if (!visible) return;
    selected.value = new Set();
    keyword.value = '';
    if (tools.value.length > 0) return;
    loading.value = true;
    try {
      tools.value = await McpToolProfileApi.list();
    } finally {
      loading.value = false;
    }
  },
);

function toggle(name: string): void {
  if (props.excluded.includes(name)) return;
  const next = new Set(selected.value);
  if (next.has(name)) next.delete(name);
  else next.add(name);
  selected.value = next;
}

function confirm(): void {
  emit('confirm', tools.value.filter((tool) => selected.value.has(tool.name)));
}
</script>

<style scoped>
.tool-picker__search { margin-bottom: 16px; }
.tool-picker__group h4 { margin: 16px 0 8px; font-size: var(--g2-font-size-sm); color: var(--g2-text-secondary); }
.tool-picker__item {
  display: grid;
  grid-template-columns: 24px 56px minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: var(--g2-border-radius-base);
  cursor: pointer;
}
.tool-picker__item:hover { background: var(--g2-fill-light); }
.tool-picker__item.is-disabled { opacity: 0.5; cursor: default; }
.tool-picker__check { pointer-events: none; }
.tool-picker__method { font-size: 11px; font-weight: 600; text-align: center; border-radius: 3px; padding: 1px 0; }
.tool-picker__method.is-get { color: var(--g2-color-primary); background: color-mix(in srgb, var(--g2-color-primary) 10%, transparent); }
.tool-picker__method.is-post, .tool-picker__method.is-put { color: var(--g2-color-success); background: color-mix(in srgb, var(--g2-color-success) 10%, transparent); }
.tool-picker__method.is-delete { color: var(--g2-color-danger); background: color-mix(in srgb, var(--g2-color-danger) 10%, transparent); }
.tool-picker__name { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; overflow: hidden; text-overflow: ellipsis; }
.tool-picker__title { color: var(--g2-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
