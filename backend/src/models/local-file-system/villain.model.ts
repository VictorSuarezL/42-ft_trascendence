import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import type { Villain } from '../../types/villains.types.ts';

const villainsDirectory = path.resolve(process.cwd(), 'json/villains');

export class VillainJsonModel {
  static async getById(villainId: string): Promise<Villain | null> {
    if (!/^[a-z0-9-]+$/.test(villainId)) {
      return null;
    }

    const filePath = path.join(villainsDirectory, `${villainId}.json`);
    try {
      const content = await readFile(filePath, 'utf-8');
      return JSON.parse(content) as Villain;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null; // File not found, return null
      }
      throw error; // Rethrow other errors
    }
  }

  static async getAll() {
    const files = await readdir(villainsDirectory);

    return Promise.all(
      files
        .filter((file) => file.endsWith('.json'))
        .map(async (file) => {
          const content = await readFile(
            path.join(villainsDirectory, file),
            'utf-8',
          );
          return JSON.parse(content) as Villain;
        }),
    );
  }
}
