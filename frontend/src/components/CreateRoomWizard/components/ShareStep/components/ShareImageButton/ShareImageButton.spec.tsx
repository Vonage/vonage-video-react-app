import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import ShareImageButton from './index';

it('downloads the QR code image when the browser cannot share files', async () => {
  expect.assertions(3);
  const canvasContext = { fillRect: vi.fn(), fillText: vi.fn() };
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    canvasContext as unknown as CanvasRenderingContext2D
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) =>
    callback(new Blob(['png'], { type: 'image/png' }))
  );
  vi.stubGlobal(
    'URL',
    class extends URL {
      static override createObjectURL = vi.fn(() => 'blob:qr-code');

      static override revokeObjectURL = vi.fn();
    }
  );
  const downloadedFileNames: string[] = [];
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement
  ) {
    downloadedFileNames.push(this.download);
  });

  render(<ShareImageButton meetingLink="https://example.com/waiting-room/session-key" />);
  await userEvent.click(screen.getByRole('button', { name: 'Share as image' }));

  expect(downloadedFileNames).toEqual(['meeting-qr-code.png']);
  expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(File));
  expect(canvasContext.fillText).toHaveBeenCalledWith(
    'Scan to join the meeting',
    expect.any(Number),
    expect.any(Number),
    expect.any(Number)
  );
});
