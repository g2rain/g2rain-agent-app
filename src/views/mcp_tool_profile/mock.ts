/**
 * 暴露档案表相关 Mock 数据
 */

import type { AxiosRequestConfig } from 'axios';
import type { Result } from '@g2rain/http';
import { mockManager, type MockDataMap } from '@runtime/http';
import Mock from 'mockjs';

/**
 * 生成符合 Result 格式的响应
 */
function createResult<T>(data: T, status: number = 200): Result<T> {
  // 先使用 Mock.mock 生成元数据，然后直接设置 data，避免 data 被 mock 处理
  const result = Mock.mock({
    requestId: '@guid',
    requestTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    status,
    errorCode: status === 200 ? '' : '@word(5,10)',
    errorMessage: status === 200 ? '' : '@cword(5,15)',
  }) as Result<T>;
  
  // 直接设置 data，不经过 Mock.mock 处理
  result.data = data;
  
  return result;
}

/**
 * 生成符合 McpToolProfile 类型的 Mock 数据模板
 */
function getMcpToolProfileTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
        'organId': '@integer(1, 100)',
            'name|1': ['@word(3,10)', '@word(3,10)'],
            'title|1': ['@word(3,10)', '@word(3,10)'],
            'resourceType|1': ['@word(3,10)', '@word(3,10)'],
            'serviceCode|1': ['@word(3,10)', '@word(3,10)'],
            'sourceId': '@integer(1, 100)',
            'method|1': ['@word(3,10)', '@word(3,10)'],
            'path|1': ['@word(3,10)', '@word(3,10)'],
            'openapiOperation|1': ['@word(3,10)', '@word(3,10)'],
            'inputSchema|1': ['@word(3,10)', '@word(3,10)'],
            'status|1': ['@word(3,10)', '@word(3,10)'],
            'description|1': ['@word(3,10)', null],
        version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 暴露档案表相关的 Mock 数据映射
 */
