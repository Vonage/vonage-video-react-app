import { vcr } from '@vonage/vcr-sdk';
import { SessionStorage } from './sessionStorage';

const ENTRY_EXPIRATION_TIME = 60 * 60 * 4; // 4 hours in seconds

class VcrSessionStorage implements SessionStorage {
  dbState = vcr.getInstanceState();
  private async setKeyExpiry(key: string): Promise<void> {
    // if you try to access a room after the expiry time, you will land on a different session.
    await this.dbState.expire(key, ENTRY_EXPIRATION_TIME);
  }
  async getSessionKey({ roomName }: { roomName: string }): Promise<string | null> {
    const key = `sessions:${roomName}`;
    const session: string | null = await this.dbState.get(key);
    if (!session) {
      return null;
    }
    // setting expiry of 4 hours for the key. After this time
    // if you try to access a room, you will land on a different session Id.
    await this.setKeyExpiry(key);
    return session;
  }

  async setSession({
    roomName,
    sessionKey,
  }: {
    roomName: string;
    sessionKey: string;
  }): Promise<void> {
    const key = `sessions:${roomName}`;
    await this.dbState.set(key, sessionKey);
    // setting expiry on the set command in case the room is
    // created before hand but never accessed.
    await this.setKeyExpiry(key);
  }

  async setCaptionsId({
    sessionKey,
    captionsId,
  }: {
    sessionKey: string;
    captionsId: string;
  }): Promise<void> {
    const key = `captionsIds:${sessionKey}`;
    await this.dbState.set(key, captionsId);
    await this.setKeyExpiry(key);
  }

  async getCaptionsId({ sessionKey }: { sessionKey: string }): Promise<string | null> {
    const key = `captionsIds:${sessionKey}`;
    const captionsId: string | null = await this.dbState.get(key);
    if (!captionsId) {
      return null;
    }
    return captionsId;
  }

  async incrementCaptionsUserCount({ sessionKey }: { sessionKey: string }): Promise<number> {
    const key = `captionsUserCount:${sessionKey}`;
    const currentCaptionsUsersCount = await this.dbState.get(key);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const newCaptionsUsersCount = currentCaptionsUsersCount ? currentCaptionsUsersCount + 1 : 1;
    await this.dbState.set(key, newCaptionsUsersCount);
    await this.setKeyExpiry(key);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return newCaptionsUsersCount;
  }

  async decrementCaptionsUserCount({ sessionKey }: { sessionKey: string }): Promise<number> {
    const key = `captionsUserCount:${sessionKey}`;
    const currentCaptionsUsersCount = await this.dbState.get(key);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const newCaptionsUsersCount = currentCaptionsUsersCount ? currentCaptionsUsersCount - 1 : 0;
    if (newCaptionsUsersCount < 0) {
      await this.dbState.delete(key);
      return 0;
    }
    await this.dbState.set(key, newCaptionsUsersCount);
    await this.setKeyExpiry(key);

    return newCaptionsUsersCount;
  }
}
export default VcrSessionStorage;
