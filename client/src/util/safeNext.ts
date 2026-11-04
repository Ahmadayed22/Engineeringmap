/**
 * Only same-site paths like "/planner". Rejects "//evil.com", "/\evil.com" and full URLs,
 * which browsers would treat as another site (open redirect).
 */
export const safeNext = (next: string | null | undefined, fallback = '/') => {
  if (!next || !next.startsWith('/')) return fallback;
  const second = next.charAt(1);
  if (second === '/' || second === '\\') return fallback;
  return next;
};
