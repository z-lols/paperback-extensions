// MangaDex source code for Paperback
// Original author: Paperback community
// Updated for MangaDex API v5 with genre filters

export default {
  id: 'com.mangadex',
  name: 'MangaDex',
  version: '1.0.0',
  author: 'Paperback',
  description: 'MangaDex source for Paperback with genre filters',
  icon: 'icon.png',
  website: 'https://mangadex.org',
  contentRating: 'Everyone',
  language: 'en',
  sourceURL: 'https://raw.githubusercontent.com/z-lols/paperback-extensions/main/MangaDex.js',
  repo: 'https://github.com/z-lols/paperback-extensions',
  apiURL: 'https://api.mangadex.org',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },

  async searchManga(query, filters = {}) {
    let url = `${this.apiURL}/manga?title=${encodeURIComponent(query)}&limit=10`;

    // Add genre filters if provided
    if (filters.genres && filters.genres.length > 0) {
      url += `&includedTags=${filters.genres.join(',')}`;
    }

    const response = await fetch(url, { headers: this.headers });
    const data = await response.json();

    return data.data.map(manga => ({
      id: manga.id,
      title: manga.attributes.title.en || Object.values(manga.attributes.title)[0],
      cover: `https://mangadex.org/covers/${manga.id}/${manga.relationships.find(rel => rel.type === 'cover_art').attributes.fileName}`,
    }));
  },

  async getMangaDetails(mangaId) {
    const url = `${this.apiURL}/manga/${mangaId}?includes[]=artist&includes[]=author&includes[]=cover_art`;
    const response = await fetch(url, { headers: this.headers });
    const data = await response.json();

    const manga = data.data;
    return {
      id: manga.id,
      title: manga.attributes.title.en || Object.values(manga.attributes.title)[0],
      author: manga.relationships.find(rel => rel.type === 'author').attributes.name,
      artist: manga.relationships.find(rel => rel.type === 'artist').attributes.name,
      description: manga.attributes.description.en || Object.values(manga.attributes.description)[0],
      cover: `https://mangadex.org/covers/${manga.id}/${manga.relationships.find(rel => rel.type === 'cover_art').attributes.fileName}`,
      status: manga.attributes.status,
      genres: manga.attributes.tags.map(tag => tag.attributes.name.en),
    };
  },

  async getChapters(mangaId) {
    const url = `${this.apiURL}/manga/${mangaId}/feed?translatedLanguage[]=en&order[chapter]=asc`;
    const response = await fetch(url, { headers: this.headers });
    const data = await response.json();

    return data.data.map(chapter => ({
      id: chapter.id,
      title: chapter.attributes.title || `Chapter ${chapter.attributes.chapter}`,
      chapterNumber: chapter.attributes.chapter,
      volumeNumber: chapter.attributes.volume,
      language: chapter.attributes.translatedLanguage,
    }));
  },

  async getChapterPages(chapterId) {
    const url = `${this.apiURL}/at-home/server/${chapterId}`;
    const response = await fetch(url, { headers: this.headers });
    const data = await response.json();

    return data.chapter.data.map(page => `${data.baseUrl}/data/${data.chapter.hash}/${page}`);
  },

  async getGenres() {
    const url = `${this.apiURL}/manga/tag`;
    const response = await fetch(url, { headers: this.headers });
    const data = await response.json();

    return data.data.map(tag => ({
      id: tag.id,
      name: tag.attributes.name.en,
    }));
  },
};