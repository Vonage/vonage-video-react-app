import { vcr } from '@vonage/vcr-sdk';
import { SessionStorage } from './sessionStorage';

class VcrSessionStorage implements SessionStorage {
  dbState = vcr.getInstanceState();
  async getSession(roomName: string): Promise<string | null> {
    const session: string | null = await this.dbState.get(`sessions:${roomName}`);
    if (!session) {
      return null;
    }
    // setting expiry of 4 hours for the key. After this time
    // if you try to access a room, you will land on a different session Id.
    await this.dbState.expire(`sessions:${roomName}`, 60 * 60 * 4);
    return session;
  }

  async setSession(roomName: string, sessionId: string): Promise<void> {
    await this.dbState.set(`sessions:${roomName}`, sessionId);
    // setting expiry on the set command in case the room is
    // created before hand but never accessed.
    await this.dbState.expire(`sessions:${roomName}`, 60 * 60 * 4);
  }

  async setCaptionId(roomName: string, captionId: string): Promise<void> {
    await this.dbState.set(`captionIds:${roomName}`, captionId);
    await this.dbState.expire(`captionIds:${roomName}`, 60 * 60 * 4);
  }

  async getCaptionId(roomName: string): Promise<string | null> {
    const captionId: string | null = await this.dbState.get(`captionIds:${roomName}`);
    if (!captionId) {
      return null;
    }
    await this.dbState.expire(`captionIds:${roomName}`, 60 * 60 * 4);
    return captionId;
  }

  async addCaptionsUser(roomName: string): Promise<number> {
    const key = `captionsUserCount:${roomName}`;
    const current = await this.dbState.get(key);
    const count = current ? parseInt(String(current), 10) + 1 : 1;
    await this.dbState.set(key, count.toString());
    await this.dbState.expire(key, 60 * 60 * 4);
    return count;
  }

  async removeCaptionsUser(roomName: string): Promise<number> {
    const key = `captionsUserCount:${roomName}`;
    const current = await this.dbState.get(key);
    const count = current ? parseInt(String(current), 10) - 1 : 0;
    if (count < 0) {
      await this.dbState.delete(key);
      return 0;
    }
    await this.dbState.set(key, count.toString());
    return count;
  }
}
export default VcrSessionStorage;
