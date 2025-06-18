import { vcr } from '@vonage/vcr-sdk';
import { SessionStorage } from './sessionStorage';

const expirationTime = 60 * 60 * 4; // 4 hours in seconds

class VcrSessionStorage implements SessionStorage {
  dbState = vcr.getInstanceState();
  async getSession(roomName: string): Promise<string | null> {
    const session: string | null = await this.dbState.get(`sessions:${roomName}`);
    if (!session) {
      return null;
    }
    // setting expiry of 4 hours for the key. After this time
    // if you try to access a room, you will land on a different session Id.
    await this.dbState.expire(`sessions:${roomName}`, expirationTime);
    return session;
  }

  async setSession(roomName: string, sessionId: string): Promise<void> {
    await this.dbState.set(`sessions:${roomName}`, sessionId);
    // setting expiry on the set command in case the room is
    // created before hand but never accessed.
    await this.dbState.expire(`sessions:${roomName}`, expirationTime);
  }

  async setCaptionId(roomName: string, captionsId: string): Promise<void> {
    await this.dbState.set(`captionsIds:${roomName}`, captionsId);
    await this.dbState.expire(`captionsIds:${roomName}`, expirationTime);
  }

  async getCaptionsId(roomName: string): Promise<string | null> {
    const captionsId: string | null = await this.dbState.get(`captionsIds:${roomName}`);
    if (!captionsId) {
      return null;
    }
    await this.dbState.expire(`captionsIds:${roomName}`, expirationTime);
    return captionsId;
  }

  async addCaptionsUser(roomName: string): Promise<number> {
    const key = `captionsUserCount:${roomName}`;
    const currentCaptionsUsersCount = await this.dbState.get(key);
    const newCaptionsUsersCount = currentCaptionsUsersCount
      ? parseInt(String(currentCaptionsUsersCount), 10) + 1
      : 1;
    await this.dbState.set(key, newCaptionsUsersCount.toString());
    await this.dbState.expire(key, expirationTime);
    return newCaptionsUsersCount;
  }

  async removeCaptionsUser(roomName: string): Promise<number> {
    const key = `captionsUserCount:${roomName}`;
    const currentCaptionsUsersCount = await this.dbState.get(key);
    const newCaptionsUsersCount = currentCaptionsUsersCount
      ? parseInt(String(currentCaptionsUsersCount), 10) - 1
      : 0;
    if (newCaptionsUsersCount < 0) {
      await this.dbState.delete(key);
      return 0;
    }
    await this.dbState.set(key, newCaptionsUsersCount.toString());
    return newCaptionsUsersCount;
  }
}
export default VcrSessionStorage;
