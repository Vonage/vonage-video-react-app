import runtimeStore from '../runtimeStore';

const useLanguage = runtimeStore.use.createSelectorHook(({ language }) => language);

export default useLanguage;
