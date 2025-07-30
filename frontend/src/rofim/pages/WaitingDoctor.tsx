import { ReactElement } from 'react';
import useIsSmallViewport from '../../hooks/useIsSmallViewport';

/**
 * WaitingDoctor Component
 *
 * This component renders a waiting doctor page to inform the patient that the doctor is on the way.
 * @returns {ReactElement} - The waiting doctor page.
 */
const WaitingDoctor = (): ReactElement => {
  const isSmallViewport = useIsSmallViewport();

  return (
    <div className="flex size-full flex-col bg-gray-100" data-testid="waitingDoctor">
      <div className="flex w-full flex-col items-center justify-center min-h-screen p-4">
        {/* Main title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">Veuillez patienter</h1>

        {/* White card container */}
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full">
          <div className="flex flex-col items-center space-y-6">
            {/* Doctor illustration */}
            <div className="w-24 h-24 bg-blue-700 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-white" viewBox="0 0 64 64" fill="currentColor">
                {/* Doctor icon - simplified medical cross with person outline */}
                <circle cx="32" cy="20" r="8" fill="white" opacity="0.9" />
                <path d="M32 12c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" />
                <path d="M20 36c0-6.6 5.4-12 12-12s12 5.4 12 12v4H20v-4z" />
                <path d="M28 44h8v8h-8z" />
                <path d="M24 52h16v2H24z" />
              </svg>
            </div>

            {/* Main message */}
            <h2 className="text-xl font-bold text-blue-700 text-center">
              Votre médecin va bientôt arriver
            </h2>

            {/* Instructional text */}
            <div className="text-center space-y-3">
              <p className="text-gray-600 text-sm leading-relaxed">
                Vous serez notifié dès que votre médecin rejoindra la visioconférence.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
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
