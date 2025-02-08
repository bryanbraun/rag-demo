/**
 * Structured Context Builder
 * 
 * Specifically designed for personal book recommendations by:
 * 1. Prioritizing personal reviews
 * 2. Including ratings and reading dates
 * 3. Emphasizing highly-rated books
 * 4. Providing temporal context of reading history
 */
class ContextBuilder {
  /**
   * Builds structured context from search results
   * @param {string} query - Original search query
   * @param {Object[]} results - Combined results from retrieval
   * @param {Object} options - Context building options
   * @returns {string} - Formatted context for LLM
   */
  buildContext(query, results, { maxResults = 3 } = {}) {
    const topResults = results.slice(0, maxResults);
    
    return `
You are helping me find my next book to read. I'm providing context about books I've previously read and enjoyed.

Search Query: "${query}"

Here are the most relevant books from my reading history, with my personal reviews and ratings:

${topResults.map((result, index) => this.formatBookEntry(result, index + 1)).join('\n\n')}

Based on these examples, especially focusing on my personal reviews and ratings, recommend a book that I would enjoy. 
Explain your recommendation, referencing specific patterns in my reading preferences.
`.trim();
  }

  /**
   * Formats a single book entry with available information
   * @private
   */
  formatBookEntry(result, index) {
    const { book, relevance } = result;
    const review = book.descriptions.personal_review;
    
    let entry = `${index}. ${book.title} by ${book.author}
   Relevance Score: ${relevance.toFixed(3)}`;

    // Prioritize personal review if available
    if (review) {
      entry += `
   My Rating: ${review.rating}/5
   Read on: ${new Date(review.date_read).toLocaleDateString()}
   My Review: ${review.content}`;
    }

    // Add general description only if no personal review or if it adds value
    if (book.descriptions.general && (!review || book.descriptions.general.length < 200)) {
      entry += `
   General Description: ${book.descriptions.general}`;
    }

    return entry;
  }
}

module.exports = ContextBuilder; 