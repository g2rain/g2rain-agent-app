/**
 * 聊天会话：会话观测列表的分页查询
 */

import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';
import type { ChatConversation, ChatConversationQuery } from './type';

const base = Gateway.HARNESS;
const http = () => getHttpClient('default');

export class ChatConversationApi {
  /** 分页查询，默认按最近消息时间倒序 */
  static async page(params: ChatConversationQuery & PageSelectListDto): Promise<PageData<ChatConversation>> {
    const res = await http().get<PageData<ChatConversation>>(`${base}/chat_conversation/page`, {
      sorts: ['lastMessageTime,desc'],
      ...params,
    });
    return res.data;
  }
}
