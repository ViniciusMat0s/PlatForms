import cors from 'cors';
import express from 'express';
import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { readDatabase, writeDatabase } from './db.js';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function createSession(userId) {
  return {
    id: crypto.randomUUID(),
    userId,
    createdAt: new Date().toISOString(),
  };
}

async function findSession(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return null;

  const db = await readDatabase();
  const session = db.sessions.find((item) => item.id === token);
  if (!session) return null;

  const user = db.users.find((item) => item.id === session.userId);
  return user ? { session, user } : null;
}

function requireAuth(handler) {
  return async (req, res, next) => {
    try {
      const auth = await findSession(req);
      if (!auth) {
        return res.status(401).json({ error: 'Não autenticado.' });
      }

      req.auth = auth;
      return handler(req, res, next);
    } catch (error) {
      return next(error);
    }
  };
}

function requireRole(allowedRoles, handler) {
  return requireAuth(async (req, res, next) => {
    if (!allowedRoles.includes(req.auth.user.role)) {
      return res.status(403).json({ error: 'Permissão insuficiente.' });
    }

    return handler(req, res, next);
  });
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'forms-platform-api' });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  const db = await readDatabase();

  const user = db.users.find(
    (item) =>
      item.email.toLowerCase() === String(email ?? '').toLowerCase() &&
      item.password === password,
  );

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  const session = createSession(user.id);
  db.sessions = [session, ...db.sessions.filter((item) => item.userId !== user.id)];
  await writeDatabase(db);

  res.json({
    token: session.id,
    user: publicUser(user),
  });
});

app.get(
  '/api/auth/me',
  requireAuth(async (req, res) => {
    res.json({ user: publicUser(req.auth.user) });
  }),
);

app.post(
  '/api/auth/logout',
  requireAuth(async (req, res) => {
    const db = await readDatabase();
    db.sessions = db.sessions.filter((item) => item.id !== req.auth.session.id);
    await writeDatabase(db);
    res.json({ ok: true });
  }),
);

app.get(
  '/api/state',
  requireAuth(async (req, res) => {
    const db = await readDatabase();
    res.json({
      questionnaires: db.questionnaires,
      responses: req.auth.user.role === 'admin' ? db.responses : [],
    });
  }),
);

app.get(
  '/api/questionnaires',
  requireAuth(async (_req, res) => {
    const db = await readDatabase();
    res.json(db.questionnaires);
  }),
);

app.post(
  '/api/questionnaires',
  requireRole(['admin'], async (req, res) => {
    res.status(405).json({
      error: 'O catálogo de formulários é fixo e vem do documento de levantamento.',
    });
  }),
);

app.put(
  '/api/questionnaires/:id',
  requireRole(['admin'], async (req, res) => {
    res.status(405).json({
      error: 'O catálogo de formulários é fixo e não pode ser alterado.',
    });
  }),
);

app.delete(
  '/api/questionnaires/:id',
  requireRole(['admin'], async (req, res) => {
    res.status(405).json({
      error: 'O catálogo de formulários é fixo e não pode ser alterado.',
    });
  }),
);

app.get(
  '/api/responses',
  requireRole(['admin'], async (_req, res) => {
    const db = await readDatabase();
    res.json(db.responses);
  }),
);

app.post('/api/responses', async (req, res) => {
    const payload = req.body ?? {};
    const db = await readDatabase();
    const questionnaireExists = db.questionnaires.some((item) => item.id === payload.questionnaireId);

    if (!questionnaireExists) {
      return res.status(404).json({ error: 'Questionário não encontrado.' });
    }

    const auth = await findSession(req);
    const response = {
      id: `resp-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      submittedByUserId: auth?.user?.id ?? null,
      submittedByRole: auth?.user?.role ?? 'public',
      ...payload,
    };

    db.responses = [response, ...db.responses];
    await writeDatabase(db);
    res.status(201).json(response);
});

app.get(
  '/api/reports/summary',
  requireRole(['admin'], async (_req, res) => {
    const db = await readDatabase();
    const recentResponse = db.responses[0] ?? null;

    res.json({
      questionnaireCount: db.questionnaires.length,
      responseCount: db.responses.length,
      userCount: db.users.length,
      recentResponse,
    });
  }),
);

const distPath = path.resolve(process.cwd(), 'dist');
const indexPath = path.join(distPath, 'index.html');
const serveClient = process.env.SERVE_CLIENT !== 'false' && existsSync(indexPath);

if (serveClient) {
  app.use(express.static(distPath));
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(indexPath);
  });
}

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`Forms API running on http://localhost:${PORT}`);
});
