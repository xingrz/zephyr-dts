export interface DeviceTree {
  readonly chosens: Record<string, NodePath>;
  readonly nodes: NodePath[];
  readonly nodeLabels: Record<string, NodePath>;
  readonly props: Record<NodePath, Record<string, string>>;
  readonly regs: Record<NodePath, Record<string, string>>;
}

export type NodePath = string;
