/**
 * Dataset Enhancement Script
 * 
 * Purpose:
 * This script combines and enhances the raw book data by:
 * 1. Merging general book descriptions with personal reviews
 * 2. Extracting structured data (ratings, dates, etc.)
 * 3. Cleaning and formatting content
 * 4. Preparing the data structure for embedding generation
 * 
 * When to use:
 * 1. After updating raw book data (books.json)
 * 2. After adding new personal reviews (reviews.json)
 * 3. When changing the data structure or extraction logic
 * 
 * Input files:
 * - src/data/raw/books.json: General book information
 * - src/data/raw/reviews.json: Personal book reviews
 * 
 * Output:
 * - src/data/processed/enhanced-books.json: Combined and structured dataset
 * 
 * Data Structure:
 * {
 *   books: [{
 *     id: string,
 *     title: string,
 *     author: string,
 *     metadata: {
 *       publicationYear: number|null,
 *       genres: string[],
 *       pageCount: number|null
 *     },
 *     descriptions: {
 *       general: string|null,
 *       personal_review: {
 *         rating: number|null,
 *         date_read: string|null,
 *         content: string,
 *         raw_html: string
 *       }|null
 *     },
 *     embeddings: {
 *       general: number[]|null,
 *       personal: number[]|null
 *     }
 *   }]
 * }
 */

const fs = require('fs');
const path = require('path');

// Utility function to extract rating from review content
function extractRating(content) {
  const ratingMatch = content.match(/Rating:\s*(\d+)\/5/);
  return ratingMatch ? parseInt(ratingMatch[1]) : null;
}

// Utility function to extract author from HTML content
function extractAuthor(contentHtml) {
  const authorMatch = contentHtml.match(/<p>Author:\s*([^<]+)<\/p>/);
  return authorMatch ? authorMatch[1].trim() : null;
}

// New function to extract clean review content
function extractReviewContent(contentHtml) {
  // Remove HTML tags
  let content = contentHtml
    .replace(/<p>Author:.*?<\/p>/g, '')  // Remove author line
    .replace(/<p>Rating:.*?<\/p>/g, '')  // Remove rating line
    .replace(/<\/?[^>]+(>|$)/g, '')      // Remove remaining HTML tags
    .replace(/\s+/g, ' ')                // Normalize whitespace
    .trim();
  
  return content;
}

/**
 * Main function to enhance the dataset
 * Combines and processes book data from multiple sources
 */
async function enhanceDataset() {
  try {
    // Load raw data
    const booksPath = path.join(__dirname, '../data/raw/books.json');
    const reviewsPath = path.join(__dirname, '../data/raw/reviews.json');
    
    const generalBooks = JSON.parse(fs.readFileSync(booksPath, 'utf8'));
    const personalReviews = JSON.parse(fs.readFileSync(reviewsPath, 'utf8'));

    // Create lookup map for faster matching
    const bookMap = new Map(generalBooks.map(book => [book.title.toLowerCase(), book]));
    
    // Enhanced dataset array
    const enhancedBooks = [];
    
    // Process each book
    for (const book of generalBooks) {
      const enhancedBook = {
        id: book.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: book.title,
        author: book.author,
        metadata: {
          publicationYear: null,  // To be filled if available
          genres: [],            // To be filled if available
          pageCount: null        // To be filled if available
        },
        descriptions: {
          general: book.description,
          personal_review: null
        },
        embeddings: {
          general: null,
          personal: null
        }
      };

      // Look for matching personal review
      const review = personalReviews.find(r => 
        r.title.toLowerCase() === book.title.toLowerCase()
      );

      if (review) {
        enhancedBook.descriptions.personal_review = {
          rating: extractRating(review.content_html),
          date_read: review.date_published,
          content: extractReviewContent(review.content_html),  // Now contains actual review text
          raw_html: review.content_html  // Keep raw HTML for reference/display
        };
      }

      enhancedBooks.push(enhancedBook);
    }

    // Add books from personal reviews that weren't in the general dataset
    for (const review of personalReviews) {
      if (!bookMap.has(review.title.toLowerCase())) {
        const newBook = {
          id: review.id.replace('/books/', ''),
          title: review.title,
          author: extractAuthor(review.content_html),
          metadata: {
            publicationYear: null,
            genres: [],
            pageCount: null
          },
          descriptions: {
            general: null,
            personal_review: {
              rating: extractRating(review.content_html),
              date_read: review.date_published,
              content: extractReviewContent(review.content_html),  // Now contains actual review text
              raw_html: review.content_html
            }
          },
          embeddings: {
            general: null,
            personal: null
          }
        };
        enhancedBooks.push(newBook);
      }
    }

    // Save enhanced dataset
    const outputPath = path.join(__dirname, '../data/processed/enhanced-books.json');
    fs.writeFileSync(
      outputPath, 
      JSON.stringify({ books: enhancedBooks }, null, 2)
    );

    console.log(`Enhanced dataset created with ${enhancedBooks.length} books`);
    console.log(`- Books with general descriptions: ${enhancedBooks.filter(b => b.descriptions.general).length}`);
    console.log(`- Books with personal reviews: ${enhancedBooks.filter(b => b.descriptions.personal_review).length}`);

  } catch (error) {
    console.error('Error enhancing dataset:', error);
  }
}

// Command-line interface
if (require.main === module) {
  console.log('Starting dataset enhancement...');
  enhanceDataset().then(() => {
    console.log('Dataset enhancement complete!');
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { enhanceDataset }; 