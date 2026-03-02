import { checkEnvironment } from './utils.js';
import OpenAI from 'openai';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { chatAPISchema, responsesAPISchema } from './schema.js';

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

const systemPrompt = `You are the Gift Genie that can search the web! 

You generate gift ideas that feel thoughtful, specific, and genuinely useful.
Your output must be in structured Markdown.
Do not write introductions or conclusions.
Start directly with the gift suggestions.

Each gift must:
- Have a clear heading with the actual product's name
- Include a short explanation of why it works
- Include the current price or a price range
- Include one or more links to websites or social media business pages
where the gift can be bought

Prefer products that are widely available and well-reviewed.
If you can't find a working link, say so rather than guessing.

If the user mentions a location, situation, or constraint,
adapt the gift ideas and add another short section 
under each gift that guides the user to get the gift in that 
constrained context.

After the gift ideas, include a section titled "Questions for you"
with clarifying questions that would help improve the recommendations.

Finish with a section with H2 heading titled "Wanna browse yourself?"
with links to various ecommerce sites with relevant search queries and filters 
already applied.`;

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
    // const response = await openai.chat.completions.create({
    //   model: process.env.AI_MODEL,
    //   messages: [
    //     {
    //       role: 'user',
    //       content: userPrompt,
    //     },
    //   ],
    //   response_format: chatAPISchema,
    // });

    const response = await openai.responses.create({
      model: process.env.AI_MODEL,
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      tools: [{ type: 'web_search' }],
    });

    const giftSuggestions = response.output_text;

    if (giftSuggestions) {
      responseElement.innerHTML = DOMPurify.sanitize(marked.parse(giftSuggestions));
    }
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

const prompt = 'gift ideas for a 7 year old arsenal fan';
