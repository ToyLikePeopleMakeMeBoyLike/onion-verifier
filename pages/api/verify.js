import { promises as fs } from 'fs';
import path from 'path';
import { adjectives, nouns } from '../../utils/wordlists';

const DATA_FILE = path.join(process.cwd(), 'data', 'urls.json');

async function readData() {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
  } catch {
    return {};
  }
}

async function writeData(store) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
}

// Generates camelCase slug like "flyingCapibara"
function genSlug() {
  const adj  = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return adj + noun.charAt(0).toUpperCase() + noun.slice(1);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end("Method " + req.method + " Not Allowed");
  }

  const { url } = req.body || {};
  if (!url) {
    return res.status(400).json({ valid: false, error: 'URL is required' });
  }

  // Validate .onion link
  let valid = false;
  let full;
  try {
    const input = url.trim();
    full = input.includes("://") ? input : "http://" + input;
    const host = new URL(full).hostname.toLowerCase();
    valid = /^([a-z2-7]{16}|[a-z2-7]{56})\.onion$/.test(host);
  } catch {
    valid = false;
  }

  if (!valid) {
    return res.status(200).json({ valid: false });
  }

  // Read & update the store
  const store = await readData();
  let slug = Object.keys(store).find(key => store[key] === full);
  if (!slug) {
    do {
      slug = genSlug();
    } while (store[slug]);
    store[slug] = full;
    await writeData(store);
  }

  // Build and return the short URL
  const baseUrl = process.env.BASE_URL || "http://" + req.headers.host;
  const shortUrl = baseUrl + "/" + slug;
  return res.status(200).json({ valid: true, shortUrl });
}
