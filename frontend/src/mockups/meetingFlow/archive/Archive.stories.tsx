import type { Meta, StoryObj } from '@storybook/react';
import mockupMeta, { type MockupArgs } from '../storybook/mockupMeta';
import LandingStackedCards from '../landing/LandingStackedCards';
import type { SavedMeetingId } from '../types/SavedMeetingId';
import ArchiveDrawer, { archiveSelection$ } from './ArchiveDrawer';
import ArchiveInlineTabs from './ArchiveInlineTabs';
import ManageMeetingsDialog, { manageMeetingsDialog$ } from './ManageMeetingsDialog';

const meta = {
  title: 'Mockups/Meeting flow/2. Archived and export',
  ...mockupMeta,
} satisfies Meta<MockupArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A: the landing meetings card gets Upcoming / Archived tabs; export and import sit in its footer.
 */
export const AInlineTabs: Story = {
  name: 'A · Tabs in the meetings card',
  render: () => <ArchiveInlineTabs />,
};

/**
 * B: a Manage meetings dialog with the Advanced settings sidebar layout, archived tab open.
 */
export const BManageDialogArchived: Story = {
  name: 'B · Manage dialog, archived tab',
  render: () => (
    <>
      <LandingStackedCards />
      <manageMeetingsDialog$.Provider>
        <ManageMeetingsDialog />
      </manageMeetingsDialog$.Provider>
    </>
  ),
};

/**
 * B: the same dialog on its Backup and restore tab.
 */
export const BManageDialogBackup: Story = {
  name: 'B · Manage dialog, backup tab',
  render: () => (
    <>
      <LandingStackedCards />
      <manageMeetingsDialog$.Provider value={(state) => ({ ...state, selectedTab: 'backup' })}>
        <ManageMeetingsDialog />
      </manageMeetingsDialog$.Provider>
    </>
  ),
};

/**
 * C: a side drawer with search and selection; export unlocks only after the warning is acknowledged.
 */
export const CDrawer: Story = {
  name: 'C · Drawer with selective export',
  render: () => (
    <>
      <LandingStackedCards />
      <archiveSelection$.Provider
        value={(state) => ({
          ...state,
          selectedIds: [
            'meeting:q3-planning' as SavedMeetingId,
            'meeting:frontend-interview' as SavedMeetingId,
          ],
        })}
      >
        <ArchiveDrawer />
      </archiveSelection$.Provider>
    </>
  ),
};
