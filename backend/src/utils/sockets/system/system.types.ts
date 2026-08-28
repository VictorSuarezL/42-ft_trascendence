export interface SystemConnectedPayload {
  socketId: string;
  userId: number;
}

export interface SystemErrorPayload {
  code: string;
  message: string;
}
