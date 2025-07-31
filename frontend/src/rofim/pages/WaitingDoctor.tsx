import { ReactElement, useEffect, useRef, useState } from 'react';
import WebSocketService from '../utils/websocket.service';
import { getRofimSession } from '../utils/session';
import WarningIcon from '@mui/icons-material/Warning';
import { getTimeStringFromDate } from '../utils/date.service';
import useSessionContext from '../../hooks/useSessionContext';
import { useNavigate } from 'react-router-dom';
import rofimApiService, { WaitingRoomStatus } from '../utils/rofimApi.service';

/**
 * WaitingDoctor Component
 *
 * This component renders a waiting doctor page to inform the patient that the doctor is on the way.
 * @returns {ReactElement} - The waiting doctor page.
 */
const WaitingDoctor = (): ReactElement => {
  const navigate = useNavigate();
  const [showDoctorDelay, setShowDoctorDelay] = useState(false);
  const [doctorDelayInMinute, setDoctorDelayInMinute] = useState<number>(0);
  const [startTime, setStartTime] = useState<string>('');
  const { subscriberWrappers, connected, vonageVideoClient, joinRoom } = useSessionContext();

  const wsRef = useRef<WebSocketService | null>(null);
  const room = getRofimSession()?.room;
  const slug = getRofimSession()?.slug;

  const participantCount = subscriberWrappers.length;
  const hasParticipants = participantCount > 0;

  console.log('connected', connected);
  console.log('hasParticipants', hasParticipants);
  console.log('vonageVideoClient', vonageVideoClient);
  // slug est null si c'est un docteur qui join la visioconférence , je redirect le docteur vers la room via WaitingRoom si c'est le cas

  // Connecter automatiquement à la room et mettre à jour le statut
  useEffect(() => {
    if (joinRoom && room) {
      joinRoom(room);
    }

    // Mettre à jour le statut vers 'wait' quand le patient arrive sur WaitingDoctor
    if (slug) {
      rofimApiService
        .setPatientStatus(slug, WaitingRoomStatus.Wait)
        .catch((error) => console.error('❌ Erreur lors de la mise à jour du statut:', error));
    }
  }, [joinRoom, room, slug]);

  // Redirection réactive vers la room dès qu'un participant rejoint
  useEffect(() => {
    // Seul le docteur peut se connecter à la room sans passer par la case WaitingDoctor
    // Le premier participant detecté est donc le docteur
    if (hasParticipants && room) {
      navigate(`/room/${room}`, {
        state: {
          hasAccess: true,
        },
      });
    }
  }, [hasParticipants, room, navigate]);

  // Cleanup quand le composant se démonte
  // useEffect(() => {
  //   return () => {
  //     // Optionnel : mettre à jour le statut quand le patient quitte
  //     if (slug) {
  //       rofimApiService.setPatientReady(slug)
  //         .catch((error) => {
  //           console.error('❌ Erreur lors du cleanup du statut:', error);
  //         });
  //     }
  //   };
  // }, [slug]);

  // useEffect(() => {
  //   if (!slug) {
  //     return;
  //   }
  //   const ws = new WebSocketService('http://localhost:3000', {
  //     id: slug,
  //     type: 'teleconsultation'
  //   });
  //   ws.connect({
  //     onDoctorAddDelay: (event) => {
  //       setDoctorDelayInMinute(event.data.doctorDelayInMinute);
  //       setStartTime(event.data.startTime);
  //       setShowDoctorDelay(true);
  //     }
  //   });
  //   wsRef.current = ws;

  //   return () => {
  //     ws.disconnect();
  //   };
  // }, [slug]);

  return (
    <div className="flex size-full flex-col bg-gray-100" data-testid="waitingDoctor">
      <div className="flex w-full flex-col items-center justify-center min-h-screen p-4">
        {/* Main title */}
        <h1 className="text-[32px] font-bold text-gray-900 mb-8 text-center">Veuillez patienter</h1>

        {/* White card container */}
        <div className="bg-white rounded-lg shadow-sm p-14 max-w-4xl w-full">
          {/* Retard medecin */}
          {showDoctorDelay && (
            <div className="bg-[#FEFCE8] border-[#FEF08A] border shadow-md p-4 rounded flex items-start mb-4">
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  <WarningIcon sx={{ color: '#D97706', fontSize: 20 }} />
                  <strong>Rendez-vous retardé</strong>
                </div>
                <div className="flex flex-col items-start mt-2">
                  <p>
                    Votre médecin vous informe que le rendez-vous est retardé de{' '}
                    <b>{doctorDelayInMinute} min</b> (heure estimée :{' '}
                    <b>{getTimeStringFromDate(startTime)}</b>)
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col items-center space-y-6">
            {/* Doctor illustration */}
            <img src="public/images/medecin.png" alt="Médecin" className="w-[120px] h-[120px]" />

            {/* Main message */}
            <h2 className="text-2xl font-bold text-blue-700 text-center">
              Votre médecin va bientôt arriver
            </h2>

            {/* Instructional text */}
            <div className="text-center space-y-3">
              <p className="text-gray-600 text-xl leading-relaxed">
                Vous serez automatiquement redirigé vers la visioconférence dès qu'il se connectera.
              </p>
              <p className="text-gray-600 text-xl leading-relaxed">
                Merci de rester connecté et de garder cette fenêtre ouverte.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingDoctor;
