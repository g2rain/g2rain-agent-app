/**
 * 工具调用记录表相关 Mock 数据
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
 * 生成符合 ToolCallRecord 类型的 Mock 数据模板
 */
function getToolCallRecordTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
        'organId': '@integer(1, 100)',
            'taskId|1': ['@word(3,10)', '@word(3,10)'],
            'nodeId|1': ['@word(3,10)', '@word(3,10)'],
            'callId|1': ['@word(3,10)', '@word(3,10)'],
            'toolName|1': ['@word(3,10)', '@word(3,10)'],
            'sideEffect|1': ['@word(3,10)', '@word(3,10)'],
            'request|1': ['@word(3,10)', null],
            'argsHash|1': ['@word(3,10)', '@word(3,10)'],
            'idempotencyKey|1': ['@word(3,10)', '@word(3,10)'],
            'round': '@integer(1, 100)',
            'response|1': ['@word(3,10)', null],
            'resultSummary|1': ['@word(3,10)', null],
            'entities|1': ['@word(3,10)', null],
            'payloadId|1': ['@word(3,10)', null],
            'callStatus|1': ['@word(3,10)', '@word(3,10)'],
            'businessOk': '@integer(1, 100)',
            'emptyResult': '@integer(1, 100)',
            'failureKind|1': ['@word(3,10)', '@word(3,10)'],
            'errorCode|1': ['@word(3,10)', null],
            'errorMessage|1': ['@word(3,10)', null],
            'durationMs': '@integer(1, 100)',
            'traceId|1': ['@word(3,10)', null],
        version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 工具调用记录表相关的 Mock 数据映射
 */
