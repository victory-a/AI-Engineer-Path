import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { createAndStoreEmbeddings, createEmbedding } from './seeder.js';
import { openai, supabase } from './config.js';
import './style.css';

async function splitDocument(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 150,
      chunkOverlap: 15, // aim for 10% overlap
    });

    const chunks = await splitter.createDocuments([text]);
    return chunks;
  } catch (error) {
    console.error('Error fetching or splitting document:', error);
    throw error;
  }
}

// Query Supabase and return a semantically matching text chunk
async function findNearestMatch(embedding) {
  try {
    const { data } = await supabase.rpc('match_movies', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 1,
    });
    return data[0].content;
  } catch (error) {
    console.error('Error querying Supabase:', error);
    throw error;
  }
}

async function getChatResponse(context, question) {
  const chatMessages = [
    {
      role: 'system',
      content: `You are an enthusiastic movie expert who loves recommending movies to people. You will be given two pieces of information - some context about movies and a question. Your main job is to formulate a short answer to the question using the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.`,
    },
  ];

  chatMessages.push({ role: 'user', content: `Context: ${context}\n\nQuestion: ${question}` });

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: chatMessages,
    temperature: 0.5,
    frequency_penalty: 0.5,
  });

  console.log(response.choices[0].message.content);
}

const query = 'Which movie can i take my child to';

async function main(input) {
  // run these lines only the first time to create and store embeddings for the movies document
  // const chunkData = await splitDocument('/src/movies.txt');
  // createAndStoreEmbeddings(chunkData, 'movies');

  const embedding = await createEmbedding(input);
  const match = await findNearestMatch(embedding);

  await getChatResponse(match, input);
}

main(query);
