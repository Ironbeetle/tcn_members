/**
 * Bulletin content helpers
 * Normalizes pasted rich text (especially Office/Word HTML) and validates text size.
 */

export const MAX_BULLETIN_TEXT_LENGTH = 10000;
export const MAX_BULLETIN_HTML_LENGTH = 120000;

export function normalizeBulletinContent(content: string): string {
  return content
    // Remove comments and Office namespace tags that bloat payloads.
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?(?:meta|link|style|xml)[^>]*>/gi, '')
    .replace(/<\/?(?:o|w|v):[^>]*>/gi, '')
    .replace(/<\/?o:p[^>]*>/gi, '')
    // Drop inline presentation attributes; portal styles control final rendering.
    .replace(/\sclass=("[^"]*"|'[^']*')/gi, '')
    .replace(/\sstyle=("[^"]*"|'[^']*')/gi, '')
    .replace(/\slang=("[^"]*"|'[^']*')/gi, '')
    .replace(/\sdata-[\w-]+=("[^"]*"|'[^']*')/gi, '')
    .trim();
}

export function getBulletinPlainTextLength(content: string): number {
  const plainText = content
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();

  return plainText.length;
}
