import type { Meta, StoryObj } from '@storybook/react';
import i18next from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import notifications$ from '@core/stores/notifications';
import NotificationsContainer from './NotificationsContainer';
import { ZodIssue } from '@common/errors';
import { handleClientApplicationError } from '@ui/helpers';
import { ApplicationClientError } from '@core/errors';

const i18n = i18next.createInstance();
void i18n.use(initReactI18next).init({
  lng: 'en',
  resources: { en: { translation: { 'notification.dismiss': 'Dismiss notification' } } },
});

const meta = {
  title: 'UI/Notifications/NotificationsContainer',
  component: NotificationsContainer,
  argTypes: {
    position: {
      control: { type: 'select' },
      options: ['top-right', 'bottom-center'],
    },
  },
  args: {
    position: 'top-right',
  },
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <div className="relative h-screen w-full bg-vera-surface">
          <Story />
        </div>
      </I18nextProvider>
    ),
  ],
} satisfies Meta<typeof NotificationsContainer>;

type Story = StoryObj<typeof meta>;

const mocks: ZodIssue[] = [
  {
    code: 'invalid_type',
    path: ['username'],
    message: 'Invalid input: expected string, received number',
    expected: 'string',
    received: 'number',
  },
  {
    code: 'too_small',
    path: ['password'],
    message: 'String must contain at least 8 character(s)',
    expected: 'string',
    received: 'string',
  },
  {
    code: 'invalid_enum_value',
    path: ['role'],
    message: "Invalid enum value. Expected 'admin' | 'user', received 'superuser'",
    expected: "'admin' | 'user'",
    received: "'superuser'",
  },
];

export const Interactive: Story = {
  render: ({ position }) => {
    return (
      <>
        <div className="flex flex-wrap gap-2 p-4">
          <button
            className="rounded bg-vera-information px-3 py-2 text-sm text-vera-on-information"
            onClick={() =>
              notifications$.actions.push({
                type: 'info',
                message: 'Session connected successfully.',
                expirationMs: null,
              })
            }
          >
            Push info
          </button>
          <button
            className="rounded bg-vera-warning px-3 py-2 text-sm text-vera-on-warning"
            onClick={() =>
              handleClientApplicationError(
                new ApplicationClientError({
                  src: { issues: mocks },
                  fallbackConfig: {
                    fallbackMessage: 'Failed to connect the session due to invalid input.',
                  },
                })
              )
            }
          >
            Push warning
          </button>
          <button
            className="rounded bg-vera-success px-3 py-2 text-sm text-vera-on-success"
            onClick={() =>
              notifications$.actions.push({
                type: 'success',
                message: 'Background effect applied.',
                expirationMs: null,
              })
            }
          >
            Push success
          </button>

          <button
            className="rounded bg-vera-warning px-3 py-2 text-sm text-vera-on-warning"
            onClick={() =>
              notifications$.actions.push({
                type: 'warning',
                message: 'Failed to apply background effect.',
                expirationMs: null,
                children: (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-vera-text-disabled-dark">
                      Your device may not meet the requirements for this feature.
                    </span>
                  </div>
                ),
              })
            }
          >
            Push warning + details
          </button>
          <button
            className="rounded bg-vera-error px-3 py-2 text-sm text-vera-on-error"
            onClick={() =>
              handleClientApplicationError(
                new ApplicationClientError({
                  src: {
                    issues: mocks,
                    message: 'Failed to connect the session due to invalid input.',
                    type: 'server_error',
                  },
                  fallbackConfig: {
                    fallbackMessage: 'Failed to connect the session due to invalid input.',
                  },
                })
              )
            }
          >
            Error with details
          </button>

          <button
            className="rounded bg-vera-error px-3 py-2 text-sm text-vera-on-error"
            onClick={() => notifications$.setState({ notifications: new Map() })}
          >
            Clear all
          </button>
        </div>

        <NotificationsContainer position={position} />
      </>
    );
  },
};

export default meta;
