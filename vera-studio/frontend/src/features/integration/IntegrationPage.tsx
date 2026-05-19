import { Outlet } from 'react-router-dom';
import { Separator } from '../../components';
import ExampleSelector from './components/ExampleSelector';
import integrationExamples$ from './stores/integrationExamples$';

export const IntegrationPage = () => {
  return (
    <integrationExamples$.Provider>
      <div className="h-full flex flex-col md:flex-row gap-4">
        <aside className="md:w-64 shrink-0">
          <ExampleSelector />
        </aside>

        <Separator orientation="vertical" className="h-full" />

        <div className="flex-1 min-w-0 overflow-auto p-4 flex flex-col gap-4 pb-32 md:pb-92">
          <Outlet />
        </div>
      </div>
    </integrationExamples$.Provider>
  );
};

export default IntegrationPage;
