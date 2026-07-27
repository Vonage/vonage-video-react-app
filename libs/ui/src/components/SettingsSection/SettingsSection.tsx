import type { ComponentProps, PropsWithChildren, ReactElement, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export type SettingsSectionProps = PropsWithChildren<
  Omit<ComponentProps<'section'>, 'title'> & {
    title: string;
    icon?: ReactNode;
    description?: string;
  }
>;

/**
 * SettingsSection Component
 *
 * Groups related form fields under a heading with an optional leading icon and description.
 * The root element carries no outer spacing so the parent owns the gap between sections.
 * @param {SettingsSectionProps} props - the props for the component
 *  @property {string} title - the heading text
 *  @property {ReactNode} [icon] - rendered before the heading, typically a VividIcon
 *  @property {string} [description] - explanatory copy rendered under the heading
 * @returns {ReactElement} The settings section.
 */
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
