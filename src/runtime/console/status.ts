/**
 * 业务状态 → 语义色与文案。页面用它驱动 `StatusDot`，components 不感知业务枚举。
 *
 * @example
 * const { tone, label } = describeStatus('FAILED'); // { tone: 'danger', label: '失败' }
 */
import { t } from '@platform/i18n';
import type { Tone } from '@/components/status-dot';

interface StatusMeta {
  tone: Tone;
  code: string;
  text: string;
}

const STATUS_META: Record<string, StatusMeta> = {
  RUNNING: { tone: 'running', code: 'AGENT_STATUS_RUNNING', text: '进行中' },
  STARTED: { tone: 'running', code: 'AGENT_STATUS_STARTED', text: '调用中' },
  READY: { tone: 'running', code: 'AGENT_STATUS_READY', text: '就绪' },
  WAITING_DELEGATE: { tone: 'running', code: 'AGENT_STATUS_WAITING_DELEGATE', text: '等待委派' },
  PENDING: { tone: 'muted', code: 'AGENT_STATUS_PENDING', text: '未开始' },
  SUSPENDED: { tone: 'waiting', code: 'AGENT_STATUS_SUSPENDED', text: '等待用户' },
  SUCCEEDED: { tone: 'success', code: 'AGENT_STATUS_SUCCEEDED', text: '成功' },
  DONE: { tone: 'success', code: 'AGENT_STATUS_DONE', text: '完成' },
  SUCCESS: { tone: 'success', code: 'AGENT_STATUS_SUCCESS', text: '成功' },
  ACTIVE: { tone: 'success', code: 'AGENT_STATUS_ACTIVE', text: '启用' },
  FAILED: { tone: 'danger', code: 'AGENT_STATUS_FAILED', text: '失败' },
  TIMEOUT: { tone: 'danger', code: 'AGENT_STATUS_TIMEOUT', text: '超时' },
  UNKNOWN: { tone: 'danger', code: 'AGENT_STATUS_UNKNOWN', text: '结果未知' },
  UNKNOWN_PRE_CALL: { tone: 'danger', code: 'AGENT_STATUS_UNKNOWN_PRE_CALL', text: '未发出' },
  CANCELED: { tone: 'muted', code: 'AGENT_STATUS_CANCELED', text: '已取消' },
  CANCELLED: { tone: 'muted', code: 'AGENT_STATUS_CANCELLED', text: '已取消' },
  SKIPPED: { tone: 'muted', code: 'AGENT_STATUS_SKIPPED', text: '已跳过' },
  INACTIVE: { tone: 'muted', code: 'AGENT_STATUS_INACTIVE', text: '停用' },
};

/** 描述一个状态值；未知取值原样显示为中性色 */
export function describeStatus(value: string | null | undefined): { tone: Tone; label: string } {
  const meta = value ? STATUS_META[value] : undefined;
  if (!meta) return { tone: 'muted', label: value || '—' };
  return { tone: meta.tone, label: t(meta.code, meta.text) };
}
