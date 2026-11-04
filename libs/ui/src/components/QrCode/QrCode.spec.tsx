import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { encode } from 'uqr';
import QrCode from '.';

it('renders the value as a labelled square grid of QR modules', () => {
  const value = 'https://example.com/waiting-room/session-key';
  const { size, data } = encode(value, { border: 2 });
  const darkModuleCount = data.flat().filter(Boolean).length;

  render(<QrCode value={value} aria-label="Meeting QR code" className="w-28" />);

  const qrCode = screen.getByRole('img', { name: 'Meeting QR code' });
  expect(qrCode).toHaveAttribute('viewBox', `0 0 ${size} ${size}`);
  expect(qrCode).toHaveClass('w-28');
  expect(qrCode.querySelector('path')?.getAttribute('d')?.match(/M/g)).toHaveLength(
    darkModuleCount
  );
});
