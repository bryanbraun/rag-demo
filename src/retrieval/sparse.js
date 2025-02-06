const natural = require('natural');
const { TfIdf } = natural;

/**
 * Sparse Retrieval Implementation using TF-IDF
 * 
 * Advantages:
 * - No external API calls needed
 * - Fast computation
 * - Good for exact keyword matches
 * 
 * Limitations:
 * - Doesn't understand semantic meaning
 * - Can miss relevant results with different wording
 * - No understanding of word order
 */
class SparseRetrieval {
  constructor(books) {
    this.books = books;
    this.tfidf = new TfIdf();
    this.initializeTfIdf();
  }

  /**
   * Preprocesses text for better matching
   * @param {string} text - Text to preprocess
   * @returns {string} - Preprocessed text
   */
  preprocessText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Remove punctuation
      .replace(/\s+/g, ' ')      // Normalize whitespace
      .trim();
  }

  /**
   * Initializes TF-IDF with book content
   * @private
   */
  initializeTfIdf() {
    this.books.forEach((book, idx) => {
      // Combine general description and personal review if available
      let content = book.descriptions.general;
      if (book.descriptions.personal_review?.content) {
        content += ' ' + book.descriptions.personal_review.content;
      }
      this.tfidf.addDocument(this.preprocessText(content));
    });
  }

  /**
   * Finds relevant books based on query
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @param {number} options.limit - Max results to return (default: 5)
   * @returns {SearchResult[]} - Ranked search results
   */
  findRelevantBooks(query, { limit = 5 } = {}) {
    const processedQuery = this.preprocessText(query);
    
    // Calculate TF-IDF scores for the query
    const results = [];
    this.tfidf.tfidfs(processedQuery, (idx, score) => {
      if (score > 0) {  // Only include non-zero scores
        const book = this.books[idx];
        results.push({
          book,
          score: score / (1 + score),  // Normalize to 0-1 range
          matchedOn: 'description'  // Could be enhanced to show where match occurred
        });
      }
    });

    // Sort by score and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

module.exports = SparseRetrieval; 