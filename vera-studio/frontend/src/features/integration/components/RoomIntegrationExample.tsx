import { CodeDisplay, Separator } from '../../../components';
import { frontendIntegrationContent } from '../constants';

const usageSnippet = `<vera-room
  session-identifier="<session-key>"
  entry-point="http://my-awesome-api/vonage-video-handler"
/>`;

const RoomIntegrationExample = () => {
  const { content } = frontendIntegrationContent.middlePanel.room;

  return (
    <>
      <label className="block text-xs font-semibold text-slate-700">{content.title}</label>

      <p className="text-xs text-slate-600 leading-relaxed">{content.description}</p>

      <Separator />

      <CodeDisplay code={usageSnippet} language="html" />
    </>
  );
};

export default RoomIntegrationExample;
