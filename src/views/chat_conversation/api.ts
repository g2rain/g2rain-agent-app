/**
 * 聊天会话（只读列表为主；list 供会话详情复用）
 */

import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';
import type { ChatConversation, ChatConversationQuery } from './type';

const base = Gateway.HARNESS;
const http = () => getHttpClient('default');

export class ChatConversationApi {
  static async list(params?: ChatConversationQuery): Promise<ChatConversation[]> {
    const res = await http().get<ChatConversation[]>(`${base}/chat_conversation/list`, params);
    return res.data || [];
  }

  /** 分页查询，默认按最近消息时间倒序 */
  static async page(params: ChatConversationQuery & PageSelectListDto): Promise<PageData<ChatConversation>> {
    const res = await http().get<PageData<ChatConversation>>(`${base}/chat_conversation/page`, {
      sorts: ['lastMessageTime,desc'],
      ...params,
    });
    return res.data;
  }
}
