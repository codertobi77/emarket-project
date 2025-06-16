export const processImage = async (imageData: string): Promise<string> => {
  // Si l'image est déjà une URL, la retourner telle quelle
  if (imageData.startsWith('http')) {
    return imageData;
  }

  // Si c'est une image base64, s'assurer qu'elle est correctement formatée
  if (imageData.startsWith('data:image')) {
    // Vérifier si l'image est complète
    if (imageData.length < 100) {
      throw new Error('Image data is incomplete');
    }
    return imageData;
  }

  // Si c'est un chemin de fichier, le convertir en URL
  if (imageData.startsWith('/')) {
    return `${process.env.NEXT_PUBLIC_APP_URL}${imageData}`;
  }

  throw new Error('Invalid image format');
};

export const validateImage = (imageData: string): boolean => {
  try {
    // Vérifier si c'est une URL valide
    if (imageData.startsWith('http')) {
      return true;
    }

    // Vérifier si c'est une image base64 valide
    if (imageData.startsWith('data:image')) {
      const base64Regex = /^data:image\/[a-zA-Z]+;base64,/;
      return base64Regex.test(imageData);
    }

    // Vérifier si c'est un chemin de fichier valide
    if (imageData.startsWith('/')) {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
}; 