/**
 * 工具目录 API（g2rain-mcp-registry / studio 引用查询）。
 */
import { getHttpClient } from '@runtime/http';
import { Gateway } from '@runtime/console';
import type { PageData } from '@platform/types/api.type';
import type { McpToolPayload, McpToolProfileVo, McpToolQuery, ToolSkillRef } from './type';

// 导入 mock 数据以触发自动注册（副作用导入）
import './mock';

interface SkillToolBindingRow {
  skillId: number;
  toolName: string;
}

interface SkillProfileRow {
  id: number;
  skillKey: string;
  skillName: string;
}

const mcp = Gateway.MCP;
const studio = Gateway.STUDIO;
const http = () => getHttpClient('default');

export class McpToolProfileApi {
  static async list(query: McpToolQuery = {}): Promise<McpToolProfileVo[]> {
    const res = await http().get<McpToolProfileVo[]>(`${mcp}/mcp_tool_profile/list`, { ...query });
    return res.data ?? [];
  }

  static async page(query: McpToolQuery, pageNum: number, pageSize: number): Promise<PageData<McpToolProfileVo>> {
    const res = await http().get<PageData<McpToolProfileVo>>(`${mcp}/mcp_tool_profile/page`, {
      ...query,
      pageNum,
      pageSize,
    });
    return res.data;
  }

  static async save(payload: McpToolPayload): Promise<number> {
    const res = await http().post<number>(`${mcp}/mcp_tool_profile/save`, payload);
    return res.data;
  }

  static async remove(id: number): Promise<void> {
    await http().delete(`${mcp}/mcp_tool_profile/${id}`);
  }

  /** 被哪些技能引用（一期前端汇总） */
  static async skillRefs(toolName: string): Promise<ToolSkillRef[]> {
    const [binds, skills] = await Promise.all([
      http().get<SkillToolBindingRow[]>(`${studio}/skill_tool_binding/list`, { toolName }),
      http().get<SkillProfileRow[]>(`${studio}/skill_profile/list`),
    ]);
    const byId = new Map((skills.data ?? []).map((s) => [s.id, s]));
    return (binds.data ?? []).map((b) => {
      const skill = byId.get(b.skillId);
      return {
        skillId: b.skillId,
        skillKey: skill?.skillKey ?? String(b.skillId),
        skillName: skill?.skillName ?? String(b.skillId),
      };
    });
  }
}
