/**
 * runtime 内置工具名 → 界面动作名。业务工具原样返回工具名。
 *
 * @example
 * actionLabel('builtin_node_finish'); // '完成节点'
 * actionLabel('post_article_save');   // 'post_article_save'
 */
import { t } from '@platform/i18n';

const BUILTIN_ACTIONS: Record<string, [code: string, text: string]> = {
  builtin_node_finish: ['AGENT_ACTION_NODE_FINISH', '完成节点'],
  builtin_node_fail: ['AGENT_ACTION_NODE_FAIL', '节点失败'],
  builtin_node_approval: ['AGENT_ACTION_NODE_APPROVAL', '申请确认'],
  builtin_node_follow_up: ['AGENT_ACTION_NODE_FOLLOW_UP', '追问用户'],
  builtin_node_delegate: ['AGENT_ACTION_NODE_DELEGATE', '委派'],
  builtin_state_set: ['AGENT_ACTION_STATE_SET', '写入便签'],
  builtin_state_get: ['AGENT_ACTION_STATE_GET', '读取便签'],
  builtin_session_info: ['AGENT_ACTION_SESSION_INFO', '会话信息'],
};

/** 是否为 runtime 内置工具 */
export function isBuiltinAction(name: string | null | undefined): boolean {
  return !!name && name.startsWith('builtin_');
}

/** 动作名：内置工具翻译为中文动作，业务工具返回原名，空值返回「用户操作」 */
export function actionLabel(name: string | null | undefined): string {
  if (!name) return t('AGENT_ACTION_USER', '用户操作');
  const entry = BUILTIN_ACTIONS[name];
  return entry ? t(entry[0], entry[1]) : name;
}
