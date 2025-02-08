const DenseRetrieval = require('./retrieval/dense');
const books = require('./data/processed/enhanced-books.json').books;

const { generateRecommendations } = require('./generation');
const readlineSync = require('readline-sync');

async function main() {
  // Prompt the user to enter a query
  const query = readlineSync.question('Enter a query to get book recommendations: ');

  // Retrieve the most relevant books based on the query
  const denseRetrieval = new DenseRetrieval();
  const denseResults = await denseRetrieval.search(query, { limit: 3, type: 'personal' });

  // If no relevant books are found, inform the user and exit
  if (denseResults.length === 0) {
    console.log('No relevant books found.');
    return;
  }

  // Generate a book recommendation based on the context
  const recommendation = await generateRecommendations(query, denseResults);

  // Display the generated recommendation
  console.log('Generated Recommendation:');
  console.log(recommendation);
}

// Run the main function if the script is executed directly
if (require.main === module) {
  main().catch(console.error);
}