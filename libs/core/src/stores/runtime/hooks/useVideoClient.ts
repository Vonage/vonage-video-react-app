import runtimeStore from '../runtimeStore';

const useVideoClient = () => {
  return runtimeStore.use.select(({ videoClient }) => {
    return videoClient;
  });
};

export default useVideoClient;
