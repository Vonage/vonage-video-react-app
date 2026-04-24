import classNames from 'classnames';
import integrationExamples$ from '../stores/integrationExamples$';
import { CodeDisplay, Separator } from '../../../components';
import { generateHandlerConfigSnippet } from '../helpers/generateSnippets';
import { backendIntegrationContent } from '../constants';

export const CreateHandlerExample = () => {
  const selectedAuthType = integrationExamples$.use.select((state) => state.selectedAuthType);
  const { selectAuthType } = integrationExamples$.use.actions();

  const codeSnippet = generateHandlerConfigSnippet(selectedAuthType);

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
            <button
              key={authType}
              onClick={handleSelectAuth}
              className={classNames(
                'px-3 py-1.5 rounded text-xs font-medium transition-colors',
                selectedAuthType === authType
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              )}
            >
              {authType === 'jwt' && 'JWT'}
              {authType === 'apiKey' && 'API Key'}
              {authType === 'signature' && 'Signature'}
            </button>
          );
        })}
      </div>

      <CodeDisplay code={codeSnippet} language="typescript" />
    </>
  );
};

export default CreateHandlerExample;
