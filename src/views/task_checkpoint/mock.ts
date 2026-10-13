/**
 * 任务检查点表相关 Mock 数据
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
 * 生成符合 TaskCheckpoint 类型的 Mock 数据模板
 */
function getTaskCheckpointTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
        'organId': '@integer(1, 100)',
            'taskId|1': ['@word(3,10)', '@word(3,10)'],
            'nodeId|1': ['@word(3,10)', null],
            'checkpointId|1': ['@word(3,10)', '@word(3,10)'],
            'type|1': ['@word(3,10)', '@word(3,10)'],
            'question|1': ['@word(3,10)', null],
            'expectedFields|1': ['@word(3,10)', null],
            'allowedActions|1': ['@word(3,10)', '@word(3,10)'],
            'suggestions|1': ['@word(3,10)', null],
            'pendingAction|1': ['@word(3,10)', null],
        version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 任务检查点表相关的 Mock 数据映射
 */
export const TaskCheckpointMockDataMap: MockDataMap = {
  // GET /task_checkpoint - 根据条件查询列表
  '/task_checkpoint': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const taskId = query?.taskId;
    const nodeId = query?.nodeId;
    const checkpointId = query?.checkpointId;
    const type = query?.type;
    const question = query?.question;
    const expectedFields = query?.expectedFields;
    const allowedActions = query?.allowedActions;
    const suggestions = query?.suggestions;
    const pendingAction = query?.pendingAction;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getTaskCheckpointTemplate({
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
    if (taskId) {
      filteredList = filteredList.filter((item: any) => {
                return item.taskId && item.taskId.includes(taskId);
              });
    }
    if (nodeId) {
      filteredList = filteredList.filter((item: any) => {
                return item.nodeId && item.nodeId.includes(nodeId);
              });
    }
    if (checkpointId) {
      filteredList = filteredList.filter((item: any) => {
                return item.checkpointId && item.checkpointId.includes(checkpointId);
              });
    }
    if (type) {
      filteredList = filteredList.filter((item: any) => {
                return item.type && item.type.includes(type);
              });
    }
    if (question) {
      filteredList = filteredList.filter((item: any) => {
                return item.question && item.question.includes(question);
              });
    }
    if (expectedFields) {
      filteredList = filteredList.filter((item: any) => {
                return item.expectedFields && item.expectedFields.includes(expectedFields);
              });
    }
    if (allowedActions) {
      filteredList = filteredList.filter((item: any) => {
                return item.allowedActions && item.allowedActions.includes(allowedActions);
              });
    }
    if (suggestions) {
      filteredList = filteredList.filter((item: any) => {
                return item.suggestions && item.suggestions.includes(suggestions);
              });
    }
    if (pendingAction) {
      filteredList = filteredList.filter((item: any) => {
                return item.pendingAction && item.pendingAction.includes(pendingAction);
              });
    }

    return createResult(filteredList);
  },

  // GET /task_checkpoint/list - 根据条件查询列表（兼容接口）
  '/task_checkpoint/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const taskId = query?.taskId;
    const nodeId = query?.nodeId;
    const checkpointId = query?.checkpointId;
    const type = query?.type;
    const question = query?.question;
    const expectedFields = query?.expectedFields;
    const allowedActions = query?.allowedActions;
    const suggestions = query?.suggestions;
    const pendingAction = query?.pendingAction;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getTaskCheckpointTemplate({
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
    if (taskId) {
      filteredList = filteredList.filter((item: any) => {
                return item.taskId && item.taskId.includes(taskId);
              });
    }
    if (nodeId) {
      filteredList = filteredList.filter((item: any) => {
                return item.nodeId && item.nodeId.includes(nodeId);
              });
    }
    if (checkpointId) {
      filteredList = filteredList.filter((item: any) => {
                return item.checkpointId && item.checkpointId.includes(checkpointId);
              });
    }
    if (type) {
      filteredList = filteredList.filter((item: any) => {
                return item.type && item.type.includes(type);
              });
    }
    if (question) {
      filteredList = filteredList.filter((item: any) => {
                return item.question && item.question.includes(question);
              });
    }
    if (expectedFields) {
      filteredList = filteredList.filter((item: any) => {
                return item.expectedFields && item.expectedFields.includes(expectedFields);
              });
    }
    if (allowedActions) {
      filteredList = filteredList.filter((item: any) => {
                return item.allowedActions && item.allowedActions.includes(allowedActions);
              });
    }
    if (suggestions) {
      filteredList = filteredList.filter((item: any) => {
                return item.suggestions && item.suggestions.includes(suggestions);
              });
    }
    if (pendingAction) {
      filteredList = filteredList.filter((item: any) => {
                return item.pendingAction && item.pendingAction.includes(pendingAction);
              });
    }

    return createResult(filteredList);
  },

  // GET /task_checkpoint/page - 根据条件分页查询
  '/task_checkpoint/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const organId = query?.query?.organId || query?.organId;
    const taskId = query?.query?.taskId || query?.taskId;
    const nodeId = query?.query?.nodeId || query?.nodeId;
    const checkpointId = query?.query?.checkpointId || query?.checkpointId;
    const type = query?.query?.type || query?.type;
    const question = query?.query?.question || query?.question;
    const expectedFields = query?.query?.expectedFields || query?.expectedFields;
    const allowedActions = query?.query?.allowedActions || query?.allowedActions;
    const suggestions = query?.query?.suggestions || query?.suggestions;
    const pendingAction = query?.query?.pendingAction || query?.pendingAction;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getTaskCheckpointTemplate()],
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

  // POST /task_checkpoint/save - 保存（新增或更新）
  '/task_checkpoint/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;
    
    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);
    
    // 生成完整的任务检查点表数据
    const TaskCheckpointItem = Mock.mock(
      getTaskCheckpointTemplate({
        id,
        organId: payload.organId !== undefined ? payload.organId : '@integer(1, 100)',
        taskId: payload.taskId !== undefined ? payload.taskId : '@word(3,10)',
        nodeId: payload.nodeId !== undefined ? payload.nodeId : null,
        checkpointId: payload.checkpointId !== undefined ? payload.checkpointId : '@word(3,10)',
        type: payload.type !== undefined ? payload.type : '@word(3,10)',
        question: payload.question !== undefined ? payload.question : null,
        expectedFields: payload.expectedFields !== undefined ? payload.expectedFields : null,
        allowedActions: payload.allowedActions !== undefined ? payload.allowedActions : '@word(3,10)',
        suggestions: payload.suggestions !== undefined ? payload.suggestions : null,
        pendingAction: payload.pendingAction !== undefined ? payload.pendingAction : null,
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );
    
    return createResult(TaskCheckpointItem);
  },

  // DELETE /task_checkpoint/:id - 删除
  '/task_checkpoint/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(TaskCheckpointMockDataMap);

