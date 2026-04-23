import type { PageContent, ReportData } from '../types';

// Map a character offset inside `report.text` to a page number.
// Works by walking through report.pages and consuming page-text lengths
// (plus a 1-char separator to account for the "\n" we join with).
// Returns `null` if we cannot determine the page.
export function charIndexToPage(
  report: Pick<ReportData, 'pages' | 'text'> | null | undefined,
  charIndex: number
): number | null {
  if (!report || !Array.isArray(report.pages) || report.pages.length === 0) return null;
  if (charIndex < 0) return null;

  let cumulative = 0;
  for (const p of report.pages as PageContent[]) {
    const pageLen = (p.text || '').length;
    cumulative += pageLen;
    if (charIndex <= cumulative) return p.page_number;
    cumulative += 1; // assume a single-char separator between pages
  }
  // If we fell off the end, return the last page as a best guess.
  return report.pages[report.pages.length - 1].page_number;
}

export function locateTextOnPage(
  report: Pick<ReportData, 'pages' | 'text'> | null | undefined,
  needle: string
): { page: number | null; index: number } {
  if (!report || !needle) return { page: null, index: -1 };
  const hay = report.text || '';
  let idx = hay.indexOf(needle);
  if (idx === -1) idx = hay.toLowerCase().indexOf(needle.toLowerCase());
  if (idx === -1) return { page: null, index: -1 };
  return { page: charIndexToPage(report, idx), index: idx };
}
