import * as assert from 'assert';
import { buildBoard } from '../src/board/BoardModel';
import { FolderInspector } from '../src/board/FolderFacts';
import { detectProjectType, parseGitHead } from '../src/board/ProjectTypeRules';
import { PaletteColor } from '../src/colors/PaletteColor';
import { StatusResolver } from '../src/statuses/StatusResolver';
import { NOW, sampleState } from './fixtures';

const fakeInspector: FolderInspector = {
  inspect: (path) => ({ isMissing: path === 'D:\\gone', projectType: 'Node.js', branch: 'main' }),
};

describe('BoardModel', () => {
  const context = { resolver: new StatusResolver(() => 30), inspector: fakeInspector, currentPath: 'd:/p' };

  it('has one column per status, including empty ones to drop on', () => {
    const columns = buildBoard(sampleState(), NOW, context);
    assert.deepStrictEqual(columns.map((column) => column.label), ['Active', 'Paused', 'Inactive', 'Archived', 'Waiting']);
    assert.strictEqual(columns[1].cards.length, 0);
  });

  it('fills cards with group, tags and folder facts', () => {
    const card = buildBoard(sampleState(), NOW, context)[0].cards[0];
    assert.strictEqual(card.name, 'Motio');
    assert.deepStrictEqual(card.group, { name: 'School', color: PaletteColor.Purple });
    assert.deepStrictEqual(card.tags, [{ name: 'web', color: PaletteColor.Blue }]);
    assert.strictEqual(card.branch, 'main');
    assert.strictEqual(card.isCurrent, true);
  });

  it('puts pinned projects first within a column', () => {
    const state = sampleState();
    state.projects.forEach((project) => (project.lastOpened = undefined));
    state.projects[1].isPinned = true;
    const inactive = buildBoard(state, NOW, context)[2];
    assert.deepStrictEqual(inactive.cards.map((card) => card.name), ['Toolkit', 'Motio']);
  });
});

describe('ProjectTypeRules', () => {
  it('prefers the most specific marker', () => {
    assert.strictEqual(detectProjectType(['package.json', 'tsconfig.json']), 'TypeScript');
    assert.strictEqual(detectProjectType(['App.csproj']), '.NET');
    assert.strictEqual(detectProjectType(['readme.md']), undefined);
  });

  it('reads a branch or a short hash from .git/HEAD', () => {
    assert.strictEqual(parseGitHead('ref: refs/heads/feature/login\n'), 'feature/login');
    assert.strictEqual(parseGitHead('0123456789abcdef0123456789abcdef01234567'), '0123456');
    assert.strictEqual(parseGitHead('garbage'), undefined);
  });
});
