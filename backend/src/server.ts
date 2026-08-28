import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import { resolve } from 'node:path';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import createUserRoutes from './routes/createUser.routes';
import howToPlayRoutes from './routes/howToPlay.routes';
import translationsRoutes from './routes/translations.routes';
import { socketAuth } from './utils/sockets/socket.auth';
import { registerSocialHandlers } from './utils/sockets/social/social.handlers';
import { registerSystemHandlers } from './utils/sockets/system/system.handlers';

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost',
      'http://localhost:5173',
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use('/assets', express.static(resolve(process.cwd(), 'assets')));

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
  });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/signup', createUserRoutes);
app.use('/how-to-play', howToPlayRoutes);
app.use('/translations', translationsRoutes);

const PORT = Number(process.env.PORT) || 3000;

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});
io.use(socketAuth);
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('auth:check', () => {
    console.log('[Socket Auth] Check:', {
      socketId: socket.id,
      authenticated: !!socket.data.user,
      userId: socket.data.user?.id,
      user: socket.data.user,
    });

    socket.emit('auth:result', {
      authenticated: !!socket.data.user,
      userId: socket.data.user?.id,
    });
  });
  registerSocialHandlers(io, socket);
  registerSystemHandlers(io, socket);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT}`);
});
