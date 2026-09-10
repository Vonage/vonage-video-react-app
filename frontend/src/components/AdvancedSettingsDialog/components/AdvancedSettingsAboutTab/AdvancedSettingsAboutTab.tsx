import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import FooterLinks from '../../../FooterLinks';

const contributors = [
  { name: 'Hossein Movahed', username: 'Hossein-Movahed' },
  { name: 'Johnny Esteban Quesada', username: 'johnny-quesada-developer' },
  { name: 'Oscar Fava', username: 'OscarFava' },
];

const AdvancedSettingsAboutTab = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6" data-testid="advanced-settings-about-tab">
      <h2 className="font-vera-plain text-vera-heading-2 text-vera-secondary">
        {t('advancedSettings.tabs.about')}
      </h2>
      <a
        href="https://developer.vonage.com/en/video/react-reference-app/overview"
        target="_blank"
        rel="noreferrer"
        data-testid="advanced-settings-about-vonage-link"
      >
        <img
          className="h-8"
          src="/images/vonage-logo-desktop.svg"
          alt={t('advancedSettings.about.vonageLogo')}
        />
      </a>
      <FooterLinks showVersion />
      <section className="flex flex-col gap-4" data-testid="advanced-settings-about-contributors">
        <h3 className="font-vera-plain text-vera-heading-4 text-vera-secondary">
          {t('advancedSettings.about.contributors')}
        </h3>
        <div className="overflow-hidden">
          <div className="flex w-max animate-contributors-scroll gap-4 motion-reduce:animate-none">
            {[...contributors, ...contributors].map((contributor, index) => {
              const isDuplicate = index >= contributors.length;

              return (
                <a
                  key={`${contributor.username}-${index}`}
                  href={`https://github.com/${contributor.username}`}
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={isDuplicate ? -1 : undefined}
                  aria-hidden={isDuplicate}
                  className="flex shrink-0 items-center gap-2 text-vera-secondary"
                  data-testid={
                    isDuplicate
                      ? undefined
                      : `advanced-settings-about-contributor-${contributor.username}`
                  }
                >
                  <img
                    className="h-8 w-8 rounded-full"
                    src={`https://github.com/${contributor.username}.png?size=96`}
                    alt=""
                  />
                  <span className="font-vera-plain text-vera-body-base">{contributor.name}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdvancedSettingsAboutTab;
