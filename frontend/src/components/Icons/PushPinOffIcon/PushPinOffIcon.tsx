import { SvgIcon, SvgIconProps } from '@mui/material';
import { ReactElement } from 'react';

/**
 * PushPinOffIcon Component
 *
 * This component renders a custom SVG icon representing a Push pin with a diagonal line across it.
 * This follows the MUI 'Off' icon visual and naming convention.
 * @param {SvgIconProps} props - the props to customize the SVG icon.
 * @returns {ReactElement} - the blur icon.
 */
const PushPinOffIcon = (props: SvgIconProps): ReactElement => {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24" data-testid="PushPinOffIcon" width="24" height="24">
      <path
        fillRule="evenodd"
        d="M 7.939 5.157 L 8 9 C 8 10.66 6.66 12 5 12 L 5 14 L 10.97 14 L 10.97 21 L 11.97 22 L 12.97 21 L 12.97 14 L 16.584 13.774"
      />
      <path d="M 17.761 14.869 L 13.131 10.239 L 13.021 10.129 L 3.084 0.289 L 1.814 1.559 L 21.751 21.51 L 23.021 20.24 L 17.761 14.869 Z" />
      <path
        fillRule="evenodd"
        d="M 15.994 8.999 L 15.994 3.999 L 16.994 3.999 C 17.544 3.999 17.994 3.549 17.994 2.999 C 17.994 2.449 17.544 1.999 16.994 1.999 L 7.362 1.939 C 6.812 1.939 19.362 13.939 19.362 13.939 L 18.994 11.999 C 17.334 11.999 15.994 10.659 15.994 8.999"
      />
    </SvgIcon>
  );
};

export default PushPinOffIcon;
