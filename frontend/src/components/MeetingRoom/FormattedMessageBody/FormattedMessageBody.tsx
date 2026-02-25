import { ReactElement } from 'react';
import Link from '@mui/material/Link';
import linkGroupsParser from '../../../utils/linkGroupsParser';

export type FormattedMessageBodyProps = {
  message: string;
};

/**
 * FormattedMessageBody Component
 *
 * From an unformatted message, returns a message with any appropriate hyperlinks added.
 * @param {FormattedMessageBodyProps} props - props for the component
 *  @property {string} message - The message to be transformed
 * @returns {ReactElement} The formatted message
 */
const FormattedMessageBody = ({ message }: FormattedMessageBodyProps): ReactElement => {
  const transformedMessage = linkGroupsParser(message);
  const messageFragments = transformedMessage.map((messageGroup) => {
    const isTextOnlyMessage = messageGroup.length === 1;
    const isLinkOnlyMessage = messageGroup.length === 2;

    if (isTextOnlyMessage) {
      const messageText = [...messageGroup].join('');
      return <span key={messageText}>{messageText}</span>;
    }

    if (isLinkOnlyMessage) {
      const messageUrl = messageGroup[0];
      const messageTextToDisplay = messageGroup[1];

      return (
        <Link key={messageTextToDisplay} href={messageUrl} target="_blank">
          {messageTextToDisplay}
        </Link>
      );
    }
    // if length of 3, it's text, and a link
    return (
      <span key={`${messageGroup[0]}-${messageGroup[1]}`}>
        <span>{messageGroup[0]}</span>
        <Link href={messageGroup[1]} target="_blank">
          {messageGroup[2]}
        </Link>
      </span>
    );
  });

  return (
    <>
      {messageFragments.map((messageFragment) => (
        <span key={messageFragment.key}>{messageFragment} </span>
      ))}
    </>
  );
};

export default FormattedMessageBody;
