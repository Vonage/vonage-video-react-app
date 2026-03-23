import type { Meta, StoryObj } from '@storybook/react';
import { ComponentProps, memo, PropsWithChildren, useEffect, useRef, forwardRef } from 'react';

import '../i18n';
import './VeraRoomElement';
import { BridgeAttribute } from './stores/bridge';

type VeraRoomProps = PropsWithChildren<
  {
    sessionIdentifier: string;
    entryPoint: string;
    language: string;
  } & ComponentProps<'div'>
>;

const meta: Meta<VeraRoomProps> = {
  title: 'VeraRoom/VeraRoomElement',
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    sessionIdentifier: {
      control: 'text',
      description: 'Session identifier to join or create',
      defaultValue: 'test-123',
    },
    entryPoint: {
      control: 'text',
      description: 'Entry point identifier for logging and tracking',
      defaultValue: 'storybook',
    },
    language: {
      control: 'text',
      description: 'BCP-47 language tag (e.g., en, es, it)',
      defaultValue: 'en',
    },
  },
};

type Story = StoryObj<VeraRoomProps>;

const StableVeraRoom = memo(
  forwardRef<HTMLElement, VeraRoomProps>((props, ref) => {
    return (
      <vera-room
        session-identifier={props.sessionIdentifier}
        entry-point={props.entryPoint}
        language={props.language}
        ref={ref}
      />
    );
  }),
  () => true
);

/**
 * Component that renders vera-room and updates attributes imperatively
 * without re-renders when props change
 */
function VeraRoomWrapper({ sessionIdentifier, entryPoint, language }: VeraRoomProps) {
  const ref = useRef<HTMLElement>(null);

  // update the html attributes without re-rendering to emulate a vanilla JS environment.
  useUpdateHTMLAttribute('session-identifier', sessionIdentifier, ref);
  useUpdateHTMLAttribute('entry-point', entryPoint, ref);
  useUpdateHTMLAttribute('language', language, ref);

  return (
    <StableVeraRoom
      sessionIdentifier={sessionIdentifier}
      entryPoint={entryPoint}
      language={language}
      ref={ref}
    />
  );
}

export const Default: Story = {
  args: {
    sessionIdentifier: 'test-123',
    entryPoint: 'storybook',
    language: 'en',
  },
  render: VeraRoomWrapper,
};

export const SpanishLanguage: Story = {
  args: {
    sessionIdentifier: 'test-spanish-session',
    entryPoint: 'storybook',
    language: 'es',
  },
  render: VeraRoomWrapper,
};

export const CustomSession: Story = {
  args: {
    sessionIdentifier: 'custom-demo-session',
    entryPoint: 'demo',
    language: 'en',
  },
  render: VeraRoomWrapper,
};

function useUpdateHTMLAttribute(
  key: BridgeAttribute,
  value: string,
  customHtmlRef: React.RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!customHtmlRef.current) return;

    customHtmlRef.current.setAttribute(key, value);
  }, [key, value, customHtmlRef]);
}

export default meta;
