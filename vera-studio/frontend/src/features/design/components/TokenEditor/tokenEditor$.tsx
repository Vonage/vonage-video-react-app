import createContext from 'react-global-state-hooks/createContext';

const tokenEditor$ = createContext(
  {
    searchTerm: '',
  },
  {
    actions: {
      setSearchTerm(searchTerm: string) {
        return ({ setState }) => {
          setState((state) => ({
            ...state,
            searchTerm,
          }));
        };
      },
    },
  }
);

export default tokenEditor$;
