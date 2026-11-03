import { ReactNode } from 'react';

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Shared frame for the sign-in and sign-up pages so both look and behave the same. */
const AuthCard = ({ title, subtitle, children, footer }: AuthCardProps) => (
  <main className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-10">
    <section className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950/70 p-6 shadow-2xl backdrop-blur-md sm:p-8">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm text-neutral-400">{subtitle}</p>
        )}
      </header>
      {children}
      {footer && (
        <footer className="mt-6 text-center text-sm text-neutral-400">
          {footer}
        </footer>
      )}
    </section>
  </main>
);

export default AuthCard;
