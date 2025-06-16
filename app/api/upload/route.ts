import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const imageData = formData.get('imageData') as string;

    if (!file || !imageData) {
      return NextResponse.json(
        { error: 'Fichier ou données d\'image manquants' },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Le fichier doit être une image' },
        { status: 400 }
      );
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'L\'image ne doit pas dépasser 5MB' },
        { status: 400 }
      );
    }

    // Créer un nom de fichier unique
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniqueId = uuidv4();
    const extension = file.name.split('.').pop();
    const filename = `${uniqueId}.${extension}`;

    // Définir le chemin de sauvegarde
    const uploadDir = join(process.cwd(), 'public', 'assets', 'users-img');
    const filePath = join(uploadDir, filename);
    // Sauvegarder le fichier
    await writeFile(filePath, new Uint8Array(buffer));

    // Retourner le chemin de l'image
    const imagePath = `/assets/users-img/${filename}`;
    return NextResponse.json({ imagePath });
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement de l\'image' },
      { status: 500 }
    );
  }
}
