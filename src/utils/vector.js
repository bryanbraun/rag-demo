/**
 * Vector similarity utilities for dense retrieval
 */

/**
 * Calculates the cosine similarity between two vectors
 * @param {number[]} vec1 - First vector
 * @param {number[]} vec2 - Second vector
 * @returns {number} - Similarity score between 0 and 1
 */
function cosineSimilarity(vec1, vec2) {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i]; // vec1 squared
    norm2 += vec2[i] * vec2[i]; // vec2 squared
  }

  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);

  return dotProduct / (norm1 * norm2);
}

module.exports = {
  cosineSimilarity
}; 