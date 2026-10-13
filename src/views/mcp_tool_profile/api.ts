/**
 * 暴露档案表相关 API 服务
 * 提供暴露档案表数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import type { McpToolProfile, McpToolProfilePayload, McpToolProfileQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

/**
 * 暴露档案表 API 服务类
 */
export class McpToolProfileApi {
  /**
   * 获取暴露档案表列表
   * @param params 查询参数（可选）
   * @returns 暴露档案表列表
   */
  static async list(params?: McpToolProfileQuery): Promise<McpToolProfile[]> {
    const http = getHttpClient('default');
    const res = await http.get<McpToolProfile[]>('/mcp_tool_profile/list', params);
    return res.data || [];
  }

  /**
   * 分页查询暴露档案表列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: McpToolProfileQuery & PageSelectListDto): Promise<PageData<McpToolProfile>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<McpToolProfile>>('/mcp_tool_profile/page', params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 暴露档案表 ID
   * @returns 暴露档案表详情
   */
  static async getById(id: number): Promise<McpToolProfile> {
    const http = getHttpClient('default');
    const res = await http.get<McpToolProfile>(`/mcp_tool_profile/${id}`);
    return res.data;
  }

  /**
   * 保存暴露档案表（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 暴露档案表数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的暴露档案表
   */
  static async save(payload: McpToolProfilePayload): Promise<McpToolProfile> {
    const http = getHttpClient('default');
    const res = await http.post<McpToolProfile>('/mcp_tool_profile/save', payload);
    return res.data;
  }

  /**
   * 删除暴露档案表
   * @param id 暴露档案表 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/mcp_tool_profile/${id}`);
  }
}

