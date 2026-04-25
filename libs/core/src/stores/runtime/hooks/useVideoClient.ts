import runtimeStore from '../runtimeStore';

const useVideoClient = runtimeStore.use.createSelectorHook(({ videoClient }) => videoClient);

export default useVideoClient;
