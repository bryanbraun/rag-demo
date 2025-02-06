/**
 * @typedef {Object} Book
 * @property {string} id - Unique identifier
 * @property {string} title - Book title
 * @property {string} author - Book author
 * @property {Object} descriptions
 * @property {string} descriptions.general - General book description
 * @property {Object} [descriptions.personal_review] - Personal review if available
 * @property {Object} [embeddings] - Book embeddings (added during processing)
 */

/**
 * @typedef {Object} SearchResult
 * @property {Book} book - The matched book
 * @property {number} score - Similarity/relevance score (0-1)
 * @property {string} matchedOn - What matched ('description', 'review', or 'both')
 */

module.exports = {
  // These are just for TypeScript-like documentation
  // No actual code needed here
}; 