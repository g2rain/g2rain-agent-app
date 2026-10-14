<template>
  <div ref="host" class="json-editor" :style="{ height }" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { EditorView, basicSetup } from 'codemirror';
import { Compartment, EditorState } from '@codemirror/state';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { forceLinting, linter, lintGutter, type Diagnostic } from '@codemirror/lint';
import type { JsonDiagnostic } from './types';

/**
 * JSON 编辑器：高亮、折叠、语法校验，外部诊断（如契约校验结果）叠加显示。
 *
 * @example
 * <JsonEditor ref="editor" v-model="form.skillContract" :diagnostics="issues" height="560px" />
 * editor.value?.format();
 */
const props = withDefaults(
  defineProps<{ height?: string; readonly?: boolean; diagnostics?: JsonDiagnostic[] }>(),
  { height: '360px', readonly: false, diagnostics: () => [] },
);

const model = defineModel<string>({ default: '' });
const host = ref<HTMLDivElement>();
const view = shallowRef<EditorView>();
const readonlyCompartment = new Compartment();

/** 外部诊断：随 props 变化由 linter 重新拉取 */
const externalLinter = linter(() => props.diagnostics.map(toDiagnostic), { delay: 0 });

function toDiagnostic(issue: JsonDiagnostic): Diagnostic {
  const length = view.value?.state.doc.length ?? 0;
  const from = Math.min(Math.max(issue.from, 0), length);
  return { from, to: Math.min(Math.max(issue.to, from), length), severity: issue.severity, message: issue.message };
}

const theme = EditorView.theme({
  '&': { height: '100%', fontSize: 'var(--g2-font-size-sm)', backgroundColor: 'var(--g2-bg-container)' },
  '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' },
  '.cm-gutters': { backgroundColor: 'var(--g2-fill-light)', color: 'var(--g2-text-placeholder)', border: 'none' },
  '&.cm-focused': { outline: 'none' },
});

onMounted(() => {
  view.value = new EditorView({
    parent: host.value,
    state: EditorState.create({
      doc: model.value,
      extensions: [
        basicSetup,
        json(),
        lintGutter(),
        linter(jsonParseLinter()),
        externalLinter,
        theme,
        readonlyCompartment.of(EditorState.readOnly.of(props.readonly)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) model.value = update.state.doc.toString();
        }),
      ],
    }),
  });
});

watch(model, (value) => {
  const current = view.value?.state.doc.toString();
  if (view.value && value !== current) {
    view.value.dispatch({ changes: { from: 0, to: view.value.state.doc.length, insert: value } });
  }
});

watch(
  () => props.readonly,
  (readonly) => view.value?.dispatch({ effects: readonlyCompartment.reconfigure(EditorState.readOnly.of(readonly)) }),
);

watch(
  () => props.diagnostics,
  () => {
    if (view.value) forceLinting(view.value);
  },
);

onBeforeUnmount(() => view.value?.destroy());

/** 按两个空格缩进格式化；内容不是合法 JSON 时返回 false 且不改动 */
function format(): boolean {
  try {
    model.value = JSON.stringify(JSON.parse(model.value), null, 2);
    return true;
  } catch {
    return false;
  }
}

/** 选中并滚动到指定区间，供诊断面板定位 */
function reveal(from: number, to = from): void {
  view.value?.dispatch({ selection: { anchor: from, head: to }, scrollIntoView: true });
  view.value?.focus();
}

defineExpose({ format, reveal });
</script>

<style scoped>
.json-editor {
  border: 1px solid var(--g2-border-color-light);
  border-radius: var(--g2-border-radius-base);
  overflow: hidden;
}
</style>
