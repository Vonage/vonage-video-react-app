import { encode } from 'uqr';
import isNil from '@common/assertions/isNil';
import tryCatch from '@common/execution/tryCatch';

const MODULE_PIXEL_SIZE = 8;
const CAPTION_HEIGHT = 64;
const IMAGE_FILE_NAME = 'meeting-qr-code.png';

export type ShareMeetingImageArgs = {
  meetingLink: string;
  caption: string;
};

/**
 * Shares a PNG with the QR code of the meeting link and a caption through the system share sheet,
 * or downloads it when the browser cannot share files.
 */
const shareMeetingImage = async ({ meetingLink, caption }: ShareMeetingImageArgs) => {
  const imageBlob = await drawMeetingImage({ meetingLink, caption });
  const imageFile = new File([imageBlob], IMAGE_FILE_NAME, { type: 'image/png' });
  const shareData = { files: [imageFile], title: caption };

  const isFileSharingSupported = 'canShare' in navigator && navigator.canShare(shareData);
  if (!isFileSharingSupported) {
    downloadFile(imageFile);
    return;
  }

  const { error } = await tryCatch(() => navigator.share(shareData));
  const hasUserCancelled = error?.name === 'AbortError';
  const isShareAlreadyInProgress = error?.name === 'InvalidStateError';
  if (isNil(error) || hasUserCancelled || isShareAlreadyInProgress) return;

  downloadFile(imageFile);
};

function drawMeetingImage({ meetingLink, caption }: ShareMeetingImageArgs): Promise<Blob> {
  const { size, data } = encode(meetingLink, { border: 2 });
  const qrCodePixelSize = size * MODULE_PIXEL_SIZE;
  const canvas = document.createElement('canvas');
  canvas.width = qrCodePixelSize;
  canvas.height = qrCodePixelSize + CAPTION_HEIGHT;

  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  context.fillStyle = '#FFFFFF';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#000000';
  data.forEach((row, rowIndex) =>
    row.forEach((isDark, columnIndex) => {
      if (!isDark) return;
      context.fillRect(
        columnIndex * MODULE_PIXEL_SIZE,
        rowIndex * MODULE_PIXEL_SIZE,
        MODULE_PIXEL_SIZE,
        MODULE_PIXEL_SIZE
      );
    })
  );
  context.font = '600 24px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(
    caption,
    canvas.width / 2,
    qrCodePixelSize + CAPTION_HEIGHT / 2,
    canvas.width - 2 * MODULE_PIXEL_SIZE
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob as Blob), 'image/png');
  });
}

function downloadFile(file: File) {
  const fileUrl = URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.href = fileUrl;
  anchor.download = file.name;
  anchor.click();
  URL.revokeObjectURL(fileUrl);
}

export default shareMeetingImage;
