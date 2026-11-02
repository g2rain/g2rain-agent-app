/**
 * 问题模板相关 API 服务
 * 提供问题模板数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type { ChatPromptTemplate, ChatPromptTemplatePayload, ChatPromptTemplateQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

const base = Gateway.STUDIO;
const http = () => getHttpClient('default');

/**
 * 问题模板 API 服务类
 */
export class ChatPromptTemplateApi {
  /**
   * 获取问题模板列表
   * @param params 查询参数（可选）
   * @returns 问题模板列表
   */
  static async list(params?: ChatPromptTemplateQuery): Promise<ChatPromptTemplate[]> {
    const res = await http().get<ChatPromptTemplate[]>(`${base}/chat_prompt_template/list`, params);
    return res.data || [];
  }

  /**
   * 分页查询问题模板列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: ChatPromptTemplateQuery & PageSelectListDto): Promise<PageData<ChatPromptTemplate>> {
    const res = await http().get<PageData<ChatPromptTemplate>>(`${base}/chat_prompt_template/page`, params);
    return res.data;
  }

  /**
   * 保存问题模板（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 问题模板数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的问题模板
   */
  static async save(payload: ChatPromptTemplatePayload): Promise<ChatPromptTemplate> {
    const res = await http().post<ChatPromptTemplate>(`${base}/chat_prompt_template/save`, payload);
    return res.data;
  }

  /**
   * 删除问题模板
   * @param id 问题模板 ID
   */
  static async remove(id: number): Promise<void> {
    await http().delete(`${base}/chat_prompt_template/${id}`);
  }

  /** 修改问题模板状态 */
  static async updateStatus(id: number, status: string): Promise<void> {
    await http().post(`${base}/chat_prompt_template/${id}/status`, { status });
  }
}

