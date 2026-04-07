import './style.css';
import { checkEnvironment } from './utils.js';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
// import DOMPurify from 'dompurify';
// import { marked } from 'marked';

checkEnvironment();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const privateKey = process.env.SUPABASE_API_KEY;
if (!privateKey) throw new Error(`Expected env var SUPABASE_API_KEY`);
const url = process.env.SUPABASE_URL;
if (!url) throw new Error(`Expected env var SUPABASE_URL`);

const supabase = createClient(url, privateKey);

export const content = [
  'Beyond Mars (1 hr 15 min): Join space enthusiasts as they speculate about extraterrestrial life and the mysteries of distant planets.',
  'Jazz under stars (55 min): Experience a captivating night in New Orleans, where jazz melodies echo under the moonlit sky.',
  'Mysteries of the deep (1 hr 30 min): Dive with marine explorers into the uncharted caves of our oceans and uncover their hidden wonders.',
  'Rediscovering lost melodies (48 min): Journey through time to explore the resurgence of vinyl culture and its timeless appeal.',
  'Tales from the tech frontier (1 hr 5 min): Navigate the complex terrain of AI ethics, understanding its implications and challenges.',
  "The soundscape of silence (30 min): Traverse the globe with sonic explorers to find the world's most serene and silent spots.",
  'Decoding dreams (1 hr 22 min): Step into the realm of the subconscious, deciphering the intricate narratives woven by our dreams.',
  'Time capsules (50 min): Revel in the bizarre, endearing, and profound discoveries that unveil the quirks of a century past.',
  'Frozen in time (1 hr 40 min): Embark on an icy expedition, unearthing secrets hidden within the majestic ancient glaciers.',
  'Songs of the Sea (1 hr): Dive deep with marine biologists to understand the intricate whale songs echoing in our vast oceans.',
];

async function createAndStoreEmbeddings(input, dbName) {
  try {
    const data = await Promise.all(
      input.map(async (textChunk) => {
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: textChunk.pageContent || textChunk, // Handle both string and object with pageContent
        });
        return { content: textChunk.pageContent, embedding: embeddingResponse.data[0].embedding };
      }),
    );

    // Insert content and embedding into Supabase
    const { error } = await supabase.from(dbName).insert(data);

    if (error) {
      throw new Error('Issue inserting data into the database.');
    }
  } catch (error) {
    console.error('Error creating or storing embeddings:', error.message);
  }
  console.log('Embedding and storing complete!');
}

// const seeder = async (text, dbName) => {
await createAndStoreEmbeddings(text, dbName);
// };

export { createAndStoreEmbeddings };
