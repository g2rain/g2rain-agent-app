/**
 * 模型服务目录相关 Mock 数据
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
 * 生成符合 ModelServiceCatalog 类型的 Mock 数据模板
 */
function getModelServiceCatalogTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
        'modelName|1': ['@word(3,10)', '@word(3,10)'],
            'modelType|1': ['@word(3,10)', '@word(3,10)'],
            'resourceType|1': ['@word(3,10)', '@word(3,10)'],
            'provider|1': ['@word(3,10)', '@word(3,10)'],
            'protocol|1': ['@word(3,10)', '@word(3,10)'],
            'baseUrl|1': ['@word(3,10)', '@word(3,10)'],
            'apiKey|1': ['@word(3,10)', null],
            'status|1': ['@word(3,10)', '@word(3,10)'],
            'description|1': ['@word(3,10)', null],
        version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 模型服务目录相关的 Mock 数据映射
 */
export const ModelServiceCatalogMockDataMap: MockDataMap = {
  // GET /model_service_catalog - 根据条件查询列表
  '/model_service_catalog': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const modelName = query?.modelName;
    const modelType = query?.modelType;
    const resourceType = query?.resourceType;
    const provider = query?.provider;
    const protocol = query?.protocol;
    const baseUrl = query?.baseUrl;
    const apiKey = query?.apiKey;
    const status = query?.status;
    const description = query?.description;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getModelServiceCatalogTemplate({
          id: i + 1,
        }),
      );
      list.push(item);
    }

    let filteredList = list;
    if (modelName) {
      filteredList = filteredList.filter((item: any) => {
                return item.modelName && item.modelName.includes(modelName);
              });
    }
    if (modelType) {
      filteredList = filteredList.filter((item: any) => {
                return item.modelType && item.modelType.includes(modelType);
              });
    }
    if (resourceType) {
      filteredList = filteredList.filter((item: any) => {
                return item.resourceType && item.resourceType.includes(resourceType);
              });
    }
    if (provider) {
      filteredList = filteredList.filter((item: any) => {
                return item.provider && item.provider.includes(provider);
              });
    }
    if (protocol) {
      filteredList = filteredList.filter((item: any) => {
                return item.protocol && item.protocol.includes(protocol);
              });
    }
    if (baseUrl) {
      filteredList = filteredList.filter((item: any) => {
                return item.baseUrl && item.baseUrl.includes(baseUrl);
              });
    }
    if (apiKey) {
      filteredList = filteredList.filter((item: any) => {
                return item.apiKey && item.apiKey.includes(apiKey);
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

  // GET /model_service_catalog/list - 根据条件查询列表（兼容接口）
  '/model_service_catalog/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const modelName = query?.modelName;
    const modelType = query?.modelType;
    const resourceType = query?.resourceType;
    const provider = query?.provider;
    const protocol = query?.protocol;
    const baseUrl = query?.baseUrl;
    const apiKey = query?.apiKey;
    const status = query?.status;
    const description = query?.description;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getModelServiceCatalogTemplate({
          id: i + 1,
        }),
      );
      list.push(item);
    }

    let filteredList = list;
    if (modelName) {
      filteredList = filteredList.filter((item: any) => {
                return item.modelName && item.modelName.includes(modelName);
              });
    }
    if (modelType) {
      filteredList = filteredList.filter((item: any) => {
                return item.modelType && item.modelType.includes(modelType);
              });
    }
    if (resourceType) {
      filteredList = filteredList.filter((item: any) => {
                return item.resourceType && item.resourceType.includes(resourceType);
              });
    }
    if (provider) {
      filteredList = filteredList.filter((item: any) => {
                return item.provider && item.provider.includes(provider);
              });
    }
    if (protocol) {
      filteredList = filteredList.filter((item: any) => {
                return item.protocol && item.protocol.includes(protocol);
              });
    }
    if (baseUrl) {
      filteredList = filteredList.filter((item: any) => {
                return item.baseUrl && item.baseUrl.includes(baseUrl);
              });
    }
    if (apiKey) {
      filteredList = filteredList.filter((item: any) => {
                return item.apiKey && item.apiKey.includes(apiKey);
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

  // GET /model_service_catalog/page - 根据条件分页查询
  '/model_service_catalog/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const modelName = query?.query?.modelName || query?.modelName;
    const modelType = query?.query?.modelType || query?.modelType;
    const resourceType = query?.query?.resourceType || query?.resourceType;
    const provider = query?.query?.provider || query?.provider;
    const protocol = query?.query?.protocol || query?.protocol;
    const baseUrl = query?.query?.baseUrl || query?.baseUrl;
    const apiKey = query?.query?.apiKey || query?.apiKey;
    const status = query?.query?.status || query?.status;
    const description = query?.query?.description || query?.description;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getModelServiceCatalogTemplate()],
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

  // POST /model_service_catalog/save - 保存（新增或更新）
  '/model_service_catalog/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;
    
    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);
    
    // 生成完整的模型服务目录数据
    const ModelServiceCatalogItem = Mock.mock(
      getModelServiceCatalogTemplate({
        id,
        modelName: payload.modelName !== undefined ? payload.modelName : '@word(3,10)',
        modelType: payload.modelType !== undefined ? payload.modelType : '@word(3,10)',
        resourceType: payload.resourceType !== undefined ? payload.resourceType : '@word(3,10)',
        provider: payload.provider !== undefined ? payload.provider : '@word(3,10)',
        protocol: payload.protocol !== undefined ? payload.protocol : '@word(3,10)',
        baseUrl: payload.baseUrl !== undefined ? payload.baseUrl : '@word(3,10)',
        apiKey: payload.apiKey !== undefined ? payload.apiKey : null,
        status: payload.status !== undefined ? payload.status : '@word(3,10)',
        description: payload.description !== undefined ? payload.description : null,
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );
    
    return createResult(ModelServiceCatalogItem);
  },

  // DELETE /model_service_catalog/:id - 删除
  '/model_service_catalog/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(ModelServiceCatalogMockDataMap);

