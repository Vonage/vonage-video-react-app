import React, { ComponentProps, PropsWithChildren } from 'react';
import useIsSmallViewport from '@hooks/useIsSmallViewport';
import SmallViewportHeader from '@components/MeetingRoom/SmallViewportHeader';
import classNames from 'classnames';
import { CircularProgress } from '@mui/material';

type MeetingRoomSkeletonProps = ComponentProps<'div'>;

const MeetingRoomSkeleton: React.FC<MeetingRoomSkeletonProps> = ({ className, ...props }) => {
  const isSmallViewport = useIsSmallViewport();

  return (
    <div
      data-testid="meetingRoom"
      className={classNames(
        'bg-darkGray-100 h-screen !pointer-events-none flex flex-col',
        className
      )}
      {...props}
    >
      {isSmallViewport && <SmallViewportHeader />}

      <div className="flex-1 flex justify-center items-center animate-fade-in">
        <CircularProgress data-testid="progress-spinner" />
      </div>

      <div className="animate-fade-in h-[80px] flex flex-row gap-3 justify-center items-center bg-darkGray-100 p-4">
        <ButtonGroupSkeleton>
          <ToolBarButtonSkeleton className="!bg-transparent" />

          <ToolBarButtonSkeleton className="!bg-transparent" />
        </ButtonGroupSkeleton>

        <ButtonGroupSkeleton>
          <ToolBarButtonSkeleton className="!bg-transparent" />

          <ToolBarButtonSkeleton className="!bg-transparent" />
        </ButtonGroupSkeleton>

        {new Array(3).fill(null).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <ToolBarButtonSkeleton key={index} />
        ))}

        <ToolBarButtonSkeleton className="!bg-red-500" />
      </div>
    </div>
  );
};

function ToolBarButtonSkeleton({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      className={classNames(
        'MuiButtonBase-root MuiIconButton-root MuiIconButton-edgeStart MuiIconButton-sizeSmall css-e2k2wo-MuiButtonBase-root-MuiIconButton-root',
        '[height:48px] [width:48px] bg-notVeryGray-55 rounded-full',
        className
      )}
      tabIndex={-1}
      type="button"
      {...props}
    />
  );
}

function ButtonGroupSkeleton({
  children,
  className,
  ...props
}: PropsWithChildren<ComponentProps<'div'>>) {
  return (
    <div
      className={classNames(
        'MuiButtonGroup-root MuiButtonGroup-contained MuiButtonGroup-disableElevation bg-notVeryGray-55 css-hp7uwt-MuiButtonGroup-root',
        'rounded-full flex flex-row gap-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default MeetingRoomSkeleton;
