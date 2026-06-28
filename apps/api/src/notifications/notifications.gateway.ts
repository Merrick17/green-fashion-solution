import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { WS_EVENTS } from '@repo/types';
import { DEFAULT_WEB_URL } from '../config/defaults';

/** Per-user WebSocket room name. */
export function wsUserRoom(userId: string): string {
  return `user:${userId}`;
}

@WebSocketGateway({ cors: { origin: process.env.CORS_ORIGIN || DEFAULT_WEB_URL, credentials: true } })
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: { handshake: { auth?: { token?: string }; headers?: { authorization?: string } }; join: (room: string) => void; disconnect: () => void }) {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      client.join(wsUserRoom(payload.sub));
    } catch {
      client.disconnect();
    }
  }

  emitToUser(userId: string, event: string, data: unknown) {
    this.server.to(wsUserRoom(userId)).emit(event, data);
  }

  emitNotification(userId: string, notification: unknown) {
    this.emitToUser(userId, WS_EVENTS.NOTIFICATION, notification);
  }

  emitProposalUpdate(userId: string, proposal: unknown) {
    this.emitToUser(userId, WS_EVENTS.PROPOSAL_UPDATED, proposal);
  }

  emitMeetingUpdate(userId: string, meeting: unknown) {
    this.emitToUser(userId, WS_EVENTS.MEETING_UPDATED, meeting);
  }

  emitProjectStatus(userId: string, project: unknown) {
    this.emitToUser(userId, WS_EVENTS.PROJECT_STATUS, project);
  }
}