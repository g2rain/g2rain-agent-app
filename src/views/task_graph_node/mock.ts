/**
 * 任务图步骤表相关 Mock 数据
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
 * 生成符合 TaskGraphNode 类型的 Mock 数据模板
 */
function getTaskGraphNodeTemplate(overrides: Partial<any> = {}): any {
  return {
    'id|+1': 1,
    'organId': '@integer(1, 100)',
    'taskId|1': ['@word(3,10)', '@word(3,10)'],
    'nodeId|1': ['@word(3,10)', '@word(3,10)'],
    'title|1': ['@word(3,10)', null],
    'objective|1': ['@word(3,10)', null],
    'skillKey|1': ['@word(3,10)', null],
    'target|1': ['@word(3,10)', null],
    'targetClaimed': '@integer(1, 100)',
    'delegateDepth': '@integer(1, 100)',
    'status|1': ['@word(3,10)', '@word(3,10)'],
    'result|1': ['@word(3,10)', null],
    'inputs|1': ['@word(3,10)', null],
    'outputs|1': ['@word(3,10)', null],
    'state|1': ['@word(3,10)', null],
    'errorCode|1': ['@word(3,10)', null],
    'errorMessage|1': ['@word(3,10)', null],
    'startedTime|1': ['@word(3,10)', null],
    'finishedTime|1': ['@word(3,10)', null],
    version: '@integer(1, 100)',
    createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
    ...overrides,
  };
}

/**
 * 任务图步骤表相关的 Mock 数据映射
 */
