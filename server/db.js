import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedQuestionnaires } from '../src/data/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const canonicalQuestionnaires = [...seedQuestionnaires];
const canonicalQuestionnaireIds = new Set(canonicalQuestionnaires.map((questionnaire) => questionnaire.id));

function normalizeRole(role) {
  if (role === 'admin') return role;
  return null;
}

function createSeedDb() {
  const now = new Date().toISOString();

  return {
    questionnaires: clone(canonicalQuestionnaires).map((questionnaire) => ({
      ...questionnaire,
      metadata: {
        ...questionnaire.metadata,
        createdAt: questionnaire.metadata?.createdAt ?? now,
        updatedAt: questionnaire.metadata?.updatedAt ?? now,
      },
    })),
    responses: [],
    users: [
      {
        id: 'user-admin',
        name: 'Administrador',
        email: 'admin@local',
        password: 'admin123',
        role: 'admin',
      },
    ],
    sessions: [],
  };
}

function normalizeQuestionnaires(existingQuestionnaires = []) {
  const existingById = new Map(existingQuestionnaires.map((item) => [item.id, item]));

  return canonicalQuestionnaires.map((questionnaire) => {
    const existing = existingById.get(questionnaire.id);

    if (!existing) {
      return questionnaire;
    }

    return {
      ...questionnaire,
      metadata: {
        ...questionnaire.metadata,
        ...(existing.metadata ?? {}),
        createdAt: existing.metadata?.createdAt ?? questionnaire.metadata?.createdAt,
        updatedAt: existing.metadata?.updatedAt ?? questionnaire.metadata?.updatedAt,
      },
    };
  });
}

function mergeUsers(existingUsers, defaultUsers) {
  const map = new Map();

  for (const user of defaultUsers) {
    map.set(user.id, user);
  }

  for (const user of existingUsers) {
    const normalizedRole = normalizeRole(user.role);
    if (!normalizedRole) continue;

    map.set(user.id, {
      ...user,
      role: normalizedRole,
    });
  }

  return Array.from(map.values());
}

function normalizeDatabase(db) {
  const seed = createSeedDb();
  const questionnaires = normalizeQuestionnaires(db.questionnaires ?? seed.questionnaires);
  const users = mergeUsers(db.users ?? [], seed.users);
  const responses = Array.isArray(db.responses)
    ? db.responses.filter((response) => canonicalQuestionnaireIds.has(response.questionnaireId))
    : [];
  const userIds = new Set(users.map((user) => user.id));
  const sessions = Array.isArray(db.sessions) ? db.sessions.filter((session) => userIds.has(session.userId)) : [];

  return {
    questionnaires,
    responses,
    users,
    sessions,
  };
}

export async function ensureDatabase() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(createSeedDb(), null, 2), 'utf8');
  }
}

export async function readDatabase() {
  await ensureDatabase();
  const raw = await fs.readFile(DB_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  const normalized = normalizeDatabase(parsed);

  if (JSON.stringify(normalized) !== JSON.stringify(parsed)) {
    await writeDatabase(normalized);
  }

  return normalized;
}

export async function writeDatabase(db) {
  await ensureDatabase();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}
