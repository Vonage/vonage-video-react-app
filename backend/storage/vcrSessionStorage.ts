import { vcr } from '@vonage/vcr-sdk';
import { SessionStorage } from './sessionStorage';

const ENTRY_EXPIRATION_TIME = 60 * 60 * 4; // 4 hours in seconds

class VcrSessionStorage implements SessionStorage {
  dbState = vcr.getInstanceState();
  private async setKeyExpiry(key: string): Promise<void> {
    // if you try to access a room after the expiry time, you will land on a different session.
    await this.dbState.expire(key, ENTRY_EXPIRATION_TIME);
  }
  async getSession(roomName: string): Promise<string | null> {
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

  async setSession(roomName: string, sessionId: string): Promise<void> {
    const key = `sessions:${roomName}`;
    await this.dbState.set(key, sessionId);
    // setting expiry on the set command in case the room is
    // created before hand but never accessed.
    await this.setKeyExpiry(key);
  }

  async setCaptionsId(roomName: string, captionsId: string): Promise<void> {
    const key = `captionsIds:${roomName}`;
    await this.dbState.set(key, captionsId);
    await this.setKeyExpiry(key);
  }

  async getCaptionsId(roomName: string): Promise<string | null> {
    const key = `captionsIds:${roomName}`;
    const captionsId: string | null = await this.dbState.get(key);
    if (!captionsId) {
      return null;
    }
    return captionsId;
  }

  async incrementCaptionsUserCount(roomName: string): Promise<number> {
    const key = `captionsUserCount:${roomName}`;
    const currentCaptionsUsersCount = (await this.dbState.get(key)) as number;
    const newCaptionsUsersCount = currentCaptionsUsersCount ? currentCaptionsUsersCount + 1 : 1;
    await this.dbState.set(key, newCaptionsUsersCount);
    await this.setKeyExpiry(key);

    return newCaptionsUsersCount;
  }

  async decrementCaptionsUserCount(roomName: string): Promise<number> {
    const key = `captionsUserCount:${roomName}`;
    const currentCaptionsUsersCount = (await this.dbState.get(key)) as number;
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
