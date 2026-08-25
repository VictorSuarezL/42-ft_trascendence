import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import { resolve } from 'node:path';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import createUserRoutes from './routes/createUser.routes';
import howToPlayRoutes from './routes/howToPlay.routes';
import translationsRoutes from './routes/translations.routes';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use('/assets', express.static(resolve(process.cwd(), 'assets')));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/signup', createUserRoutes);
app.use('/how-to-play', howToPlayRoutes);
app.use('/translations', translationsRoutes);

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT}`);
});
