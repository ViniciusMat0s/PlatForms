import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createQuestionnaireId } from '../src/lib/scoring.js';
import { seedQuestionnaires } from '../src/data/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createSeedDb() {
  const now = new Date().toISOString();

  return {
    questionnaires: clone(seedQuestionnaires).map((questionnaire) => ({
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
      {
        id: 'user-editor',
        name: 'Editor',
        email: 'editor@local',
        password: 'editor123',
        role: 'editor',
      },
      {
        id: 'user-viewer',
        name: 'Leitor',
        email: 'viewer@local',
        password: 'viewer123',
        role: 'viewer',
      },
    ],
    sessions: [],
  };
}

function mergeMissingById(existingItems, defaultItems) {
  const map = new Map(existingItems.map((item) => [item.id, item]));

  for (const item of defaultItems) {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  }

  return Array.from(map.values());
}

function normalizeDatabase(db) {
  const seed = createSeedDb();
  const questionnaires = mergeMissingById(db.questionnaires ?? [], seed.questionnaires);
  const users = mergeMissingById(db.users ?? [], seed.users);
  const responses = Array.isArray(db.responses) ? db.responses : [];
  const sessions = Array.isArray(db.sessions) ? db.sessions : [];

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

export function createQuestionnaireFromInput(input) {
  const now = new Date().toISOString();
  const title = input.title ?? 'Novo questionário';

  return {
    id: input.id ?? createQuestionnaireId(title),
    code: input.code ?? input.id ?? createQuestionnaireId(title),
    title,
    subtitle: input.subtitle ?? '',
    audience: input.audience ?? 'Geral',
    domain: input.domain ?? 'Geral',
    source: input.source ?? 'API',
    version: input.version ?? 1,
    status: input.status ?? 'draft',
    tags: Array.isArray(input.tags) ? input.tags : [],
    scale: input.scale,
    bands: Array.isArray(input.bands) ? input.bands : [],
    scoring: input.scoring ?? { type: 'mean_scaled', reverseQuestions: [] },
    consent: input.consent ?? { required: false, text: '' },
    sections: Array.isArray(input.sections) ? input.sections : [],
    questions: Array.isArray(input.questions) ? input.questions : [],
    metadata: {
      createdAt: input.metadata?.createdAt ?? now,
      updatedAt: now,
    },
  };
}
