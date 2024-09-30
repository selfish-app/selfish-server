import { ROOT } from '../../../config';
import path from "node:path";
import fs from 'node:fs'


export async function getJSFiles(filter: string, dir = ROOT): Promise<{ rootRelative: string, absolute: string }[]> {

  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  let files: { rootRelative: string, absolute: string }[] = [];

  for (const entry of entries) {
    const entryPath = path.join(entry.parentPath, entry.name);
    const relativePath = entryPath.replace(ROOT, '');
    if (entry.isDirectory()) {
      const subFiles = await getJSFiles(filter, entryPath);
      files = files.concat(subFiles);
    } else if (entry.isFile() && relativePath.includes(filter) && entry.name.endsWith('.js')) {
      files.push({
        rootRelative: relativePath,
        absolute: entryPath
      });
    }
  }

  return files;
}