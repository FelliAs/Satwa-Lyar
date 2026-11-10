'use client';

import { useEffect, useState } from 'react';
import { publicAnimalsApi } from '@/lib/api';

interface Destination {
  name: string;
  kicker: string;
  description: string;
  href: string;
  zone: string;
}

export default function LandingDestinations({ destinations }: { destinations: Destination[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const controller = new AbortController();
    Promise.all(
      destinations.map(async (destination) => {
        const response = await publicAnimalsApi.list(
          { zone: destination.zone, page: 1, limit: 1, sort: 'newest' },
          controller.signal
        );
        return [destination.zone, response.data[0]?.image_url ?? ''] as const;
      })
    )
      .then((entries) => setImages(Object.fromEntries(entries)))
      .catch(() => undefined);
    return () => controller.abort();
  }, [destinations]);

  return (
    <div
      className="destination-grid mx-auto mt-9 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-6"
      onPointerLeave={() => setSelected(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setSelected(null);
      }}
    >
      {destinations.map((destination, index) => (
        <a
          key={destination.name}
          href={destination.href}
          onPointerEnter={() => setSelected(destination.name)}
          onPointerDown={() => setSelected(destination.name)}
          onFocus={() => setSelected(destination.name)}
          style={{
            backgroundImage: images[destination.zone]
              ? `linear-gradient(180deg, transparent 24%, rgb(7 25 19 / 84%) 100%), url("${images[destination.zone]}")`
              : 'linear-gradient(180deg, #315b40, #102e2c)',
          }}
          className={`destination-card group lg:col-span-2 ${index === 3 ? 'lg:col-start-2' : index === 4 ? 'lg:col-start-4' : ''} ${selected ? (selected === destination.name ? 'is-selected' : 'is-dimmed') : ''}`}
        >
          <span className="destination-kicker">{destination.kicker}</span>
          <span className="destination-arrow" aria-hidden="true">↗</span>
          <div><h3>{destination.name}</h3><p>{destination.description}</p></div>
        </a>
      ))}
    </div>
  );
}
