<template>
  <div class="contract">
    <div class="contract__bar">
      <el-radio-group v-model="view" size="small">
        <el-radio-button value="structure">{{ $t('AGENT_CONTRACT_STRUCTURE', '结构') }}</el-radio-button>
        <el-radio-button value="source">{{ $t('AGENT_CONTRACT_SOURCE', '源码') }}</el-radio-button>
      </el-radio-group>
      <span class="contract__summary">
        <span v-if="errorCount" class="is-error">{{ $t('AGENT_CONTRACT_ERRORS', { n: errorCount }, '{n} 个错误') }}</span>
        <span v-if="warningCount" class="is-warning">{{ $t('AGENT_CONTRACT_WARNINGS', { n: warningCount }, '{n} 个提示') }}</span>
        <span v-if="!errorCount && !warningCount" class="is-ok">{{ $t('AGENT_CONTRACT_OK', '校验通过') }}</span>
      </span>
      <el-button v-if="view === 'source'" size="small" @click="format">{{ $t('AGENT_CONTRACT_FORMAT', '格式化') }}</el-button>
    </div>

    <JsonEditor v-if="view === 'source' || !parsed.ok" v-model="model" :diagnostics="diagnostics" height="560px" />

    <div v-else class="contract__structure">
      <nav class="contract__nav">
        <button type="button" :class="navClass(ROOT)" @click="select(ROOT)">{{ $t('AGENT_CONTRACT_ROOT', '根属性') }}</button>
        <button type="button" :class="navClass(INPUTS)" @click="select(INPUTS)">
          {{ $t('AGENT_CONTRACT_INPUTS', '输入') }} <em>{{ count(contract.inputs) }}</em>
        </button>
        <button type="button" :class="navClass(OUTPUTS)" @click="select(OUTPUTS)">
          {{ $t('AGENT_CONTRACT_OUTPUTS', '产出') }} <em>{{ count(contract.outputs) }}</em>
        </button>
        <template v-for="group in toolGroups" :key="group.title">
          <h5>{{ group.title }}</h5>
          <button v-for="tool in group.tools" :key="tool.name" type="button" :class="navClass(tool.name)" @click="select(tool.name)">
            <i class="contract__mark" :class="`is-${tool.state}`" />
            <span class="contract__tool-name">{{ tool.label }}</span>
            <span v-if="tool.issues" class="contract__issue">⚠ {{ tool.issues }}</span>
          </button>
        </template>
      </nav>

      <section class="contract__detail">
        <ul v-if="selectedIssues.length" class="contract__issues">
          <li v-for="(issue, index) in selectedIssues" :key="index" :class="`is-${issue.severity}`">{{ issue.message }}</li>
        </ul>

        <template v-if="selected === ROOT">
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="mode">{{ contract.mode ?? 'REACT' }}</el-descriptions-item>
            <el-descriptions-item label="delegatable">{{ contract.delegatable ? 'true' : 'false' }}</el-descriptions-item>
            <el-descriptions-item label="target">{{ contract.target ?? EMPTY }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-else-if="selected === INPUTS || selected === OUTPUTS">
          <el-table :data="entries(selected === INPUTS ? contract.inputs : contract.outputs)" size="small" border>
            <el-table-column :label="$t('AGENT_CONTRACT_KEY', '名称')" prop="key" min-width="160" />
            <el-table-column :label="$t('AGENT_CONTRACT_DEFINITION', '定义')" min-width="320">
              <template #default="{ row }"><code class="contract__inline">{{ JSON.stringify(row.value) }}</code></template>
            </el-table-column>
          </el-table>
        </template>

        <template v-else-if="selectedTool">
          <div class="contract__tool-head">
            <code>{{ selected }}</code>
            <span>{{ selectedTool.label }}</span>
            <span v-if="isWriteTool(selectedTool)" class="contract__write">{{ $t('AGENT_TRACE_WRITE', '写') }}</span>
            <span v-if="selectedTool.confirm" class="contract__muted">{{ $t('AGENT_CONTRACT_CONFIRM', '需确认') }}</span>
          </div>
          <el-table :data="argRows" size="small" border>
            <el-table-column :label="$t('AGENT_CONTRACT_ARG', '参数')" prop="name" min-width="140" />
            <el-table-column :label="$t('AGENT_CONTRACT_SOURCE_COL', '来源')" min-width="200">
              <template #default="{ row }">{{ row.source }}</template>
            </el-table-column>
            <el-table-column :label="$t('AGENT_CONTRACT_REQUIRED', '必填')" width="70">
              <template #default="{ row }">{{ row.required ? $t('G2_LBL_YES', '是') : $t('G2_LBL_NO', '否') }}</template>
            </el-table-column>
            <el-table-column :label="$t('AGENT_CONTRACT_MISSING', '缺值处理')" min-width="160">
              <template #default="{ row }">{{ row.missing }}</template>
            </el-table-column>
          </el-table>
          <el-descriptions :column="1" size="small" class="contract__rules">
            <el-descriptions-item :label="$t('AGENT_CONTRACT_SUCCESS', '成功条件')">{{ successText }}</el-descriptions-item>
            <el-descriptions-item :label="$t('AGENT_CONTRACT_ERROR', '错误信息')">{{ errorText }}</el-descriptions-item>
            <el-descriptions-item :label="$t('AGENT_CONTRACT_EXTRACTS', '抽取')">{{ extractText }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <div v-else class="contract__unconfigured">
          <p>{{ $t('AGENT_CONTRACT_UNCONFIGURED', { name: selected }, '{name} 已绑定，但还没有配置契约。未配置的工具仍可调用，按只读、无参数约束处理。') }}</p>
          <el-button type="primary" plain @click="generate">{{ $t('AGENT_CONTRACT_GENERATE', '按参数定义生成契约骨架') }}</el-button>
        </div>

        <div v-if="segmentPath" class="contract__segment">
          <el-button link type="primary" @click="toggleSegment">
            {{ segmentOpen ? $t('AGENT_CONTRACT_SEGMENT_CLOSE', '收起 JSON') : $t('AGENT_CONTRACT_SEGMENT_EDIT', '编辑这一段的 JSON') }}
          </el-button>
          <template v-if="segmentOpen">
            <JsonEditor v-model="segmentText" height="280px" />
            <div class="contract__segment-actions">
              <el-button size="small" type="primary" @click="applySegment">{{ $t('AGENT_CONTRACT_SEGMENT_APPLY', '应用到契约') }}</el-button>
            </div>
          </template>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { t } from '@platform/i18n';
import { EMPTY } from '@runtime/console';
import type { McpToolMetaVo } from '@/views/mcp_tool_profile';
import { isWriteTool, parseContract, stringifyContract, toolSkeleton, type SkillContract } from '../contract';
import { issueUnder, toDiagnostics, type ContractIssue, type ContractPath } from '../contract-lint';

const JsonEditor = defineAsyncComponent(() => import('@/components/json-editor').then((m) => m.JsonEditor));

/**
 * 执行契约：结构视图逐个工具查看参数与规则，源码视图编辑整份 JSON；两种视图编辑同一份文本。
 * 契约不是合法 JSON 时只显示源码视图。
 */
const props = defineProps<{ toolNames: string[]; tools: McpToolMetaVo[]; issues: ContractIssue[] }>();
const model = defineModel<string>({ required: true });

const ROOT = '__root';
const INPUTS = '__inputs';
const OUTPUTS = '__outputs';

const view = ref<string>('structure');
const selected = ref<string>(ROOT);

const parsed = computed(() => parseContract(model.value));
const contract = computed<SkillContract>(() => (parsed.value.ok ? parsed.value.contract : {}));
const diagnostics = computed(() => toDiagnostics(model.value, props.issues));
const errorCount = computed(() => props.issues.filter((i) => i.severity === 'error').length);
const warningCount = computed(() => props.issues.filter((i) => i.severity === 'warning').length);

const count = (map: object | undefined) => Object.keys(map ?? {}).length;
const entries = (map: Record<string, unknown> | undefined) => Object.entries(map ?? {}).map(([key, value]) => ({ key, value }));

type ToolState = 'ok' | 'unconfigured' | 'unbound';

/** 工具导航：已绑定 ∪ 已配置，按查询 / 写入分组 */
const toolGroups = computed(() => {
  const configured = contract.value.tools ?? {};
  const names = [...new Set([...props.toolNames, ...Object.keys(configured)])];
  const items = names.map((name) => {
    const tool = configured[name];
    const state: ToolState = !tool ? 'unconfigured' : props.toolNames.includes(name) ? 'ok' : 'unbound';
    return {
      name,
      label: tool?.label ?? name,
      write: tool ? isWriteTool(tool) : (props.tools.find((m) => m.name === name)?.method ?? 'GET') !== 'GET',
      state,
      issues: props.issues.filter((issue) => issueUnder(issue, ['tools', name])).length,
    };
  });
  return [
    { title: t('AGENT_CONTRACT_QUERY_TOOLS', '查询'), tools: items.filter((i) => !i.write) },
    { title: t('AGENT_CONTRACT_WRITE_TOOLS', '写入'), tools: items.filter((i) => i.write) },
  ].filter((group) => group.tools.length > 0);
});

function navClass(key: string) {
  return ['contract__nav-item', { 'is-active': selected.value === key }];
}

const selectedTool = computed(() => contract.value.tools?.[selected.value]);

const selectedPath = computed<ContractPath>(() => {
  if (selected.value === ROOT) return [];
  if (selected.value === INPUTS) return ['inputs'];
  if (selected.value === OUTPUTS) return ['outputs'];
  return ['tools', selected.value];
});

const ROOT_KEYS = new Set<string | number>(['mode', 'delegatable', 'target']);

/** 当前选中项的问题：根属性取整体与根字段的问题，其余取该路径下的问题 */
const selectedIssues = computed(() =>
  selected.value === ROOT
    ? props.issues.filter((i) => i.path.length === 0 || ROOT_KEYS.has(i.path[0]))
    : props.issues.filter((i) => issueUnder(i, selectedPath.value)),
);

const SOURCE_TEXT: Record<string, [string, string]> = {
  USER: ['AGENT_SOURCE_USER', '用户'],
  MODEL: ['AGENT_SOURCE_MODEL', '模型'],
  EVIDENCE: ['AGENT_SOURCE_EVIDENCE', '证据'],
  PRIOR_TASK: ['AGENT_SOURCE_PRIOR_TASK', '前序任务'],
  NODE_OUTPUT: ['AGENT_SOURCE_NODE_OUTPUT', '节点产出'],
  SHARED: ['AGENT_SOURCE_SHARED', '共享'],
  SESSION: ['AGENT_SOURCE_SESSION', '会话'],
  CONTRACT: ['AGENT_SOURCE_CONTRACT', '契约'],
  PLATFORM: ['AGENT_SOURCE_PLATFORM', '平台'],
};

const MISSING_TEXT: Record<string, [string, string]> = {
  ASK_USER: ['AGENT_MISSING_ASK_USER', '追问用户'],
  CALL_TOOL: ['AGENT_MISSING_CALL_TOOL', '先调用'],
  FAIL: ['AGENT_MISSING_FAIL', '失败'],
};

const label = (map: Record<string, [string, string]>, key: string) => (map[key] ? t(...map[key]) : key);

const argRows = computed(() =>
  Object.entries(selectedTool.value?.args ?? {}).map(([name, spec]) => ({
    name,
    source: spec.from ?? (spec.const !== undefined ? `const ${JSON.stringify(spec.const)}` : (spec.sources ?? []).map((s) => label(SOURCE_TEXT, s)).join(' · ') || EMPTY),
    required: spec.required !== false,
    missing: spec.missing?.action ? [label(MISSING_TEXT, spec.missing.action), spec.missing.tool].filter(Boolean).join(' ') : EMPTY,
  })),
);

const successText = computed(() => {
  const success = selectedTool.value?.success;
  return success ? `${success.path ?? ''} ${success.op ?? ''} ${success.value === undefined ? '' : JSON.stringify(success.value)}`.trim() : EMPTY;
});
const errorText = computed(() => {
  const error = selectedTool.value?.error;
  return error ? [error.code, error.message].filter(Boolean).join(' / ') : EMPTY;
});
const extractText = computed(() => {
  const extracts = selectedTool.value?.extracts ?? [];
  return extracts.length ? extracts.map((e) => `${e.key ?? '?'} ← ${e.path ?? '?'}`).join('，') : EMPTY;
});

// ---------------------------------------------------------------- 片段编辑

const segmentOpen = ref(false);
const segmentText = ref('');

/** 可单独编辑的片段路径：根属性编辑 mode / delegatable / target，其余编辑对应对象 */
const segmentPath = computed<ContractPath | null>(() => (selected.value === ROOT || selectedTool.value || selected.value === INPUTS || selected.value === OUTPUTS ? selectedPath.value : null));

function segmentValue(): unknown {
  const c = contract.value;
  if (selected.value === ROOT) return { mode: c.mode, delegatable: c.delegatable, target: c.target };
  if (selected.value === INPUTS) return c.inputs ?? {};
  if (selected.value === OUTPUTS) return c.outputs ?? {};
  return c.tools?.[selected.value] ?? {};
}

function toggleSegment(): void {
  segmentOpen.value = !segmentOpen.value;
  if (segmentOpen.value) segmentText.value = JSON.stringify(segmentValue(), null, 2);
}

function write(next: SkillContract): void {
  model.value = stringifyContract(next);
}

function applySegment(): void {
  let value: unknown;
  try {
    value = JSON.parse(segmentText.value);
  } catch {
    ElMessage.error(t('AGENT_CONTRACT_SEGMENT_INVALID', '这一段不是合法的 JSON'));
    return;
  }
  const next: SkillContract = { ...contract.value };
  if (selected.value === ROOT) {
    const root = (value ?? {}) as Pick<SkillContract, 'mode' | 'delegatable' | 'target'>;
    Object.assign(next, { mode: root.mode, delegatable: root.delegatable, target: root.target });
  } else if (selected.value === INPUTS) {
    next.inputs = value as SkillContract['inputs'];
  } else if (selected.value === OUTPUTS) {
    next.outputs = value as SkillContract['outputs'];
  } else {
    next.tools = { ...(next.tools ?? {}), [selected.value]: value as NonNullable<SkillContract['tools']>[string] };
  }
  write(next);
  segmentOpen.value = false;
}

function generate(): void {
  const meta = props.tools.find((tool) => tool.name === selected.value);
  const skeleton = toolSkeleton({ title: meta?.title ?? selected.value, method: meta?.method ?? 'POST', inputSchema: meta?.inputSchema ?? null });
  write({ ...contract.value, tools: { ...(contract.value.tools ?? {}), [selected.value]: skeleton } });
}

function select(key: string): void {
  selected.value = key;
  segmentOpen.value = false;
}

function prettyJson(text: string): string | null {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return null;
  }
}

function format(): void {
  const pretty = prettyJson(model.value);
  if (pretty == null) {
    ElMessage.warning(t('AGENT_CONTRACT_FORMAT_FAIL', '内容不是合法 JSON，无法格式化'));
    return;
  }
  model.value = pretty;
}

/** 进入源码时直接美化 model（JsonEditor 异步挂载，等 ref 会扑空） */
watch(view, (value) => {
  if (value !== 'source') return;
  const pretty = prettyJson(model.value);
  if (pretty != null && pretty !== model.value) model.value = pretty;
});

/** 外部切换技能时回到根属性 */
watch(
  () => props.toolNames.join(','),
  () => select(ROOT),
);

</script>

<style scoped>
.contract__bar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.contract__summary { flex: 1; display: flex; gap: 12px; font-size: var(--g2-font-size-sm); }
.contract__summary .is-error { color: var(--g2-color-danger); }
.contract__summary .is-warning { color: var(--g2-color-warning); }
.contract__summary .is-ok { color: var(--g2-color-success); }
.contract__structure { display: grid; grid-template-columns: 240px minmax(0, 1fr); border: 1px solid var(--g2-border-color-light); border-radius: var(--g2-border-radius-lg); min-height: 520px; }
.contract__nav { padding: 8px; border-right: 1px solid var(--g2-border-color-light); overflow: auto; max-height: 640px; }
.contract__nav h5 { margin: 12px 8px 4px; font-size: 11px; font-weight: 600; color: var(--g2-text-placeholder); }
.contract__nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 6px 8px;
  border: none;
  border-radius: var(--g2-border-radius-base);
  background: none;
  font: inherit;
  text-align: left;
  color: var(--g2-text-regular);
  cursor: pointer;
}
.contract__nav-item:hover { background: var(--g2-fill-light); }
.contract__nav-item.is-active { background: color-mix(in srgb, var(--g2-color-primary) 10%, transparent); color: var(--g2-color-primary); }
.contract__nav-item em { margin-left: auto; font-style: normal; color: var(--g2-text-placeholder); }
.contract__tool-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.contract__mark { width: 8px; height: 8px; border-radius: 50%; flex: none; }
.contract__mark.is-ok { background: var(--g2-color-success); }
.contract__mark.is-unconfigured { border: 1.5px solid var(--g2-color-warning); }
.contract__mark.is-unbound { border: 1.5px dashed var(--g2-text-placeholder); }
.contract__issue { color: var(--g2-color-warning); font-size: 11px; }
.contract__detail { padding: 16px 20px; min-width: 0; }
.contract__issues { margin: 0 0 12px; padding: 8px 12px 8px 28px; border-radius: var(--g2-border-radius-base); background: var(--g2-fill-light); font-size: var(--g2-font-size-sm); }
.contract__issues .is-error { color: var(--g2-color-danger); }
.contract__issues .is-warning { color: var(--g2-color-warning); }
.contract__tool-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.contract__tool-head code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-weight: 600; }
.contract__write { padding: 0 4px; font-size: 11px; color: var(--g2-color-warning); border: 1px solid var(--g2-color-warning); border-radius: 3px; }
.contract__muted { color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.contract__rules { margin-top: 12px; }
.contract__inline { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; word-break: break-all; }
.contract__unconfigured p { color: var(--g2-text-regular); line-height: 1.7; }
.contract__segment { margin-top: 16px; }
.contract__segment-actions { display: flex; justify-content: flex-end; margin-top: 8px; }
</style>
