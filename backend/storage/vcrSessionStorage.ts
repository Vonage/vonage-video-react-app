import { vcr } from '@vonage/vcr-sdk';
import { SessionStorage } from './sessionStorage';

const ENTRY_EXPIRATION_TIME = 60 * 60 * 4; // 4 hours in seconds

class VcrSessionStorage implements SessionStorage {
  dbState = vcr.getInstanceState();
  async getSession(roomName: string): Promise<string | null> {
    const session: string | null = await this.dbState.get(`sessions:${roomName}`);
    if (!session) {
      return null;
    }
    // setting expiry of 4 hours for the key. After this time
    // if you try to access a room, you will land on a different session Id.
    await this.dbState.expire(`sessions:${roomName}`, ENTRY_EXPIRATION_TIME);
    return session;
  }

  async setSession(roomName: string, sessionId: string): Promise<void> {
    await this.dbState.set(`sessions:${roomName}`, sessionId);
    // setting expiry on the set command in case the room is
    // created before hand but never accessed.
    await this.dbState.expire(`sessions:${roomName}`, ENTRY_EXPIRATION_TIME);
  }

  async setCaptionsId(roomName: string, captionsId: string): Promise<void> {
    await this.dbState.set(`captionsIds:${roomName}`, captionsId);
    // setting expiry of 4 hours for the key. After this time
    // if you try to access a room, you will land on a different session Id.
    await this.dbState.expire(`captionsIds:${roomName}`, ENTRY_EXPIRATION_TIME);
  }

  async getCaptionsId(roomName: string): Promise<string | null> {
    const captionsId: string | null = await this.dbState.get(`captionsIds:${roomName}`);
    if (!captionsId) {
      return null;
    }
    // setting expiry of 4 hours for the key. After this time
    // if you try to access a room, you will land on a different session Id.
    await this.dbState.expire(`captionsIds:${roomName}`, ENTRY_EXPIRATION_TIME);
    return captionsId;
  }

  async incrementCaptionsUserCount(roomName: string): Promise<number> {
    const key = `captionsUserCount:${roomName}`;
    const currentCaptionsUsersCount = (await this.dbState.get(key)) as number;
    const newCaptionsUsersCount = currentCaptionsUsersCount ? currentCaptionsUsersCount + 1 : 1;
    await this.dbState.set(key, newCaptionsUsersCount);
    // setting expiry of 4 hours for the key. After this time
    // if you try to access a room, you will land on a different session Id.
    await this.dbState.expire(key, ENTRY_EXPIRATION_TIME);
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
    // setting expiry of 4 hours for the key. After this time
    // if you try to access a room, you will land on a different session Id.
    await this.dbState.set(key, newCaptionsUsersCount);
    return newCaptionsUsersCount;
  }
}
export default VcrSessionStorage;
