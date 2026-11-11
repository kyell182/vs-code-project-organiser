import * as assert from 'assert';
import { readableTextOn } from '../src/colors/Color';
import { PaletteColor } from '../src/colors/PaletteColor';
import { formatRelativeTime } from '../src/shared/relativeTime';

const MINUTE = 60 * 1000;
const NOW = 1_000_000_000_000;

describe('readableTextOn', () => {
  it('uses dark text on light colors and white text on dark colors', () => {
    assert.strictEqual(readableTextOn(PaletteColor.Yellow), '#000000');
    assert.strictEqual(readableTextOn('#ffffff'), '#000000');
    assert.strictEqual(readableTextOn('#1e1e5a'), '#ffffff');
    assert.strictEqual(readableTextOn(PaletteColor.Red), '#ffffff');
  });
});

describe('formatRelativeTime', () => {
  it('describes recent and older moments in words', () => {
    assert.strictEqual(formatRelativeTime(NOW - 2 * MINUTE, NOW, 'en'), '2 minutes ago');
    assert.strictEqual(formatRelativeTime(NOW - 3 * 60 * MINUTE, NOW, 'en'), '3 hours ago');
    assert.strictEqual(formatRelativeTime(NOW - 24 * 60 * MINUTE, NOW, 'en'), 'yesterday');
  });

  it('follows the language of VS Code', () => {
    assert.strictEqual(formatRelativeTime(NOW - 2 * MINUTE, NOW, 'nl'), '2 minuten geleden');
  });
});