export const TaskGraphNodeMockDataMap: MockDataMap = {
  // GET /task_graph_node - 根据条件查询列表
  '/task_graph_node': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const taskId = query?.taskId;
    const nodeId = query?.nodeId;
    const title = query?.title;
    const objective = query?.objective;
    const skillKey = query?.skillKey;
    const target = query?.target;
    const targetClaimed = query?.targetClaimed;
    const delegateDepth = query?.delegateDepth;
    const status = query?.status;
    const result = query?.result;
    const inputs = query?.inputs;
    const outputs = query?.outputs;
    const state = query?.state;
    const errorCode = query?.errorCode;
    const errorMessage = query?.errorMessage;
    const startedTime = query?.startedTime;
    const finishedTime = query?.finishedTime;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getTaskGraphNodeTemplate({
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
    if (title) {
      filteredList = filteredList.filter((item: any) => {
        return item.title && item.title.includes(title);
      });
    }
    if (objective) {
      filteredList = filteredList.filter((item: any) => {
        return item.objective && item.objective.includes(objective);
      });
    }
    if (skillKey) {
      filteredList = filteredList.filter((item: any) => {
        return item.skillKey && item.skillKey.includes(skillKey);
      });
    }
    if (target) {
      filteredList = filteredList.filter((item: any) => {
        return item.target && item.target.includes(target);
      });
    }
    if (targetClaimed) {
      filteredList = filteredList.filter((item: any) => {
        return item.targetClaimed === targetClaimed;
      });
    }
    if (delegateDepth) {
      filteredList = filteredList.filter((item: any) => {
        return item.delegateDepth === delegateDepth;
      });
    }
    if (status) {
      filteredList = filteredList.filter((item: any) => {
        return item.status && item.status.includes(status);
      });
    }
    if (result) {
      filteredList = filteredList.filter((item: any) => {
        return item.result && item.result.includes(result);
      });
    }
    if (inputs) {
      filteredList = filteredList.filter((item: any) => {
        return item.inputs && item.inputs.includes(inputs);
      });
    }
    if (outputs) {
      filteredList = filteredList.filter((item: any) => {
        return item.outputs && item.outputs.includes(outputs);
      });
    }
    if (state) {
      filteredList = filteredList.filter((item: any) => {
        return item.state && item.state.includes(state);
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
    if (startedTime) {
      filteredList = filteredList.filter((item: any) => {
        return item.startedTime && item.startedTime.includes(startedTime);
      });
    }
    if (finishedTime) {
      filteredList = filteredList.filter((item: any) => {
        return item.finishedTime && item.finishedTime.includes(finishedTime);
      });
    }

    return createResult(filteredList);
  },

  // GET /task_graph_node/list - 根据条件查询列表（兼容接口）
  '/task_graph_node/list': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const organId = query?.organId;
    const taskId = query?.taskId;
    const nodeId = query?.nodeId;
    const title = query?.title;
    const objective = query?.objective;
    const skillKey = query?.skillKey;
    const target = query?.target;
    const targetClaimed = query?.targetClaimed;
    const delegateDepth = query?.delegateDepth;
    const status = query?.status;
    const result = query?.result;
    const inputs = query?.inputs;
    const outputs = query?.outputs;
    const state = query?.state;
    const errorCode = query?.errorCode;
    const errorMessage = query?.errorMessage;
    const startedTime = query?.startedTime;
    const finishedTime = query?.finishedTime;

    const count = 15;

    const list: any[] = [];
    for (let i = 0; i < count; i++) {
      const item = Mock.mock(
        getTaskGraphNodeTemplate({
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
    if (title) {
      filteredList = filteredList.filter((item: any) => {
        return item.title && item.title.includes(title);
      });
    }
    if (objective) {
      filteredList = filteredList.filter((item: any) => {
        return item.objective && item.objective.includes(objective);
      });
    }
    if (skillKey) {
      filteredList = filteredList.filter((item: any) => {
        return item.skillKey && item.skillKey.includes(skillKey);
      });
    }
    if (target) {
      filteredList = filteredList.filter((item: any) => {
        return item.target && item.target.includes(target);
      });
    }
    if (targetClaimed) {
      filteredList = filteredList.filter((item: any) => {
        return item.targetClaimed === targetClaimed;
      });
    }
    if (delegateDepth) {
      filteredList = filteredList.filter((item: any) => {
        return item.delegateDepth === delegateDepth;
      });
    }
    if (status) {
      filteredList = filteredList.filter((item: any) => {
        return item.status && item.status.includes(status);
      });
    }
    if (result) {
      filteredList = filteredList.filter((item: any) => {
        return item.result && item.result.includes(result);
      });
    }
    if (inputs) {
      filteredList = filteredList.filter((item: any) => {
        return item.inputs && item.inputs.includes(inputs);
      });
    }
    if (outputs) {
      filteredList = filteredList.filter((item: any) => {
        return item.outputs && item.outputs.includes(outputs);
      });
    }
    if (state) {
      filteredList = filteredList.filter((item: any) => {
        return item.state && item.state.includes(state);
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
    if (startedTime) {
      filteredList = filteredList.filter((item: any) => {
        return item.startedTime && item.startedTime.includes(startedTime);
      });
    }
    if (finishedTime) {
      filteredList = filteredList.filter((item: any) => {
        return item.finishedTime && item.finishedTime.includes(finishedTime);
      });
    }

    return createResult(filteredList);
  },

  // GET /task_graph_node/page - 根据条件分页查询
  '/task_graph_node/page': (config: AxiosRequestConfig) => {
    const query = config.params || {};
    const pageNum = parseInt(query?.pageNum || query?.page || '1', 10);
    const pageSize = parseInt(query?.pageSize || query?.size || '10', 10);
    const organId = query?.query?.organId || query?.organId;
    const taskId = query?.query?.taskId || query?.taskId;
    const nodeId = query?.query?.nodeId || query?.nodeId;
    const title = query?.query?.title || query?.title;
    const objective = query?.query?.objective || query?.objective;
    const skillKey = query?.query?.skillKey || query?.skillKey;
    const target = query?.query?.target || query?.target;
    const targetClaimed = query?.query?.targetClaimed || query?.targetClaimed;
    const delegateDepth = query?.query?.delegateDepth || query?.delegateDepth;
    const status = query?.query?.status || query?.status;
    const result = query?.query?.result || query?.result;
    const inputs = query?.query?.inputs || query?.inputs;
    const outputs = query?.query?.outputs || query?.outputs;
    const state = query?.query?.state || query?.state;
    const errorCode = query?.query?.errorCode || query?.errorCode;
    const errorMessage = query?.query?.errorMessage || query?.errorMessage;
    const startedTime = query?.query?.startedTime || query?.startedTime;
    const finishedTime = query?.query?.finishedTime || query?.finishedTime;

    const total = 50;
    const count = Math.min(pageSize, total - (pageNum - 1) * pageSize);
    const template: any = {
      [`records|${count}`]: [getTaskGraphNodeTemplate()],
    };

    const mockResult = Mock.mock(template);

    // 计算总页数
    const totalPages = Math.ceil(total / pageSize);

    const pageData = {
      pageNum,
      pageSize,
      total,
      totalPages,
      records: mockResult.records,
    };

    return createResult(pageData);
  },

  // POST /task_graph_node/save - 保存（新增或更新）
  '/task_graph_node/save': (config: AxiosRequestConfig) => {
    const payload = config.data || {};
    const isUpdate = payload.id !== undefined && payload.id !== null;

    // 如果是更新，使用传入的 id；如果是新增，生成新 id
    const id = isUpdate ? payload.id : Mock.Random.integer(1000, 9999);

    // 生成完整的任务图步骤表数据
    const TaskGraphNodeItem = Mock.mock(
      getTaskGraphNodeTemplate({
        id,
        organId: payload.organId !== undefined ? payload.organId : '@integer(1, 100)',
        taskId: payload.taskId !== undefined ? payload.taskId : '@word(3,10)',
        nodeId: payload.nodeId !== undefined ? payload.nodeId : '@word(3,10)',
        title: payload.title !== undefined ? payload.title : null,
        objective: payload.objective !== undefined ? payload.objective : null,
        skillKey: payload.skillKey !== undefined ? payload.skillKey : null,
        target: payload.target !== undefined ? payload.target : null,
        targetClaimed: payload.targetClaimed !== undefined ? payload.targetClaimed : '@integer(1, 100)',
        delegateDepth: payload.delegateDepth !== undefined ? payload.delegateDepth : '@integer(1, 100)',
        status: payload.status !== undefined ? payload.status : '@word(3,10)',
        result: payload.result !== undefined ? payload.result : null,
        inputs: payload.inputs !== undefined ? payload.inputs : null,
        outputs: payload.outputs !== undefined ? payload.outputs : null,
        state: payload.state !== undefined ? payload.state : null,
        errorCode: payload.errorCode !== undefined ? payload.errorCode : null,
        errorMessage: payload.errorMessage !== undefined ? payload.errorMessage : null,
        startedTime: payload.startedTime !== undefined ? payload.startedTime : null,
        finishedTime: payload.finishedTime !== undefined ? payload.finishedTime : null,
        updateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        createTime: isUpdate ? '@datetime("yyyy-MM-dd HH:mm:ss")' : '@datetime("yyyy-MM-dd HH:mm:ss")',
      }),
    );

    return createResult(TaskGraphNodeItem);
  },

  // DELETE /task_graph_node/:id - 删除
  '/task_graph_node/:id': (config: AxiosRequestConfig) => {
    const deletedRows = 1;
    return createResult(deletedRows);
  },
};

// 模块加载时自动注册到 mockManager
mockManager.registerAll(TaskGraphNodeMockDataMap);

