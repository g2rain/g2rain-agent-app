/**
 * 聊天会话表相关 API 服务
 * 提供聊天会话表数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import type { ChatConversation, ChatConversationPayload, ChatConversationQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

/**
 * 聊天会话表 API 服务类
 */
export class ChatConversationApi {
  /**
   * 获取聊天会话表列表
   * @param params 查询参数（可选）
   * @returns 聊天会话表列表
   */
  static async list(params?: ChatConversationQuery): Promise<ChatConversation[]> {
    const http = getHttpClient('default');
    const res = await http.get<ChatConversation[]>('/chat_conversation/list', params);
    return res.data || [];
  }

  /**
   * 分页查询聊天会话表列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: ChatConversationQuery & PageSelectListDto): Promise<PageData<ChatConversation>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<ChatConversation>>('/chat_conversation/page', params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 聊天会话表 ID
   * @returns 聊天会话表详情
   */
  static async getById(id: number): Promise<ChatConversation> {
    const http = getHttpClient('default');
    const res = await http.get<ChatConversation>(`/chat_conversation/${id}`);
    return res.data;
  }

  /**
   * 保存聊天会话表（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 聊天会话表数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的聊天会话表
   */
  static async save(payload: ChatConversationPayload): Promise<ChatConversation> {
    const http = getHttpClient('default');
    const res = await http.post<ChatConversation>('/chat_conversation/save', payload);
    return res.data;
  }

  /**
   * 删除聊天会话表
   * @param id 聊天会话表 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/chat_conversation/${id}`);
  }
}

