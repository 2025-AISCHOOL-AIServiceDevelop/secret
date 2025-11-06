// Generates mock contents when backend returns no data
// The shape matches fields used by UI: contentsId, title, thumbUrl, language, durationSec

const SAMPLE_THUMBS = [
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516637090014-cb1ab0d08fc7?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1496302662116-85c65e7d0c33?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80&auto=format&fit=crop',
];

export function buildMockContents(query = '') {
  const baseTitle = query ? `${query} 추천 동화` : '추천 전래동화';
  const languages = ['ko', 'en', 'ja'];
  const items = Array.from({ length: 6 }).map((_, index) => {
    const id = -(index + 1); // negative IDs to avoid collision with real data
    const lang = languages[index % languages.length];
    const durationSec = 180 + index * 45; // 3~6 min
    return {
      contentsId: id,
      title: `${baseTitle} ${index + 1}`,
      thumbUrl: SAMPLE_THUMBS[index % SAMPLE_THUMBS.length],
      language: lang,
      durationSec,
    };
  });
  return items;
}

export default buildMockContents;


