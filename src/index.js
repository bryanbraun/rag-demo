const { loadDataset, retrieveRelevantBooks } = require('./retrieval');
const { generateRecommendations } = require('./generation');
const readlineSync = require('readline-sync');

async function main() {
  // Load the dataset of book descriptions
  const dataset = loadDataset();

  // Prompt the user to enter a query
  const query = readlineSync.question('Enter a query to get book recommendations: ');

  // Retrieve the most relevant books based on the query
  const relevantBooks = retrieveRelevantBooks(query, dataset);

  // If no relevant books are found, inform the user and exit
  if (relevantBooks.length === 0) {
    console.log('No relevant books found.');
    return;
  }

  // Prepare the context for the OpenAI API by combining the descriptions of the relevant books
  const context = relevantBooks.map(book => `${book.title} by ${book.author}: ${book.description}`).join('\n\n');

  // Generate a book recommendation based on the context
  const recommendation = await generateRecommendations(context);

  // Display the top 3 relevant books
  console.log('\nTop 3 relevant books:');
  relevantBooks.forEach((book, index) => {
    console.log(`${index + 1}. ${book.title} by ${book.author}`);
    console.log(`   Description: ${book.description}\n`);
  });

  // Display the generated recommendation
  console.log('Generated Recommendation:');
  console.log(recommendation);
}

// Run the main function if the script is executed directly
if (require.main === module) {
  main().catch(console.error);
}