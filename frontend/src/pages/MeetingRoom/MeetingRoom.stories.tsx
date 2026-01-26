import type { Meta, StoryObj } from '@storybook/react';
import MeetingRoomSkeleton from './MeetingRoom.skeleton';
import { ThemeProvider } from '@ui/theme';

const meta: Meta<typeof MeetingRoomSkeleton> = {
  title: 'Pages/MeetingRoom',
  component: MeetingRoomSkeleton,
  decorators: [
    (Story: React.FC) => (
      <ThemeProvider>
        <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof MeetingRoomSkeleton>;

/**
 * MeetingRoom Skeleton Component
 *
 * Loading state shown while the meeting room is initializing.
 * This is a sub-component of MeetingRoom that displays:
 * - VideoTileCanvas placeholder with loading spinner
 * - Toolbar skeleton with button placeholders
 * - SmallViewportHeader (on mobile)
 */
export const Skeleton: Story = {
  render: () => <MeetingRoomSkeleton />,
};

/**
 * MeetingRoom Skeleton with custom styling
 *
 * Demonstrates how to customize the skeleton appearance using the sx prop
 */
export const SkeletonWithCustomSx: Story = {
  render: () => <MeetingRoomSkeleton />,
};

/**
 * MeetingRoom Skeleton on small viewport
 *
 * Shows the skeleton on mobile devices with SmallViewportHeader visible
 */
export const SkeletonOnMobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => <MeetingRoomSkeleton />,
};
