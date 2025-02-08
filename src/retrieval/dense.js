const fs = require('fs').promises;
const path = require('path');
const EmbeddingService = require('../services/embedding');
const { cosineSimilarity } = require('../utils/vector');

/**
 * Dense Retrieval Implementation using Embeddings
 * 
 * Advantages:
 * - Understands semantic meaning
 * - Can find relevant results even with different wording
 * - Better at understanding context
 * 
 * Limitations:
 * - Requires API calls (cost and latency)
 * - More complex implementation
 * - Needs careful management of embedding storage
 */
class DenseRetrieval {
  constructor() {
    this.embeddingService = new EmbeddingService(process.env.OPENAI_API_KEY);
    this.books = null;
    this.initialized = false;
  }

  /**
   * Loads cached book embeddings from enhanced-books.json
   * Called once during initialization
   */
  async initialize() {
    if (this.initialized) return;

    const dataPath = path.join(__dirname, '../data/processed/enhanced-books.json');
    const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
    this.books = data.books;
    this.initialized = true;
  }

  /**
   * Preprocesses text for embedding generation
   * @param {string} text - Text to preprocess
   * @returns {string} - Preprocessed text
   */
  preprocessText(text) {
    return text
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .trim();
  }

  /**
   * Searches for books using dense retrieval with cached embeddings
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @param {number} options.limit - Maximum number of results (default: 5)
   * @param {string} options.type - Type of embeddings to use: 'general' or 'personal' (default: 'general')
   * @returns {Promise<Array>} Ranked search results
   */
  async search(query, { limit = 5, type = 'general' } = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    // Only generate embedding for the search query
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);

    // Calculate similarities using cached book embeddings.
    const results = this.books
      .map(async book => {
        const content = type === 'general' ? book.descriptions.general : book.descriptions.personal_review?.content;
        const cachedBookEmbedding = book.embeddings?.[type];

        if (!content && !cachedBookEmbedding) {
          return null; // We don't have enough data to compare this book.
        }

        // Fallback to generating an embedding for the book on the fly, if necessary.
        const bookEmbedding = cachedBookEmbedding || await this.embeddingService.generateEmbedding(content);

        // TODO NEXT: Update the format of this result to match the SparseRetrieval implementation and ContextBuilder expectations.
        return {
          book: {
            id: book.id,
            title: book.title,
            author: book.author,
            descriptions: book.descriptions
          },
          relevance: cosineSimilarity(queryEmbedding, bookEmbedding)
        };
      });
    
    return (await Promise.all(results))
      .filter(result => result !== null)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  }
}

module.exports = DenseRetrieval; 