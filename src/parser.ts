import { IDeviceTreeParser, Node } from './';
import { DeviceTree, NodePath } from './types';

export default class DeviceTreeParser implements IDeviceTreeParser, DeviceTree {
  readonly chosens: Record<string, NodePath> = {};
  readonly nodes: NodePath[] = [];
  readonly nodeLabels: Record<string, NodePath> = {};
  readonly props: Record<NodePath, Record<string, string>> = {};
  readonly regs: Record<NodePath, Record<string, string>> = {};

  private readonly parsedNodes: Record<NodePath, Node> = {};

  constructor(document: string) {
    parse(this, document);
    populate(this, this.parsedNodes);
  }

  choose(name: string): Node | null {
    const path = this.chosens[name];
    if (!path) return null;
    return this.parsedNodes[path] || null;
  }

  label(label: string): Node | null {
    const path = this.nodeLabels[label];
    if (!path) return null;
    return this.parsedNodes[path] || null;
  }

  node(path: NodePath): Node | null {
    return this.parsedNodes[path] || null;
  }

  under(parent: NodePath): Node[] {
    return this.nodes
      .filter(path => isChild(parent, path))
      .map(path => this.parsedNodes[path])
      .filter(node => !!node);
  }
}

function parse(dt: DeviceTree, document: string): void {
  for (const line of document.split('\n')) {
    if (!line.match(/^set_target_properties\(devicetree_target PROPERTIES \"([^\"]+)\" (.+)\)$/)) continue;
    const [cmakeType, ...cmakeKeys] = RegExp.$1.split('|');
    const cmakeValue = RegExp.$2;
    switch (cmakeType) {
      case 'DT_CHOSEN': {
        const [name] = cmakeKeys;
        dt.chosens[name] = JSON.parse(cmakeValue);
        break;
      }
      case 'DT_NODELABEL': {
        const [name] = cmakeKeys;
        dt.nodeLabels[name] = JSON.parse(cmakeValue);
        break;
      }
      case 'DT_NODE': {
        if (cmakeValue == 'TRUE') {
          const [path] = cmakeKeys;
          dt.nodes.push(path);
          dt.props[path] = {};
          dt.regs[path] = {};
        }
        break;
      }
      case 'DT_PROP': {
        const [path, key] = cmakeKeys;
        dt.props[path][key] = JSON.parse(cmakeValue);
        break;
      }
      case 'DT_REG': {
        const [path, key] = cmakeKeys;
        dt.regs[path][key] = JSON.parse(cmakeValue);
        break;
      }
    }
  }
}

function populate(dt: DeviceTree, nodes: Record<NodePath, Node>): void {
  for (const path of dt.nodes) {
    const properties = dt.props[path] || {};
    const regs = dt.regs[path] || {};
    const node: Node = nodes[path] = { path, properties };

    if (properties['compatible']) {
      node.compatible = properties['compatible'].split(';');
    }
    if (properties['label']) {
      node.label = properties['label'];
    }
    if (properties['status'] == 'okay' || properties['status'] == 'disabled') {
      node.status = properties['status'];
    }
    if (properties['interrupts']) {
      node.interrupts = values(properties['interrupts']).map(parseInt);
    }

    if (regs['NUM']) {
      const num = parseInt(regs['NUM']);
      const addrs = values(regs['ADDR']);
      const sizes = values(regs['SIZE']);
      node.reg = [];
      for (let i = 0; i < num; i++) {
        node.reg[i] = { addr: parseInt(addrs[i]) };
        if (sizes[i] != 'NONE') {
          node.reg[i].size = parseInt(sizes[i]);
        }
      }
    }
  }
}

function values(value: string): string[] {
  return value.split(';').slice(0, -1);
}

function isChild(parent: NodePath, path: NodePath): boolean {
  return path.startsWith(`${parent}/`) &&
    !path.substr(parent.length + 1).includes('/');
}
