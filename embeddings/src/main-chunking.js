import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import './style.css';

async function splitDocument() {
  const response = await fetch('/src/podcast.txt');
  const text = await response.text();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 150,
    chunkOverlap: 15, // aim for 10% overlap
  });

  const chunks = await splitter.createDocuments([text]);
  console.log(chunks);
}

splitDocument();
