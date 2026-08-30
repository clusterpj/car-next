// src/pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, Fields, Files, File } from 'formidable';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createLogger } from '@/utils/logger';

const logger = createLogger('upload-api');

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'cars');

const saveFile = async (file: File): Promise<string> => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const filename = file.originalFilename ? file.originalFilename.replace(/\.[^/.]+$/, '') + '-' + uniqueSuffix + '.webp' : '';
  const filepath = path.join(uploadDir, filename);

  // Resize and convert image to webp
  await sharp(file.filepath)
    .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(filepath);

  return `/cars/${filename}`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({
    multiples: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
  });

  try {
    const { fields, files } = await new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const fileArray = Array.isArray(files.images) ? files.images : [files.images];
    const savedFiles = await Promise.all(fileArray.map(file => saveFile(file as File)));

    res.status(200).json({ urls: savedFiles });
  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}