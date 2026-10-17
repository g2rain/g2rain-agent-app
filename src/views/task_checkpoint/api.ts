/**
 * 任务检查点表相关 API 服务
 * 提供任务检查点表数据的 CRUD 操作接口
 */

import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type { TaskCheckpoint, TaskCheckpointPayload, TaskCheckpointQuery } from './type';
import type { PageData, PageSelectListDto } from '@platform/types/api.type';

const base = Gateway.HARNESS;

/**
 * 任务检查点表 API 服务类
 */
export class TaskCheckpointApi {
  /**
   * 获取任务检查点表列表
   * @param params 查询参数（可选）
   * @returns 任务检查点表列表
   */
  static async list(params?: TaskCheckpointQuery): Promise<TaskCheckpoint[]> {
    const http = getHttpClient('default');
    const res = await http.get<TaskCheckpoint[]>(`${base}/task_checkpoint/list`, params);
    return res.data || [];
  }

  /**
   * 分页查询任务检查点表列表
   * @param params 查询参数（继承PageSelectListDto，包含基础查询和业务查询条件）
   * @returns 分页数据
   */
  static async page(params: TaskCheckpointQuery & PageSelectListDto): Promise<PageData<TaskCheckpoint>> {
    const http = getHttpClient('default');
    const res = await http.get<PageData<TaskCheckpoint>>(`${base}/task_checkpoint/page`, params);
    return res.data;
  }

  /**
   * 按 ID 查询单条明细
   * @param id 任务检查点表 ID
   * @returns 任务检查点表详情
   */
  static async getById(id: number): Promise<TaskCheckpoint> {
    const http = getHttpClient('default');
    const res = await http.get<TaskCheckpoint>(`${base}/task_checkpoint/${id}`);
    return res.data;
  }

  /**
   * 保存任务检查点表（新增或更新）
   * 如果 payload 中包含 id，则为更新；否则为新增
   * @param payload 任务检查点表数据（包含 id 时为更新，不包含时为新增）
   * @returns 保存后的任务检查点表
   */
  static async save(payload: TaskCheckpointPayload): Promise<TaskCheckpoint> {
    const http = getHttpClient('default');
    const res = await http.post<TaskCheckpoint>(`${base}/task_checkpoint/save`, payload);
    return res.data;
  }

  /**
   * 删除任务检查点表
   * @param id 任务检查点表 ID
   */
  static async remove(id: number): Promise<void> {
    const http = getHttpClient('default');
    await http.delete(`${base}/task_checkpoint/${id}`);
  }
}

