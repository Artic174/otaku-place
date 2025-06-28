const axios = require('axios');
const config = require('../config/api');

// Membuat instance axios untuk Jikan API
const jikanClient = axios.create({
    baseURL: config.jikan.baseURL,
    timeout: config.jikan.timeout,
    headers: {
        'User-Agent': 'AnimeWebsite/1.0'
    }
});

// Rate limiting helper
let lastRequestTime = 0;
const minInterval = 1000 / config.jikan.rateLimit.requestsPerSecond;

async function makeRequest(url, params = {}) {
    // Simple rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < minInterval) {
        await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest));
    }
    
    lastRequestTime = Date.now();
    
    try {
        const response = await jikanClient.get(url, { params });
        return response.data;
    } catch (error) {
        console.error(`Jikan API Error for ${url}:`, error.message);
        throw error;
    }
}

// API Methods
const JikanAPI = {
    // Get anime by ID
    async getAnime(id) {
        return await makeRequest(`/anime/${id}/full`);
    },

    // Get anime characters
    async getAnimeCharacters(id) {
        return await makeRequest(`/anime/${id}/characters`);
    },

    // Get anime episodes
    async getAnimeEpisodes(id, page = 1) {
        return await makeRequest(`/anime/${id}/episodes`, { page });
    },

    // Get anime news
    async getAnimeNews(id) {
        return await makeRequest(`/anime/${id}/news`);
    },

    // Get anime videos/trailers
    async getAnimeVideos(id) {
        return await makeRequest(`/anime/${id}/videos`);
    },

    // Get anime pictures
    async getAnimePictures(id) {
        return await makeRequest(`/anime/${id}/pictures`);
    },

    // Get anime statistics
    async getAnimeStatistics(id) {
        return await makeRequest(`/anime/${id}/statistics`);
    },

    // Get anime recommendations
    async getAnimeRecommendations(id) {
        return await makeRequest(`/anime/${id}/recommendations`);
    },

    // Get schedules (all days or specific day)
    async getSchedules(day = null, page = 1) {
        const params = { page };
        if (day) {
            params.filter = day;
        }
        return await makeRequest('/schedules', params);
    },

    // Search anime
    async searchAnime(query, page = 1, limit = 20) {
        return await makeRequest('/anime', {
            q: query,
            page,
            limit
        });
    },

    // Get anime by genre
    async getAnimeByGenre(genreId, page = 1, limit = 20) {
        return await makeRequest('/anime', {
            genres: genreId,
            page,
            limit
        });
    },

    // Get top anime
    async getTopAnime(type = 'anime', page = 1, limit = 20) {
        return await makeRequest('/top/anime', {
            type,
            page,
            limit
        });
    },

    // Get current season anime
    async getCurrentSeason(page = 1) {
        return await makeRequest('/seasons/now', { page });
    },

    // Get anime by season and year
    async getAnimeBySeason(year, season, page = 1) {
        return await makeRequest(`/seasons/${year}/${season}`, { page });
    },

    // Get anime genres
    async getAnimeGenres() {
        return await makeRequest('/genres/anime');
    },

    // Get random anime
    async getRandomAnime() {
        return await makeRequest('/random/anime');
    },

    // Get anime recommendations (general)
    async getRecommendations(page = 1) {
        return await makeRequest('/recommendations/anime', { page });
    }
};

module.exports = JikanAPI;

