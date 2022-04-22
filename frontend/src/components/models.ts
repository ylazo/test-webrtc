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
