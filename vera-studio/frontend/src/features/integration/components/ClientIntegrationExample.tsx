import { CodeDisplay, Separator } from '../../../components';
import { frontendIntegrationContent } from '../constants';

const { content } = frontendIntegrationContent.middlePanel.client;

const usageSnippet = `import { createVideoClient } from '@vonage/video-client';

const videoClient = createVideoClient({
  url: 'http://my-awesome-api/vonage-video-handler',
});`;

const usageSnippet2 = `/**
 * Returns Promise<Session>
*/
const { sessionKey } = await videoClient.createSession();

/**
 * Returns Promise<{ token: string }>
*/
const { token } = await videoClient.joinSession({ sessionKey });

/**
 * Returns Promise<{ captionsId: string }>
*/
const { captionsId } = await videoClient.enableCaptions({ sessionKey })
`;

const ClientIntegrationExample = () => {
  return (
    <>
      <label className="block text-xs font-semibold text-slate-700">{content.title}</label>

      <p className="text-xs text-slate-600 leading-relaxed">{content.description}</p>

      <Separator />

      <CodeDisplay code={usageSnippet} language="typescript" />

      <Separator />

      <label className="block text-xs font-semibold text-slate-700">{content.title2}</label>

      <p className="text-xs text-slate-600 leading-relaxed">{content.description2}</p>

      <CodeDisplay code={usageSnippet2} language="typescript" />
    </>
  );
};

export default ClientIntegrationExample;
