/**
 * Retrieval Comparison Script
 * 
 * Purpose:
 * This script compares different book retrieval approaches:
 * 1. Sparse Retrieval (TF-IDF based)
 * 2. Dense Retrieval (Embedding based)
 * 
 * When to use:
 * 1. To test search quality
 * 2. To compare retrieval performance
 * 3. To debug retrieval issues
 * 4. To demonstrate different search approaches
 * 
 * Usage:
 * 1. Basic search:
 *    node src/scripts/compare-retrieval.js "your search query"
 * 
 * 2. Default query (if none provided):
 *    node src/scripts/compare-retrieval.js
 * 
 * Environment Variables:
 * - OPENAI_API_KEY: Required for dense retrieval
 * 
 * Output includes:
 * - Initialization time
 * - Results from both approaches
 * - Performance metrics (time, memory usage)
 * - Relevance scores
 */

const SparseRetrieval = require('../retrieval/sparse');
const DenseRetrieval = require('../retrieval/dense');
const EmbeddingService = require('../services/embedding');
const PerformanceMonitor = require('../utils/performance');

/**
 * Compares sparse and dense retrieval approaches
 * @param {string} query - Search query
 */
async function compareApproaches(query) {
  // Load books data
  const books = require('../data/processed/enhanced-books.json').books;
  
  // Initialize retrievers
  console.log('Initializing retrievers...');
  const initMonitor = new PerformanceMonitor();
  
  const sparseRetrieval = new SparseRetrieval(books);
  const denseRetrieval = new DenseRetrieval();
  
  const initMetrics = initMonitor.getMetrics();
  console.log(`Initialization took ${initMetrics.timeMs}ms\n`);

  console.log(`Query: "${query}"\n`);

  // Test sparse retrieval
  console.log('Sparse Retrieval Results:');
  const sparseMonitor = new PerformanceMonitor();
  const sparseResults = sparseRetrieval.findRelevantBooks(query);
  const sparseMetrics = sparseMonitor.getMetrics();
  
  sparseResults.forEach((result, i) => {
    console.log(`${i + 1}. ${result.book.title} (Score: ${result.score.toFixed(3)})`);
  });
  console.log(`Time: ${sparseMetrics.timeMs}ms`);
  console.log(`Memory: ${sparseMetrics.memoryMB}MB`);

  // Test dense retrieval 1
  console.log('\nDense Retrieval Results (general):');
  const denseMonitor1 = new PerformanceMonitor();
  const denseResults1 = await denseRetrieval.search(query);
  const denseMetrics1 = denseMonitor1.getMetrics();
  
  denseResults1.forEach((result, i) => {
    console.log(`${i + 1}. ${result.title} (Score: ${result.similarity.toFixed(3)})`);
  });
  console.log(`Time: ${denseMetrics1.timeMs}ms`);
  console.log(`Memory: ${denseMetrics1.memoryMB}MB`);

  // Test dense retrieval 12
  console.log('\nDense Retrieval Results (personal):');
  const denseMonitor2 = new PerformanceMonitor();
  const denseResults2 = await denseRetrieval.search(query, { type: 'personal' });
  const denseMetrics2 = denseMonitor2.getMetrics();
  
  denseResults2.forEach((result, i) => {
    console.log(`${i + 1}. ${result.title} (Score: ${result.similarity.toFixed(3)})`);
  });
  console.log(`Time: ${denseMetrics2.timeMs}ms`);
  console.log(`Memory: ${denseMetrics2.memoryMB}MB`);
}

// Command-line interface
if (require.main === module) {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  const query = process.argv[2] || 'books about learning and personal growth';
  console.log('Starting retrieval comparison...');
  compareApproaches(query).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { compareApproaches }; 