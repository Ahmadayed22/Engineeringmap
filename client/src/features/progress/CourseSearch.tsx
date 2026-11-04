import { useId, useMemo, useState } from 'react';
import { Panel } from '@xyflow/react';
import { useProgressContext } from './ProgressContext';
import { useOpenCourse } from './useOpenCourse';
import { searchCourses } from './search';
import { useI18n } from '@i18n/context';

const statusDot = {
  completed: 'bg-white/40',
  available: 'bg-green-500',
  locked: 'bg-amber-500/70',
} as const;

/** Type-ahead course search on the map (keyboard: ↑ ↓ Enter Esc). */
const CourseSearch = () => {
  const ctx = useProgressContext();
  const openCourse = useOpenCourse();
  const { t, dir } = useI18n();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const listId = useId();

  const items = useMemo(
    () =>
      ctx
        ? [...ctx.progress.graph.courses.values()].map((c) => ({
            id: c.courseId,
            name: c.name,
          }))
        : [],
    [ctx]
  );
  const results = useMemo(() => searchCourses(items, query), [items, query]);

  if (!ctx) return null;

  const choose = (id: number) => {
    openCourse(id);
    setQuery('');
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      choose(results[active].id);
    } else if (e.key === 'Escape') {
      setQuery('');
      setOpen(false);
    }
  };

  const showList = open && query.trim().length > 0;

  return (
    <Panel position={dir === 'rtl' ? 'top-right' : 'top-left'}>
      <div className="pointer-events-auto relative w-[min(18rem,calc(100vw-2rem))]">
        <label htmlFor={`${listId}-input`} className="sr-only">
          {t('search.label')}
        </label>
        <input
          id={`${listId}-input`}
          type="search"
          dir="auto"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList && results[active]
              ? `${listId}-${results[active].id}`
              : undefined
          }
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          className="w-full rounded-full border border-white/15 bg-neutral-950/85 px-4 py-2 text-sm text-white shadow-xl backdrop-blur-md placeholder:text-white/40 focus:border-blue-500 focus:outline-none"
        />
        {showList && (
          <ul
            id={listId}
            role="listbox"
            className="absolute mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-white/10 bg-neutral-950/95 p-1 shadow-2xl backdrop-blur-md"
          >
            {results.length === 0 ? (
              <li className="px-3 py-2 text-sm text-white/60">
                {t('search.none')}
              </li>
            ) : (
              results.map((r, i) => {
                const status = ctx.isSignedIn
                  ? ctx.progress.states.get(r.id)?.status
                  : undefined;
                return (
                  <li
                    key={r.id}
                    id={`${listId}-${r.id}`}
                    role="option"
                    aria-selected={i === active}
                    dir="auto"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      choose(r.id);
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-white ${
                      i === active ? 'bg-white/10' : ''
                    }`}
                  >
                    {status && (
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 shrink-0 rounded-full ${statusDot[status]}`}
                      />
                    )}
                    <span className="truncate">{r.name}</span>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    </Panel>
  );
};

export default CourseSearch;
