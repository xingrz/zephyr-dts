import { join } from 'path';
import { loadDT } from '../src';

const FIXTURES_DIR = join(__dirname, 'fixtures');

test('loadDT()', async () => {
  const dt = await loadDT(join(FIXTURES_DIR, 'build1'));
  expect(dt).toBeTruthy();
  expect(dt.chosens).toBeInstanceOf(Object);
  expect(dt.nodes).toBeInstanceOf(Array);
  expect(dt.nodes.length).toBeGreaterThan(0);
  expect(dt.nodeLabels).toBeInstanceOf(Object);
  expect(dt.props).toBeInstanceOf(Object);
  expect(dt.regs).toBeInstanceOf(Object);
});

test('loadDT() with CRLF', async () => {
  const dt = await loadDT(join(FIXTURES_DIR, 'crlf'));
  expect(dt.nodes).toBeInstanceOf(Array);
  expect(dt.nodes.length).toBeGreaterThan(0);
});

test('loadDT() with directory not exists', async () => {
  await expect(loadDT(join(FIXTURES_DIR, 'not-found'))).rejects.toThrow(/ENOENT/);
});

describe('class DeviceTreeParser', () => {
  test('node()', async () => {
    const dt = await loadDT(join(FIXTURES_DIR, 'build1'));

    const flash0 = dt.node('/soc/flash-controller@3ff42000/flash@0')!;
    expect(flash0).toBeTruthy();

    expect(flash0.path).toBe('/soc/flash-controller@3ff42000/flash@0');
    expect(flash0.compatible).toBeInstanceOf(Array);
    expect(flash0.compatible).toContain('soc-nv-flash');
    expect(flash0.label).toBe('FLASH_ESP32');
    expect(flash0.reg).toEqual([{ addr: 0x0, size: 0x400000 }]);
    expect(flash0.status).toBe('okay');
    expect(flash0.properties).toHaveProperty('erase-block-size', '4096');
    expect(flash0.properties).toHaveProperty('write-block-size', '4');

    expect(dt.node('/path/not/found')).toBeNull();
  });

  test('choose()', async () => {
    const dt = await loadDT(join(FIXTURES_DIR, 'build1'));

    const flash0 = dt.node('/soc/flash-controller@3ff42000/flash@0')!;
    expect(flash0).toBeTruthy();

    expect(dt.choose('zephyr,flash')).toEqual(flash0);
    expect(dt.choose('invalid,name')).toBeNull();
  });

  test('label()', async () => {
    const dt = await loadDT(join(FIXTURES_DIR, 'build1'));

    const flash0 = dt.node('/soc/flash-controller@3ff42000/flash@0')!;
    expect(flash0).toBeTruthy();

    expect(dt.label('flash0')).toEqual(flash0);
    expect(dt.label('non-exists')).toBeNull();
  });

  test('under()', async () => {
    const dt = await loadDT(join(FIXTURES_DIR, 'build1'));

    const flash0 = dt.node('/soc/flash-controller@3ff42000/flash@0')!;
    expect(flash0).toBeTruthy();

    const parts = dt.under(`${flash0.path}/partitions`);
    const part0 = dt.node(`${flash0.path}/partitions/partition@9000`);
    expect(parts).toContainEqual(part0);

    expect(dt.under('/path/not/found')).toEqual([]);
  });
});
