export type SongStatus = "ideia" | "escrita" | "revisao" | "finalizada" | "registrada" | "gravada";
export type ProjectType = "single" | "ep" | "album";
export type ProjectStyle = "acustico" | "banda" | "ao-vivo";

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location: { city: string; country: string; lat: number; lng: number };
  instagram?: string;
  followers: number;
  following: number;
  authorColor: 1 | 2 | 3 | 4 | 5;
}

export interface Contribution {
  userId: string;
  percentage: number;
}

export interface SongBlock {
  id: string;
  type: "section" | "chord-line" | "lyric-line" | "note";
  label?: string; // ex: Verso 1, Refrão
  text: string;
  authorId: string; // who wrote it
}

export interface Song {
  id: string;
  title: string;
  status: SongStatus;
  creatorId: string;
  collaborators: Contribution[];
  createdAt: string;
  updatedAt: string;
  projectId?: string;
  folderId?: string;
  blocks: SongBlock[];
  key?: string;
  bpm?: number;
}

export interface Folder {
  id: string;
  name: string;
  ownerId: string;
  parentId?: string;
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  style: ProjectStyle;
  description: string;
  cover: string;
  releaseDate: string;
  estimatedCost: number;
  fundingGoal: number;
  fundingProgress: number; // 0..100
  status: "planejamento" | "producao" | "mixagem" | "lancado";
  songIds: string[];
  collaboratorIds: string[];
  ownerId: string;
}

export interface Message {
  id: string;
  fromId: string;
  toId: string;
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  withUserId: string;
  messages: Message[];
}

export type FeedItemType = "post" | "song-released" | "project-update" | "follow";

export interface FeedItem {
  id: string;
  type: FeedItemType;
  userId: string;
  timestamp: string;
  content?: string;
  songId?: string;
  projectId?: string;
  image?: string;
  likes: number;
  comments: number;
}
