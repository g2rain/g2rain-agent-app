<template>
  <el-drawer :model-value="visible" size="720px" :title="title" @close="emit('close')">
    <div class="tool-picker">
      <el-tabs v-model="activeKind" @tab-change="onTabChange">
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.value"
          :label="tab.label"
          :name="tab.value"
        />
      </el-tabs>
      <el-input
        v-model="keyword"
        clearable
        :placeholder="searchPlaceholder"
        class="tool-picker__search"
        @keyup.enter="reload"
        @clear="reload"
      />
      <el-skeleton v-if="loading" :rows="6" animated />
      <el-empty v-else-if="groups.length === 0" :image-size="64" :description="emptyText" />
      <template v-else>
        <section v-for="group in groups" :key="group.service" class="tool-picker__group">
          <h4>{{ group.service }}</h4>
          <div
            v-for="tool in group.tools"
            :key="tool.name"
            class="tool-picker__item"
            :class="{ 'is-disabled': excluded.includes(tool.name) }"
            @click="toggle(tool)"
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
        <div class="tool-picker__pager">
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[20, 50, 100]"
            layout="total, sizes, prev, pager, next"
            small
            @current-change="loadPage"
            @size-change="onSizeChange"
          />
        </div>
      </template>
    </div>
    <template #footer>
      <el-button @click="emit('close')">{{ cancelText }}</el-button>
      <el-button type="primary" :disabled="selected.size === 0" @click="confirm">
        {{ confirmText }} {{ selected.size || '' }}
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RecordStatus, ResourceType } from '@runtime/console';
import { McpToolProfileApi } from '../api';
import type { McpToolProfileVo } from '../type';

/**
 * 按类型 Tab + 分页选工具；勾选跨 Tab 累加。平台技能可隐藏客户 Tab。
 */
const props = withDefaults(
  defineProps<{
    visible: boolean;
    /** 平台技能为 true 时不展示客户系统 Tab */
    hideCustomer?: boolean;
    excluded?: string[];
    title?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    cancelText?: string;
    confirmText?: string;
    builtInLabel?: string;
    extensionLabel?: string;
    customerLabel?: string;
  }>(),
  {
    hideCustomer: false,
    excluded: () => [],
    title: '',
    searchPlaceholder: '',
    emptyText: '',
    cancelText: 'Cancel',
    confirmText: 'Add',
    builtInLabel: '自有系统',
    extensionLabel: '扩展系统',
    customerLabel: '客户系统',
  },
);
const emit = defineEmits<{ confirm: [tools: McpToolProfileVo[]]; close: [] }>();

const tabs = computed(() => {
  const list = [
    { value: ResourceType.BUILT_IN, label: props.builtInLabel },
    { value: ResourceType.EXTENSION, label: props.extensionLabel },
  ];
  if (!props.hideCustomer) {
    list.push({ value: ResourceType.CUSTOMER, label: props.customerLabel });
  }
  return list;
});

const activeKind = ref(ResourceType.BUILT_IN);
const tools = ref<McpToolProfileVo[]>([]);
const loading = ref(false);
const keyword = ref('');
const pageNum = ref(1);
const pageSize = ref(20);
const total = ref(0);
/** 跨 Tab 勾选名 */
const selected = ref(new Set<string>());
/** 已勾选工具详情（跨页/跨 Tab 确认时用） */
const selectedTools = ref(new Map<string, McpToolProfileVo>());

const groups = computed(() => {
  const byService = new Map<string, McpToolProfileVo[]>();
  for (const tool of tools.value) {
    byService.set(tool.serviceCode, [...(byService.get(tool.serviceCode) ?? []), tool]);
  }
  return [...byService].map(([service, list]) => ({ service, tools: list }));
});

async function loadPage(): Promise<void> {
  loading.value = true;
  try {
    const page = await McpToolProfileApi.page(activeKind.value, {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      name: keyword.value.trim() || undefined,
      status: RecordStatus.ACTIVE,
    });
    tools.value = page?.records ?? [];
    total.value = page?.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function reload(): void {
  pageNum.value = 1;
  void loadPage();
}

function onTabChange(): void {
  pageNum.value = 1;
  keyword.value = '';
  void loadPage();
}

function onSizeChange(): void {
  pageNum.value = 1;
  void loadPage();
}

function toggle(tool: McpToolProfileVo): void {
  if (props.excluded.includes(tool.name)) return;
  const next = new Set(selected.value);
  const map = new Map(selectedTools.value);
  if (next.has(tool.name)) {
    next.delete(tool.name);
    map.delete(tool.name);
  } else {
    next.add(tool.name);
    map.set(tool.name, tool);
  }
  selected.value = next;
  selectedTools.value = map;
}

function confirm(): void {
  emit('confirm', [...selectedTools.value.values()]);
}

watch(
  () => props.visible,
  async (visible) => {
    if (!visible) return;
    selected.value = new Set();
    selectedTools.value = new Map();
    keyword.value = '';
    pageNum.value = 1;
    activeKind.value = ResourceType.BUILT_IN;
    await loadPage();
  },
);

watch(
  () => props.hideCustomer,
  (hide) => {
    if (hide && activeKind.value === ResourceType.CUSTOMER) {
      activeKind.value = ResourceType.BUILT_IN;
    }
  },
);
</script>

<style scoped>
.tool-picker__search { margin-bottom: 12px; }
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
.tool-picker__pager { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
