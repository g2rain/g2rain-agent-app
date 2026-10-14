/**
 * 会话观测 API（g2rain-agent-runtime，只读）。
 */
import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type { PageData } from '@platform/types/api.type';
import type { ChatConversationVo, ConversationQuery } from './type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

export class ConversationApi {
  /** 分页查询，按最近消息时间倒序 */
  static async page(query: ConversationQuery, pageNum: number, pageSize: number): Promise<PageData<ChatConversationVo>> {
    const res = await getHttpClient('default').get<PageData<ChatConversationVo>>(
      `${Gateway.HARNESS}/chat_conversation/page`,
      { ...query, pageNum, pageSize, sorts: ['lastMessageTime,desc'] },
    );
    return res.data;
  }
}
