import integrationExamples$ from '../../stores/integrationExamples$';
import { Button, CodeDisplay, Separator } from '../../../../components';
import { generateHandlerConfigSnippet } from '../../helpers/generateSnippets';
import { backendIntegrationContent } from '../../constants';

export const CreateHandlerExample = () => {
  const selectedAuthType = integrationExamples$.use.select((state) => state.selectedAuthType);
  const { selectAuthType } = integrationExamples$.use.actions();

  const codeSnippet = `import { createVideoHandler } from '@vonage/video-api';

${generateHandlerConfigSnippet(selectedAuthType)}`;

  return (
    <>
      <label className="block text-xs font-semibold text-slate-700">
        {backendIntegrationContent.middlePanel.createHandler.content.title}
      </label>

      <p className="text-xs text-slate-600 leading-relaxed">
        {backendIntegrationContent.middlePanel.createHandler.content.description}
      </p>

      <Separator />

      <div className="flex gap-4">
        {(['jwt', 'apiKey', 'signature'] as const).map((authType) => {
          const handleSelectAuth = () => {
            selectAuthType(authType);
          };

          return (
            <Button
              key={authType}
              onClick={handleSelectAuth}
              variant={selectedAuthType === authType ? 'primary' : 'secondary'}
            >
              {authType === 'jwt' && 'JWT'}
              {authType === 'apiKey' && 'API Key'}
              {authType === 'signature' && 'Signature'}
            </Button>
          );
        })}
      </div>

      <CodeDisplay code={codeSnippet} language="typescript" />
    </>
  );
};

export default CreateHandlerExample;
