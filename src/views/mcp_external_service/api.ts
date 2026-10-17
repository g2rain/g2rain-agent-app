/**
 * 外部服务表 API（g2rain-mcp-registry）。
 * 扩展 / 客户分入口，resourceType 由服务端写死。
 */
import { getHttpClient } from '@runtime/http';
import { Gateway, ResourceType } from '@runtime/console';
import type { McpExternalService, McpExternalServicePayload, McpExternalServiceQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

const mcp = Gateway.MCP;
const http = () => getHttpClient('default');

export type McpExternalServiceKind = 'extension' | 'customer';

function kindOf(resourceType: string): McpExternalServiceKind {
  return resourceType === ResourceType.EXTENSION ? 'extension' : 'customer';
}

export class McpExternalServiceApi {
  static async list(
    kind: McpExternalServiceKind,
    params: McpExternalServiceQuery = {},
  ): Promise<McpExternalService[]> {
    const res = await http().get<McpExternalService[]>(
      `${mcp}/mcp_external_service/${kind}/list`,
      params,
    );
    return res.data ?? [];
  }

  static async page(
    resourceType: string,
    params: McpExternalServiceQuery & PageSelectListDto,
  ): Promise<PageData<McpExternalService>> {
    const kind = kindOf(resourceType);
    const res = await http().get<PageData<McpExternalService>>(
      `${mcp}/mcp_external_service/${kind}/page`,
      params,
    );
    return res.data;
  }

  /** 保存；后端返回主键 id；resourceType 由入口决定，勿依赖客户端传值 */
  static async save(resourceType: string, payload: McpExternalServicePayload): Promise<number> {
    const kind = kindOf(resourceType);
    const res = await http().post<number>(`${mcp}/mcp_external_service/${kind}/save`, payload);
    return res.data;
  }

  static async updateStatus(id: number, status: string): Promise<void> {
    await http().post(`${mcp}/mcp_external_service/${id}/status`, { status });
  }

  static async remove(id: number): Promise<void> {
    await http().delete(`${mcp}/mcp_external_service/${id}`);
  }
}
