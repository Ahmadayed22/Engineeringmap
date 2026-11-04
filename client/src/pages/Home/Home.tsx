import { Link } from 'react-router-dom';

import cpe from '@assets/EngPlan/cpe.webp';
import EE from '@assets/EngPlan/EE.webp';
import { useI18n } from '../../i18n/context';

const plans = [
  {
    to: '/computerEngineer',
    image: cpe,
    width: 1600,
    height: 1067,
    titleKey: 'plan.cpe',
  },
  {
    to: '/electricalEngineer',
    image: EE,
    width: 1280,
    height: 777,
    titleKey: 'plan.ee',
  },
] as const;

const Home = () => {
  const { t, dir } = useI18n();
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
        {plans.map((plan) => (
          <li key={plan.to}>
            <Link
              to={plan.to}
              className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <img
                src={plan.image}
                alt={t('home.planAlt', { plan: t(plan.titleKey) })}
                width={plan.width}
                height={plan.height}
                decoding="async"
                className="aspect-[3/2] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
              />
              <div className="flex items-center justify-between gap-3 px-5 py-4">
                <h2 className="text-lg font-semibold text-white">
                  {t(plan.titleKey)}
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
          </li>
        ))}
      </ul>
    </main>
  );
};

export default Home;
