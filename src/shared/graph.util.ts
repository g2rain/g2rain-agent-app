/**
 * 有向无环图的纯函数工具：拓扑排序与冗余边识别。
 *
 * 不依赖框架与业务字段，只认节点 ID 与有向边。
 *
 * @example
 * const edges = [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }, { from: 'a', to: 'c' }];
 * topoOrder(['a', 'b', 'c'], edges);   // ['a', 'b', 'c']
 * redundantEdges(edges);               // Set { 'a->c' }
 */

/** 有向边 */
export interface DirectedEdge {
  from: string;
  to: string;
}

/** 边的唯一键，形如 `from->to` */
export function edgeKey(edge: DirectedEdge): string {
  return `${edge.from}->${edge.to}`;
}

/**
 * 拓扑排序（Kahn 算法）。同一层按入参顺序稳定输出；存在环时，环上节点按入参顺序追加在末尾。
 */
export function topoOrder(ids: readonly string[], edges: readonly DirectedEdge[]): string[] {
  const indegree = new Map<string, number>(ids.map((id) => [id, 0]));
  const next = new Map<string, string[]>(ids.map((id) => [id, []]));
  for (const { from, to } of edges) {
    if (!indegree.has(from) || !indegree.has(to)) continue;
    next.get(from)!.push(to);
    indegree.set(to, indegree.get(to)! + 1);
  }
  const queue = ids.filter((id) => indegree.get(id) === 0);
  const order: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    order.push(id);
    for (const to of next.get(id)!) {
      const rest = indegree.get(to)! - 1;
      indegree.set(to, rest);
      if (rest === 0) queue.push(to);
    }
  }
  return order.length === ids.length ? order : [...order, ...ids.filter((id) => !order.includes(id))];
}

/**
 * 找出冗余边：存在 `from → … → to` 的其他路径时，直接边 `from → to` 视为冗余（传递约简）。
 */
export function redundantEdges(edges: readonly DirectedEdge[]): Set<string> {
  const next = new Map<string, string[]>();
  for (const { from, to } of edges) {
    if (!next.has(from)) next.set(from, []);
    next.get(from)!.push(to);
  }
  const reachableWithout = (from: string, target: string, skip: DirectedEdge): boolean => {
    const stack = [from];
    const seen = new Set<string>();
    while (stack.length > 0) {
      const id = stack.pop()!;
      for (const to of next.get(id) ?? []) {
        if (id === skip.from && to === skip.to) continue;
        if (to === target) return true;
        if (!seen.has(to)) {
          seen.add(to);
          stack.push(to);
        }
      }
    }
    return false;
  };
  const result = new Set<string>();
  for (const edge of edges) {
    if (reachableWithout(edge.from, edge.to, edge)) result.add(edgeKey(edge));
  }
  return result;
}
