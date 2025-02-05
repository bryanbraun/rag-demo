const fs = require('fs');
const natural = require('natural');
const { TfIdf } = natural;

// Load the dataset from the JSON file
// This function reads the book descriptions from a JSON file and parses it into a JavaScript object.
function loadDataset() {
  const data = fs.readFileSync('./data/books.json');
  return JSON.parse(data);
}

// Perform TF-IDF based retrieval
// This function uses the TF-IDF (Term Frequency-Inverse Document Frequency) algorithm to find the most relevant book descriptions based on the user's query.
function retrieveRelevantBooks(query, dataset) {
  const tfidf = new TfIdf();

  // Add each book description to the TF-IDF model
  // The TF-IDF model is built by adding each book's description as a document.
  dataset.forEach(book => {
    tfidf.addDocument(book.description);
  });

  // Find the most relevant book descriptions based on the query
  // The TF-IDF model is used to calculate the relevance score of each document (book description) with respect to the query.
  const results = [];
  tfidf.tfidfs(query, (i, measure) => {
    results.push({ book: dataset[i], score: measure });
  });

  // Sort results by relevance score in descending order
  // The results are sorted so that the most relevant book descriptions appear first.
  results.sort((a, b) => b.score - a.score);

  // Return the top 3 most relevant books
  // Only the top 3 most relevant books are returned.
  return results.slice(0, 3).map(result => result.book);
}

module.exports = {
  loadDataset,
  retrieveRelevantBooks
};