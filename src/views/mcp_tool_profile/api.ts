/**
 * 暴露档案表相关 API 服务
 * 提供暴露档案表数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import { Gateway, ResourceType } from '@runtime/console';
import type { McpToolProfile, McpToolProfilePayload, McpToolProfileQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

const base = Gateway.MCP;

/**
 * 暴露档案表 API 服务类
 */
function kindOf(resourceType: string): 'built_in' | 'extension' | 'customer' {
  if (resourceType === ResourceType.EXTENSION) return 'extension';
  if (resourceType === ResourceType.CUSTOMER) return 'customer';
  return 'built_in';
}

export class McpToolProfileApi {
  /**
   * 获取暴露档案表列表
   * @param params 查询参数（可选）
   * @returns 暴露档案表列表
   */
  static async listAll(): Promise<McpToolProfile[]> {
    const kinds = [ResourceType.BUILT_IN, ResourceType.EXTENSION, ResourceType.CUSTOMER];
    const parts = await Promise.all(kinds.map((kind) => McpToolProfileApi.list(kind)));
    return parts.flat();
  }

  static async list(resourceType: string, params?: McpToolProfileQuery): Promise<McpToolProfile[]> {
    const http = getHttpClient('default');
    const res = await http.get<McpToolProfile[]>(`${base}/mcp_tool_profile/${kindOf(resourceType)}/list`, params);
    return res.data || [];
  }

  /**
   * 分页查询暴露档案表列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(resourceType: string, params: McpToolProfileQuery & PageSelectListDto): Promise<PageData<McpToolProfile>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<McpToolProfile>>(`${base}/mcp_tool_profile/${kindOf(resourceType)}/page`, params);
    return res.data;
  }

  /**
   * 保存暴露档案表（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 暴露档案表数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的暴露档案表
   */
  static async save(resourceType: string, payload: McpToolProfilePayload): Promise<McpToolProfile> {
    const http = getHttpClient('default');
    const res = await http.post<McpToolProfile>(`${base}/mcp_tool_profile/${kindOf(resourceType)}/save`, payload);
    return res.data;
  }

  /**
   * 删除暴露档案表
   * @param id 暴露档案表 ID
   */
  static async updateStatus(id: number, status: string): Promise<void> {
    const http = getHttpClient('default');
    await http.post(`${base}/mcp_tool_profile/${id}/status`, { status });
  }

  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`${base}/mcp_tool_profile/${id}`);
  }

  static async preview(payload: {
    document: string;
    resourceType?: string;
    serviceCode?: string;
    contextPath?: string;
  }): Promise<ConvertedOperation[]> {
    const http = getHttpClient('default');
    const res = await http.post<ConvertedOperation[]>(`${base}/mcp_tool_profile/preview`, payload);
    return res.data || [];
  }

  static async confirmImport(payload: {
    serviceCode: string;
    resourceType: string;
    operations: ConvertedOperation[];
  }): Promise<McpToolImportResult> {
    const http = getHttpClient('default');
    const res = await http.post<McpToolImportResult>(`${base}/mcp_tool_profile/confirm_import`, payload);
    return res.data;
  }

  static async syncBuiltIn(payload: {
    serviceCode: string;
    resourceApiIds?: number[];
    importAll: boolean;
  }): Promise<McpToolImportResult> {
    const http = getHttpClient('default');
    const res = await http.post<McpToolImportResult>(`${base}/mcp_tool_profile/sync_built_in`, payload);
    return res.data;
  }
}

export interface ConvertedOperation {
  method: string;
  path: string;
  name: string;
  description?: string;
  toolName: string;
  inputSchema: string;
  openapiOperation: string;
  problem?: string;
}

export interface McpToolImportResult {
  created: number;
  updated: number;
  skipped: number;
}

