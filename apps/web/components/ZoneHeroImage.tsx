'use client';

const HERO_IMAGES: Record<string, string> = {
  'burung': 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=2000&q=90',
  'air-tawar': 'https://images.unsplash.com/photo-1530053969600-caedar9f6f9e?w=2000&q=90',
  'farmhouse': 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=2000&q=90',
  'reptil': 'https://www.indonesia.travel/contentassets/57f6b916eacb408e9d41f31fe470d739/museum-fauna-indonesia-komodo-dan-taman-reptilia.jpg',
  'serangga': 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=2000&q=90',
};

export default function ZoneHeroImage({ zone }: { zone: string }) {
  const imageUrl = HERO_IMAGES[zone];

  return (
    <div
      className="absolute inset-0 -z-20 bg-cover bg-center transition-opacity duration-500"
      style={{ backgroundImage: `url("${imageUrl}")` }}
      aria-hidden="true"
    />
  );
}
