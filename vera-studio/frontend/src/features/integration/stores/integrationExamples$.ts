import createContext from 'react-global-state-hooks/createContext';

export type AuthType = 'jwt' | 'apiKey' | 'signature';

export type IntegrationExamplesContextType = {
  selectedAuthType: AuthType;
};

const integrationExamples$ = createContext(
  () => ({
    selectedAuthType: 'jwt' as AuthType,
  }),
  {
    actions: {
      selectAuthType(authType: AuthType) {
        return ({ setState }) => {
          setState((state) => ({ ...state, selectedAuthType: authType }));
        };
      },
    },
  }
);

export default integrationExamples$;
