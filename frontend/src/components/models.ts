export interface Video {
  id: string;
  stream: MediaStream;
  isLocal: boolean
}

export interface DiscoveryData {
  roomResponse: string;
  peers: string[];
}
