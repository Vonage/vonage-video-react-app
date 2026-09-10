import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import FooterLinks from '../../../FooterLinks';

const contributors = [
  'arnaud-lebreton-rofim',
  'behei-vonage',
  'chetanvangadiTokbox',
  'cpettet',
  'czoli1976',
  'dwivedisachin',
  'HapPiNeHsSs',
  'Hossein-Movahed',
  'johnny-quesada-developer',
  'jorgesanmartin-vng',
  'maikthomas',
  'manolovn',
  'masayukimiyazawa',
  'mend-for-github-com[bot]',
  'mobilebiz',
  'OscarFava',
  'rserebrennykov',
  'sharad-srivastava2',
  'VZaphod',
  'ydumburs',
];

const AdvancedSettingsAboutTab = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6" data-testid="advanced-settings-about-tab">
      <h2 className="font-vera-plain text-vera-heading-2 text-vera-secondary">
        {t('advancedSettings.tabs.about')}
      </h2>
      <div className="flex flex-col gap-3">
        <img
          className="h-8"
          src="/images/vonage-logo-desktop.svg"
          alt={t('advancedSettings.about.vonageLogo')}
        />
        <h3 className="font-vera-plain text-vera-heading-4 text-vera-secondary">
          {t('advancedSettings.about.referenceApp.title')}
        </h3>
        <p className="font-vera-plain text-vera-body-base text-vera-tertiary">
          {t('advancedSettings.about.referenceApp.description')}
        </p>
        <a
          href="https://developer.vonage.com/en/video/react-reference-app/overview"
          target="_blank"
          rel="noreferrer"
          data-testid="advanced-settings-about-vonage-link"
          className="font-vera-plain text-vera-body-base-semibold text-vera-primary"
        >
          {t('advancedSettings.about.referenceApp.learnMore')}
        </a>
      </div>
      <section className="flex flex-col gap-4" data-testid="advanced-settings-about-contributors">
        <h3 className="font-vera-plain text-vera-heading-4 text-vera-secondary">
          {t('advancedSettings.about.contributors')}
        </h3>
        <div className="h-72 overflow-hidden [perspective:500px]">
          <div className="grid w-full animate-contributors-crawl grid-cols-2 gap-6 motion-reduce:animate-none">
            {[...contributors, ...contributors].map((contributor, index) => {
              const isDuplicate = index >= contributors.length;

              return (
                <a
                  key={`${contributor}-${index}`}
                  href={`https://github.com/${contributor}`}
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={isDuplicate ? -1 : undefined}
                  aria-hidden={isDuplicate}
                  className="flex items-center justify-center gap-3 text-vera-secondary"
                  data-testid={
                    isDuplicate ? undefined : `advanced-settings-about-contributor-${contributor}`
                  }
                >
                  <img
                    className="h-12 w-12 rounded-full"
                    src={`https://github.com/${contributor}.png?size=96`}
                    alt=""
                  />
                  <span className="font-vera-plain text-vera-body-base-semibold">
                    {contributor}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>
      <FooterLinks className="justify-center" showVersion />
    </div>
  );
};

export default AdvancedSettingsAboutTab;
