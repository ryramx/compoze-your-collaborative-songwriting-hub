import { create } from "zustand";
import {
  CURRENT_USER_ID,
  conversations as initialConversations,
  feed as initialFeed,
  folders as initialFolders,
  projects as initialProjects,
  songs as initialSongs,
  users as initialUsers,
} from "@/data/mockData";
import type {
  Conversation,
  FeedItem,
  Folder,
  Project,
  Song,
  SongBlock,
  User,
} from "@/data/types";

interface CompozeState {
  currentUserId: string;
  users: User[];
  songs: Song[];
  folders: Folder[];
  projects: Project[];
  conversations: Conversation[];
  feed: FeedItem[];
  followingIds: string[];

  // actions
  getUser: (id: string) => User | undefined;
  getSong: (id: string) => Song | undefined;
  getProject: (id: string) => Project | undefined;
  createSong: (input: { title: string; folderId?: string; projectId?: string }) => string;
  createProject: (input: {
    name: string;
    type: Project["type"];
    style: Project["style"];
    description?: string;
    releaseDate?: string;
    fundingGoal?: number;
    estimatedCost?: number;
  }) => string;
  updateSong: (id: string, patch: Partial<Song>) => void;
  updateBlock: (songId: string, blockId: string, patch: Partial<SongBlock>) => void;
  addBlock: (songId: string, block: Omit<SongBlock, "id">) => void;
  removeBlock: (songId: string, blockId: string) => void;
  inviteCollaborator: (songId: string, userId: string, percentage?: number) => void;
  setContribution: (songId: string, userId: string, percentage: number) => void;
  createFolder: (name: string, parentId?: string) => string;
  toggleFollow: (userId: string) => void;
  sendMessage: (toUserId: string, content: string) => void;
  postFeed: (content: string) => void;
  toggleSongHidden: (songId: string) => void;
  deleteSong: (songId: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useCompoze = create<CompozeState>((set, get) => ({
  currentUserId: CURRENT_USER_ID,
  users: initialUsers,
  songs: initialSongs,
  folders: initialFolders,
  projects: initialProjects,
  conversations: initialConversations,
  feed: initialFeed,
  followingIds: ["u3", "u5"],

  getUser: (id) => get().users.find((u) => u.id === id),
  getSong: (id) => get().songs.find((s) => s.id === id),
  getProject: (id) => get().projects.find((p) => p.id === id),

  createSong: ({ title, folderId, projectId }) => {
    const id = "s_" + uid();
    const now = new Date().toISOString();
    const song: Song = {
      id,
      title: title || "Nova canção",
      status: "ideia",
      creatorId: get().currentUserId,
      collaborators: [{ userId: get().currentUserId, percentage: 100 }],
      createdAt: now,
      updatedAt: now,
      folderId,
      projectId,
      blocks: [
        { id: uid(), type: "section", label: "Verso 1", text: "", authorId: get().currentUserId },
        { id: uid(), type: "chord-line", text: "C   G   Am   F", authorId: get().currentUserId },
        { id: uid(), type: "lyric-line", text: "", authorId: get().currentUserId },
      ],
    };
    set({ songs: [song, ...get().songs] });
    if (projectId) {
      set({
        projects: get().projects.map((p) =>
          p.id === projectId ? { ...p, songIds: [...p.songIds, id] } : p,
        ),
      });
    }
    return id;
  },

  updateSong: (id, patch) =>
    set({
      songs: get().songs.map((s) =>
        s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s,
      ),
    }),

  updateBlock: (songId, blockId, patch) =>
    set({
      songs: get().songs.map((s) =>
        s.id === songId
          ? {
              ...s,
              updatedAt: new Date().toISOString(),
              blocks: s.blocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b)),
            }
          : s,
      ),
    }),

  addBlock: (songId, block) =>
    set({
      songs: get().songs.map((s) =>
        s.id === songId
          ? {
              ...s,
              updatedAt: new Date().toISOString(),
              blocks: [...s.blocks, { ...block, id: uid() }],
            }
          : s,
      ),
    }),

  removeBlock: (songId, blockId) =>
    set({
      songs: get().songs.map((s) =>
        s.id === songId ? { ...s, blocks: s.blocks.filter((b) => b.id !== blockId) } : s,
      ),
    }),

  inviteCollaborator: (songId, userId, percentage = 0) => {
    const song = get().songs.find((s) => s.id === songId);
    if (!song) return;
    if (song.collaborators.some((c) => c.userId === userId)) return;
    set({
      songs: get().songs.map((s) =>
        s.id === songId
          ? { ...s, collaborators: [...s.collaborators, { userId, percentage }] }
          : s,
      ),
    });
  },

  setContribution: (songId, userId, percentage) =>
    set({
      songs: get().songs.map((s) =>
        s.id === songId
          ? {
              ...s,
              collaborators: s.collaborators.map((c) =>
                c.userId === userId ? { ...c, percentage } : c,
              ),
            }
          : s,
      ),
    }),

  createFolder: (name, parentId) => {
    const id = "f_" + uid();
    set({
      folders: [...get().folders, { id, name, ownerId: get().currentUserId, parentId }],
    });
    return id;
  },

  toggleFollow: (userId) =>
    set({
      followingIds: get().followingIds.includes(userId)
        ? get().followingIds.filter((i) => i !== userId)
        : [...get().followingIds, userId],
    }),

  sendMessage: (toUserId, content) => {
    const conv = get().conversations.find((c) => c.withUserId === toUserId);
    const msg = {
      id: uid(),
      fromId: get().currentUserId,
      toId: toUserId,
      content,
      timestamp: new Date().toISOString(),
    };
    if (conv) {
      set({
        conversations: get().conversations.map((c) =>
          c.withUserId === toUserId ? { ...c, messages: [...c.messages, msg] } : c,
        ),
      });
    } else {
      set({
        conversations: [
          ...get().conversations,
          { id: uid(), withUserId: toUserId, messages: [msg] },
        ],
      });
    }
  },

  postFeed: (content) =>
    set({
      feed: [
        {
          id: uid(),
          type: "post",
          userId: get().currentUserId,
          timestamp: new Date().toISOString(),
          content,
          likes: 0,
          comments: 0,
        },
        ...get().feed,
      ],
    }),

  toggleSongHidden: (songId) =>
    set({
      songs: get().songs.map((s) => (s.id === songId ? { ...s, hidden: !s.hidden } : s)),
    }),

  deleteSong: (songId) =>
    set({
      songs: get().songs.filter((s) => s.id !== songId),
      projects: get().projects.map((p) =>
        p.songIds.includes(songId)
          ? { ...p, songIds: p.songIds.filter((sid) => sid !== songId) }
          : p,
      ),
    }),
}));
