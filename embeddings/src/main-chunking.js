import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { createAndStoreEmbeddings } from './seeder.js';
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

/* Create an embedding from each text chunk.
Store all embeddings and corresponding text in Supabase. */
async function createAndStoreEmbeddings() {
  try {
    const chunkData = await splitDocument('/src/movies.txt');

    await createAndStoreEmbeddings(chunkData, 'movies');
  } catch (error) {
    console.error('Error creating or storing embeddings:', error.message);
  }
  console.log('SUCCESS!');
}

createAndStoreEmbeddings();
