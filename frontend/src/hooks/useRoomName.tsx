import { useParams, useLocation } from 'react-router-dom';

export type UseRoomNameProps = {
  useLocationState?: boolean;
};

/**
 * Creates a lower case version of the room name regardless of the original format.
 * @param {UseRoomNameProps} props - the props for this hook
 *  @property {boolean} useLocationState - the boolean that if set to true, uses location.state instead of URL params
 * @returns {string} the lowercase room name.
 */
const useRoomName = ({ useLocationState = false }: UseRoomNameProps = {}): string => {
  let roomName;
  const params = useParams();
  const location = useLocation();

  if (useLocationState) {
    // in some cases we want to grab the room name from location.state
    roomName = location.state?.roomName;
  } else {
    // in other cases we want to grab it from the URL params
    // this is the default behavior of this hook
    roomName = params.roomName;
  }
  const lowerCaseRoomName: string = roomName?.toLowerCase() || '';

  return lowerCaseRoomName;
};

export default useRoomName;
