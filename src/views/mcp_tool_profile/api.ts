/**
 * MCP 工具档案 API（g2rain-mcp-registry）。
 * 原生 / 扩展 / 租户分入口，resourceType 由服务端写死。
 */

import { getHttpClient } from '@runtime/http';
import { Gateway, ResourceType } from '@runtime/console';
import type {
  McpToolMetaVo,
  McpToolOptionQuery,
  McpToolOptionVo,
  McpToolProfile,
  McpToolProfilePayload,
  McpToolProfileQuery,
} from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

const base = Gateway.MCP;

function kindOf(resourceType: string): 'native' | 'extension' | 'customer' {
  if (resourceType === ResourceType.EXTENSION) return 'extension';
  if (resourceType === ResourceType.CUSTOMER) return 'customer';
  return 'native';
}

export class McpToolProfileApi {
  static async list(resourceType: string, params?: McpToolProfileQuery): Promise<McpToolProfile[]> {
    const http = getHttpClient('default');
    const res = await http.get<McpToolProfile[]>(`${base}/mcp_tool_profile/${kindOf(resourceType)}/list`, params);
    return res.data || [];
  }

  static async page(resourceType: string, params: McpToolProfileQuery & PageSelectListDto): Promise<PageData<McpToolProfile>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<McpToolProfile>>(`${base}/mcp_tool_profile/${kindOf(resourceType)}/page`, params);
    return res.data;
  }

  /** 更新扩展 / 租户工具；原生工具不支持编辑 */
  static async save(resourceType: string, payload: McpToolProfilePayload): Promise<number> {
    const http = getHttpClient('default');
    const res = await http.post<number>(`${base}/mcp_tool_profile/${kindOf(resourceType)}/save`, payload);
    return res.data;
  }

  static async updateStatus(id: number, status: string): Promise<void> {
    const http = getHttpClient('default');
    await http.post(`${base}/mcp_tool_profile/${id}/status`, { status });
  }

  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`${base}/mcp_tool_profile/${id}`);
  }

  static async preview(payload: { serviceId: number; document: string }): Promise<ConvertedOperation[]> {
    const http = getHttpClient('default');
    const res = await http.post<ConvertedOperation[]>(`${base}/mcp_tool_profile/preview`, payload);
    return res.data || [];
  }

  static async confirmImport(payload: {
    serviceId: number;
    operations: ConvertedOperation[];
  }): Promise<McpToolImportResult> {
    const http = getHttpClient('default');
    const res = await http.post<McpToolImportResult>(`${base}/mcp_tool_profile/confirm_import`, payload);
    return res.data;
  }

  static async syncNative(payload: {
    serviceId: number;
    resourceApiIds?: number[];
    importAll: boolean;
  }): Promise<McpToolImportResult> {
    const http = getHttpClient('default');
    const res = await http.post<McpToolImportResult>(`${base}/mcp_tool_profile/sync_native`, payload);
    return res.data;
  }

  /** 技能选择工具：原生、扩展全局可见，租户仅当前机构 */
  static async optionPage(params: McpToolOptionQuery & PageSelectListDto): Promise<PageData<McpToolOptionVo>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<McpToolOptionVo>>(`${base}/mcp_tool_profile/options/page`, params);
    return res.data;
  }

  /** 按工具名批量取元数据，单次最多 200 个 */
  static async metas(names: string[]): Promise<McpToolMetaVo[]> {
    if (names.length === 0) return [];
    const http = getHttpClient('default');
    const res = await http.post<McpToolMetaVo[]>(`${base}/mcp_tool_profile/options/by_names`, names);
    return res.data || [];
  }
}

export interface ConvertedOperation {
  method: string;
  path: string;
  name: string;
  description?: string;
  toolName: string;
  inputSchema: string;
  openapiDocument: string;
  problem?: string;
}

export interface McpToolImportResult {
  created: number;
  updated: number;
  skipped: number;
}
