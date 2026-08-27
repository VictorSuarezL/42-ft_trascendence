export interface MessageSendPayload {
  message: string;
}

export interface MessageReceivedPayload {
  id: string;
  user: {
    id: number;
    displayName: string;
    avatarUrl: string | null;
  };
  message: string;
  createdAt: string;
}

export interface FriendRequestPayload {
  userId: number;
}

export interface FriendAcceptPayload {
  userId: number;
}

export type PresenceStatus = 'online' | 'offline';

export interface PresenceChangedPayload {
  userId: number;
  status: PresenceStatus;
}
