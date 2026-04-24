import { BrowserRouter, Route, Routes, FutureConfig, Outlet, Navigate } from 'react-router-dom';

import {
  StudioLeftNavigation,
  StudioTopNavigation,
  Separator,
  StudioHeader,
  IntegrationsMenu,
} from './components';

import { useVeraStudio } from './hooks';
import { DesignPage } from './features';
import { paths } from './features/integration/constants';

// TODO: Encapsulate this inside the IntegrationPage
import {
  AdvancesIntegrationExamples,
  CreateHandlerExample,
  ExampleSelector,
  ExpressIntegrationExamples,
  RoomIntegrationExample,
  ClientIntegrationExample,
} from './features/integration/components';
import { integrationExamples$ } from './features/integration/stores';

const futureConfig: Partial<FutureConfig> = {
  /**
   * Enable relative splat paths to ensure that dynamic imports in the app work correctly regardless of the base path.
   */
  v7_relativeSplatPath: true,
  v7_startTransition: true,
};

const backendPaths = paths.integration.backend;
const frontendPaths = paths.integration.frontend;

export default function App() {
  const [tokens] = useVeraStudio((state) => state.tokens);
  const [isLoading] = useVeraStudio((state) => state.isLoading);
  const [loadError] = useVeraStudio((state) => state.loadError);
  const [saveError] = useVeraStudio((state) => state.saveError);

  return (
    <div className="App h-screen flex flex-col font-sans gap-4 sm:gap-0">
      <BrowserRouter future={futureConfig}>
        <Routes>
          <Route
            element={
              <>
                <StudioHeader />
                <StudioTopNavigation />

                {(isLoading || !tokens) && (
                  <div className="p-5 font-sans">
                    <h1 className="text-xl font-bold">Vera Studio</h1>
                    <p className="mt-2 text-sm text-slate-500">Loading design tokens...</p>
                  </div>
                )}

                {(loadError ?? saveError) && (
                  <div className="px-4 py-2 text-red-900 bg-red-50 border-b border-red-200 text-sm">
                    {loadError ?? saveError}
                  </div>
                )}

                <main
                  className="md:grid min-h-0 flex-1"
                  style={{
                    gridTemplateColumns: '3.5rem 1fr',
                  }}
                >
                  <StudioLeftNavigation />

                  <div
                    className="flex flex-col md:grid min-h-0 flex-1  gap-4"
                    style={{
                      gridTemplateColumns: 'auto auto minmax(50%, 1fr)',
                    }}
                  >
                    <Outlet />
                  </div>
                </main>
              </>
            }
          >
            <Route index path={paths.design.root} element={<DesignPage />} />

            <Route
              path={paths.integration.root}
              element={
                <>
                  <div className="min-h-0 flex flex-col gap-4 p-3">
                    <IntegrationsMenu />
                  </div>

                  <Separator orientation="vertical" />

                  <div className="min-h-0">
                    <div className="h-full flex flex-col md:flex-row gap-4">
                      <aside className="md:w-64 shrink-0">
                        <ExampleSelector />
                      </aside>

                      <Separator orientation="vertical" className="h-full" />

                      <div className="flex-1 min-w-0 overflow-auto p-4 flex flex-col gap-4 pb-32 md:pb-92">
                        <Outlet />
                      </div>
                    </div>

                    <Outlet />
                  </div>
                </>
              }
            >
              <Route index element={<Navigate to={backendPaths.root} />} />

              <Route
                path={backendPaths.root}
                element={
                  <integrationExamples$.Provider>
                    <Outlet />
                  </integrationExamples$.Provider>
                }
              >
                <Route index element={<Navigate to={backendPaths.createHandler.root} />} />

                <Route path={backendPaths.createHandler.root} element={<CreateHandlerExample />} />

                <Route
                  path={backendPaths.expressIntegration.root}
                  element={<ExpressIntegrationExamples />}
                />

                <Route
                  path={backendPaths.advancedUseCases.root}
                  element={<AdvancesIntegrationExamples />}
                />

                <Route path="*" element={<Navigate to={backendPaths.createHandler.root} />} />
              </Route>

              <Route path={frontendPaths.root}>
                <Route index element={<Navigate to={frontendPaths.room.root} />} />

                <Route path={frontendPaths.room.root} element={<RoomIntegrationExample />} />

                <Route path={frontendPaths.client.root} element={<ClientIntegrationExample />} />

                <Route path="*" element={<Navigate to={frontendPaths.room.root} />} />
              </Route>

              <Route path="*" element={<Navigate to={backendPaths.root} />} />
            </Route>

            <Route path="*" element={<Navigate to={paths.design.root} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}
