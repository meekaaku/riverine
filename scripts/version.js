import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const versionPath = join(__dirname, '..', 'version.json');

const data = JSON.parse(readFileSync(versionPath, 'utf8'));
const current = Number(data.version) || 0;
const next = current + 1;

data.version = next;
writeFileSync(versionPath, JSON.stringify(data, null, 2) + '\n');

console.log(`Version: ${current} → ${next}`);
