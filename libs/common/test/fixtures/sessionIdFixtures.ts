/**
 * Valid Vonage/OpenTok session IDs for testing
 */
export const VALID_SESSION_ID =
  '1_MX44NDI4YjFjOS02NTA1LTQ4M2MtYTI3YS05YzA4NmZjMDkwZGV-fjE3NzA4NjcyNTcxNTh-ZnI4S0haci9wYzU1enQ5bzFjbHBFNjN6fn5-';

export const INVALID_SESSION_IDS = {
  empty: '',
  noUnderscore: 'MX44NDI4YjFjOS02NTA1LTQ4M2MtYTI3YS05YzA4NmZjMDkwZGV',
  multipleUnderscores: '1_MX44NDI4_YjFjOS02NTA1',
  invalidBase64: '1_!!!invalid!!!',
  tooFewFields: '1_dGVzdA==', // decodes to "test" - not enough fields
};