export const ToolCallRecordMockDataMap: MockDataMap = {
  // GET /tool_call_record - 根据条件查询列表
  '/tool_call_record': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const taskId = query?.taskId;
    const nodeId = query?.nodeId;
    const callId = query?.callId;
    const toolName = query?.toolName;
    const sideEffect = query?.sideEffect;
    const request = query?.request;
    const argsHash = query?.argsHash;
    const idempotencyKey = query?.idempotencyKey;
    const round = query?.round;
    const response = query?.response;
    const resultSummary = query?.resultSummary;
    const entities = query?.entities;
    const payloadId = query?.payloadId;
    const callStatus = query?.callStatus;
    const businessOk = query?.businessOk;
    const emptyResult = query?.emptyResult;
    const failureKind = query?.failureKind;
    const errorCode = query?.errorCode;
    const errorMessage = query?.errorMessage;
    const durationMs = query?.durationMs;
    const traceId = query?.traceId;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getToolCallRecordTemplate({
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
    if (callId) {
      filteredList = filteredList.filter((item: any) => {
                return item.callId && item.callId.includes(callId);
              });
    }
    if (toolName) {
      filteredList = filteredList.filter((item: any) => {
                return item.toolName && item.toolName.includes(toolName);
              });
    }
    if (sideEffect) {
      filteredList = filteredList.filter((item: any) => {
                return item.sideEffect && item.sideEffect.includes(sideEffect);
              });
    }
    if (request) {
      filteredList = filteredList.filter((item: any) => {
                return item.request && item.request.includes(request);
              });
    }
    if (argsHash) {
      filteredList = filteredList.filter((item: any) => {
                return item.argsHash && item.argsHash.includes(argsHash);
              });
    }
    if (idempotencyKey) {
      filteredList = filteredList.filter((item: any) => {
                return item.idempotencyKey && item.idempotencyKey.includes(idempotencyKey);
              });
    }
    if (round) {
      filteredList = filteredList.filter((item: any) => {
                return item.round === round;
              });
    }
    if (response) {
      filteredList = filteredList.filter((item: any) => {
                return item.response && item.response.includes(response);
              });
    }
    if (resultSummary) {
      filteredList = filteredList.filter((item: any) => {
                return item.resultSummary && item.resultSummary.includes(resultSummary);
              });
    }
    if (entities) {
      filteredList = filteredList.filter((item: any) => {
                return item.entities && item.entities.includes(entities);
              });
    }
    if (payloadId) {
      filteredList = filteredList.filter((item: any) => {
                return item.payloadId && item.payloadId.includes(payloadId);
              });
    }
    if (callStatus) {
      filteredList = filteredList.filter((item: any) => {
                return item.callStatus && item.callStatus.includes(callStatus);
              });
    }
    if (businessOk) {
      filteredList = filteredList.filter((item: any) => {
                return item.businessOk === businessOk;
              });
    }
    if (emptyResult) {
      filteredList = filteredList.filter((item: any) => {
                return item.emptyResult === emptyResult;
              });
    }
    if (failureKind) {
      filteredList = filteredList.filter((item: any) => {
                return item.failureKind && item.failureKind.includes(failureKind);
              });
    }
    if (errorCode) {
      filteredList = filteredList.filter((item: any) => {
                return item.errorCode && item.errorCode.includes(errorCode);
              });
    }
    if (errorMessage) {
      filteredList = filteredList.filter((item: any) => {
                return item.errorMessage && item.errorMessage.includes(errorMessage);
              });
    }
    if (durationMs) {
      filteredList = filteredList.filter((item: any) => {
                return item.durationMs === durationMs;
              });
    }
    if (traceId) {
      filteredList = filteredList.filter((item: any) => {
                return item.traceId && item.traceId.includes(traceId);
              });
    }

    return createResult(filteredList);
  },

  // GET /tool_call_record/list - 根据条件查询列表（兼容接口）
  '/tool_call_record/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const taskId = query?.taskId;
    const nodeId = query?.nodeId;
    const callId = query?.callId;
    const toolName = query?.toolName;
    const sideEffect = query?.sideEffect;
    const request = query?.request;
    const argsHash = query?.argsHash;
    const idempotencyKey = query?.idempotencyKey;
    const round = query?.round;
    const response = query?.response;
    const resultSummary = query?.resultSummary;
    const entities = query?.entities;
    const payloadId = query?.payloadId;
    const callStatus = query?.callStatus;
    const businessOk = query?.businessOk;
    const emptyResult = query?.emptyResult;
    const failureKind = query?.failureKind;
    const errorCode = query?.errorCode;
    const errorMessage = query?.errorMessage;
    const durationMs = query?.durationMs;
    const traceId = query?.traceId;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getToolCallRecordTemplate({
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
    if (callId) {
      filteredList = filteredList.filter((item: any) => {
                return item.callId && item.callId.includes(callId);
              });
    }
    if (toolName) {
      filteredList = filteredList.filter((item: any) => {
                return item.toolName && item.toolName.includes(toolName);
              });
    }
    if (sideEffect) {
      filteredList = filteredList.filter((item: any) => {
                return item.sideEffect && item.sideEffect.includes(sideEffect);
              });
    }
    if (request) {
      filteredList = filteredList.filter((item: any) => {
                return item.request && item.request.includes(request);
              });
    }
    if (argsHash) {
      filteredList = filteredList.filter((item: any) => {
                return item.argsHash && item.argsHash.includes(argsHash);
              });
    }
    if (idempotencyKey) {
      filteredList = filteredList.filter((item: any) => {
                return item.idempotencyKey && item.idempotencyKey.includes(idempotencyKey);
              });
    }
    if (round) {
      filteredList = filteredList.filter((item: any) => {
                return item.round === round;
              });
    }
    if (response) {
      filteredList = filteredList.filter((item: any) => {
                return item.response && item.response.includes(response);
              });
    }
    if (resultSummary) {
      filteredList = filteredList.filter((item: any) => {
                return item.resultSummary && item.resultSummary.includes(resultSummary);
              });
    }
    if (entities) {
      filteredList = filteredList.filter((item: any) => {
                return item.entities && item.entities.includes(entities);
              });
    }
    if (payloadId) {
      filteredList = filteredList.filter((item: any) => {
                return item.payloadId && item.payloadId.includes(payloadId);
              });
    }
    if (callStatus) {
      filteredList = filteredList.filter((item: any) => {
                return item.callStatus && item.callStatus.includes(callStatus);
              });
    }
    if (businessOk) {
      filteredList = filteredList.filter((item: any) => {
                return item.businessOk === businessOk;
              });
    }
    if (emptyResult) {
      filteredList = filteredList.filter((item: any) => {
                return item.emptyResult === emptyResult;
              });
    }
    if (failureKind) {
      filteredList = filteredList.filter((item: any) => {
                return item.failureKind && item.failureKind.includes(failureKind);
              });
    }
    if (errorCode) {
      filteredList = filteredList.filter((item: any) => {
                return item.errorCode && item.errorCode.includes(errorCode);
              });
    }
    if (errorMessage) {
      filteredList = filteredList.filter((item: any) => {
                return item.errorMessage && item.errorMessage.includes(errorMessage);
              });
    }
    if (durationMs) {
      filteredList = filteredList.filter((item: any) => {
                return item.durationMs === durationMs;
              });
    }
    if (traceId) {
      filteredList = filteredList.filter((item: any) => {
                return item.traceId && item.traceId.includes(traceId);
              });
    }

    return createResult(filteredList);
  },

  // GET /tool_call_record/page - 根据条件分页查询
  '/tool_call_record/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const organId = query?.query?.organId || query?.organId;
    const taskId = query?.query?.taskId || query?.taskId;
    const nodeId = query?.query?.nodeId || query?.nodeId;
    const callId = query?.query?.callId || query?.callId;
    const toolName = query?.query?.toolName || query?.toolName;
    const sideEffect = query?.query?.sideEffect || query?.sideEffect;
    const request = query?.query?.request || query?.request;
    const argsHash = query?.query?.argsHash || query?.argsHash;
    const idempotencyKey = query?.query?.idempotencyKey || query?.idempotencyKey;
    const round = query?.query?.round || query?.round;
    const response = query?.query?.response || query?.response;
    const resultSummary = query?.query?.resultSummary || query?.resultSummary;
    const entities = query?.query?.entities || query?.entities;
    const payloadId = query?.query?.payloadId || query?.payloadId;
    const callStatus = query?.query?.callStatus || query?.callStatus;
    const businessOk = query?.query?.businessOk || query?.businessOk;
    const emptyResult = query?.query?.emptyResult || query?.emptyResult;
    const failureKind = query?.query?.failureKind || query?.failureKind;
    const errorCode = query?.query?.errorCode || query?.errorCode;
    const errorMessage = query?.query?.errorMessage || query?.errorMessage;
    const durationMs = query?.query?.durationMs || query?.durationMs;
    const traceId = query?.query?.traceId || query?.traceId;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getToolCallRecordTemplate()],
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

  // POST /tool_call_record/save - 保存（新增或更新）
  '/tool_call_record/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;
    
    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);
    
    // 生成完整的工具调用记录表数据
    const ToolCallRecordItem = Mock.mock(
      getToolCallRecordTemplate({
        id,
        organId: payload.organId !== undefined ? payload.organId : '@integer(1, 100)',
        taskId: payload.taskId !== undefined ? payload.taskId : '@word(3,10)',
        nodeId: payload.nodeId !== undefined ? payload.nodeId : '@word(3,10)',
        callId: payload.callId !== undefined ? payload.callId : '@word(3,10)',
        toolName: payload.toolName !== undefined ? payload.toolName : '@word(3,10)',
        sideEffect: payload.sideEffect !== undefined ? payload.sideEffect : '@word(3,10)',
        request: payload.request !== undefined ? payload.request : null,
        argsHash: payload.argsHash !== undefined ? payload.argsHash : '@word(3,10)',
        idempotencyKey: payload.idempotencyKey !== undefined ? payload.idempotencyKey : '@word(3,10)',
        round: payload.round !== undefined ? payload.round : null,
        response: payload.response !== undefined ? payload.response : null,
        resultSummary: payload.resultSummary !== undefined ? payload.resultSummary : null,
        entities: payload.entities !== undefined ? payload.entities : null,
        payloadId: payload.payloadId !== undefined ? payload.payloadId : null,
        callStatus: payload.callStatus !== undefined ? payload.callStatus : '@word(3,10)',
        businessOk: payload.businessOk !== undefined ? payload.businessOk : null,
        emptyResult: payload.emptyResult !== undefined ? payload.emptyResult : '@integer(1, 100)',
        failureKind: payload.failureKind !== undefined ? payload.failureKind : '@word(3,10)',
        errorCode: payload.errorCode !== undefined ? payload.errorCode : null,
        errorMessage: payload.errorMessage !== undefined ? payload.errorMessage : null,
        durationMs: payload.durationMs !== undefined ? payload.durationMs : null,
        traceId: payload.traceId !== undefined ? payload.traceId : null,
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );
    
    return createResult(ToolCallRecordItem);
  },

  // DELETE /tool_call_record/:id - 删除
  '/tool_call_record/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(ToolCallRecordMockDataMap);

