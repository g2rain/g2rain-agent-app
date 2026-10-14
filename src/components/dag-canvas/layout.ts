import type { DagDirection, DagEdge, DagNode } from './types';

/** 布局结果：节点左上角坐标 */
export type DagPositions = Map<string, { x: number; y: number }>;

/**
 * 用 dagre 计算分层布局。dagre 按需动态加载，不进入主包。
 */
export async function layoutDag(
  nodes: readonly DagNode[],
  edges: readonly DagEdge[],
  direction: DagDirection,
  size: { width: number; height: number },
): Promise<DagPositions> {
  const { default: dagre } = await import('@dagrejs/dagre');
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({ rankdir: direction, nodesep: 32, ranksep: 72, marginx: 16, marginy: 16 });
  graph.setDefaultEdgeLabel(() => ({}));
  for (const node of nodes) {
    graph.setNode(node.id, { width: node.width ?? size.width, height: node.height ?? size.height });
  }
  for (const edge of edges) graph.setEdge(edge.from, edge.to);
  dagre.layout(graph);

  const positions: DagPositions = new Map();
  for (const node of nodes) {
    const box = graph.node(node.id);
    const width = node.width ?? size.width;
    const height = node.height ?? size.height;
    positions.set(node.id, { x: box.x - width / 2, y: box.y - height / 2 });
  }
  return positions;
}
