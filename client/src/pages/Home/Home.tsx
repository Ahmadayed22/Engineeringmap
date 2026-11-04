import { useState } from 'react';
import { Link } from 'react-router-dom';

import cpe from '@assets/EngPlan/cpe.webp';
import EE from '@assets/EngPlan/EE.webp';
import {
  roadmapName,
  roadmapPath,
  useRoadmaps,
  type Roadmap,
} from '@features/map/useRoadmaps';
import {
  CreateRoadmapDialog,
  RoadmapSettingsDialog,
} from '@features/map/RoadmapDialogs';
import { useI18n } from '../../i18n/context';

/** Pictures of the two original 2022 trees; other roadmaps get a plain card. */
const PICTURES: Record<string, { src: string; width: number; height: number }> =
  {
    cpe: { src: cpe, width: 1600, height: 1067 },
    ee: { src: EE, width: 1280, height: 777 },
  };

const Home = () => {
  const { t, dir, lang } = useI18n();
  const { roadmaps, isAdmin } = useRoadmaps();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Roadmap | null>(null);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl flex-col items-center justify-center px-4 py-10">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-white md:text-4xl">
          {t('home.title')}
        </h1>
        <p className="mt-3 text-sm text-white/70 md:text-base">
          {t('home.subtitle')}
        </p>
      </header>

      <ul className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
        {roadmaps.map((plan) => {
          const name = roadmapName(plan, lang);
          const picture = PICTURES[plan.slug];
          return (
            <li key={plan.slug} className="relative">
              <Link
                to={roadmapPath(plan.slug)}
                className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                {picture ? (
                  <img
                    src={picture.src}
                    alt={t('home.planAlt', { plan: name })}
                    width={picture.width}
                    height={picture.height}
                    decoding="async"
                    className="aspect-[3/2] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex aspect-[3/2] w-full items-center justify-center bg-gradient-to-br from-[#87032f] via-[#3a0a24] to-[#0f3460] p-6 text-center text-2xl font-bold text-white/90 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none md:text-3xl"
                  >
                    {name}
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 px-5 py-4">
                  <h2 className="text-lg font-semibold text-white">
                    {name}
                    {!plan.visible && (
                      <span className="ms-2 rounded-md bg-amber-500/90 px-2 py-0.5 align-middle text-xs font-semibold text-neutral-950">
                        {t('roadmaps.hidden')}
                      </span>
                    )}
                  </h2>
                  <span
                    aria-hidden="true"
                    className={`text-2xl text-white/60 transition-transform group-hover:text-white ${
                      dir === 'rtl'
                        ? 'group-hover:-translate-x-1'
                        : 'group-hover:translate-x-1'
                    }`}
                  >
                    {dir === 'rtl' ? '←' : '→'}
                  </span>
                </div>
              </Link>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setEditing(plan)}
                  aria-label={`${t('roadmaps.settings')}: ${name}`}
                  title={t('roadmaps.settings')}
                  className="absolute end-3 top-3 cursor-pointer rounded-lg bg-neutral-900/85 px-2.5 py-1.5 text-sm text-white shadow hover:bg-neutral-800"
                >
                  ⚙ {t('roadmaps.settingsShort')}
                </button>
              )}
            </li>
          );
        })}
        {isAdmin && (
          <li>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex h-full min-h-48 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/25 p-6 text-white/80 transition hover:border-white/50 hover:text-white"
            >
              <span className="text-4xl" aria-hidden="true">
                +
              </span>
              <span className="text-lg font-semibold">{t('roadmaps.new')}</span>
              <span className="text-sm text-white/60">{t('roadmaps.newHint')}</span>
            </button>
          </li>
        )}
      </ul>

      {creating && (
        <CreateRoadmapDialog
          roadmaps={roadmaps}
          onClose={() => setCreating(false)}
        />
      )}
      {editing && (
        <RoadmapSettingsDialog
          key={editing.slug}
          roadmap={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </main>
  );
};

export default Home;
