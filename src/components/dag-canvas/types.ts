/** 画布节点：尺寸用于自动布局，业务数据原样透传给节点插槽 */
export interface DagNode<T = unknown> {
  id: string;
  width?: number;
  height?: number;
  data: T;
}

/** 画布边 */
export interface DagEdge {
  from: string;
  to: string;
  /** 虚线（如委派边） */
  dashed?: boolean;
  /** 淡化（如冗余依赖） */
  faded?: boolean;
  label?: string;
}

/** 布局方向：从左到右 / 从上到下 */
export type DagDirection = 'LR' | 'TB';
