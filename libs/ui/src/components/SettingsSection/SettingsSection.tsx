import type { ComponentProps, PropsWithChildren, ReactElement, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export type SettingsSectionProps = PropsWithChildren<
  Omit<ComponentProps<'section'>, 'title'> & {
    title: string;
    icon?: ReactNode;
    description?: string;
  }
>;

const SettingsSection = ({
  title,
  icon,
  description,
  className,
  children,
  ...sectionProps
}: SettingsSectionProps): ReactElement => (
  <section className={twMerge('flex flex-col gap-4', className)} {...sectionProps}>
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-row items-center gap-2">
        {icon}
        <h4 className="font-vera-plain text-vera-heading-4 text-vera-secondary">{title}</h4>
      </div>
      {description ? (
        <p className="font-vera-plain text-vera-body-base text-vera-tertiary">{description}</p>
      ) : null}
    </div>
    <div className="flex flex-col gap-6">{children}</div>
  </section>
);

export default SettingsSection;
