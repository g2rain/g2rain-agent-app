/**
 * 模型用量记录相关 Mock 数据
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
 * 生成符合 ModelUsageRecord 类型的 Mock 数据模板
 */
function getModelUsageRecordTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
        'organId': '@integer(1, 100)',
            'profileId': '@integer(1, 100)',
            'catalogId': '@integer(1, 100)',
            'protocol|1': ['@word(3,10)', '@word(3,10)'],
            'provider|1': ['@word(3,10)', '@word(3,10)'],
            'modelName|1': ['@word(3,10)', '@word(3,10)'],
            'promptTokens': '@integer(1, 100)',
            'completionTokens': '@integer(1, 100)',
            'totalTokens': '@integer(1, 100)',
        version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 模型用量记录相关的 Mock 数据映射
 */
export const ModelUsageRecordMockDataMap: MockDataMap = {
  // GET /model_usage_record - 根据条件查询列表
  '/model_usage_record': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const profileId = query?.profileId;
    const catalogId = query?.catalogId;
    const protocol = query?.protocol;
    const provider = query?.provider;
    const modelName = query?.modelName;
    const promptTokens = query?.promptTokens;
    const completionTokens = query?.completionTokens;
    const totalTokens = query?.totalTokens;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getModelUsageRecordTemplate({
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
    if (profileId) {
      filteredList = filteredList.filter((item: any) => {
                return item.profileId === profileId;
              });
    }
    if (catalogId) {
      filteredList = filteredList.filter((item: any) => {
                return item.catalogId === catalogId;
              });
    }
    if (protocol) {
      filteredList = filteredList.filter((item: any) => {
                return item.protocol && item.protocol.includes(protocol);
              });
    }
    if (provider) {
      filteredList = filteredList.filter((item: any) => {
                return item.provider && item.provider.includes(provider);
              });
    }
    if (modelName) {
      filteredList = filteredList.filter((item: any) => {
                return item.modelName && item.modelName.includes(modelName);
              });
    }
    if (promptTokens) {
      filteredList = filteredList.filter((item: any) => {
                return item.promptTokens === promptTokens;
              });
    }
    if (completionTokens) {
      filteredList = filteredList.filter((item: any) => {
                return item.completionTokens === completionTokens;
              });
    }
    if (totalTokens) {
      filteredList = filteredList.filter((item: any) => {
                return item.totalTokens === totalTokens;
              });
    }

    return createResult(filteredList);
  },

  // GET /model_usage_record/list - 根据条件查询列表（兼容接口）
  '/model_usage_record/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const profileId = query?.profileId;
    const catalogId = query?.catalogId;
    const protocol = query?.protocol;
    const provider = query?.provider;
    const modelName = query?.modelName;
    const promptTokens = query?.promptTokens;
    const completionTokens = query?.completionTokens;
    const totalTokens = query?.totalTokens;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getModelUsageRecordTemplate({
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
    if (profileId) {
      filteredList = filteredList.filter((item: any) => {
                return item.profileId === profileId;
              });
    }
    if (catalogId) {
      filteredList = filteredList.filter((item: any) => {
                return item.catalogId === catalogId;
              });
    }
    if (protocol) {
      filteredList = filteredList.filter((item: any) => {
                return item.protocol && item.protocol.includes(protocol);
              });
    }
    if (provider) {
      filteredList = filteredList.filter((item: any) => {
                return item.provider && item.provider.includes(provider);
              });
    }
    if (modelName) {
      filteredList = filteredList.filter((item: any) => {
                return item.modelName && item.modelName.includes(modelName);
              });
    }
    if (promptTokens) {
      filteredList = filteredList.filter((item: any) => {
                return item.promptTokens === promptTokens;
              });
    }
    if (completionTokens) {
      filteredList = filteredList.filter((item: any) => {
                return item.completionTokens === completionTokens;
              });
    }
    if (totalTokens) {
      filteredList = filteredList.filter((item: any) => {
                return item.totalTokens === totalTokens;
              });
    }

    return createResult(filteredList);
  },

  // GET /model_usage_record/page - 根据条件分页查询
  '/model_usage_record/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const organId = query?.query?.organId || query?.organId;
    const profileId = query?.query?.profileId || query?.profileId;
    const catalogId = query?.query?.catalogId || query?.catalogId;
    const protocol = query?.query?.protocol || query?.protocol;
    const provider = query?.query?.provider || query?.provider;
    const modelName = query?.query?.modelName || query?.modelName;
    const promptTokens = query?.query?.promptTokens || query?.promptTokens;
    const completionTokens = query?.query?.completionTokens || query?.completionTokens;
    const totalTokens = query?.query?.totalTokens || query?.totalTokens;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getModelUsageRecordTemplate()],
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

  // POST /model_usage_record/save - 保存（新增或更新）
  '/model_usage_record/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;
    
    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);
    
    // 生成完整的模型用量记录数据
    const ModelUsageRecordItem = Mock.mock(
      getModelUsageRecordTemplate({
        id,
        organId: payload.organId !== undefined ? payload.organId : '@integer(1, 100)',
        profileId: payload.profileId !== undefined ? payload.profileId : '@integer(1, 100)',
        catalogId: payload.catalogId !== undefined ? payload.catalogId : '@integer(1, 100)',
        protocol: payload.protocol !== undefined ? payload.protocol : '@word(3,10)',
        provider: payload.provider !== undefined ? payload.provider : '@word(3,10)',
        modelName: payload.modelName !== undefined ? payload.modelName : '@word(3,10)',
        promptTokens: payload.promptTokens !== undefined ? payload.promptTokens : '@integer(1, 100)',
        completionTokens: payload.completionTokens !== undefined ? payload.completionTokens : '@integer(1, 100)',
        totalTokens: payload.totalTokens !== undefined ? payload.totalTokens : '@integer(1, 100)',
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );
    
    return createResult(ModelUsageRecordItem);
  },

  // DELETE /model_usage_record/:id - 删除
  '/model_usage_record/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(ModelUsageRecordMockDataMap);

