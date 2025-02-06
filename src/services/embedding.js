const OpenAI = require('openai');

/**
 * Service for generating and managing embeddings
 * Implements caching to minimize API calls
 */
class EmbeddingService {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
    this.cache = new Map();
  }

  /**
   * Generates an embedding for the given text
   * @param {string} text - Text to embed
   * @returns {Promise<number[]>} - Embedding vector
   */
  async generateEmbedding(text) {
    // Check cache first
    const cacheKey = this.getCacheKey(text);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });

      const embedding = response.data[0].embedding;
      this.cache.set(cacheKey, embedding);
      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Creates a cache key for the text
   * @private
   */
  getCacheKey(text) {
    return text.toLowerCase().trim();
  }
}

module.exports = EmbeddingService; 