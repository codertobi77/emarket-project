import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Phone, MapPin } from "lucide-react";

// Utilitaire pour normaliser le chemin d'image
function getNormalizedImagePath(imagePath?: string) {
  if (!imagePath) return "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg";
  if (imagePath.startsWith('/users-img/')) return `/assets${imagePath}`;
  if (imagePath.includes('public/assets/')) return `/${imagePath.split('public/')[1]}`;
  if (imagePath.includes('assets/')) return `/${imagePath}`;
  return `/assets/users-img/${imagePath.split('/').pop()}`;
}

async function getSeller(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/users?sellerId=${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const users = await res.json();
  return users && users.length > 0 ? users[0] : null;
}

async function getSellerProducts(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products?sellerId=${id}`, { cache: 'no-store' });
  if (!res.ok) return [];
  return await res.json();
}

export default async function SellerProfilePage({ params }: { params: { id: string } }) {
  const seller = await getSeller(params.id);
  if (!seller || seller.role !== "SELLER") return notFound();
  const products = await getSellerProducts(params.id);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container py-10 flex flex-col items-center">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative">
            <Image
              src={getNormalizedImagePath(seller.image)}
              alt={`Photo de profil de ${seller.name}`}
              width={120}
              height={120}
              className="rounded-full border-4 border-primary/10 object-cover h-28 w-28"
            />
            {seller.isCertified && (
              <Badge variant="outline" className="absolute bottom-0 right-0 flex items-center gap-1 text-xs border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4 mr-1 text-emerald-500" />
                Certifié
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold text-center">{seller.name}</h1>
          <div className="flex flex-wrap gap-2 items-center justify-center">
            <Badge variant="secondary">Vendeur</Badge>
            {seller.location && (
              <span className="flex items-center gap-1 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4" />
                {seller.location}
              </span>
            )}
            {seller.phone && (
              <span className="flex items-center gap-1 text-muted-foreground text-sm">
                <Phone className="h-4 w-4" />
                {seller.phone}
              </span>
            )}
          </div>
        </div>
        <div className="w-full max-w-3xl">
          <h2 className="text-2xl font-semibold mb-4">Produits du vendeur</h2>
          {products.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">Ce vendeur n'a pas encore de produits.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product: any) => (
                <div key={product.id} className="border rounded-lg p-4 bg-card flex flex-col">
                  <Image
                    src={product.image ? (product.image.startsWith('/products-img/') ? `/assets${product.image}` : product.image) : "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg"}
                    alt={product.name}
                    width={200}
                    height={150}
                    className="rounded-md object-cover mb-2 h-32 w-full"
                  />
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <div className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.description}</div>
                  <div className="font-bold text-primary mb-1">{product.price} FCFA</div>
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Stock: {product.stock}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 