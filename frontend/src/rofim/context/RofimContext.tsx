import { PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initRofimSession } from '../utils/session';

export const RofimInit = ({ children }: PropsWithChildren) => {
  const [isInit, setIsInit] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    try {
      initRofimSession();
    } catch (error) {
      navigate('/error');
    } finally {
      setIsInit(true);
    }
  }, [initRofimSession, navigate, setIsInit]);

  // To avoid blinking page when no token set
  // and accessing waiting-room page, which start camera
  return <>{isInit ? children : null}</>;
};
