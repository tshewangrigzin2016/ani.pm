import type { AnimeTitle, EpisodeItem, EpisodeKind } from '@/src/types/anime';

const ONE_PIECE_FIRST_EPS: Array<{ title: string; synopsis: string; aired: string; duration: string }> = [
  {
    title: "I'm Luffy! The Man Who's Gonna Be King of the Pirates!",
    synopsis: 'Alvida pirates plunder a ship only to find a barrel containing a strange boy named Luffy who is on a quest to find the legendary One Piece and become the King of Pirates.',
    aired: 'Oct 20, 1999',
    duration: '24:38',
  },
  {
    title: 'Enter the Great Swordsman! Pirate Hunter Roronoa Zoro!',
    synopsis: 'Luffy and his new companion Coby set sail in search of the infamous pirate hunter Zoro, rumored to be held captive at a Marine base.',
    aired: 'Nov 17, 1999',
    duration: '24:37',
  },
  {
    title: 'Morgan vs. Luffy! Who’s the Mysterious Pretty Girl?',
    synopsis: 'Luffy is in the line of fire after saving Zoro, and now tyrannical Captain Morgan refuses to go down without a fight.',
    aired: 'Nov 24, 1999',
    duration: '24:38',
  },
  {
    title: "Luffy's Past! Enter Red-Haired Shanks!",
    synopsis: 'Luffy recalls a time when Captain Red-Haired Shanks stayed in his village and inspired his dream to sail the seas.',
    aired: 'Dec 8, 1999',
    duration: '24:38',
  },
  {
    title: 'A Terrifying Mysterious Power! Captain Buggy, the Clown Pirate!',
    synopsis: 'Luffy crosses paths with the clever thief Nami. A navigator is exactly what Luffy needs, but she wants nothing to do with pirates.',
    aired: 'Dec 15, 1999',
    duration: '24:38',
  },
  {
    title: 'Desperate Situation! Beast Tamer Mohji vs. Luffy!',
    synopsis: 'Locked in a cage with no escape, Luffy watches as Buggy prepares his Special Buggy Ball cannon.',
    aired: 'Dec 29, 1999',
    duration: '24:36',
  },
];

const ONE_PIECE_ARCS = [
  { name: 'East Blue Saga', until: 61 },
  { name: 'Alabasta Saga', until: 135 },
  { name: 'Sky Island Saga', until: 206 },
  { name: 'Water 7 Saga', until: 325 },
  { name: 'Thriller Bark Saga', until: 384 },
  { name: 'Summit War Saga', until: 516 },
  { name: 'Fish-Man Island Saga', until: 574 },
  { name: 'Dressrosa Saga', until: 746 },
  { name: 'Whole Cake Island Saga', until: 891 },
  { name: 'Wano Country Saga', until: 1085 },
  { name: 'Egghead Arc', until: 1200 },
];

export function buildEpisodesForAnime(anime: AnimeTitle, stillsPool: readonly string[]): EpisodeItem[] {
  const total = Math.max(1, Math.min(anime.episodeCount || 12, 1200));
  const isOnePiece = anime.slug.includes('one-piece') || anime.id === 1642;
  const subMax = anime.subCount || total;
  const dubMax = anime.dubCount || 0;
  const defaultDur = typeof anime.duration === 'number' && anime.duration > 0 ? `${anime.duration}:00` : '24:10';
  const defaultSec = typeof anime.duration === 'number' && anime.duration > 0 ? anime.duration * 60 : 1450;

  const episodes: EpisodeItem[] = [];
  for (let n = 1; n <= total; n++) {
    let kind: EpisodeKind = 'canon';
    if (total > 24 && (n % 17 === 0 || (isOnePiece && n >= 54 && n <= 60))) {
      kind = 'filler';
    } else if (total > 20 && n % 11 === 0) {
      kind = 'mixed';
    }

    let arc = 'Season 1';
    if (isOnePiece) {
      arc = ONE_PIECE_ARCS.find((a) => n <= a.until)?.name ?? 'Egghead Arc';
    } else if (total > 24) {
      const block = Math.ceil(n / 24);
      arc = `Arc ${block}`;
    }

    const customEp = isOnePiece && n <= ONE_PIECE_FIRST_EPS.length ? ONE_PIECE_FIRST_EPS[n - 1] : null;
    const thumb = stillsPool.length > 0 && (n <= 6 || n % 3 === 1)
      ? stillsPool[(anime.id + n) % stillsPool.length]
      : null;

    episodes.push({
      number: n,
      title: customEp?.title ?? `${anime.title} — Episode ${n}`,
      synopsis:
        customEp?.synopsis ??
        `Episode ${n} of ${anime.title}. The story continues as new challenges test every ally along the way.`,
      aired: customEp?.aired ?? `${anime.year ?? 2024}`,
      duration: customEp?.duration ?? defaultDur,
      durationSec: defaultSec,
      hasSub: n <= subMax,
      hasDub: n <= dubMax,
      kind,
      arc,
      season: Math.ceil(n / 24),
      thumbnail: thumb,
    });
  }
  return episodes;
}
