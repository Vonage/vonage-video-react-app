import type { Meta, StoryObj } from '@storybook/react';
import i18next from 'i18next';
import { initReactI18next, I18nextProvider } from 'react-i18next';
import type { NotificationId } from '@core/stores/notifications';
import NotificationItem from './NotificationItem';
import { notifications$ } from '@core/stores';

const i18n = i18next.createInstance();
void i18n.use(initReactI18next).init({
  lng: 'en',
  resources: { en: { translation: { 'notification.dismiss': 'Dismiss notification' } } },
});

const meta = {
  title: 'UI/Notifications/NotificationItem',
  component: NotificationItem,
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <Story />
      </I18nextProvider>
    ),
  ],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['info', 'warning', 'success'],
    },
  },
  args: {
    id: 'notification:preview' as const,
    message: 'This is a notification message.',
    expirationMs: null,
  },
} satisfies Meta<typeof NotificationItem>;

type Story = StoryObj<typeof meta>;

export const AllTypes: Story = {
  args: { type: 'info', onDismiss: () => {} },
  parameters: { controls: { disable: true } },
  render: () => {
    const infoId = 'notification:info' as NotificationId;
    const warningId = 'notification:warning' as NotificationId;
    const successId = 'notification:success' as NotificationId;
    const childrenId = 'notification:children' as NotificationId;

    return (
      <I18nextProvider i18n={i18n}>
        <div className="flex flex-col gap-3">
          <NotificationItem
            id={infoId}
            type="info"
            message="Session connected successfully."
            expirationMs={null}
            onDismiss={notifications$.actions.dismiss}
          />
          <NotificationItem
            id={warningId}
            type="warning"
            message="Poor network quality detected."
            expirationMs={null}
            onDismiss={notifications$.actions.dismiss}
          />
          <NotificationItem
            id={successId}
            type="success"
            message="Background effect applied."
            expirationMs={null}
            onDismiss={notifications$.actions.dismiss}
          />
          <NotificationItem
            id={childrenId}
            type="warning"
            message="Failed to apply background effect."
            expirationMs={null}
            onDismiss={notifications$.actions.dismiss}
          >
            <details>
              <summary className="cursor-pointer text-xs opacity-80">View error details</summary>
              <pre className="mt-1 whitespace-pre-wrap text-xs">
                {`MediaProcessorError: GPU acceleration unavailable\n  at BackgroundProcessor.apply (processor.js:42)`}
              </pre>
            </details>
          </NotificationItem>
        </div>
      </I18nextProvider>
    );
  },
};

export const Info: Story = {
  args: { type: 'info', onDismiss: notifications$.actions.dismiss },
};

export const Warning: Story = {
  args: { type: 'warning', onDismiss: notifications$.actions.dismiss },
};

export const Success: Story = {
  args: { type: 'success', onDismiss: notifications$.actions.dismiss },
};

export const WithAutoDismiss: Story = {
  args: {
    type: 'info',
    message: 'This notification will dismiss after 3 seconds.',
    expirationMs: 3000,
    onDismiss: notifications$.actions.dismiss,
  },
};

export const LongMessage: Story = {
  args: {
    type: 'warning',
    message:
      'This is a longer notification message to show how text wraps inside the notification item component when the content exceeds one line.',
    onDismiss: notifications$.actions.dismiss,
  },
};

export const WithChildren: Story = {
  args: {
    type: 'warning',
    message: 'Failed to apply background effect.',
    onDismiss: notifications$.actions.dismiss,
  },
  render: (args) => (
    <I18nextProvider i18n={i18n}>
      <NotificationItem {...args}>
        <details className="">
          <summary className=" cursor-pointer text-xs text-vera-text-disabled-dark">
            View error details
          </summary>
          <pre className="mt-1 whitespace-pre-wrap text-xs">
            {`MediaProcessorError: GPU acceleration unavailable\n  at BackgroundProcessor.apply (processor.js:42)\n  at VideoSession.applyEffect (session.js:118)`}
          </pre>
        </details>
      </NotificationItem>
    </I18nextProvider>
  ),
};

export default meta;
