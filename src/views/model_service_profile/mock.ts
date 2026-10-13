/**
 * 模型服务配置相关 Mock 数据
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
 * 生成符合 ModelServiceProfile 类型的 Mock 数据模板
 */
function getModelServiceProfileTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
        'organId': '@integer(1, 100)',
            'catalogId': '@integer(1, 100)',
            'temperature|1': ['@word(3,10)', null],
            'topP|1': ['@word(3,10)', null],
            'maxTokens': '@integer(1, 100)',
            'timeoutMs': '@integer(1, 100)',
            'status|1': ['@word(3,10)', '@word(3,10)'],
            'description|1': ['@word(3,10)', null],
        version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 模型服务配置相关的 Mock 数据映射
 */
export const ModelServiceProfileMockDataMap: MockDataMap = {
  // GET /model_service_profile - 根据条件查询列表
  '/model_service_profile': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const catalogId = query?.catalogId;
    const temperature = query?.temperature;
    const topP = query?.topP;
    const maxTokens = query?.maxTokens;
    const timeoutMs = query?.timeoutMs;
    const status = query?.status;
    const description = query?.description;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getModelServiceProfileTemplate({
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
    if (catalogId) {
      filteredList = filteredList.filter((item: any) => {
                return item.catalogId === catalogId;
              });
    }
    if (temperature) {
      filteredList = filteredList.filter((item: any) => {
                return item.temperature && item.temperature.includes(temperature);
              });
    }
    if (topP) {
      filteredList = filteredList.filter((item: any) => {
                return item.topP && item.topP.includes(topP);
              });
    }
    if (maxTokens) {
      filteredList = filteredList.filter((item: any) => {
                return item.maxTokens === maxTokens;
              });
    }
    if (timeoutMs) {
      filteredList = filteredList.filter((item: any) => {
                return item.timeoutMs === timeoutMs;
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

  // GET /model_service_profile/list - 根据条件查询列表（兼容接口）
  '/model_service_profile/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const catalogId = query?.catalogId;
    const temperature = query?.temperature;
    const topP = query?.topP;
    const maxTokens = query?.maxTokens;
    const timeoutMs = query?.timeoutMs;
    const status = query?.status;
    const description = query?.description;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getModelServiceProfileTemplate({
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
    if (catalogId) {
      filteredList = filteredList.filter((item: any) => {
                return item.catalogId === catalogId;
              });
    }
    if (temperature) {
      filteredList = filteredList.filter((item: any) => {
                return item.temperature && item.temperature.includes(temperature);
              });
    }
    if (topP) {
      filteredList = filteredList.filter((item: any) => {
                return item.topP && item.topP.includes(topP);
              });
    }
    if (maxTokens) {
      filteredList = filteredList.filter((item: any) => {
                return item.maxTokens === maxTokens;
              });
    }
    if (timeoutMs) {
      filteredList = filteredList.filter((item: any) => {
                return item.timeoutMs === timeoutMs;
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

  // GET /model_service_profile/page - 根据条件分页查询
  '/model_service_profile/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const organId = query?.query?.organId || query?.organId;
    const catalogId = query?.query?.catalogId || query?.catalogId;
    const temperature = query?.query?.temperature || query?.temperature;
    const topP = query?.query?.topP || query?.topP;
    const maxTokens = query?.query?.maxTokens || query?.maxTokens;
    const timeoutMs = query?.query?.timeoutMs || query?.timeoutMs;
    const status = query?.query?.status || query?.status;
    const description = query?.query?.description || query?.description;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getModelServiceProfileTemplate()],
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

  // POST /model_service_profile/save - 保存（新增或更新）
  '/model_service_profile/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;
    
    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);
    
    // 生成完整的模型服务配置数据
    const ModelServiceProfileItem = Mock.mock(
      getModelServiceProfileTemplate({
        id,
        organId: payload.organId !== undefined ? payload.organId : '@integer(1, 100)',
        catalogId: payload.catalogId !== undefined ? payload.catalogId : '@integer(1, 100)',
        temperature: payload.temperature !== undefined ? payload.temperature : null,
        topP: payload.topP !== undefined ? payload.topP : null,
        maxTokens: payload.maxTokens !== undefined ? payload.maxTokens : null,
        timeoutMs: payload.timeoutMs !== undefined ? payload.timeoutMs : null,
        status: payload.status !== undefined ? payload.status : '@word(3,10)',
        description: payload.description !== undefined ? payload.description : null,
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );
    
    return createResult(ModelServiceProfileItem);
  },

  // DELETE /model_service_profile/:id - 删除
  '/model_service_profile/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(ModelServiceProfileMockDataMap);

