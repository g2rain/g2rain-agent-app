/**
 * 工具调用记录表相关 API 服务
 * 提供工具调用记录表数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import type { ToolCallRecord, ToolCallRecordPayload, ToolCallRecordQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

/**
 * 工具调用记录表 API 服务类
 */
export class ToolCallRecordApi {
  /**
   * 获取工具调用记录表列表
   * @param params 查询参数（可选）
   * @returns 工具调用记录表列表
   */
  static async list(params?: ToolCallRecordQuery): Promise<ToolCallRecord[]> {
    const http = getHttpClient('default');
    const res = await http.get<ToolCallRecord[]>('/tool_call_record/list', params);
    return res.data || [];
  }

  /**
   * 分页查询工具调用记录表列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: ToolCallRecordQuery & PageSelectListDto): Promise<PageData<ToolCallRecord>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<ToolCallRecord>>('/tool_call_record/page', params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 工具调用记录表 ID
   * @returns 工具调用记录表详情
   */
  static async getById(id: number): Promise<ToolCallRecord> {
    const http = getHttpClient('default');
    const res = await http.get<ToolCallRecord>(`/tool_call_record/${id}`);
    return res.data;
  }

  /**
   * 保存工具调用记录表（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 工具调用记录表数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的工具调用记录表
   */
  static async save(payload: ToolCallRecordPayload): Promise<ToolCallRecord> {
    const http = getHttpClient('default');
    const res = await http.post<ToolCallRecord>('/tool_call_record/save', payload);
    return res.data;
  }

  /**
   * 删除工具调用记录表
   * @param id 工具调用记录表 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/tool_call_record/${id}`);
  }
}

