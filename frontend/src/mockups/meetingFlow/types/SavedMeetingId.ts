declare const savedMeetingIdBrand: unique symbol;

export type SavedMeetingId = `meeting:${string}` & { [savedMeetingIdBrand]: 'SavedMeetingId' };

export default SavedMeetingId;
