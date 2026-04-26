import { useNavigate } from 'react-router-dom';
import { Button, Separator } from '../../../../components';
import { buildContent, paths } from '../../../integration/constants';

const { content } = buildContent.middlePanel.customizeRoom;

const CustomizeRoomPage = () => {
  const navigate = useNavigate();

  const handleCustomizeClick = () => {
    navigate(paths.design.root, {
      state: { returnTo: paths.integration.build.buildRoom.root },
    });
  };

  const handleContinueClick = () => {
    navigate(paths.integration.build.buildRoom.root);
  };

  return (
    <>
      <label className="block text-xs font-semibold text-slate-700">{content.title}</label>

      <p className="text-xs text-slate-600 leading-relaxed">{content.description}</p>

      <Separator />

      <div className="border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center min-h-48 text-xs text-slate-400 select-none">
        here goes preview
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={handleCustomizeClick}>
          Customize
        </Button>

        <Button onClick={handleContinueClick}>Continue</Button>
      </div>
    </>
  );
};

export default CustomizeRoomPage;
