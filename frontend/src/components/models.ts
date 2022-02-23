export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

export interface Video {
  id: string;
  muted: boolean;
  stream: MediaStream;
  isLocal: boolean
}
