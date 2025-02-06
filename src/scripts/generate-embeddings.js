/**
 * Embedding Generation Script
 * 
 * Purpose:
 * This script generates and stores embeddings for book descriptions and reviews.
 * Embeddings are vector representations of text that enable semantic search
 * capabilities. They are stored alongside the book data and used by the dense
 * retrieval system.
 * 
 * When to use:
 * 1. After initial dataset creation (enhance-dataset.js)
 * 2. After adding new books to the dataset
 * 3. If you want to regenerate embeddings (e.g., after changing the embedding model)
 * 
 * Usage:
 * 1. Basic (only generates missing embeddings):
 *    node src/scripts/generate-embeddings.js
 * 
 * 2. Force regenerate all embeddings:
 *    node src/scripts/generate-embeddings.js --force
 * 
 * Environment Variables:
 * - OPENAI_API_KEY: Required. Your OpenAI API key for generating embeddings
 * 
 * Cost Considerations:
 * - Uses OpenAI's text-embedding-3-small model
 * - Current cost: $0.0001 per 1K tokens
 * - Average cost per book: ~$0.00004 (assuming 200 tokens per text)
 * 
 * Output:
 * - Updates enhanced-books.json with embedding vectors
 * - Provides progress updates and final statistics
 * - Estimates API usage cost
 */

const fs = require('fs').promises;
const path = require('path');
const EmbeddingService = require('../services/embedding');
const PerformanceMonitor = require('../utils/performance');

/**
 * Generates and stores embeddings for all books in the dataset
 * 
 * Features:
 * - Generates embeddings for both general descriptions and personal reviews
 * - Saves progress regularly to prevent data loss
 * - Skips existing embeddings unless forced to regenerate
 * - Provides detailed progress and cost information
 * 
 * @returns {Promise<void>}
 */
async function generateAndStoreEmbeddings() {
  console.log('Starting embedding generation...');
  const monitor = new PerformanceMonitor();
  
  try {
    // Load books
    const booksPath = path.join(__dirname, '../data/processed/enhanced-books.json');
    const data = JSON.parse(await fs.readFile(booksPath, 'utf8'));
    const books = data.books;

    // Initialize embedding service
    const embeddingService = new EmbeddingService(process.env.OPENAI_API_KEY);
    
    // Track statistics
    let totalEmbeddings = 0;
    let skippedEmbeddings = 0;
    
    // Process each book
    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      console.log(`\nProcessing book ${i + 1}/${books.length}: ${book.title}`);
      
      if (!book.embeddings) {
        book.embeddings = {};
      }

      // Generate general description embedding
      if (!book.embeddings.general && book.descriptions.general) {
        console.log('  Generating general description embedding...');
        book.embeddings.general = await embeddingService.generateEmbedding(
          book.descriptions.general
        );
        totalEmbeddings++;
      } else if (book.embeddings.general) {
        console.log('  General description embedding already exists');
        skippedEmbeddings++;
      }

      // Generate personal review embedding
      if (!book.embeddings.personal && book.descriptions.personal_review?.content) {
        console.log('  Generating personal review embedding...');
        book.embeddings.personal = await embeddingService.generateEmbedding(
          book.descriptions.personal_review.content
        );
        totalEmbeddings++;
      } else if (book.embeddings.personal) {
        console.log('  Personal review embedding already exists');
        skippedEmbeddings++;
      }

      // Save progress regularly to prevent data loss from interruptions
      if (i % 5 === 0 || i === books.length - 1) {
        console.log('\nSaving progress...');
        await fs.writeFile(
          booksPath,
          JSON.stringify({ books }, 2)
        );
      }
    }

    const metrics = monitor.getMetrics();
    
    // Display final statistics
    console.log('\nEmbedding Generation Complete!');
    console.log('------------------------------');
    console.log(`Total books processed: ${books.length}`);
    console.log(`New embeddings generated: ${totalEmbeddings}`);
    console.log(`Existing embeddings skipped: ${skippedEmbeddings}`);
    console.log(`Total time: ${metrics.timeMs}ms`);
    console.log(`Memory used: ${metrics.memoryMB}MB`);
    
    // Calculate and display cost estimate
    const avgTokensPerText = 200; // rough estimate
    const costPer1kTokens = 0.0001; // current OpenAI embedding cost
    const estimatedCost = (totalEmbeddings * avgTokensPerText * costPer1kTokens) / 1000;
    console.log(`Estimated API cost: $${estimatedCost.toFixed(4)}`);

  } catch (error) {
    console.error('Error generating embeddings:', error);
    process.exit(1);
  }
}

// Command-line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const forceRegenerate = args.includes('--force');
  
  // Validate environment
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is required');
    console.error('Please set it with: export OPENAI_API_KEY=your-key-here');
    process.exit(1);
  }

  // Display mode
  if (forceRegenerate) {
    console.log('Force regenerate flag detected - will regenerate all embeddings');
    console.log('Warning: This will use more API calls and increase costs');
  } else {
    console.log('Running in normal mode - will only generate missing embeddings');
  }
  
  generateAndStoreEmbeddings().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { generateAndStoreEmbeddings }; 