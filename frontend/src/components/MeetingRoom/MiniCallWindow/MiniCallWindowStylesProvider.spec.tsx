import { render } from '@testing-library/react';
import { createPortal } from 'react-dom';
import { describe, expect, it } from 'vitest';
import IconButton from '@mui/material/IconButton';
import MiniCallWindowStylesProvider from './MiniCallWindowStylesProvider';

describe('MiniCallWindowStylesProvider', () => {
  it('injects MUI styles into the target document instead of the opener', () => {
    const pictureInPictureDocument = document.implementation.createHTMLDocument('');
    const openerStyleCount = document.head.querySelectorAll(
      'style[data-emotion^="mini-mode"]'
    ).length;

    render(
      createPortal(
        <MiniCallWindowStylesProvider targetDocument={pictureInPictureDocument}>
          <IconButton aria-label="mute">x</IconButton>
        </MiniCallWindowStylesProvider>,
        pictureInPictureDocument.body
      )
    );

    const injectedStyles = pictureInPictureDocument.head.querySelectorAll(
      'style[data-emotion^="mini-mode"]'
    );
    expect(injectedStyles.length).toBeGreaterThan(0);
    expect(document.head.querySelectorAll('style[data-emotion^="mini-mode"]')).toHaveLength(
      openerStyleCount
    );
  });
});
