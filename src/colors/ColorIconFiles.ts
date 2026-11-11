import * as fs from 'fs';
import * as vscode from 'vscode';
import { HexColor } from './Color';

interface Shape {
  markup: string;
  isOutline: boolean;
}

/** Simple 16×16 shapes drawn in the same style as the codicons they stand in for. */
const SHAPES: Record<string, Shape> = {
  folder: { markup: '<path d="M1.5 3.5h4.3l1.5 1.5h7.2v7.5h-13z"/>', isOutline: true },
  tag: { markup: '<path d="M2 2.5h5.3l6.7 6.7-4.8 4.8-6.7-6.7z"/><circle cx="5" cy="5.5" r="1"/>', isOutline: true },
  circle: { markup: '<circle cx="8" cy="8" r="4"/>', isOutline: false },
};
const DEFAULT_SHAPE = 'circle';
/** Part of the file name, so icons drawn by an older version are not reused after a style change. */
const STYLE_VERSION = 2;

let iconFolder: vscode.Uri | undefined;

/**
 * Called once from activate(): the folder is only known then, while icons are needed in many
 * small UI spots, so passing it through every constructor would add noise without adding safety.
 *
 * The folder must lie inside the extension itself: the tree view refuses to load icon files
 * from other places such as globalStorage, and then silently shows no icon at all.
 */
export function configureColorIconFolder(folder: vscode.Uri): void {
  iconFolder = folder;
  fs.mkdirSync(folder.fsPath, { recursive: true });
}

/** Writes each shape/color combination once and reuses the file afterwards. */
export function colorIconUri(icon: string, color: HexColor): vscode.Uri {
  if (!iconFolder) {
    throw new Error('Color icon folder is not configured.');
  }
  const shape = SHAPES[icon] ? icon : DEFAULT_SHAPE;
  const file = vscode.Uri.joinPath(iconFolder, `${shape}-v${STYLE_VERSION}-${color.slice(1)}.svg`);
  if (!fs.existsSync(file.fsPath)) {
    fs.writeFileSync(file.fsPath, svgFor(shape, color));
  }
  return file;
}

function svgFor(shapeName: string, color: HexColor): string {
  const shape = SHAPES[shapeName];
  const paint = shape.isOutline ? `fill="none" stroke="${color}" stroke-width="1.1" stroke-linejoin="round"` : `fill="${color}"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" ${paint}>${shape.markup}</svg>`;
}
