import decodeSessionId from '../../helpers/decodeSessionId';

function assertVonageSessionId(value: unknown): asserts value is string {
  decodeSessionId(value as string);
}

export default assertVonageSessionId;
