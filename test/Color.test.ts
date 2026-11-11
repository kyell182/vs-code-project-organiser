import * as assert from 'assert';
import { isHexColor, nearestPaletteColor, normalizeHex, requireColor, toHex } from '../src/colors/Color';
import { colorDot } from '../src/colors/colorEmoji';
import { PaletteColor } from '../src/colors/PaletteColor';
import { DomainError } from '../src/shared/DomainError';
import { TagService } from '../src/tags/TagService';
import { InMemoryStateStore, SequentialIds } from './fakes';

describe('Color', () => {
  it('normalizes short, long and hashless hex values', () => {
    assert.strictEqual(normalizeHex('#F6C'), '#ff66cc');
    assert.strictEqual(normalizeHex('ff66cc'), '#ff66cc');
    assert.strictEqual(normalizeHex(' #FF66CC '), '#ff66cc');
  });

  it('rejects values that are not hex colors', () => {
    assert.strictEqual(isHexColor('#12345'), false);
    assert.throws(() => normalizeHex('pink'), DomainError);
  });

  it('keeps palette colors as they are', () => {
    assert.strictEqual(requireColor('green'), PaletteColor.Green);
    assert.strictEqual(nearestPaletteColor(PaletteColor.Purple), PaletteColor.Purple);
  });

  it('gives every color a fixed hex value for quick pick icons', () => {
    assert.strictEqual(toHex(PaletteColor.Green), '#89d185');
    assert.strictEqual(toHex('#ff66cc'), '#ff66cc');
  });

  it('maps a custom color to the closest palette color', () => {
    assert.strictEqual(nearestPaletteColor('#ff0000'), PaletteColor.Red);
    assert.strictEqual(nearestPaletteColor('#2080ff'), PaletteColor.Blue);
    assert.strictEqual(nearestPaletteColor('#a0a0a0'), PaletteColor.Gray);
  });

  it('gives tags a colored dot, using the closest dot for custom colors', () => {
    assert.strictEqual(colorDot(PaletteColor.Blue), '🔵');
    assert.strictEqual(colorDot('#ff0010'), '🔴');
  });

  it('lets services store a normalized custom color', async () => {
    const tags = new TagService(new InMemoryStateStore(), new SequentialIds());
    const tag = await tags.create('design', '#F6C');
    assert.strictEqual(tag.color, '#ff66cc');
    await assert.rejects(tags.recolor(tag.id, '#nope'), DomainError);
  });
});
