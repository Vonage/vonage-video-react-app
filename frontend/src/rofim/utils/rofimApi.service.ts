import { getRofimSession } from './session';

export enum WaitingRoomStatus {
  Connected = 'connected', // = Enregistrement
  Disconnected = 'disconnected',
  Wait = 'wait',
  Progress = 'progress', // Visioconference started
  MomentarilyDisconnected = 'momentarily-disconnected',
  CheckingEquipment = 'checking-equipment',
}

class RofimApiService {
  private baseUrl = 'http://localhost:3000';

  /**
   * Met à jour le statut de la téléconsultation
   * @param slug - Le slug de la téléconsultation
   * @param type - Le nouveau statut
   * @returns Promise<Response>
   */
  async updateTeleconsultationStatus(slug: string, type: WaitingRoomStatus): Promise<Response> {
    const session = getRofimSession();
    const token = session?.tokenJwtTcPatient;

    if (!token) {
      throw new Error('Token ROFIM manquant');
    }

    const response = await fetch(
      `${this.baseUrl}/services/teleconsultation/${slug}/patient-hook?type=${type}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  /**
   * Change le statut du patient lorsqu'il arrive sur WaitingDoctor ou WaitingRoom
   * @param slug - Le slug de la téléconsultation
   */
  async setPatientStatus(slug: string, status: WaitingRoomStatus): Promise<void> {
    try {
      await this.updateTeleconsultationStatus(slug, status);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }
}

export default new RofimApiService();
