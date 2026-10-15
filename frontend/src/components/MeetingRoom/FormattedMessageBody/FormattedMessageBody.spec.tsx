import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FormattedMessageBody from './FormattedMessageBody';

describe('FormattedMessageBody', () => {
  it('if there are no links, returns unmodified text', () => {
    const message = 'Truly, famous last words on this PR being easy.';

    render(<FormattedMessageBody message={message} />);

    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('renders duplicate links without colliding React keys', () => {
    const message = 'https://example.com https://example.com';

    render(<FormattedMessageBody message={message} />);

    expect(screen.getAllByRole('link', { name: 'example.com' })).toHaveLength(2);
  });

  describe('when messages contain URLs, correctly renders', () => {
    it('messages with a single link', () => {
      const message = 'https://developer.vonage.com/en/video/client-sdks/web/overview';

      render(<FormattedMessageBody message={message} />);

      const linkElement = screen.getByRole('link', {
        name: 'developer.vonage.com/en/video/client-sdks/web/overview',
      });
      expect(linkElement).toBeInTheDocument();
    });

    it('messages with a link before some text', () => {
      const message =
        'https://developer.vonage.com/en/video/client-sdks/web/overview and some text';

      render(<FormattedMessageBody message={message} />);

      const nonLinkedElement = screen.getByText('and some text');
      const isNonLinkedElementAHyperlink = nonLinkedElement.closest('a');
      expect(isNonLinkedElementAHyperlink).toBeFalsy();

      const linkElement = screen.getByRole('link', {
        name: 'developer.vonage.com/en/video/client-sdks/web/overview',
      });
      expect(linkElement).toBeInTheDocument();
    });

    it('messages with a single link after text', () => {
      const message = 'Before link https://developer.vonage.com/en/video/client-sdks/web/overview';

      render(<FormattedMessageBody message={message} />);

      const nonLinkedElement = screen.getByText('Before link');
      const isNonLinkedElementAHyperlink = nonLinkedElement.closest('a');
      expect(isNonLinkedElementAHyperlink).toBeFalsy();

      const linkElement = screen.getByRole('link', {
        name: 'developer.vonage.com/en/video/client-sdks/web/overview',
      });
      expect(linkElement).toBeInTheDocument();
    });

    it('messages with a single link embedded in text', () => {
      const message =
        'Before link https://developer.vonage.com/en/video/client-sdks/web/overview and after link';

      render(<FormattedMessageBody message={message} />);

      const firstNonLinkedElement = screen.getByText('Before link');
      const isFirstNonLinkedElementAHyperlink = firstNonLinkedElement.closest('a');
      expect(isFirstNonLinkedElementAHyperlink).toBeFalsy();

      const secondNonLinkedElement = screen.getByText('and after link');
      const isSecondNonLinkedElementAHyperlink = secondNonLinkedElement.closest('a');
      expect(isSecondNonLinkedElementAHyperlink).toBeFalsy();

      const linkElement = screen.getByRole('link', {
        name: 'developer.vonage.com/en/video/client-sdks/web/overview',
      });
      expect(linkElement).toBeInTheDocument();
    });

    it('messages with two links embedded in text', () => {
      const message =
        'First one: https://developer.vonage.com/en/video/client-sdks/web/overview and then two: www.example.com finally, did I arrive at the optimized solution, proctor?';

      render(<FormattedMessageBody message={message} />);

      const firstNonLinkedElement = screen.getByText('First one:');
      const isFirstNonLinkedElementAHyperlink = firstNonLinkedElement.closest('a');
      expect(isFirstNonLinkedElementAHyperlink).toBeFalsy();

      const secondNonLinkedElement = screen.getByText('and then two:');
      const isSecondNonLinkedElementAHyperlink = secondNonLinkedElement.closest('a');
      expect(isSecondNonLinkedElementAHyperlink).toBeFalsy();

      const thirdNonLinkedElement = screen.getByText(
        'finally, did I arrive at the optimized solution, proctor?'
      );
      const isThirdNonLinkedElementAHyperlink = thirdNonLinkedElement.closest('a');
      expect(isThirdNonLinkedElementAHyperlink).toBeFalsy();

      const firstLinkElement = screen.getByRole('link', {
        name: 'developer.vonage.com/en/video/client-sdks/web/overview',
      });
      expect(firstLinkElement).toBeInTheDocument();

      const secondLinkElement = screen.getByRole('link', {
        name: 'example.com',
      });
      expect(secondLinkElement).toBeInTheDocument();
    });
  });
});
