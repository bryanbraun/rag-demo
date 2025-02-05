const OpenAI = require('openai');

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate book recommendations
// This function generates a book recommendation based on the provided context (retrieved book descriptions).
async function generateRecommendations(context) {
  const prompt = `Based on the following book descriptions, recommend a book:\n\n${context}\n\nRecommendation:`;

  // Send a request to the OpenAI API to generate a recommendation
  // The prompt includes the locally-generated context and asks the model to recommend a book.
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 100,
    temperature: 0.7,
  });

  // Log various metrics around the prompt and openai response
  console.log(`Prompt size: ${prompt.length} characters`);
  console.log(`Response size: ${response.choices[0].message.content.length} characters`);
  console.log(`Tokens used: ${response.usage.total_tokens}`);
  console.log(`  prompt_tokens: ${response.usage.prompt_tokens}`);
  console.log(`  completion_tokens: ${response.usage.completion_tokens}`);

  return response.choices[0].message.content.trim();
}

module.exports = {
  generateRecommendations,
};