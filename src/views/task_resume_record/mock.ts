/**
 * 任务恢复动作审计表相关 Mock 数据
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
 * 生成符合 TaskResumeRecord 类型的 Mock 数据模板
 */
function getTaskResumeRecordTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
        'organId': '@integer(1, 100)',
            'taskId|1': ['@word(3,10)', '@word(3,10)'],
            'nodeId|1': ['@word(3,10)', null],
            'resumeId|1': ['@word(3,10)', '@word(3,10)'],
            'checkpointId|1': ['@word(3,10)', null],
            'messageId|1': ['@word(3,10)', null],
            'resumeAction|1': ['@word(3,10)', '@word(3,10)'],
            'payload|1': ['@word(3,10)', null],
            'actedAt|1': ['@word(3,10)', null],
        version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 任务恢复动作审计表相关的 Mock 数据映射
 */
export const TaskResumeRecordMockDataMap: MockDataMap = {
  // GET /task_resume_record - 根据条件查询列表
  '/task_resume_record': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const taskId = query?.taskId;
    const nodeId = query?.nodeId;
    const resumeId = query?.resumeId;
    const checkpointId = query?.checkpointId;
    const messageId = query?.messageId;
    const resumeAction = query?.resumeAction;
    const payload = query?.payload;
    const actedAt = query?.actedAt;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getTaskResumeRecordTemplate({
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
    if (resumeId) {
      filteredList = filteredList.filter((item: any) => {
                return item.resumeId && item.resumeId.includes(resumeId);
              });
    }
    if (checkpointId) {
      filteredList = filteredList.filter((item: any) => {
                return item.checkpointId && item.checkpointId.includes(checkpointId);
              });
    }
    if (messageId) {
      filteredList = filteredList.filter((item: any) => {
                return item.messageId && item.messageId.includes(messageId);
              });
    }
    if (resumeAction) {
      filteredList = filteredList.filter((item: any) => {
                return item.resumeAction && item.resumeAction.includes(resumeAction);
              });
    }
    if (payload) {
      filteredList = filteredList.filter((item: any) => {
                return item.payload && item.payload.includes(payload);
              });
    }
    if (actedAt) {
      filteredList = filteredList.filter((item: any) => {
                return item.actedAt && item.actedAt.includes(actedAt);
              });
    }

    return createResult(filteredList);
  },

  // GET /task_resume_record/list - 根据条件查询列表（兼容接口）
  '/task_resume_record/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const taskId = query?.taskId;
    const nodeId = query?.nodeId;
    const resumeId = query?.resumeId;
    const checkpointId = query?.checkpointId;
    const messageId = query?.messageId;
    const resumeAction = query?.resumeAction;
    const payload = query?.payload;
    const actedAt = query?.actedAt;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getTaskResumeRecordTemplate({
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
    if (resumeId) {
      filteredList = filteredList.filter((item: any) => {
                return item.resumeId && item.resumeId.includes(resumeId);
              });
    }
    if (checkpointId) {
      filteredList = filteredList.filter((item: any) => {
                return item.checkpointId && item.checkpointId.includes(checkpointId);
              });
    }
    if (messageId) {
      filteredList = filteredList.filter((item: any) => {
                return item.messageId && item.messageId.includes(messageId);
              });
    }
    if (resumeAction) {
      filteredList = filteredList.filter((item: any) => {
                return item.resumeAction && item.resumeAction.includes(resumeAction);
              });
    }
    if (payload) {
      filteredList = filteredList.filter((item: any) => {
                return item.payload && item.payload.includes(payload);
              });
    }
    if (actedAt) {
      filteredList = filteredList.filter((item: any) => {
                return item.actedAt && item.actedAt.includes(actedAt);
              });
    }

    return createResult(filteredList);
  },

  // GET /task_resume_record/page - 根据条件分页查询
  '/task_resume_record/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const organId = query?.query?.organId || query?.organId;
    const taskId = query?.query?.taskId || query?.taskId;
    const nodeId = query?.query?.nodeId || query?.nodeId;
    const resumeId = query?.query?.resumeId || query?.resumeId;
    const checkpointId = query?.query?.checkpointId || query?.checkpointId;
    const messageId = query?.query?.messageId || query?.messageId;
    const resumeAction = query?.query?.resumeAction || query?.resumeAction;
    const payload = query?.query?.payload || query?.payload;
    const actedAt = query?.query?.actedAt || query?.actedAt;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getTaskResumeRecordTemplate()],
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

  // POST /task_resume_record/save - 保存（新增或更新）
  '/task_resume_record/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;
    
    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);
    
    // 生成完整的任务恢复动作审计表数据
    const TaskResumeRecordItem = Mock.mock(
      getTaskResumeRecordTemplate({
        id,
        organId: payload.organId !== undefined ? payload.organId : '@integer(1, 100)',
        taskId: payload.taskId !== undefined ? payload.taskId : '@word(3,10)',
        nodeId: payload.nodeId !== undefined ? payload.nodeId : null,
        resumeId: payload.resumeId !== undefined ? payload.resumeId : '@word(3,10)',
        checkpointId: payload.checkpointId !== undefined ? payload.checkpointId : null,
        messageId: payload.messageId !== undefined ? payload.messageId : null,
        resumeAction: payload.resumeAction !== undefined ? payload.resumeAction : '@word(3,10)',
        payload: payload.payload !== undefined ? payload.payload : null,
        actedAt: payload.actedAt !== undefined ? payload.actedAt : null,
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );
    
    return createResult(TaskResumeRecordItem);
  },

  // DELETE /task_resume_record/:id - 删除
  '/task_resume_record/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(TaskResumeRecordMockDataMap);

