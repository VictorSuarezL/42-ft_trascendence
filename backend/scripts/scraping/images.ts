import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

export interface StoredImage {
  path: string;
  width: number;
  height: number;
  mimeType: 'image/webp';
  sourcePage: string;
  sourceUrl: string;
}

interface DownloadImageOptions {
  sourceUrl: string;
  sourceName: string;
  relativePath: string;
  maxWidth?: number;
  quality?: number;
}

function createSourcePageUrl(sourceName: string): string {
  const encodedName = encodeURIComponent(sourceName.replaceAll(' ', '_'));

  return 'https://disney-villainous.fandom.com/' + `wiki/File:${encodedName}`;
}

export async function downloadImageAsWebp({
  sourceUrl,
  sourceName,
  relativePath,
  maxWidth = 1000,
  quality = 90,
}: DownloadImageOptions): Promise<StoredImage> {
  if (relativePath.startsWith('/') || relativePath.includes('..')) {
    throw new Error(`Invalid image path: "${relativePath}"`);
  }

  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(
      `Image download failed with HTTP ${response.status}: ` + sourceUrl,
    );
  }

  const input = Buffer.from(await response.arrayBuffer());

  const outputPath = resolve(process.cwd(), 'assets', relativePath);

  await mkdir(dirname(outputPath), {
    recursive: true,
  });

  const result = await sharp(input)
    .resize({
      width: maxWidth,
      withoutEnlargement: true,
    })
    .webp({
      quality,
      effort: 6,
      smartSubsample: true,
    })
    .toFile(outputPath);

  return {
    path: `/assets/${relativePath}`,
    width: result.width,
    height: result.height,
    mimeType: 'image/webp',
    sourcePage: createSourcePageUrl(sourceName),
    sourceUrl,
  };
}
