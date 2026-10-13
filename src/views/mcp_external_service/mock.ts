/**
 * 外部服务表相关 Mock 数据
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
 * 生成符合 McpExternalService 类型的 Mock 数据模板
 */
function getMcpExternalServiceTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
        'organId': '@integer(1, 100)',
            'code|1': ['@word(3,10)', '@word(3,10)'],
            'name|1': ['@word(3,10)', '@word(3,10)'],
            'endpoint|1': ['@word(3,10)', '@word(3,10)'],
            'contextPath|1': ['@word(3,10)', '@word(3,10)'],
            'resourceType|1': ['@word(3,10)', '@word(3,10)'],
            'status|1': ['@word(3,10)', '@word(3,10)'],
            'description|1': ['@word(3,10)', null],
        version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 外部服务表相关的 Mock 数据映射
 */
export const McpExternalServiceMockDataMap: MockDataMap = {
  // GET /mcp_external_service - 根据条件查询列表
  '/mcp_external_service': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const code = query?.code;
    const name = query?.name;
    const endpoint = query?.endpoint;
    const contextPath = query?.contextPath;
    const resourceType = query?.resourceType;
    const status = query?.status;
    const description = query?.description;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getMcpExternalServiceTemplate({
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
    if (code) {
      filteredList = filteredList.filter((item: any) => {
                return item.code && item.code.includes(code);
              });
    }
    if (name) {
      filteredList = filteredList.filter((item: any) => {
                return item.name && item.name.includes(name);
              });
    }
    if (endpoint) {
      filteredList = filteredList.filter((item: any) => {
                return item.endpoint && item.endpoint.includes(endpoint);
              });
    }
    if (contextPath) {
      filteredList = filteredList.filter((item: any) => {
                return item.contextPath && item.contextPath.includes(contextPath);
              });
    }
    if (resourceType) {
      filteredList = filteredList.filter((item: any) => {
                return item.resourceType && item.resourceType.includes(resourceType);
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

  // GET /mcp_external_service/list - 根据条件查询列表（兼容接口）
  '/mcp_external_service/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const code = query?.code;
    const name = query?.name;
    const endpoint = query?.endpoint;
    const contextPath = query?.contextPath;
    const resourceType = query?.resourceType;
    const status = query?.status;
    const description = query?.description;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getMcpExternalServiceTemplate({
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
    if (code) {
      filteredList = filteredList.filter((item: any) => {
                return item.code && item.code.includes(code);
              });
    }
    if (name) {
      filteredList = filteredList.filter((item: any) => {
                return item.name && item.name.includes(name);
              });
    }
    if (endpoint) {
      filteredList = filteredList.filter((item: any) => {
                return item.endpoint && item.endpoint.includes(endpoint);
              });
    }
    if (contextPath) {
      filteredList = filteredList.filter((item: any) => {
                return item.contextPath && item.contextPath.includes(contextPath);
              });
    }
    if (resourceType) {
      filteredList = filteredList.filter((item: any) => {
                return item.resourceType && item.resourceType.includes(resourceType);
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

  // GET /mcp_external_service/page - 根据条件分页查询
  '/mcp_external_service/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const organId = query?.query?.organId || query?.organId;
    const code = query?.query?.code || query?.code;
    const name = query?.query?.name || query?.name;
    const endpoint = query?.query?.endpoint || query?.endpoint;
    const contextPath = query?.query?.contextPath || query?.contextPath;
    const resourceType = query?.query?.resourceType || query?.resourceType;
    const status = query?.query?.status || query?.status;
    const description = query?.query?.description || query?.description;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getMcpExternalServiceTemplate()],
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

  // POST /mcp_external_service/save - 保存（新增或更新）
  '/mcp_external_service/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;
    
    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);
    
    // 生成完整的外部服务表数据
    const McpExternalServiceItem = Mock.mock(
      getMcpExternalServiceTemplate({
        id,
        organId: payload.organId !== undefined ? payload.organId : '@integer(1, 100)',
        code: payload.code !== undefined ? payload.code : '@word(3,10)',
        name: payload.name !== undefined ? payload.name : '@word(3,10)',
        endpoint: payload.endpoint !== undefined ? payload.endpoint : '@word(3,10)',
        contextPath: payload.contextPath !== undefined ? payload.contextPath : '@word(3,10)',
        resourceType: payload.resourceType !== undefined ? payload.resourceType : '@word(3,10)',
        status: payload.status !== undefined ? payload.status : '@word(3,10)',
        description: payload.description !== undefined ? payload.description : null,
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );
    
    return createResult(McpExternalServiceItem);
  },

  // DELETE /mcp_external_service/:id - 删除
  '/mcp_external_service/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(McpExternalServiceMockDataMap);

