export interface Video {
  id: string;
  stream: MediaStream;
  isLocal: boolean
}

export interface DiscoveryData {
  roomResponse: string;
  peers: string[];
}

export interface Login {
  accessToken: string;
  expire: string;
}

export interface ServerError {
  message: string;
}

export interface Room {
  creatorUserId: string;
  peersIds: string[];
}

export interface RoomData {
  room: Room;
}

export interface RoomAuthorization extends RoomData {
  token: string;
}

export interface joinRequestData {
  username: string;
  requesterId: string;
}
