/**
 * Dataset Testing Script
 * 
 * Purpose:
 * This script validates and analyzes the enhanced dataset by:
 * 1. Checking data structure integrity
 * 2. Generating dataset statistics
 * 3. Validating content extraction
 * 4. Providing sample data for inspection
 * 
 * When to use:
 * 1. After running enhance-dataset.js
 * 2. Before generating embeddings
 * 3. When debugging data processing issues
 * 4. To get dataset statistics
 * 
 * Usage:
 * node src/scripts/test-dataset.js
 * 
 * Output includes:
 * - Total number of books
 * - Books with reviews vs. general descriptions
 * - Average ratings
 * - Sample book structure
 * - Content extraction validation
 */

const fs = require('fs');
const path = require('path');

/**
 * Tests and validates the enhanced dataset
 * Provides detailed statistics and sample data
 */
function testEnhancedDataset() {
  const dataPath = path.join(__dirname, '../data/processed/enhanced-books.json');
  
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Basic statistics
    const totalBooks = data.books.length;
    const booksWithReviews = data.books.filter(b => b.descriptions.personal_review).length;
    const booksWithGeneralDesc = data.books.filter(b => b.descriptions.general).length;
    const booksWithEmbeddings = data.books.filter(b => b.embeddings?.general || b.embeddings?.personal).length;
    const averageRating = data.books
      .filter(b => b.descriptions.personal_review?.rating)
      .reduce((acc, book) => acc + book.descriptions.personal_review.rating, 0) / booksWithReviews;

    console.log('\nDataset Statistics:');
    console.log('------------------');
    console.log(`Total books: ${totalBooks}`);
    console.log(`Books with personal reviews: ${booksWithReviews}`);
    console.log(`Books with general descriptions: ${booksWithGeneralDesc}`);
    console.log(`Books with embeddings: ${booksWithEmbeddings}`);
    console.log(`Average rating: ${averageRating.toFixed(2)}/5`);
    
    // Validate data structure
    console.log('\nValidating data structure...');
    const sampleBook = data.books[0];
    console.log('Sample book structure:');
    // console.log(JSON.stringify(sampleBook, null, 2));

    // Test content extraction
    console.log('\nContent Extraction Test:');
    console.log('------------------------');
    const bookWithReview = data.books.find(b => b.descriptions.personal_review);
    if (bookWithReview) {
      console.log(`Book: ${bookWithReview.title}`);
      console.log('Review content sample (first 150 chars):');
      console.log(bookWithReview.descriptions.personal_review.content.slice(0, 150) + '...');
      console.log(`Content length: ${bookWithReview.descriptions.personal_review.content.length} chars`);
    }
  } catch (error) {
    console.error('Error testing dataset:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  console.log('Starting dataset testing...');
  testEnhancedDataset();
} 