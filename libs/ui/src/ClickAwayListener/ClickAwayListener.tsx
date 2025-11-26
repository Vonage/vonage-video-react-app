import {
  ClickAwayListener as MUIClickAwayListener,
  ClickAwayListenerProps as MUIClickAwayListenerProps,
} from '@mui/material';

type ClickAwayListenerProps = MUIClickAwayListenerProps;

const ClickAwayListener = (clickAwayListenerProps: ClickAwayListenerProps) => {
  return <MUIClickAwayListener {...clickAwayListenerProps} />;
};

export default ClickAwayListener;
