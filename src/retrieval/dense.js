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
    this.embeddingService = new EmbeddingService();
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
   * Ensures a book has necessary embeddings
   * @param {Book} book - Book to process
   * @returns {Promise<void>}
   * @private
   */
  async ensureBookEmbeddings(book) {
    if (!book.embeddings) {
      book.embeddings = {};
    }

    // Generate general description embedding if needed
    if (!book.embeddings.general && book.descriptions.general) {
      const text = this.preprocessText(book.descriptions.general);
      book.embeddings.general = await this.embeddingService.generateEmbedding(text);
    }

    // Generate personal review embedding if needed
    if (!book.embeddings.personal && book.descriptions.personal_review?.content) {
      const text = this.preprocessText(book.descriptions.personal_review.content);
      book.embeddings.personal = await this.embeddingService.generateEmbedding(text);
    }
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

    // Calculate similarities using cached book embeddings
    const results = this.books
      .map(book => {
        const bookEmbedding = book.embeddings?.[type];
        if (!bookEmbedding) return null;

        return {
          id: book.id,
          title: book.title,
          author: book.author,
          description: book.descriptions[type === 'general' ? 'general' : 'personal_review']?.content,
          similarity: cosineSimilarity(queryEmbedding, bookEmbedding)
        };
      })
      .filter(result => result !== null)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return results;
  }
}

module.exports = DenseRetrieval; 