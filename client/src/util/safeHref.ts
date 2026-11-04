/**
 * Returns the URL only if it's a plain http(s) link; otherwise undefined.
 * User-submitted links are rendered as <a href>, and a javascript: or data: URL there
 * would run code in whoever clicks it. The API rejects such links too; this also covers
 * anything stored before that check existed.
 */
export function safeHref(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      ? parsed.href
      : undefined;
  } catch {
    return undefined;
  }
}
