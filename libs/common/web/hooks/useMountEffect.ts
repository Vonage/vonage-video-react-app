import { useEffect, useEffectEvent } from 'react';

type CleanupFunction = () => void;

const useMountEffect = (effect: () => CleanupFunction | void) => {
  const handler = useEffectEvent(effect);

  useEffect(() => {
    return handler();
  }, []);
};

export default useMountEffect;
