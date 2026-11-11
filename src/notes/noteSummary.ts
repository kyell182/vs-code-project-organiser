const MAX_SUMMARY_LENGTH = 80;
/** Markdown markers that only format a line: headings, list bullets, quotes, checkboxes. */
const LEADING_MARKDOWN = /^(#{1,6}\s+|[-*+]\s+(\[[ xX]\]\s+)?|>\s+|\d+\.\s+)/;

/** The first line with text, without markdown markers, shortened for small places. */
export function noteSummary(note: string | undefined): string | undefined {
  const line = note
    ?.split(/\r?\n/)
    .map((candidate) => candidate.trim().replace(LEADING_MARKDOWN, '').trim())
    .find((candidate) => candidate.length > 0);
  if (!line) {
    return undefined;
  }
  return line.length > MAX_SUMMARY_LENGTH ? `${line.slice(0, MAX_SUMMARY_LENGTH - 1)}…` : line;
}
