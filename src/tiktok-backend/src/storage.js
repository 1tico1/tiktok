import fs from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_FILE = join(__dirname, '../data/db.json');

// Estrutura inicial do banco de dados
const initialDB = {
  candidates: [],
  cuts: [],
  renderedClips: [],
  posts: []
};

// Garante que o diretório data existe
await fs.mkdir(join(__dirname, '../data'), { recursive: true });

// Inicializa o arquivo se não existir
try {
  await fs.access(DB_FILE);
} catch {
  await fs.writeFile(DB_FILE, JSON.stringify(initialDB, null, 2));
}

// Funções de acesso ao banco
export async function readDB() {
  const data = await fs.readFile(DB_FILE, 'utf8');
  return JSON.parse(data);
}

export async function writeDB(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// Funções auxiliares para cada entidade
export async function saveCandidate(candidate) {
  const db = await readDB();
  db.candidates.push(candidate);
  await writeDB(db);
  return candidate;
}

export async function saveCut(cut) {
  const db = await readDB();
  db.cuts.push(cut);
  await writeDB(db);
  return cut;
}

export async function saveRenderedClip(clip) {
  const db = await readDB();
  db.renderedClips.push(clip);
  await writeDB(db);
  return clip;
}

export async function savePost(post) {
  const db = await readDB();
  db.posts.push(post);
  await writeDB(db);
  return post;
}