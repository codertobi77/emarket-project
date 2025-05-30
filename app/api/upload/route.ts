import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { randomBytes } from 'crypto';
import { join } from 'path';
import * as fs from 'fs';

export async function POST (req: NextRequest) {

    const formData = await req.formData();

    if (!formData) {
      return NextResponse.json({ message: 'No form data provided' }, { status: 400 });
    }
  
    const image = formData.get('image');
    const folder = formData.get('folder');

  if (!image) {
    return NextResponse.json({ message: 'No image provided' }, { status: 400 });
  }

  if (!folder) {
    return NextResponse.json({ message: 'No folder provided' }, { status: 400 });
  }

  if (image instanceof File) {
    try {
      // Méthode correcte pour lire le contenu d'un fichier dans Next.js API routes
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Générer un nom de fichier unique pour éviter les doublons et les problèmes d'extension
      const fileExt = image.name.split('.').pop() || 'jpg';
      const uniqueFilename = `${randomBytes(8).toString('hex')}.${fileExt}`;
      
      const dir = join("public", 'assets', folder as string);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const filePath = join(dir, uniqueFilename);
      // Écrire le contenu réel du fichier
      fs.writeFileSync(filePath, new Uint8Array(buffer));
      
      console.log(`Fichier uploadé avec succès: ${filePath} - Taille: ${buffer.length} octets`);
    
      return NextResponse.json({ filename: uniqueFilename, path: filePath });      
    } catch (error) {
      console.error('Erreur lors de l\'upload du fichier:', error);
      return NextResponse.json({ message: 'Erreur lors de l\'upload du fichier' }, { status: 500 });
    }

  } else {
    // Handle the case where image is not a File object
    return NextResponse.json({ message: 'Invalid image provided' }, { status: 400 });
  }
  
};
