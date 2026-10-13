/**
 * 任务实例表相关 Mock 数据
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
 * 生成符合 TaskInstance 类型的 Mock 数据模板
 */
function getTaskInstanceTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
        'organId': '@integer(1, 100)',
            'conversationId|1': ['@word(3,10)', '@word(3,10)'],
            'taskId|1': ['@word(3,10)', '@word(3,10)'],
            'agentId': '@integer(1, 100)',
            'goalSummary|1': ['@word(3,10)', null],
            'request|1': ['@word(3,10)', null],
            'skillVersions|1': ['@word(3,10)', null],
            'shared|1': ['@word(3,10)', null],
            'prior|1': ['@word(3,10)', null],
            'record|1': ['@word(3,10)', null],
            'sourceMessageId|1': ['@word(3,10)', null],
            'status|1': ['@word(3,10)', '@word(3,10)'],
            'currentNodeId|1': ['@word(3,10)', null],
            'finalMessage|1': ['@word(3,10)', null],
            'startedTime|1': ['@word(3,10)', null],
            'suspendedTime|1': ['@word(3,10)', null],
            'finishedTime|1': ['@word(3,10)', null],
            'traceId|1': ['@word(3,10)', null],
            'stateVersion': '@integer(1, 100)',
        version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 任务实例表相关的 Mock 数据映射
 */
