<template>
  <div class="agent-page">
    <header class="agent-page__head">
      <div>
        <h2>{{ $t('AGENT_MENU_AGENT', '智能体列表') }}</h2>
        <p>{{ $t('AGENT_LIST_SUBTITLE', '配置智能体画像与技能；平台智能体可供租户引用') }}</p>
      </div>
      <el-button v-permission="'agent:add'" type="primary" @click="openCreate">{{ $t('AGENT_NEW', '新建智能体') }}</el-button>
    </header>

    <div class="agent-page__filters">
      <el-radio-group v-model="segment" @change="search">
        <el-radio-button value="">{{ $t('AGENT_FILTER_ALL', '全部') }}</el-radio-button>
        <el-radio-button :value="ResourceType.PLATFORM">{{ $t('AGENT_RESOURCE_PLATFORM', '平台') }}</el-radio-button>
        <el-radio-button :value="ResourceType.CUSTOM">{{ $t('AGENT_RESOURCE_CUSTOM', '私有') }}</el-radio-button>
      </el-radio-group>
      <el-input
        v-model="keyword"
        clearable
        :placeholder="$t('AGENT_LIST_SEARCH', '搜索名称或编码')"
        style="width: 240px"
        @change="search"
        @clear="search"
      />
      <el-select
        v-model="status"
        clearable
        :placeholder="$t('AGENT_LIST_STATUS', '状态')"
        style="width: 120px"
        @change="search"
      >
        <el-option :label="$t('AGENT_STATUS_ACTIVE', '启用')" :value="RecordStatus.ACTIVE" />
        <el-option :label="$t('AGENT_STATUS_INACTIVE', '停用')" :value="RecordStatus.INACTIVE" />
      </el-select>
      <div class="agent-page__view">
        <el-radio-group v-model="view" size="small">
          <el-radio-button value="card">
            <el-icon><Grid /></el-icon>
          </el-radio-button>
          <el-radio-button value="table">
            <el-icon><List /></el-icon>
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <el-skeleton v-if="loading && !rows.length" :rows="6" animated />

    <el-result v-else-if="failure" icon="error" :sub-title="failure">
      <template #extra><el-button type="primary" @click="load">{{ $t('G2_BTN_RETRY', '重试') }}</el-button></template>
    </el-result>

    <template v-else>
      <!-- 卡片视图 -->
      <div v-if="view === 'card'" v-loading="loading" class="agent-page__grid">
        <article v-for="row in rows" :key="row.id" class="agent-card">
          <div class="agent-card__top">
            <span class="agent-card__avatar">{{ (row.agentName || '?').slice(0, 1) }}</span>
            <div class="agent-card__title">
              <h3>{{ row.agentName }}</h3>
              <div class="agent-card__meta">
                <code>{{ row.agentCode }}</code>
                <el-tag size="small" effect="plain" :type="isPlatform(row) ? 'info' : 'primary'">
                  {{ isPlatform(row) ? $t('AGENT_RESOURCE_PLATFORM', '平台') : $t('AGENT_RESOURCE_CUSTOM', '私有') }}
                </el-tag>
                <StatusDot :tone="describeStatus(row.status).tone" :label="describeStatus(row.status).label" />
              </div>
            </div>
            <el-dropdown v-if="canWrite(row)" trigger="click" @command="(cmd: string) => onMenu(row, cmd)">
              <el-button text :icon="MoreFilled" @click.stop />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-permission="'agent:edit'" command="toggle">
                    {{ row.status === RecordStatus.ACTIVE ? $t('AGENT_STATUS_INACTIVE', '停用') : $t('AGENT_STATUS_ACTIVE', '启用') }}
                  </el-dropdown-item>
                  <el-dropdown-item v-permission="'agent:delete'" command="delete" divided>
                    <span class="agent-page__danger">{{ $t('G2_BTN_DELETE', '删除') }}</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <p class="agent-card__summary">{{ summary(row) }}</p>
          <div class="agent-card__stats">
            {{ fill($t('AGENT_LIST_TOOL_COUNT', '{n} 个工具'), { n: row.toolCount }) }}
          </div>
          <div class="agent-card__actions">
            <el-button v-if="canWrite(row)" type="primary" plain @click="openConfig(row)">{{ $t('AGENT_LIST_CONFIG', '配置') }}</el-button>
            <el-button v-else @click="openConfig(row)">{{ $t('AGENT_LIST_VIEW', '查看') }}</el-button>
            <el-button @click="openSkills(row)">{{ fill($t('AGENT_LIST_SKILLS', '技能 {n}'), { n: row.skillCount }) }}</el-button>
            <el-button
              v-if="isPlatform(row) && !canWrite(row)"
              v-permission="'agent:copy'"
              disabled
              :title="$t('AGENT_COPY_PENDING', '复制为私有（待后端）')"
            >
              {{ $t('AGENT_COPY_PRIVATE', '复制为私有') }}
            </el-button>
          </div>
        </article>
        <el-empty v-if="!rows.length" :image-size="72" :description="$t('AGENT_LIST_EMPTY', '还没有智能体，点击右上角新建')" />
      </div>

      <!-- 表格视图 -->
      <el-table v-else v-loading="loading" :data="rows" class="agent-page__table" @row-click="openConfig">
        <el-table-column :label="$t('AGENT_LIST_COLUMN', '智能体')" min-width="260">
          <template #default="{ row }">
            <div class="agent-page__name">{{ row.agentName }}</div>
            <code class="agent-page__code">{{ row.agentCode }}</code>
          </template>
        </el-table-column>
        <el-table-column :label="$t('AGENT_LIST_SOURCE', '来源')" width="100">
          <template #default="{ row }">
            <el-tag size="small" effect="plain" :type="isPlatform(row) ? 'info' : 'primary'">
              {{ isPlatform(row) ? $t('AGENT_RESOURCE_PLATFORM', '平台') : $t('AGENT_RESOURCE_CUSTOM', '私有') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('AGENT_LIST_STATUS', '状态')" width="100">
          <template #default="{ row }">
            <StatusDot :tone="describeStatus(row.status).tone" :label="describeStatus(row.status).label" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('AGENT_TAB_SKILL', '技能')" width="80" prop="skillCount" />
        <el-table-column :label="$t('AGENT_LIST_TOOLS', '工具')" width="80" prop="toolCount" />
        <el-table-column :label="$t('G2_FIELD_UPDATE_TIME', '更新时间')" width="170" prop="updateTime" />
        <el-table-column :label="$t('G2_LBL_ACTION', '操作')" width="200" fixed="right">
          <template #default="{ row }">
            <el-button v-if="canWrite(row)" link type="primary" @click.stop="openConfig(row)">{{ $t('AGENT_LIST_CONFIG', '配置') }}</el-button>
            <el-button v-else link @click.stop="openConfig(row)">{{ $t('AGENT_LIST_VIEW', '查看') }}</el-button>
            <el-button link @click.stop="openSkills(row)">{{ fill($t('AGENT_LIST_SKILLS', '技能 {n}'), { n: row.skillCount }) }}</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :image-size="72" :description="$t('AGENT_LIST_EMPTY', '还没有智能体，点击右上角新建')" />
        </template>
      </el-table>

      <div class="agent-page__pagination">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="search"
          @current-change="load"
        />
      </div>
    </template>

    <el-drawer
      v-model="createOpen"
      :title="$t('AGENT_NEW', '新建智能体')"
      size="560px"
      destroy-on-close
      @closed="resetCreate"
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-position="top">
        <el-form-item :label="$t('AGENT_FIELD_NAME', '名称')" prop="agentName">
          <el-input v-model="createForm.agentName" maxlength="64" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('AGENT_FIELD_CODE', '编码')" prop="agentCode">
          <el-input v-model="createForm.agentCode" maxlength="64" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createOpen = false">{{ $t('G2_BTN_CANCEL', '取消') }}</el-button>
        <el-button type="primary" :loading="creating" @click="submitCreate">{{ $t('G2_BTN_SAVE', '保存') }}</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Grid, List, MoreFilled } from '@element-plus/icons-vue';
import { t } from '@platform/i18n';
import { StatusDot, PageElementPermission, showErrorMessage } from '@/components';
import { RecordStatus, ResourceType, describeStatus, fill } from '@runtime/console';
import { agentDetailRoute } from '@/views/agent_detail';
import { AgentApi } from './api';
import type { AgentCard, AgentCreatePayload } from './type';

const route = useRoute();
const router = useRouter();

const keyword = ref('');
const segment = ref('');
const status = ref('');
const view = ref<'card' | 'table'>('card');
const rows = ref<AgentCard[]>([]);
const loading = ref(false);
const failure = ref('');
const pageNum = ref(1);
const pageSize = ref(12);
const total = ref(0);

const createOpen = ref(false);
const creating = ref(false);
const createFormRef = ref<FormInstance>();
const createForm = reactive<AgentCreatePayload>({ agentName: '', agentCode: '' });
const createRules: FormRules = {
  agentName: [{ required: true, message: () => t('AGENT_REQUIRED_NAME', '请填写名称'), trigger: 'blur' }],
  agentCode: [{ required: true, message: () => t('AGENT_REQUIRED_CODE', '请填写编码'), trigger: 'blur' }],
};

const canEditPlatform = computed(() => PageElementPermission.has('agent:platform'));

function isPlatform(row: AgentCard): boolean {
  return row.resourceType === ResourceType.PLATFORM;
}

/** 私有可写；平台仅运营方（agent:platform）可写 */
function canWrite(row: AgentCard): boolean {
  return !isPlatform(row) || canEditPlatform.value;
}

function summary(row: AgentCard): string {
  const text = (row.missionDesc || row.identityDesc || '').trim();
  return text || t('AGENT_LIST_NO_SUMMARY', '暂无使命描述');
}

function syncQuery(): void {
  void router.replace({
    query: {
      ...(segment.value ? { resourceType: segment.value } : {}),
      ...(keyword.value ? { agentName: keyword.value } : {}),
      ...(status.value ? { status: status.value } : {}),
      ...(view.value !== 'card' ? { view: view.value } : {}),
      ...(pageNum.value > 1 ? { pageNum: String(pageNum.value) } : {}),
    },
  });
}

function readQuery(): void {
  const q = route.query;
  segment.value = typeof q.resourceType === 'string' ? q.resourceType : '';
  keyword.value = typeof q.agentName === 'string' ? q.agentName : '';
  status.value = typeof q.status === 'string' ? q.status : '';
  view.value = q.view === 'table' ? 'table' : 'card';
  const n = Number(q.pageNum);
  pageNum.value = Number.isFinite(n) && n > 0 ? n : 1;
}

async function load(): Promise<void> {
  loading.value = true;
  failure.value = '';
  syncQuery();
  try {
    const [page, binds, tools] = await Promise.all([
      AgentApi.page(
        {
          ...(keyword.value ? { agentName: keyword.value } : {}),
          ...(segment.value ? { resourceType: segment.value } : {}),
          ...(status.value ? { status: status.value } : {}),
        },
        pageNum.value,
        pageSize.value,
      ),
      AgentApi.agentSkills(),
      AgentApi.skillTools(),
    ]);
    const toolsBySkill = new Map<number, number>();
    for (const tool of tools) {
      toolsBySkill.set(tool.skillId, (toolsBySkill.get(tool.skillId) ?? 0) + 1);
    }
    const skillsByAgent = new Map<number, number[]>();
    for (const bind of binds) {
      const list = skillsByAgent.get(bind.agentId) ?? [];
      list.push(bind.skillId);
      skillsByAgent.set(bind.agentId, list);
    }
    rows.value = page.records.map((row) => {
      const skillIds = skillsByAgent.get(row.id) ?? [];
      const toolCount = skillIds.reduce((sum, skillId) => sum + (toolsBySkill.get(skillId) ?? 0), 0);
      return { ...row, skillCount: skillIds.length, toolCount };
    });
    total.value = page.total;
  } catch (error: unknown) {
    failure.value = error instanceof Error ? error.message : t('G2_MSG_LOAD_FAIL', '加载列表失败');
  } finally {
    loading.value = false;
  }
}

function search(): void {
  pageNum.value = 1;
  void load();
}

function openConfig(row: AgentCard): void {
  void router.push(agentDetailRoute(row.id));
}

function openSkills(row: AgentCard): void {
  void router.push(agentDetailRoute(row.id, 'skill'));
}

function openCreate(): void {
  createOpen.value = true;
}

function resetCreate(): void {
  createForm.agentName = '';
  createForm.agentCode = '';
  createFormRef.value?.clearValidate();
}

async function submitCreate(): Promise<void> {
  const valid = await createFormRef.value?.validate().catch(() => false);
  if (!valid) return;
  creating.value = true;
  try {
    // 不传 resourceType：后端按机构是否运营方落 PLATFORM / CUSTOM
    const id = await AgentApi.create({
      agentName: createForm.agentName.trim(),
      agentCode: createForm.agentCode.trim(),
      status: RecordStatus.ACTIVE,
    });
    createOpen.value = false;
    ElMessage.success(t('G2_MSG_SAVE_OK', '保存成功'));
    await router.push(agentDetailRoute(id));
  } catch (error: unknown) {
    showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败'));
  } finally {
    creating.value = false;
  }
}

async function onMenu(row: AgentCard, cmd: string): Promise<void> {
  if (cmd === 'toggle') {
    const next = row.status === RecordStatus.ACTIVE ? RecordStatus.INACTIVE : RecordStatus.ACTIVE;
    try {
      await AgentApi.saveStatus(row.id, next, row);
      ElMessage.success(t('G2_MSG_SAVE_OK', '保存成功'));
      await load();
    } catch (error: unknown) {
      showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_SAVE_FAIL', '保存失败'));
    }
    return;
  }
  if (cmd === 'delete') {
    try {
      await ElMessageBox.confirm(
        fill(t('AGENT_LIST_DELETE_CONFIRM', '确定删除智能体「{name}」？'), { name: row.agentName }),
        t('G2_LBL_TIP', '提示'),
        { type: 'warning' },
      );
      await AgentApi.remove(row.id);
      ElMessage.success(t('G2_MSG_DELETE_OK', '删除成功'));
      await load();
    } catch (error: unknown) {
      if (error === 'cancel' || error === 'close') return;
      showErrorMessage(error instanceof Error ? error.message : t('G2_MSG_DELETE_FAIL', '删除失败'));
    }
  }
}

watch(view, () => syncQuery());

onMounted(() => {
  readQuery();
  void load();
});
</script>

<style scoped>
.agent-page { padding: 16px 24px 24px; }
.agent-page__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.agent-page__head h2 { margin: 0; font-size: 18px; font-weight: 600; color: var(--g2-text-primary); }
.agent-page__head p { margin: 4px 0 0; color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.agent-page__filters { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin: 16px 0; }
.agent-page__view { margin-left: auto; }
.agent-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  min-height: 120px;
}
.agent-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px;
  border: 1px solid var(--g2-border-color);
  border-radius: var(--g2-radius-md, 8px);
  background: var(--g2-bg-container, var(--el-bg-color));
}
.agent-card__top { display: flex; align-items: flex-start; gap: 12px; }
.agent-card__avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--g2-color-primary);
  background: color-mix(in srgb, var(--g2-color-primary) 12%, transparent);
  flex: none;
}
.agent-card__title { flex: 1; min-width: 0; }
.agent-card__title h3 { margin: 0; font-size: 15px; font-weight: 600; color: var(--g2-text-primary); }
.agent-card__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 4px; }
.agent-card__meta code,
.agent-page__code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  color: var(--g2-text-secondary);
}
.agent-card__summary {
  margin: 0;
  color: var(--g2-text-secondary);
  font-size: var(--g2-font-size-sm);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.8em;
}
.agent-card__stats { color: var(--g2-text-secondary); font-size: var(--g2-font-size-sm); }
.agent-card__actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; }
.agent-page__name { font-weight: 500; color: var(--g2-text-primary); }
.agent-page__table :deep(.el-table__row) { cursor: pointer; }
.agent-page__pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
.agent-page__danger { color: var(--el-color-danger); }
</style>
