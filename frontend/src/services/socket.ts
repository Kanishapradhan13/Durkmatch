import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import type { Message } from '../types';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinMatch(matchId: number) {
    this.socket?.emit('join_match', matchId);
  }

  leaveMatch(matchId: number) {
    this.socket?.emit('leave_match', matchId);
  }

  sendMessage(matchId: number, messageText: string) {
    this.socket?.emit('send_message', { matchId, messageText });
  }

  onNewMessage(callback: (message: Message) => void) {
    this.socket?.on('new_message', callback);
  }

  offNewMessage() {
    this.socket?.off('new_message');
  }

  onMessageNotification(callback: (data: { matchId: number; message: Message }) => void) {
    this.socket?.on('message_notification', callback);
  }

  offMessageNotification() {
    this.socket?.off('message_notification');
  }

  onMatchNotification(callback: (data: { matchId: number; userId: number }) => void) {
    this.socket?.on('match_notification', callback);
  }

  offMatchNotification() {
    this.socket?.off('match_notification');
  }

  emitTypingStart(matchId: number) {
    this.socket?.emit('typing_start', matchId);
  }

  emitTypingStop(matchId: number) {
    this.socket?.emit('typing_stop', matchId);
  }

  onUserTyping(callback: (data: { userId: number; matchId: number }) => void) {
    this.socket?.on('user_typing', callback);
  }

  offUserTyping() {
    this.socket?.off('user_typing');
  }

  onUserStoppedTyping(callback: (data: { userId: number; matchId: number }) => void) {
    this.socket?.on('user_stopped_typing', callback);
  }

  offUserStoppedTyping() {
    this.socket?.off('user_stopped_typing');
  }

  emitNewMatch(matchId: number, matchedUserId: number) {
    this.socket?.emit('new_match', { matchId, matchedUserId });
  }
}

export default new SocketService();
