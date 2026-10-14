/**
 * 会话详情的公共 API：会话观测等页面通过它跳转，不深度导入内部实现。
 *
 * @example
 * router.push(conversationDetailRoute(row.conversationId));
 */
import type { RouteLocationRaw } from 'vue-router';

export const CONVERSATION_DETAIL_PATH = '/conversation_detail';

/** 会话详情的路由；嵌入模式下保持 embed 参数 */
export function conversationDetailRoute(conversationId: string, embed = false): RouteLocationRaw {
  return { path: CONVERSATION_DETAIL_PATH, query: embed ? { conversationId, embed: '1' } : { conversationId } };
}

export type { ChatConversationVo } from './type';
