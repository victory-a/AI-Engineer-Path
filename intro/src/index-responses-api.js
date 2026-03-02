import { checkEnvironment } from './utils.js';
import OpenAI from 'openai';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

checkEnvironment();

const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
  dangerouslyAllowBrowser: true,
});

const promptElement = document.getElementById('user-prompt');
const responseElement = document.getElementById('response');
const errorSection = document.getElementById('error');
const errorElement = document.getElementById('error-text');
const submitBtn = document.getElementById('submit-btn');

async function callLLM() {
  const userPrompt = promptElement.value;

  if (!userPrompt.trim()) {
    alert('Please enter a prompt');
    return;
  }

  responseElement.textContent = '';
  errorSection.style.display = 'none';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Generating...';

  try {
    const response = await openai.responses.create({
      model: process.env.AI_MODEL,
      // stream: true,
      // temperature: 1,
      // top_p: 0.5,
      input: `Suggest 3 gifts for a coffee lover.`,
    });

    let fullResponse = '';
    fullResponse = response.output_text;
    responseElement.innerHTML = DOMPurify.sanitize(marked.parse(fullResponse));
  } catch (error) {
    errorSection.style.display = 'block';

    let message = '';
    if (error.status === 401 || error.status === 403) {
      message = 'Authentication error: Check your AI_KEY and make sure it’s valid.';
      console.error('Authentication error: Check your AI_KEY and make sure it’s valid.');
    } else if (error.status >= 500) {
      message = 'AI provider error: Something went wrong on the provider side. Try again shortly.';
      console.error('AI provider error: Something went wrong on the provider side. Try again shortly.');
    } else {
      message = 'Unexpected error: ' + (error.message || error);
      console.error('Unexpected error:', error.message || error);
    }

    errorElement.textContent = message;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
}

submitBtn.addEventListener('click', callLLM);
promptElement.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    callLLM();
  }
});
