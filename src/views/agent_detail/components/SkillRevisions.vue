<template>
  <div class="revisions">
    <el-table v-loading="loading" :data="rows" size="small" row-key="id">
      <el-table-column :label="$t('AGENT_REVISION_NUMBER', '修订号')" width="100">
        <template #default="{ row }">
          <span>{{ row.status === 'DRAFT' ? $t('AGENT_REVISION_DRAFT', '草稿') : `#${row.revisionNo}` }}</span>
          <el-tag v-if="row.status === 'PUBLISHED'" size="small" type="success" effect="plain">
            {{ $t('AGENT_REVISION_CURRENT', '当前') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('AGENT_REVISION_STATUS', '状态')" width="130">
        <template #default="{ row }">
          <el-tag size="small" :type="statusType(row.status)">
            {{ $t(statusKey(row.status), statusText(row.status)) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('AGENT_REVISION_ORIGIN', '来源')" width="110">
        <template #default="{ row }">{{ $t(originKey(row.origin), originText(row.origin)) }}</template>
      </el-table-column>
      <el-table-column prop="baseRevisionNo" :label="$t('AGENT_REVISION_BASE', '基于修订号')" width="120" />
      <el-table-column prop="note" :label="$t('AGENT_REVISION_NOTE', '说明')" min-width="180" show-overflow-tooltip />
      <el-table-column prop="createTime" :label="$t('G2_FIELD_CREATE_TIME', '创建时间')" width="170" />
      <el-table-column :label="$t('G2_FIELD_ACTION', '操作')" fixed="right" width="250">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="view(row)">
            {{ $t('AGENT_REVISION_VIEW', '查看') }}
          </el-button>
          <el-button v-if="row.status === 'DRAFT'" v-permission="'skill:edit'" link type="success" size="small" @click="publish(row)">
            {{ $t('AGENT_REVISION_PUBLISH', '发布') }}
          </el-button>
          <el-button v-if="row.status === 'DRAFT'" v-permission="'skill:edit'" link type="danger" size="small" @click="discard(row)">
            {{ $t('AGENT_REVISION_DISCARD', '丢弃') }}
          </el-button>
          <el-button v-if="row.status === 'SUPERSEDED'" v-permission="'skill:edit'" link type="warning" size="small" @click="rollback(row)">
            {{ $t('AGENT_REVISION_ROLLBACK', '回滚') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="pageNum"
      :page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="load"
    />

    <el-dialog v-model="snapshotOpen" :title="$t('AGENT_REVISION_SNAPSHOT', '修订快照')" width="min(900px, 90vw)">
      <el-descriptions v-if="selected" :column="1" border>
        <el-descriptions-item :label="$t('G2_FIELD_NAME', '名称')">{{ selected.skillName }}</el-descriptions-item>
        <el-descriptions-item :label="$t('AGENT_SKILL_SEMANTIC', '语义描述')">{{ selected.semanticDesc || EMPTY }}</el-descriptions-item>
        <el-descriptions-item :label="$t('AGENT_REVISION_TOOLS', '工具列表')">
          <el-tag v-for="name in toolNames" :key="name" class="revision-tool" size="small">{{ name }}</el-tag>
          <span v-if="!toolNames.length">{{ EMPTY }}</span>
        </el-descriptions-item>
      </el-descriptions>
      <h4>{{ $t('AGENT_SKILL_TAB_MANUAL', '操作手册') }}</h4>
      <MarkdownViewer :content="selected?.skillManual ?? ''" :locale="locale" />
      <h4>{{ $t('AGENT_SKILL_TAB_CONTRACT', '执行契约') }}</h4>
      <JsonEditor v-model="contract" readonly height="360px" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { t } from '@platform/i18n';
import { EMPTY } from '@runtime/console';
import { AgentDetailApi } from '../api';
import type { SkillRevisionVo } from '../type';

const props = defineProps<{ skillId: number; locale: string }>();
const emit = defineEmits<{ published: [] }>();
const MarkdownViewer = defineAsyncComponent(() => import('@/components/markdown').then((module) => module.MarkdownViewer));
const JsonEditor = defineAsyncComponent(() => import('@/components/json-editor').then((module) => module.JsonEditor));
const rows = ref<SkillRevisionVo[]>([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = 10;
const total = ref(0);
const snapshotOpen = ref(false);
const selected = ref<SkillRevisionVo | null>(null);
const contract = ref('');
const toolNames = computed(() => {
  if (!selected.value?.toolNames) return [];
  try {
    const value: unknown = JSON.parse(selected.value.toolNames);
    return Array.isArray(value) ? value.filter((name): name is string => typeof name === 'string') : [];
  } catch {
    return [];
  }
});

watch(() => props.skillId, () => {
  pageNum.value = 1;
  void load();
}, { immediate: true });

async function load(): Promise<void> {
  loading.value = true;
  try {
    const page = await AgentDetailApi.skillRevisions(props.skillId, { pageNum: pageNum.value, pageSize });
    rows.value = page.records ?? [];
    total.value = page.total ?? 0;
  } finally {
    loading.value = false;
  }
}

async function view(row: SkillRevisionVo): Promise<void> {
  selected.value = await AgentDetailApi.skillRevision(row.id);
  contract.value = selected.value.skillContract ?? '{}';
  snapshotOpen.value = true;
}

async function confirm(message: string): Promise<boolean> {
  return ElMessageBox.confirm(message, t('G2_LBL_TIP', '提示'), { type: 'warning' })
    .then(() => true, () => false);
}

async function publish(row: SkillRevisionVo): Promise<void> {
  if (!await confirm(t('AGENT_REVISION_PUBLISH_CONFIRM', '发布后立即生效，确定发布此修订吗？'))) return;
  try {
    await AgentDetailApi.publishSkillRevision(row.id, row.baseRevisionNo ?? 0);
    ElMessage.success(t('AGENT_REVISION_PUBLISHED', '修订已发布'));
    await load();
    emit('published');
  } catch {
    // 请求失败已由 http 层统一提示
  }
}

async function discard(row: SkillRevisionVo): Promise<void> {
  if (!await confirm(t('AGENT_REVISION_DISCARD_CONFIRM', '确定丢弃此草稿吗？'))) return;
  try {
    await AgentDetailApi.discardSkillRevision(row.id);
    ElMessage.success(t('AGENT_REVISION_DISCARDED', '草稿已丢弃'));
    await load();
  } catch {
    // 请求失败已由 http 层统一提示
  }
}

async function rollback(row: SkillRevisionVo): Promise<void> {
  if (!await confirm(t('AGENT_REVISION_ROLLBACK_CONFIRM', '将以该修订的内容生成新修订并立即生效，确定继续吗？'))) return;
  try {
    await AgentDetailApi.rollbackSkillRevision(row.id);
    ElMessage.success(t('AGENT_REVISION_ROLLED_BACK', '已回滚并生效'));
    await load();
    emit('published');
  } catch {
    // 请求失败已由 http 层统一提示
  }
}

function statusKey(status: SkillRevisionVo['status']): string { return `AGENT_REVISION_STATUS_${status}`; }
function statusText(status: SkillRevisionVo['status']): string {
  return { DRAFT: '草稿', PUBLISHED: '已发布', SUPERSEDED: '已被替代', DISCARDED: '已丢弃' }[status];
}
function statusType(status: SkillRevisionVo['status']): 'success' | 'warning' | 'info' | 'danger' {
  const types: Record<SkillRevisionVo['status'], 'success' | 'warning' | 'info' | 'danger'> = {
    DRAFT: 'warning',
    PUBLISHED: 'success',
    SUPERSEDED: 'info',
    DISCARDED: 'danger',
  };
  return types[status];
}
function originKey(origin: SkillRevisionVo['origin']): string { return `AGENT_REVISION_ORIGIN_${origin}`; }
function originText(origin: SkillRevisionVo['origin']): string {
  return { MANUAL: '人工保存', CANDIDATE: '候选草稿', ROLLBACK: '回滚' }[origin];
}
</script>

<style scoped>
.revisions { display: grid; gap: 12px; }
.revisions :deep(.el-pagination) { justify-content: flex-end; }
.revision-tool { margin: 2px 6px 2px 0; }
</style>