export const TaskInstanceMockDataMap: MockDataMap = {
  // GET /task_instance - 根据条件查询列表
  '/task_instance': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const conversationId = query?.conversationId;
    const taskId = query?.taskId;
    const agentId = query?.agentId;
    const goalSummary = query?.goalSummary;
    const request = query?.request;
    const skillVersions = query?.skillVersions;
    const shared = query?.shared;
    const prior = query?.prior;
    const record = query?.record;
    const sourceMessageId = query?.sourceMessageId;
    const status = query?.status;
    const currentNodeId = query?.currentNodeId;
    const finalMessage = query?.finalMessage;
    const startedTime = query?.startedTime;
    const suspendedTime = query?.suspendedTime;
    const finishedTime = query?.finishedTime;
    const traceId = query?.traceId;
    const stateVersion = query?.stateVersion;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getTaskInstanceTemplate({
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
    if (conversationId) {
      filteredList = filteredList.filter((item: any) => {
                return item.conversationId && item.conversationId.includes(conversationId);
              });
    }
    if (taskId) {
      filteredList = filteredList.filter((item: any) => {
                return item.taskId && item.taskId.includes(taskId);
              });
    }
    if (agentId) {
      filteredList = filteredList.filter((item: any) => {
                return item.agentId === agentId;
              });
    }
    if (goalSummary) {
      filteredList = filteredList.filter((item: any) => {
                return item.goalSummary && item.goalSummary.includes(goalSummary);
              });
    }
    if (request) {
      filteredList = filteredList.filter((item: any) => {
                return item.request && item.request.includes(request);
              });
    }
    if (skillVersions) {
      filteredList = filteredList.filter((item: any) => {
                return item.skillVersions && item.skillVersions.includes(skillVersions);
              });
    }
    if (shared) {
      filteredList = filteredList.filter((item: any) => {
                return item.shared && item.shared.includes(shared);
              });
    }
    if (prior) {
      filteredList = filteredList.filter((item: any) => {
                return item.prior && item.prior.includes(prior);
              });
    }
    if (record) {
      filteredList = filteredList.filter((item: any) => {
                return item.record && item.record.includes(record);
              });
    }
    if (sourceMessageId) {
      filteredList = filteredList.filter((item: any) => {
                return item.sourceMessageId && item.sourceMessageId.includes(sourceMessageId);
              });
    }
    if (status) {
      filteredList = filteredList.filter((item: any) => {
                return item.status && item.status.includes(status);
              });
    }
    if (currentNodeId) {
      filteredList = filteredList.filter((item: any) => {
                return item.currentNodeId && item.currentNodeId.includes(currentNodeId);
              });
    }
    if (finalMessage) {
      filteredList = filteredList.filter((item: any) => {
                return item.finalMessage && item.finalMessage.includes(finalMessage);
              });
    }
    if (startedTime) {
      filteredList = filteredList.filter((item: any) => {
                return item.startedTime && item.startedTime.includes(startedTime);
              });
    }
    if (suspendedTime) {
      filteredList = filteredList.filter((item: any) => {
                return item.suspendedTime && item.suspendedTime.includes(suspendedTime);
              });
    }
    if (finishedTime) {
      filteredList = filteredList.filter((item: any) => {
                return item.finishedTime && item.finishedTime.includes(finishedTime);
              });
    }
    if (traceId) {
      filteredList = filteredList.filter((item: any) => {
                return item.traceId && item.traceId.includes(traceId);
              });
    }
    if (stateVersion) {
      filteredList = filteredList.filter((item: any) => {
                return item.stateVersion === stateVersion;
              });
    }

    return createResult(filteredList);
  },

  // GET /task_instance/list - 根据条件查询列表（兼容接口）
  '/task_instance/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const conversationId = query?.conversationId;
    const taskId = query?.taskId;
    const agentId = query?.agentId;
    const goalSummary = query?.goalSummary;
    const request = query?.request;
    const skillVersions = query?.skillVersions;
    const shared = query?.shared;
    const prior = query?.prior;
    const record = query?.record;
    const sourceMessageId = query?.sourceMessageId;
    const status = query?.status;
    const currentNodeId = query?.currentNodeId;
    const finalMessage = query?.finalMessage;
    const startedTime = query?.startedTime;
    const suspendedTime = query?.suspendedTime;
    const finishedTime = query?.finishedTime;
    const traceId = query?.traceId;
    const stateVersion = query?.stateVersion;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getTaskInstanceTemplate({
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
    if (conversationId) {
      filteredList = filteredList.filter((item: any) => {
                return item.conversationId && item.conversationId.includes(conversationId);
              });
    }
    if (taskId) {
      filteredList = filteredList.filter((item: any) => {
                return item.taskId && item.taskId.includes(taskId);
              });
    }
    if (agentId) {
      filteredList = filteredList.filter((item: any) => {
                return item.agentId === agentId;
              });
    }
    if (goalSummary) {
      filteredList = filteredList.filter((item: any) => {
                return item.goalSummary && item.goalSummary.includes(goalSummary);
              });
    }
    if (request) {
      filteredList = filteredList.filter((item: any) => {
                return item.request && item.request.includes(request);
              });
    }
    if (skillVersions) {
      filteredList = filteredList.filter((item: any) => {
                return item.skillVersions && item.skillVersions.includes(skillVersions);
              });
    }
    if (shared) {
      filteredList = filteredList.filter((item: any) => {
                return item.shared && item.shared.includes(shared);
              });
    }
    if (prior) {
      filteredList = filteredList.filter((item: any) => {
                return item.prior && item.prior.includes(prior);
              });
    }
    if (record) {
      filteredList = filteredList.filter((item: any) => {
                return item.record && item.record.includes(record);
              });
    }
    if (sourceMessageId) {
      filteredList = filteredList.filter((item: any) => {
                return item.sourceMessageId && item.sourceMessageId.includes(sourceMessageId);
              });
    }
    if (status) {
      filteredList = filteredList.filter((item: any) => {
                return item.status && item.status.includes(status);
              });
    }
    if (currentNodeId) {
      filteredList = filteredList.filter((item: any) => {
                return item.currentNodeId && item.currentNodeId.includes(currentNodeId);
              });
    }
    if (finalMessage) {
      filteredList = filteredList.filter((item: any) => {
                return item.finalMessage && item.finalMessage.includes(finalMessage);
              });
    }
    if (startedTime) {
      filteredList = filteredList.filter((item: any) => {
                return item.startedTime && item.startedTime.includes(startedTime);
              });
    }
    if (suspendedTime) {
      filteredList = filteredList.filter((item: any) => {
                return item.suspendedTime && item.suspendedTime.includes(suspendedTime);
              });
    }
    if (finishedTime) {
      filteredList = filteredList.filter((item: any) => {
                return item.finishedTime && item.finishedTime.includes(finishedTime);
              });
    }
    if (traceId) {
      filteredList = filteredList.filter((item: any) => {
                return item.traceId && item.traceId.includes(traceId);
              });
    }
    if (stateVersion) {
      filteredList = filteredList.filter((item: any) => {
                return item.stateVersion === stateVersion;
              });
    }

    return createResult(filteredList);
  },

  // GET /task_instance/page - 根据条件分页查询
  '/task_instance/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const organId = query?.query?.organId || query?.organId;
    const conversationId = query?.query?.conversationId || query?.conversationId;
    const taskId = query?.query?.taskId || query?.taskId;
    const agentId = query?.query?.agentId || query?.agentId;
    const goalSummary = query?.query?.goalSummary || query?.goalSummary;
    const request = query?.query?.request || query?.request;
    const skillVersions = query?.query?.skillVersions || query?.skillVersions;
    const shared = query?.query?.shared || query?.shared;
    const prior = query?.query?.prior || query?.prior;
    const record = query?.query?.record || query?.record;
    const sourceMessageId = query?.query?.sourceMessageId || query?.sourceMessageId;
    const status = query?.query?.status || query?.status;
    const currentNodeId = query?.query?.currentNodeId || query?.currentNodeId;
    const finalMessage = query?.query?.finalMessage || query?.finalMessage;
    const startedTime = query?.query?.startedTime || query?.startedTime;
    const suspendedTime = query?.query?.suspendedTime || query?.suspendedTime;
    const finishedTime = query?.query?.finishedTime || query?.finishedTime;
    const traceId = query?.query?.traceId || query?.traceId;
    const stateVersion = query?.query?.stateVersion || query?.stateVersion;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getTaskInstanceTemplate()],
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

  // POST /task_instance/save - 保存（新增或更新）
  '/task_instance/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;
    
    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);
    
    // 生成完整的任务实例表数据
    const TaskInstanceItem = Mock.mock(
      getTaskInstanceTemplate({
        id,
        organId: payload.organId !== undefined ? payload.organId : '@integer(1, 100)',
        conversationId: payload.conversationId !== undefined ? payload.conversationId : '@word(3,10)',
        taskId: payload.taskId !== undefined ? payload.taskId : '@word(3,10)',
        agentId: payload.agentId !== undefined ? payload.agentId : null,
        goalSummary: payload.goalSummary !== undefined ? payload.goalSummary : null,
        request: payload.request !== undefined ? payload.request : null,
        skillVersions: payload.skillVersions !== undefined ? payload.skillVersions : null,
        shared: payload.shared !== undefined ? payload.shared : null,
        prior: payload.prior !== undefined ? payload.prior : null,
        record: payload.record !== undefined ? payload.record : null,
        sourceMessageId: payload.sourceMessageId !== undefined ? payload.sourceMessageId : null,
        status: payload.status !== undefined ? payload.status : '@word(3,10)',
        currentNodeId: payload.currentNodeId !== undefined ? payload.currentNodeId : null,
        finalMessage: payload.finalMessage !== undefined ? payload.finalMessage : null,
        startedTime: payload.startedTime !== undefined ? payload.startedTime : null,
        suspendedTime: payload.suspendedTime !== undefined ? payload.suspendedTime : null,
        finishedTime: payload.finishedTime !== undefined ? payload.finishedTime : null,
        traceId: payload.traceId !== undefined ? payload.traceId : null,
        stateVersion: payload.stateVersion !== undefined ? payload.stateVersion : '@integer(1, 100)',
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );
    
    return createResult(TaskInstanceItem);
  },

  // DELETE /task_instance/:id - 删除
  '/task_instance/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(TaskInstanceMockDataMap);

