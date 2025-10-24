import { render as renderBase, RenderOptions, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AppConfigStore from '@Context/ConfigProvider/AppConfigStore';
import { ConfigProviderBase } from '@Context/ConfigProvider/ConfigProvider';
import { FC, PropsWithChildren, ReactElement } from 'react';
import ParticipantListButton from './ParticipantListButton';

describe('ParticipantListButton', () => {
  it('should show participant number', () => {
    render(<ParticipantListButton handleClick={() => {}} isOpen={false} participantCount={10} />);
    expect(screen.getByText('10')).toBeVisible();
  });
  it('should have a white icon when the list is closed', () => {
    render(<ParticipantListButton handleClick={() => {}} isOpen={false} participantCount={10} />);
    expect(screen.getByTestId('PeopleIcon')).toHaveStyle('color: rgb(255, 255, 255)');
  });
  it('should have a blue icon when the list is open', () => {
    render(<ParticipantListButton handleClick={() => {}} isOpen participantCount={10} />);
    expect(screen.getByTestId('PeopleIcon')).toHaveStyle('color: rgb(130, 177, 255)');
  });
  it('should invoke callback on click', () => {
    const handleClick = vi.fn();
    render(<ParticipantListButton handleClick={handleClick} isOpen participantCount={10} />);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalled();
  });
  it('is not rendered when showParticipantList is false', () => {
    const configStore = new AppConfigStore({
      meetingRoomSettings: {
        showParticipantList: false,
      },
    });
    render(<ParticipantListButton handleClick={() => {}} isOpen={false} participantCount={10} />, {
      wrapper: makeProvidersWrapper({ configStore }),
    });
    expect(screen.queryByTestId('participant-list-button')).not.toBeInTheDocument();
  });
});

function render(ui: ReactElement, options?: RenderOptions) {
  const Wrapper = options?.wrapper ?? makeProvidersWrapper();
  return renderBase(ui, { ...options, wrapper: Wrapper });
}

function makeProvidersWrapper(providers?: { configStore?: AppConfigStore }) {
  const configStore =
    providers?.configStore ??
    new AppConfigStore({
      meetingRoomSettings: {
        showParticipantList: true,
      },
    });

  const Wrapper: FC<PropsWithChildren> = ({ children }) => (
    <ConfigProviderBase value={configStore}>{children}</ConfigProviderBase>
  );

  return Wrapper;
}
