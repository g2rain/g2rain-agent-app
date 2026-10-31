/**
 * MCP 工具档案相关类型定义
 */

import type { BaseSelectListDto, BaseVo } from '@platform/types/api.type';

/**
 * MCP 工具档案
 */
export interface McpToolProfile extends BaseVo {
  organId: number;
  organName?: string;
  name: string;
  title: string;
  resourceType: string;
  serviceId: number;
  serviceName: string;
  sourceId: number;
  method: string;
  path: string;
  openapiDocument: string;
  inputSchema: string;
  status: string;
  description: string;
}

/**
 * 更新时提交的负载：工具由导入生成，只允许改标题、说明与契约
 */
export interface McpToolProfilePayload {
  id: number;
  title?: string;
  description?: string;
  openapiDocument?: string;
  inputSchema?: string;
}

/**
 * MCP 工具档案查询条件
 */
export interface McpToolProfileQuery extends BaseSelectListDto {
  organId?: number;
  name?: string;
  title?: string;
  serviceId?: number;
  sourceId?: number;
  method?: string;
  path?: string;
  status?: string;
}

/** 技能选择工具时的工具选项 */
export interface McpToolOptionVo {
  name: string;
  title: string;
  description: string;
  resourceType: string;
  serviceId: number;
  serviceName: string;
  method: string;
}

/** 技能已绑定工具的元数据：契约骨架使用 */
export interface McpToolMetaVo extends McpToolOptionVo {
  inputSchema: string;
}

/** 工具选项查询条件 */
export interface McpToolOptionQuery {
  resourceType?: string;
  serviceId?: number;
  keyword?: string;
}
