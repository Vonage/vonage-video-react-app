import integrationExamples$ from '../stores/integrationExamples$';
import { CodeDisplay } from '../../../components';
import {
  generateExpressAppWithMiddlewareSnippet,
  generateBuiltInMiddlewareSnippet,
} from '../helpers/generateSnippets';
import { Separator } from '../../../components';
import { backendIntegrationContent } from '../constants';

export const AdvancesIntegrationExamples = () => {
  const selectedAuthType = integrationExamples$.use.select((state) => state.selectedAuthType);

  const middlewareSnippet = generateExpressAppWithMiddlewareSnippet(selectedAuthType);
  const advancedUseCasesSnippet = generateBuiltInMiddlewareSnippet(selectedAuthType);

  return (
    <>
      <label className="block text-xs font-semibold text-slate-700">
        {backendIntegrationContent.middlePanel.advancedUsage.content.title}
      </label>

      <p className="text-xs text-slate-600 leading-relaxed">
        {backendIntegrationContent.middlePanel.advancedUsage.content.description}
      </p>

      <Separator />

      <label className="block text-xs font-semibold text-slate-700">
        {backendIntegrationContent.middlePanel.advancedUsage.content.examples1.title}
      </label>

      <CodeDisplay code={middlewareSnippet} language="typescript" />

      <Separator />

      <label className="block text-xs font-semibold text-slate-700">
        {backendIntegrationContent.middlePanel.advancedUsage.content.examples2.title}
      </label>

      <CodeDisplay code={advancedUseCasesSnippet} language="typescript" />
    </>
  );
};

export default AdvancesIntegrationExamples;
