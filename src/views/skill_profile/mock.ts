/**
 * 定义表相关 Mock 数据
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
 * 生成符合 SkillProfile 类型的 Mock 数据模板
 */
function getSkillProfileTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
        'organId': '@integer(1, 100)',
            'skillKey|1': ['@word(3,10)', '@word(3,10)'],
            'skillName|1': ['@word(3,10)', '@word(3,10)'],
            'resourceType|1': ['@word(3,10)', '@word(3,10)'],
            'semanticDesc|1': ['@word(3,10)', null],
            'skillManual|1': ['@word(3,10)', null],
            'skillContract|1': ['@word(3,10)', null],
            'status|1': ['@word(3,10)', '@word(3,10)'],
            'description|1': ['@word(3,10)', null],
        version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 定义表相关的 Mock 数据映射
 */
export const SkillProfileMockDataMap: MockDataMap = {
  // GET /skill_profile - 根据条件查询列表
  '/skill_profile': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const skillKey = query?.skillKey;
    const skillName = query?.skillName;
    const resourceType = query?.resourceType;
    const semanticDesc = query?.semanticDesc;
    const skillManual = query?.skillManual;
    const skillContract = query?.skillContract;
    const status = query?.status;
    const description = query?.description;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getSkillProfileTemplate({
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
    if (skillKey) {
      filteredList = filteredList.filter((item: any) => {
                return item.skillKey && item.skillKey.includes(skillKey);
              });
    }
    if (skillName) {
      filteredList = filteredList.filter((item: any) => {
                return item.skillName && item.skillName.includes(skillName);
              });
    }
    if (resourceType) {
      filteredList = filteredList.filter((item: any) => {
                return item.resourceType && item.resourceType.includes(resourceType);
              });
    }
    if (semanticDesc) {
      filteredList = filteredList.filter((item: any) => {
                return item.semanticDesc && item.semanticDesc.includes(semanticDesc);
              });
    }
    if (skillManual) {
      filteredList = filteredList.filter((item: any) => {
                return item.skillManual && item.skillManual.includes(skillManual);
              });
    }
    if (skillContract) {
      filteredList = filteredList.filter((item: any) => {
                return item.skillContract && item.skillContract.includes(skillContract);
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

  // GET /skill_profile/list - 根据条件查询列表（兼容接口）
  '/skill_profile/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const skillKey = query?.skillKey;
    const skillName = query?.skillName;
    const resourceType = query?.resourceType;
    const semanticDesc = query?.semanticDesc;
    const skillManual = query?.skillManual;
    const skillContract = query?.skillContract;
    const status = query?.status;
    const description = query?.description;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getSkillProfileTemplate({
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
    if (skillKey) {
      filteredList = filteredList.filter((item: any) => {
                return item.skillKey && item.skillKey.includes(skillKey);
              });
    }
    if (skillName) {
      filteredList = filteredList.filter((item: any) => {
                return item.skillName && item.skillName.includes(skillName);
              });
    }
    if (resourceType) {
      filteredList = filteredList.filter((item: any) => {
                return item.resourceType && item.resourceType.includes(resourceType);
              });
    }
    if (semanticDesc) {
      filteredList = filteredList.filter((item: any) => {
                return item.semanticDesc && item.semanticDesc.includes(semanticDesc);
              });
    }
    if (skillManual) {
      filteredList = filteredList.filter((item: any) => {
                return item.skillManual && item.skillManual.includes(skillManual);
              });
    }
    if (skillContract) {
      filteredList = filteredList.filter((item: any) => {
                return item.skillContract && item.skillContract.includes(skillContract);
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

  // GET /skill_profile/page - 根据条件分页查询
  '/skill_profile/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const organId = query?.query?.organId || query?.organId;
    const skillKey = query?.query?.skillKey || query?.skillKey;
    const skillName = query?.query?.skillName || query?.skillName;
    const resourceType = query?.query?.resourceType || query?.resourceType;
    const semanticDesc = query?.query?.semanticDesc || query?.semanticDesc;
    const skillManual = query?.query?.skillManual || query?.skillManual;
    const skillContract = query?.query?.skillContract || query?.skillContract;
    const status = query?.query?.status || query?.status;
    const description = query?.query?.description || query?.description;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getSkillProfileTemplate()],
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

  // POST /skill_profile/save - 保存（新增或更新）
  '/skill_profile/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;
    
    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);
    
    // 生成完整的定义表数据
    const SkillProfileItem = Mock.mock(
      getSkillProfileTemplate({
        id,
        organId: payload.organId !== undefined ? payload.organId : '@integer(1, 100)',
        skillKey: payload.skillKey !== undefined ? payload.skillKey : '@word(3,10)',
        skillName: payload.skillName !== undefined ? payload.skillName : '@word(3,10)',
        resourceType: payload.resourceType !== undefined ? payload.resourceType : '@word(3,10)',
        semanticDesc: payload.semanticDesc !== undefined ? payload.semanticDesc : null,
        skillManual: payload.skillManual !== undefined ? payload.skillManual : null,
        skillContract: payload.skillContract !== undefined ? payload.skillContract : null,
        status: payload.status !== undefined ? payload.status : '@word(3,10)',
        description: payload.description !== undefined ? payload.description : null,
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );
    
    return createResult(SkillProfileItem);
  },

  // DELETE /skill_profile/:id - 删除
  '/skill_profile/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(SkillProfileMockDataMap);

