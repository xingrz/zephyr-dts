import { promisify } from 'util';
import { readFile as _readFile } from 'fs';
import { join } from 'path';

const readFile = promisify(_readFile);

import { DeviceTree, NodePath } from './types';
import DeviceTreeParser from './parser';

export interface IDeviceTreeParser {
  choose(name: string): Node | null;
  label(label: string): Node | null;
  node(path: NodePath): Node | null;
  under(parent: NodePath): Node[];
}

export interface Node {
  path: string;
  compatible?: string[];
  label?: string;
  reg?: Register[];
  status?: 'okay' | 'disabled';
  interrupts?: number[];
  properties: Record<string, string>;
}

export interface Register {
  addr?: number;
  size?: number;
}

export async function loadDT(buildDir: string): Promise<DeviceTree & IDeviceTreeParser> {
  const document = await readFile(join(buildDir, 'zephyr', 'dts.cmake'), 'utf-8');
  return new DeviceTreeParser(document);
}
