/**
 * 任务图步骤表相关 API 服务
 * 提供任务图步骤表数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type { TaskGraphNode, TaskGraphNodePayload, TaskGraphNodeQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

const base = Gateway.HARNESS;

/**
 * 任务图步骤表 API 服务类
 */
export class TaskGraphNodeApi {
  /**
   * 获取任务图步骤表列表
   * @param params 查询参数（可选）
   * @returns 任务图步骤表列表
   */
  static async list(params?: TaskGraphNodeQuery): Promise<TaskGraphNode[]> {
    const http = getHttpClient('default');
    const res = await http.get<TaskGraphNode[]>(`${base}/task_graph_node/list`, params);
    return res.data || [];
  }

  /**
   * 分页查询任务图步骤表列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: TaskGraphNodeQuery & PageSelectListDto): Promise<PageData<TaskGraphNode>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<TaskGraphNode>>(`${base}/task_graph_node/page`, params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 任务图步骤表 ID
   * @returns 任务图步骤表详情
   */
  static async getById(id: number): Promise<TaskGraphNode> {
    const http = getHttpClient('default');
    const res = await http.get<TaskGraphNode>(`${base}/task_graph_node/${id}`);
    return res.data;
  }

  /**
   * 保存任务图步骤表（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 任务图步骤表数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的任务图步骤表
   */
  static async save(payload: TaskGraphNodePayload): Promise<TaskGraphNode> {
    const http = getHttpClient('default');
    const res = await http.post<TaskGraphNode>(`${base}/task_graph_node/save`, payload);
    return res.data;
  }

  /**
   * 删除任务图步骤表
   * @param id 任务图步骤表 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`${base}/task_graph_node/${id}`);
  }
}

