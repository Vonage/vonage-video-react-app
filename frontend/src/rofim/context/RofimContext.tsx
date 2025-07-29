import { PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initRofimSession } from '../utils/session';

const RofimInit = ({ children }: PropsWithChildren) => {
  const [isInit, setIsInit] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    try {
      initRofimSession();
    } catch (error) {
      console.error('Cannot load rofim session token', error);
      navigate('/error');
    } finally {
      setIsInit(true);
    }
  }, [navigate, setIsInit]);

  // To avoid blinking page when no token set
  // and accessing waiting-room page, which start camera
  return isInit ? children : null;
};

export default RofimInit;
