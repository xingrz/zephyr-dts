zephyr-dts [![test](https://github.com/xingrz/zephyr-dts/actions/workflows/test.yml/badge.svg)](https://github.com/xingrz/zephyr-dts/actions/workflows/test.yml)
==========

[![][npm-version]][npm-url] [![][npm-downloads]][npm-url] [![license][license-img]][license-url] [![issues][issues-img]][issues-url] [![stars][stars-img]][stars-url] [![commits][commits-img]][commits-url]

A library for parsing DeviceTree from [Zephyr](https://github.com/zephyrproject-rtos/zephyr).

## Install

```sh
npm install zephyr-dts --save
```

## Usage

This library loads DTS from Zephyr's `build` directory:

```ts
import { loadDT } from 'zephyr-dts';

const dt = await loadDT('/path/to/zephyr/build');

const flash = dt.choose('zephyr,flash');
if (flash) {
  for (const part of dt.under(`${flash.path}/partitions`)) {
    const reg = part.reg![0]!;
    console.log(`part ${part.label} - addr: ${reg.addr}, size: ${reg.size}`);
  }
}
```

## APIs

```ts
function loadDT(buildDir: string): Promise<DeviceTreeParser>;

interface DeviceTreeParser {
  choose(name: string): Node | null;
  label(label: string): Node | null;
  node(path: NodePath): Node | null;
  under(parent: NodePath): Node[];
}

interface Node {
  path: string;
  compatible?: string[];
  label?: string;
  reg?: Register[];
  status?: 'okay' | 'disabled';
  interrupts?: number[];
  properties: Record<string, string>;
}

type NodePath = string;

interface Register {
  addr: number;
  size?: number;
}
```

## License

[MIT License](LICENSE)

[npm-version]: https://img.shields.io/npm/v/zephyr-dts.svg?style=flat-square
[npm-downloads]: https://img.shields.io/npm/dm/zephyr-dts.svg?style=flat-square
[npm-url]: https://www.npmjs.org/package/zephyr-dts
[license-img]: https://img.shields.io/github/license/xingrz/zephyr-dts?style=flat-square
[license-url]: LICENSE
[issues-img]: https://img.shields.io/github/issues/xingrz/zephyr-dts?style=flat-square
[issues-url]: https://github.com/xingrz/zephyr-dts/issues
[stars-img]: https://img.shields.io/github/stars/xingrz/zephyr-dts?style=flat-square
[stars-url]: https://github.com/xingrz/zephyr-dts/stargazers
[commits-img]: https://img.shields.io/github/last-commit/xingrz/zephyr-dts?style=flat-square
[commits-url]: https://github.com/xingrz/zephyr-dts/commits/master
