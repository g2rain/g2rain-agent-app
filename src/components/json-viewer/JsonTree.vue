<template>
  <span v-if="!isBranch" class="json-tree__leaf" :class="`is-${kind}`">{{ literal }}</span>
  <span v-else class="json-tree__branch">
    <span class="json-tree__toggle" @click="open = !open">
      <i class="json-tree__caret" :class="{ 'is-open': open }" />{{ isArray ? '[' : '{' }}
      <span v-if="!open" class="json-tree__summary">{{ summary }}{{ isArray ? ']' : '}' }}</span>
    </span>
    <template v-if="open">
      <div v-for="[key, child] in entries" :key="key" class="json-tree__row">
        <span v-if="!isArray" class="json-tree__key">"{{ key }}"</span><span v-if="!isArray">: </span>
        <JsonTree :value="child" :depth="depth + 1" :collapsed-depth="collapsedDepth" />
      </div>
      <span>{{ isArray ? ']' : '}' }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

defineOptions({ name: 'JsonTree' });

const props = defineProps<{ value: unknown; depth: number; collapsedDepth: number }>();

const isArray = computed(() => Array.isArray(props.value));
const isBranch = computed(() => props.value !== null && typeof props.value === 'object');
const kind = computed(() => (props.value === null ? 'null' : typeof props.value));
const literal = computed(() => JSON.stringify(props.value));
const entries = computed<[string, unknown][]>(() =>
  isBranch.value ? Object.entries(props.value as Record<string, unknown>) : [],
);
const summary = computed(() => (entries.value.length > 0 ? ` ${entries.value.length} … ` : ''));
const open = ref(props.depth < props.collapsedDepth);
</script>

<style scoped>
.json-tree__row { padding-left: 16px; }
.json-tree__toggle { cursor: pointer; }
.json-tree__caret {
  display: inline-block;
  width: 0;
  height: 0;
  margin-right: 4px;
  border-left: 4px solid var(--g2-text-secondary);
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  transition: transform var(--g2-transition-duration);
}
.json-tree__caret.is-open { transform: rotate(90deg); }
.json-tree__summary { color: var(--g2-text-placeholder); }
.json-tree__key { color: var(--g2-color-primary); }
.json-tree__leaf.is-string { color: var(--g2-color-success); }
.json-tree__leaf.is-number, .json-tree__leaf.is-boolean { color: var(--g2-color-warning); }
.json-tree__leaf.is-null { color: var(--g2-text-placeholder); }
</style>
