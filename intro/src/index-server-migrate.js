import { checkEnvironment } from './utils.js';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

checkEnvironment();

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
    const response = await fetch('/api/gift', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userPrompt }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data.message);

    const giftSuggestions = data.message;

    if (giftSuggestions) {
      responseElement.innerHTML = DOMPurify.sanitize(marked.parse(giftSuggestions));
    }
  } catch (error) {
    errorSection.style.display = 'block';

    let message = '';
    if (error.status === 401 || error.status === 403) {
      message = 'Authentication error: Check your AI_KEY and make sure it’s valid.';
    } else if (error.status >= 500) {
      message = 'AI provider error: Something went wrong on the provider side. Try again shortly.';
    } else {
      message = 'Unexpected error: ' + (error.message || error);
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

const prompt = 'gift ideas for a 7 year old arsenal fan';
