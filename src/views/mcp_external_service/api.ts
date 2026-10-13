/**
 * 外部服务表相关 API 服务
 * 提供外部服务表数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import type { McpExternalService, McpExternalServicePayload, McpExternalServiceQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

/**
 * 外部服务表 API 服务类
 */
export class McpExternalServiceApi {
  /**
   * 获取外部服务表列表
   * @param params 查询参数（可选）
   * @returns 外部服务表列表
   */
  static async list(params?: McpExternalServiceQuery): Promise<McpExternalService[]> {
    const http = getHttpClient('default');
    const res = await http.get<McpExternalService[]>('/mcp_external_service/list', params);
    return res.data || [];
  }

  /**
   * 分页查询外部服务表列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: McpExternalServiceQuery & PageSelectListDto): Promise<PageData<McpExternalService>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<McpExternalService>>('/mcp_external_service/page', params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 外部服务表 ID
   * @returns 外部服务表详情
   */
  static async getById(id: number): Promise<McpExternalService> {
    const http = getHttpClient('default');
    const res = await http.get<McpExternalService>(`/mcp_external_service/${id}`);
    return res.data;
  }

  /**
   * 保存外部服务表（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 外部服务表数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的外部服务表
   */
  static async save(payload: McpExternalServicePayload): Promise<McpExternalService> {
    const http = getHttpClient('default');
    const res = await http.post<McpExternalService>('/mcp_external_service/save', payload);
    return res.data;
  }

  /**
   * 删除外部服务表
   * @param id 外部服务表 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`/mcp_external_service/${id}`);
  }
}

