import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi, expect, Mock } from 'vitest';
import ReportIssue from './ReportIssue';
// Import the mocked function so we can override it in tests
import reportIssue from '../../../api/reportFeedback';

// Mock
vi.mock('../../../hooks/useCollectBrowserInformation', () => ({
  default: () => ({ browser: 'TestBrowser' }),
}));
vi.mock('../../../api/reportFeedback', () => ({
  default: vi.fn(), // Just a jest.fn placeholder, will override later
}));

const mockHandleClose = vi.fn();

describe('ReportIssue component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<ReportIssue isOpen={false} handleClose={mockHandleClose} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders form and submits data successfully', async () => {
    // Override mock to resolve successfully
    (reportIssue as Mock).mockResolvedValue({
      data: {
        feedbackData: {
          message: 'It worked!',
          ticketUrl: 'https://success.url',
        },
      },
    });

    render(<ReportIssue isOpen handleClose={mockHandleClose} />);

    const input = screen.getByLabelText(/add screenshot/i); // File input
    // Create a mock image file
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
    // Simulate file upload
    fireEvent.change(input, { target: { files: [file] } });

    fireEvent.change(screen.getByTestId('title-input').querySelector('input')!, {
      target: { value: 'Trying to submit a form' },
    });
    fireEvent.change(screen.getByTestId('name-input').querySelector('input')!, {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByTestId('issue-input').querySelector('textarea')!, {
      target: { value: 'App crashed after clicking submit' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Send/i }));

    const successMessage = await screen.findByText('Thank you for your feedback!');
    expect(successMessage).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('close-button-form-submitted'));
  });

  it('displays error message when submission fails', async () => {
    // Override mock to reject (simulate failure)
    (reportIssue as Mock).mockRejectedValue(new Error('Network error'));

    render(<ReportIssue isOpen handleClose={mockHandleClose} />);

    fireEvent.change(screen.getByTestId('title-input').querySelector('input')!, {
      target: { value: 'Trying to submit a form' },
    });
    fireEvent.change(screen.getByTestId('name-input').querySelector('input')!, {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByTestId('issue-input').querySelector('textarea')!, {
      target: { value: 'App crashed after clicking submit' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Send/i }));

    const successMessage = await screen.findAllByTestId('error-text');
    expect(successMessage[0]).toBeInTheDocument();
  });
});
