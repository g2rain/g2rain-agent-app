/**
 * 会话观测的查询条件。读取模型由会话详情模块提供。
 */
export type { ChatConversationVo } from '@/views/conversation_detail';

export interface ConversationQuery {
  /** 标题关键字 */
  title?: string;
  /** 创建时间区间 [开始, 结束]，格式 YYYY-MM-DD HH:mm:ss */
  createTime?: [string, string];
}
