import classNames from 'classnames';
import type { ComponentProps, FC } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { ThemeProvider } from '@ui/theme';
import WaitingRoomSkeleton from '@pages/WaitingRoom/WaitingRoom.skeleton';

type VeraRoomProps = ComponentProps<'div'> & {};

const VeraRoom: FC<VeraRoomProps> = ({ className, ...props }) => {
  return (
    <ThemeProvider>
      <MemoryRouter>
        <WaitingRoomSkeleton className={twMerge(classNames('VeraRoom', className))} {...props} />
      </MemoryRouter>
    </ThemeProvider>
  );
};

export default VeraRoom;
