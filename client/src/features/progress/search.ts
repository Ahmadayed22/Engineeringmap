/**
 * Loose matching for course names: ignores Arabic diacritics and the common spelling
 * variants students type interchangeably (أ/إ/آ/ا, ة/ه, ى/ي), plus case and extra spaces.
 */
export function normalizeForSearch(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[ً-ٰٟـ]/g, '') // tashkeel + tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[()[\]{}.,،:;'"!?-]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export type Searchable = { id: number; name: string };

/** Best matches first: name starts with the query, then contains it, then all words match. */
export function searchCourses<T extends Searchable>(
  items: T[],
  query: string,
  limit = 8
): T[] {
  const q = normalizeForSearch(query);
  if (!q) return [];
  const words = q.split(' ');
  const scored: { item: T; score: number }[] = [];
  for (const item of items) {
    const name = normalizeForSearch(item.name);
    let score = -1;
    if (name.startsWith(q)) score = 3;
    else if (name.includes(q)) score = 2;
    else if (words.every((w) => name.includes(w))) score = 1;
    if (score > 0) scored.push({ item, score });
  }
  return scored
    .sort(
      (a, b) =>
        b.score - a.score || a.item.name.localeCompare(b.item.name, 'ar')
    )
    .slice(0, limit)
    .map((s) => s.item);
}