export const McpToolProfileMockDataMap: MockDataMap = {
  // GET /mcp_tool_profile - 根据条件查询列表
  '/mcp_tool_profile': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const name = query?.name;
    const title = query?.title;
    const resourceType = query?.resourceType;
    const serviceCode = query?.serviceCode;
    const sourceId = query?.sourceId;
    const method = query?.method;
    const path = query?.path;
    const openapiOperation = query?.openapiOperation;
    const inputSchema = query?.inputSchema;
    const status = query?.status;
    const description = query?.description;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getMcpToolProfileTemplate({
          id: i + 1,
        }),
      );
      list.push(item);
    }

    let filteredList = list;
    if (organId) {
      filteredList = filteredList.filter((item: any) => {
                return item.organId === organId;
              });
    }
    if (name) {
      filteredList = filteredList.filter((item: any) => {
                return item.name && item.name.includes(name);
              });
    }
    if (title) {
      filteredList = filteredList.filter((item: any) => {
                return item.title && item.title.includes(title);
              });
    }
    if (resourceType) {
      filteredList = filteredList.filter((item: any) => {
                return item.resourceType && item.resourceType.includes(resourceType);
              });
    }
    if (serviceCode) {
      filteredList = filteredList.filter((item: any) => {
                return item.serviceCode && item.serviceCode.includes(serviceCode);
              });
    }
    if (sourceId) {
      filteredList = filteredList.filter((item: any) => {
                return item.sourceId === sourceId;
              });
    }
    if (method) {
      filteredList = filteredList.filter((item: any) => {
                return item.method && item.method.includes(method);
              });
    }
    if (path) {
      filteredList = filteredList.filter((item: any) => {
                return item.path && item.path.includes(path);
              });
    }
    if (openapiOperation) {
      filteredList = filteredList.filter((item: any) => {
                return item.openapiOperation && item.openapiOperation.includes(openapiOperation);
              });
    }
    if (inputSchema) {
      filteredList = filteredList.filter((item: any) => {
                return item.inputSchema && item.inputSchema.includes(inputSchema);
              });
    }
    if (status) {
      filteredList = filteredList.filter((item: any) => {
                return item.status && item.status.includes(status);
              });
    }
    if (description) {
      filteredList = filteredList.filter((item: any) => {
                return item.description && item.description.includes(description);
              });
    }

    return createResult(filteredList);
  },

  // GET /mcp_tool_profile/list - 根据条件查询列表（兼容接口）
  '/mcp_tool_profile/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const name = query?.name;
    const title = query?.title;
    const resourceType = query?.resourceType;
    const serviceCode = query?.serviceCode;
    const sourceId = query?.sourceId;
    const method = query?.method;
    const path = query?.path;
    const openapiOperation = query?.openapiOperation;
    const inputSchema = query?.inputSchema;
    const status = query?.status;
    const description = query?.description;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getMcpToolProfileTemplate({
          id: i + 1,
        }),
      );
      list.push(item);
    }

    let filteredList = list;
    if (organId) {
      filteredList = filteredList.filter((item: any) => {
                return item.organId === organId;
              });
    }
    if (name) {
      filteredList = filteredList.filter((item: any) => {
                return item.name && item.name.includes(name);
              });
    }
    if (title) {
      filteredList = filteredList.filter((item: any) => {
                return item.title && item.title.includes(title);
              });
    }
    if (resourceType) {
      filteredList = filteredList.filter((item: any) => {
                return item.resourceType && item.resourceType.includes(resourceType);
              });
    }
    if (serviceCode) {
      filteredList = filteredList.filter((item: any) => {
                return item.serviceCode && item.serviceCode.includes(serviceCode);
              });
    }
    if (sourceId) {
      filteredList = filteredList.filter((item: any) => {
                return item.sourceId === sourceId;
              });
    }
    if (method) {
      filteredList = filteredList.filter((item: any) => {
                return item.method && item.method.includes(method);
              });
    }
    if (path) {
      filteredList = filteredList.filter((item: any) => {
                return item.path && item.path.includes(path);
              });
    }
    if (openapiOperation) {
      filteredList = filteredList.filter((item: any) => {
                return item.openapiOperation && item.openapiOperation.includes(openapiOperation);
              });
    }
    if (inputSchema) {
      filteredList = filteredList.filter((item: any) => {
                return item.inputSchema && item.inputSchema.includes(inputSchema);
              });
    }
    if (status) {
      filteredList = filteredList.filter((item: any) => {
                return item.status && item.status.includes(status);
              });
    }
    if (description) {
      filteredList = filteredList.filter((item: any) => {
                return item.description && item.description.includes(description);
              });
    }

    return createResult(filteredList);
  },

  // GET /mcp_tool_profile/page - 根据条件分页查询
  '/mcp_tool_profile/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const organId = query?.query?.organId || query?.organId;
    const name = query?.query?.name || query?.name;
    const title = query?.query?.title || query?.title;
    const resourceType = query?.query?.resourceType || query?.resourceType;
    const serviceCode = query?.query?.serviceCode || query?.serviceCode;
    const sourceId = query?.query?.sourceId || query?.sourceId;
    const method = query?.query?.method || query?.method;
    const path = query?.query?.path || query?.path;
    const openapiOperation = query?.query?.openapiOperation || query?.openapiOperation;
    const inputSchema = query?.query?.inputSchema || query?.inputSchema;
    const status = query?.query?.status || query?.status;
    const description = query?.query?.description || query?.description;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getMcpToolProfileTemplate()],
    };

    const result = Mock.mock(template);

    // 计算总页数
    const totalPages = Math.ceil(total / pageSize);

    const pageData = {
      pageNum,
      pageSize,
      total,
      totalPages,
      records: result.records,
    };

    return createResult(pageData);
  },

  // POST /mcp_tool_profile/save - 保存（新增或更新）
  '/mcp_tool_profile/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;
    
    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);
    
    // 生成完整的暴露档案表数据
    const McpToolProfileItem = Mock.mock(
      getMcpToolProfileTemplate({
        id,
        organId: payload.organId !== undefined ? payload.organId : '@integer(1, 100)',
        name: payload.name !== undefined ? payload.name : '@word(3,10)',
        title: payload.title !== undefined ? payload.title : '@word(3,10)',
        resourceType: payload.resourceType !== undefined ? payload.resourceType : '@word(3,10)',
        serviceCode: payload.serviceCode !== undefined ? payload.serviceCode : '@word(3,10)',
        sourceId: payload.sourceId !== undefined ? payload.sourceId : null,
        method: payload.method !== undefined ? payload.method : '@word(3,10)',
        path: payload.path !== undefined ? payload.path : '@word(3,10)',
        openapiOperation: payload.openapiOperation !== undefined ? payload.openapiOperation : '@word(3,10)',
        inputSchema: payload.inputSchema !== undefined ? payload.inputSchema : '@word(3,10)',
        status: payload.status !== undefined ? payload.status : '@word(3,10)',
        description: payload.description !== undefined ? payload.description : null,
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );
    
    return createResult(McpToolProfileItem);
  },

  // DELETE /mcp_tool_profile/:id - 删除
  '/mcp_tool_profile/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(McpToolProfileMockDataMap);

