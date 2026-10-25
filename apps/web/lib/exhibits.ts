import {
  Bird,
  Bug,
  Droplets,
  Fish,
  Leaf,
  PawPrint,
  Rabbit,
  Shell,
  Squirrel,
  Turtle,
  Worm,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from './types';

/**
 * Pemetaan ikon lucide sebagai cadangan ketika kategori tidak memiliki
 * emoji yang bisa ditampilkan.
 */
const ICON_RULES: { match: RegExp; icon: LucideIcon }[] = [
  { match: /air|tawar|ikan|fish|aqua|sungai|laut|marine|danau|sungai/i, icon: Fish },
  { match: /serangga|insect|bug|kupu|lebah|jangkrik|nyamuk|kupu/i, icon: Bug },
  { match: /reptil|ular|kadal|snake|lizard|turtle|penyu|kura|crocodile/i, icon: Turtle },
  { match: /burung|ungu|avian|bird|elang|kutilang|merpati/i, icon: Bird },
  { match: /mamalia|rusa|kelinci|domba|kambing|sapi|kucing|anjing|monkey|kera/i, icon: PawPrint },
  { match: /farm|house|ternak|kandang/i, icon: Rabbit },
  { match: /amfib|katak|kodok|salamander/i, icon: Droplets },
  { match: /mollusk|kerang|remi|siput|timmon/i, icon: Shell },
  { match: /rodent|tikus|hamster|marmot/i, icon: Rabbit },
  { match: /sambar|primata|kera|monyet/i, icon: Squirrel },
  { match: /cacing|worm|vermiform/i, icon: Worm },
];

export interface ExhibitIconMeta {
  /** Emoji dari database (bisa kosong). */
  emoji: string;
  /** Ikon lucide cadangan. */
  fallback: LucideIcon;
}

/**
 * Ambil metadata ikon sebuah kategori/wahana.
 * Emoji pada database bisa berupa karakter mojibake, sehingga hanya
 * dianggap valid bila berada di rentang emoji/simbol umum.
 */
export const getExhibitIcon = (
  category?: Pick<Category, 'name' | 'slug' | 'icon'> | null
): ExhibitIconMeta => {
  const raw = (category?.icon ?? '').trim();
  // Deteksi emoji (surrogate pair) atau simbol; karakter '?' menandakan
  // data rusak/mojibake sehingga tidak dipakai.
  const isValidEmoji =
    raw.length > 0 &&
    !/^\?+$/.test(raw) &&
    (/[\uD800-\uDBFF]/.test(raw) || /[\u2190-\u2BFF\u2600-\u27BF\uFE0F]/.test(raw));

  const haystack = `${category?.name ?? ''} ${category?.slug ?? ''}`;
  const rule = ICON_RULES.find((r) => r.match.test(haystack));

  return {
    emoji: isValidEmoji ? raw : '',
    fallback: rule?.icon ?? Leaf,
  };
};
