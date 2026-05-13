import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

type ErrorPageProps = {
  error: Error;
};

/**
 * ErrorPage
 *
 * Displayed by the root ErrorBoundary when the application throws an
 * unrecoverable error (e.g. an invalid environment variable in env.ts).
 *
 * IMPORTANT: intentionally self-contained — must NOT import any component
 * that transitively reads `env`, because `env` may be the broken `{} as Env`
 * shell when this page is rendered (e.g. Banner → BannerLanguage → LanguageSelector → env).
 * @param {ErrorPageProps} props
 * @returns {ReactElement}
 */
const ErrorPage = ({ error }: ErrorPageProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <div
      data-testid="error-page"
      className="flex min-h-dvh items-center justify-center p-8 bg-vera-background"
    >
      <div className="flex w-full max-w-[560px] flex-col gap-6 rounded-2xl p-8 bg-vera-surface">
        <h1 className="text-vera-heading-4 text-vera-error">{t('errorPage.title')}</h1>

        <p className="text-vera-body-base text-vera-on-surface">{t('errorPage.description')}</p>

        <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg p-4 text-vera-caption bg-vera-background text-vera-error">
          {error.message}
        </pre>
      </div>
    </div>
  );
};

export default ErrorPage;
