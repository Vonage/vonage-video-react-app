import React from 'react';
import { env } from '../../env';

const Example = () => {
  return (
    <div className="min-h-screen bg-vera-surface flex flex-col font-sans">
      <header className="bg-vera-surface px-8 py-4 border-b border-vera-border">
        <h1 className="text-vera-primary text-vera-heading-2">Vera Room</h1>
        <p className="text-vera-text-tertiary text-vera-body-base mt-1">
          Embeddable Video Conferencing Web Component
        </p>
      </header>

      <main className="flex-1 p-8 flex flex-col gap-8 bg-vera-background">
        <section className="bg-vera-surface rounded-lg p-6 border border-vera-border">
          <h2 className="text-vera-text-secondary text-vera-heading-4 mb-4">Live Example</h2>
          <p className="text-vera-text-tertiary text-vera-body-base mb-4">
            The component below is a fully functional video room embedded using the{' '}
            <code className="text-vera-primary">&lt;vera-room&gt;</code> custom element.
          </p>
          <div
            className="w-full rounded-lg overflow-hidden bg-vera-dark-background shadow-lg border border-vera-dark-grey"
            style={{ height: '600px' }}
          >
            <vera-room
              session-identifier="test-room-session"
              entry-point={`${env.API_URL}/v2`}
              language="en"
              className="h-full"
            />
          </div>
        </section>

        <section className="bg-vera-surface rounded-lg p-6 border border-vera-border">
          <h2 className="text-vera-text-secondary text-vera-heading-4 mb-4">Usage</h2>
          <p className="text-vera-text-tertiary text-vera-body-base mb-4">
            Add the script to your page and use the custom element:
          </p>
          <CodeBlock>
            <code>
              <span className="text-vera-text-tertiary">{`<!-- 1. Include the script -->`}</span>
              {'\n'}
              <span className="text-vera-primary">&lt;script</span>{' '}
              <span className="text-vera-warning">src</span>=
              <span className="text-vera-success">"room.js"</span>
              <span className="text-vera-primary">&gt;&lt;/script&gt;</span>
              {'\n\n'}
              <span className="text-vera-text-tertiary">{`<!-- 2. Use the component -->`}</span>
              {'\n'}
              <span className="text-vera-primary">&lt;vera-room&gt;&lt;/vera-room&gt;</span>
            </code>
          </CodeBlock>
        </section>

        <section className="bg-vera-surface rounded-lg p-6 border border-vera-border">
          <h2 className="text-vera-text-secondary text-vera-heading-4 mb-4">
            Styling the Container
          </h2>
          <p className="text-vera-text-tertiary text-vera-body-base mb-4">
            The component fills its container. Set dimensions on the parent or the element itself:
          </p>
          <CodeBlock>
            <code>
              <span className="text-vera-primary">&lt;style&gt;</span>
              {'\n'}
              {'  vera-room {\n'}
              {'    width: 100%;\n'}
              {'    height: 600px;\n'}
              {'  }\n'}
              <span className="text-vera-primary">&lt;/style&gt;</span>
              {'\n\n'}
              <span className="text-vera-primary">&lt;div</span>{' '}
              <span className="text-vera-warning">class</span>=
              <span className="text-vera-success">"video-container"</span>
              <span className="text-vera-primary">&gt;</span>
              {'\n'}
              {'  '}
              <span className="text-vera-primary">&lt;vera-room&gt;&lt;/vera-room&gt;</span>
              {'\n'}
              <span className="text-vera-primary">&lt;/div&gt;</span>
            </code>
          </CodeBlock>
        </section>
      </main>
    </div>
  );
};

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded bg-vera-background p-4 overflow-x-auto">
      <pre className="font-mono text-vera-body-base text-vera-text-secondary">{children}</pre>
    </div>
  );
}

export default Example;
