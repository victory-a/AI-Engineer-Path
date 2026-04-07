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
    const response = await fetch(process.env.API_PROXY_TARGET, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userPrompt }),
    });

    if (!response.body) {
      throw new Error('Streaming is not supported in this browser.');
    }

    if (response.ok) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let giftSuggestions = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        giftSuggestions += decoder.decode(value, { stream: true });
        responseElement.innerHTML = DOMPurify.sanitize(marked.parse(giftSuggestions));
      }

      giftSuggestions += decoder.decode(); // flush what may be left in the buffer
      if (giftSuggestions) {
        responseElement.innerHTML = DOMPurify.sanitize(marked.parse(giftSuggestions));
      }
    } else {
      const errorText = await response.text();
      throw new Error(errorText);
    }
  } catch (error) {
    errorSection.style.display = 'block';

    errorElement.textContent = 'Unexpected error: ' + error;
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

const defaultPrompt = 'gift ideas for a 7 year old arsenal fan';
``;
