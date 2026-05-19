import { useNavigate } from 'react-router-dom';
import { Button, Separator } from '../../../components';
import { integrationContent, paths } from '../constants';

const IntegrationLandingPage = () => {
  const navigate = useNavigate();
  const createHandlerPath = paths.integration.backend.createHandler.root;

  const handleStartClick = () => {
    navigate(createHandlerPath);
  };

  return (
    <>
      <label className="block text-xs font-semibold text-slate-700">
        {integrationContent.title}
      </label>

      <p className="text-xs text-slate-600 leading-relaxed">{integrationContent.description}</p>

      <Separator />

      <Button onClick={handleStartClick}>{integrationContent.button}</Button>
    </>
  );
};

export default IntegrationLandingPage;
