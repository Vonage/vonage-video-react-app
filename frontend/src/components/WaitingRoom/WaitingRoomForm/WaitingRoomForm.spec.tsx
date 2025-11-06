import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import WaitingRoomForm from './WaitingRoomForm';
import enTranslations from '../../../locales/en.json';
import useRoomName from '../../../hooks/useRoomName';
import useUserContext from '../../../hooks/useUserContext';
import useConfigContext from '../../../hooks/useConfigContext';
import { ConfigContextType } from '../../../Context/ConfigProvider';
import { UserContextType } from '../../../Context/user';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      const translations: Record<string, string> = {
        'waitingRoom.title': enTranslations['waitingRoom.title'],
        'waitingRoom.user.input.label': enTranslations['waitingRoom.user.input.label'],
        'waitingRoom.user.input.placeholder': enTranslations['waitingRoom.user.input.placeholder'],
        'button.join': enTranslations['button.join'],
        'waitingRoom.testNetwork': 'Test Network',
      };
      return translations[key] || fallback || key;
    },
  }),
}));

const mockRoomName = 'test-room';
vi.mock('../../../hooks/useRoomName');
vi.mock('../../../hooks/useUserContext');
vi.mock('../../../hooks/useConfigContext');

const mockSetUser = vi.fn();
const mockUseUserContext = useUserContext as Mock<[], UserContextType>;
const mockUseConfigContext = useConfigContext as Mock<[], ConfigContextType>;

vi.mock('../../../utils/isValidRoomName', () => ({
  default: vi.fn(() => true),
}));

vi.mock('../../../utils/storage', () => ({
  setStorageItem: vi.fn(),
  STORAGE_KEYS: {
    USERNAME: 'username',
  },
}));

const renderWaitingRoomForm = (props = {}) => {
  const defaultProps = {
    username: '',
    setUsername: vi.fn(),
    onOpenPreCallTest: vi.fn(),
    ...props,
  };

  return render(
    <BrowserRouter>
      <WaitingRoomForm {...defaultProps} />
    </BrowserRouter>
  );
};

describe('WaitingRoomForm', () => {
  const placeholderText = enTranslations['waitingRoom.user.input.placeholder'];

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    (useRoomName as Mock).mockReturnValue(mockRoomName);

    mockUseUserContext.mockReturnValue({
      setUser: mockSetUser,
      user: {
        defaultSettings: {
          name: '',
          publishAudio: true,
          publishVideo: true,
          noiseSuppression: false,
          publishCaptions: false,
        },
        issues: {
          reconnections: 0,
          audioFallbacks: 0,
        },
      },
    } as unknown as UserContextType);

    mockUseConfigContext.mockReturnValue({
      waitingRoomSettings: {
        allowTestNetwork: true,
      },
    } as Partial<ConfigContextType> as ConfigContextType);
  });

  it('renders the form layout correctly', () => {
    renderWaitingRoomForm();

    expect(screen.getByText(enTranslations['waitingRoom.title'])).toBeInTheDocument();
    expect(screen.getByText(mockRoomName)).toBeInTheDocument();
    expect(screen.getByText(enTranslations['waitingRoom.user.input.label'])).toBeInTheDocument();
    expect(screen.getByPlaceholderText(placeholderText)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: enTranslations['button.join'] })).toBeInTheDocument();
  });

  it('displays room name correctly', () => {
    renderWaitingRoomForm();

    expect(screen.getByText(mockRoomName)).toBeInTheDocument();
  });

  it('shows test network button when allowTestNetwork is true', () => {
    const mockOnOpenPreCallTest = vi.fn();
    renderWaitingRoomForm({ onOpenPreCallTest: mockOnOpenPreCallTest });

    expect(screen.getByText('Test Network')).toBeInTheDocument();
  });

  it('hides test network button when allowTestNetwork is false', () => {
    mockUseConfigContext.mockReturnValue({
      waitingRoomSettings: {
        allowTestNetwork: false,
      },
    } as Partial<ConfigContextType> as ConfigContextType);

    renderWaitingRoomForm();

    expect(screen.queryByText('Test Network')).not.toBeInTheDocument();
  });

  it('calls onOpenPreCallTest when test network button is clicked', () => {
    const mockOnOpenPreCallTest = vi.fn();
    renderWaitingRoomForm({ onOpenPreCallTest: mockOnOpenPreCallTest });

    const testNetworkButton = screen.getByText('Test Network');
    fireEvent.click(testNetworkButton);

    expect(mockOnOpenPreCallTest).toHaveBeenCalled();
  });

  it('updates username when input changes', () => {
    const mockSetUsername = vi.fn();
    renderWaitingRoomForm({ setUsername: mockSetUsername });

    const nameInput = screen.getByPlaceholderText(placeholderText);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    expect(mockSetUsername).toHaveBeenCalledWith('John Doe');
  });

  it('disables join button when username is empty', () => {
    renderWaitingRoomForm({ username: '' });

    const joinButton = screen.getByRole('button', { name: enTranslations['button.join'] });
    expect(joinButton).toBeDisabled();
  });

  it('enables join button when username is provided', () => {
    renderWaitingRoomForm({ username: 'John Doe' });

    const joinButton = screen.getByRole('button', { name: enTranslations['button.join'] });
    expect(joinButton).not.toBeDisabled();
  });

  it('shows error state when trying to join with empty username', async () => {
    renderWaitingRoomForm({ username: '' });

    const joinButton = screen.getByRole('button', { name: enTranslations['button.join'] });
    fireEvent.click(joinButton);

    expect(joinButton).toBeDisabled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to room when form is submitted with valid data', async () => {
    const username = 'John Doe';
    renderWaitingRoomForm({ username });

    const joinButton = screen.getByRole('button', { name: enTranslations['button.join'] });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith(expect.any(Function));
      expect(mockNavigate).toHaveBeenCalledWith(`/room/${mockRoomName}`, {
        state: {
          hasAccess: true,
        },
      });
    });
  });

  it('updates user context when joining', async () => {
    const username = 'John Doe';
    renderWaitingRoomForm({ username });

    const joinButton = screen.getByRole('button', { name: enTranslations['button.join'] });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalled();

      const setUserCallback = mockSetUser.mock.calls[0][0];
      const mockPrevUser = {
        defaultSettings: { name: 'Old Name' },
      };

      const result = setUserCallback(mockPrevUser);
      expect(result).toEqual({
        defaultSettings: { name: username },
      });
    });
  });

  it('enforces maximum length on username input', () => {
    const mockSetUsername = vi.fn();
    renderWaitingRoomForm({ setUsername: mockSetUsername });

    const nameInput = screen.getByPlaceholderText(placeholderText);

    expect(nameInput).toHaveAttribute('maxLength', '60');
  });

  it('displays username value in input field', () => {
    const username = 'Test User';
    renderWaitingRoomForm({ username });

    const nameInput = screen.getByPlaceholderText(placeholderText) as HTMLInputElement;
    expect(nameInput.value).toBe(username);
  });

  it('prevents form submission on invalid room name', async () => {
    const { default: isValidRoomName } = await import('../../../utils/isValidRoomName');
    vi.mocked(isValidRoomName).mockReturnValue(false);

    const username = 'John Doe';
    renderWaitingRoomForm({ username });

    const joinButton = screen.getByRole('button', { name: enTranslations['button.join'] });
    fireEvent.click(joinButton);

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
