import integrationExamples$ from '../stores/integrationExamples$';
import { CodeDisplay, Separator } from '../../../components';
import { generateExpressAppSnippet } from '../helpers/generateSnippets';
import { backendIntegrationContent } from '../constants';

export const ExpressIntegrationExamples = () => {
  const selectedAuthType = integrationExamples$.use.select((state) => state.selectedAuthType);
  const codeSnippet = generateExpressAppSnippet(selectedAuthType);

  return (
    <>
      <label className="block text-xs font-semibold text-slate-700">
        {backendIntegrationContent.middlePanel.expressIntegration.content.title}
      </label>

      <p className="text-xs text-slate-600 leading-relaxed">
        {backendIntegrationContent.middlePanel.expressIntegration.content.description}
      </p>

      <Separator />

      <CodeDisplay code={codeSnippet} language="typescript" />
    </>
  );
};

export default ExpressIntegrationExamples;
