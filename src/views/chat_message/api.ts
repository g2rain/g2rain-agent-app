/**
 * 聊天消息表相关 API 服务
 * 提供聊天消息表数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type { ChatMessage, ChatMessagePayload, ChatMessageQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

const base = Gateway.HARNESS;

/**
 * 聊天消息表 API 服务类
 */
export class ChatMessageApi {
  /**
   * 获取聊天消息表列表
   * @param params 查询参数（可选）
   * @returns 聊天消息表列表
   */
  static async list(params?: ChatMessageQuery): Promise<ChatMessage[]> {
    const http = getHttpClient('default');
    const res = await http.get<ChatMessage[]>(`${base}/chat_message/list`, params);
    return res.data || [];
  }

  /**
   * 分页查询聊天消息表列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: ChatMessageQuery & PageSelectListDto): Promise<PageData<ChatMessage>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<ChatMessage>>(`${base}/chat_message/page`, params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 聊天消息表 ID
   * @returns 聊天消息表详情
   */
  static async getById(id: number): Promise<ChatMessage> {
    const http = getHttpClient('default');
    const res = await http.get<ChatMessage>(`${base}/chat_message/${id}`);
    return res.data;
  }

  /**
   * 保存聊天消息表（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 聊天消息表数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的聊天消息表
   */
  static async save(payload: ChatMessagePayload): Promise<ChatMessage> {
    const http = getHttpClient('default');
    const res = await http.post<ChatMessage>(`${base}/chat_message/save`, payload);
    return res.data;
  }

  /**
   * 删除聊天消息表
   * @param id 聊天消息表 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`${base}/chat_message/${id}`);
  }
}

