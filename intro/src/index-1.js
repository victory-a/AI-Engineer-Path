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

const initialMessage = [
  {
    role: 'system',
    content: `You are the Gift Genie!
    Make your gift suggestions thoughtful and practical.
    The user will describe the gift's recipient. 
    Your response must be in structured Markdown.
    Each gift must: 
      - Have a clear heading
      - A short explanation of why it would work

    If the user mentions a location or a time constraint,
    add another section under each gift that gives the user 
    a step by step guide on where and how they can get the gift.

    Skip intros and conclusions. 
    Only output gift suggestions.
    
    End with a section with an H2 heading titled "Questions for you" 
    that contains follow-ups that would help improve the 
    gift suggestions`,
  },
  {
    role: 'user',
    content: 'dubai airport. last minute gifts for niece (arts & crafts) and nephew who loves football',
  },
  {
    role: 'assistant',
    content: `
### Travel Art Kit for Niece (Compact & Portable)

A small, kid-friendly arts & crafts item that's easy to pack and perfect for a quick creative distraction during travel.

**How to get it:**
1. Head to Dubai International Airport (DXB) and proceed to Terminal 3 Departures.
2. Visit Dubai Duty Free or a nearby WHSmith that carries kids’ stationery.
3. Ask for compact arts & crafts kits or a coloring book with pencils.
4. Choose a lightweight option suitable for carry-on.
5. Request gift wrapping if available.

---

### Mini Football Keychain for Nephew

A light, inexpensive football-themed souvenir that’s easy to carry and perfect for an airport purchase.

**How to get it:**
1. Visit Dubai Duty Free or a souvenir shop near the gates.
2. Ask for football-themed keychains or small sports souvenirs.
3. Check toy or sports sections if needed.
4. Purchase and pack securely.

---

## Questions for you
1. What are the ages of your niece and nephew?
2. Do you have a budget per gift?
3. Are you departing from Terminal 3?
4. Does your nephew support a specific team?
`,
  },
  {
    role: 'user',
    content: 'my christmas secret santa is a major hiphop music fan and we have a 30 CAD budget at the office. week left. I have Amazon prime.',
  },
  {
    role: 'assistant',
    content: `
### Hip-Hop Coffee Table Book (Artists, Lyrics, or Culture)

A well-designed book on hip-hop history, iconic albums, or legendary artists works as a tasteful office-friendly gift that still feels personal to a serious fan.

**How to get it:**

1. Open Amazon and make sure you’re on Amazon.ca.
2. Search for titles like *“hip hop coffee table book”*, *“hip hop history book”*, or *“rap album art book”*.
3. Filter by **Prime eligible** and price under **30 CAD**.
4. Check delivery date to ensure arrival within a week.
5. Order hardcover if available for a more premium feel.

---

### Vinyl-Style Hip-Hop Wall Art or Poster

Minimalist prints featuring classic hip-hop albums, artists, or lyric typography fit well in an office or home setup without being gimmicky.

**How to get it:**

1. Search Amazon for *“hip hop wall art”* or *“rap album poster minimalist”*.
2. Filter by **Prime** and size (A3 or smaller is safer for offices).
3. Read reviews to ensure print quality.
4. Order unframed to stay within budget, or framed if still under 30 CAD.
5. Consider neutral designs if office taste is conservative.

---

### High-Quality Hip-Hop Graphic Tee (Low-Key Design)

A subtle, well-designed T-shirt referencing a classic artist or era is practical and personal without being loud.

**How to get it:**

1. Search *“hip hop graphic t shirt”* or specific artists (e.g., Nas, Wu-Tang, Kendrick).
2. Filter by **Prime** and check size availability.
3. Look for neutral colors (black, grey, off-white).
4. Check material and reviews for print durability.
5. Order one size up if unsure.

---

### Hip-Hop Lyric Mug or Desk Accessory

A mug or desk item featuring iconic lyrics or album references works well as a daily-use office gift.

**How to get it:**

1. Search *“hip hop lyric mug”* or *“rap quote mug”* on Amazon.
2. Filter Prime-only and check delivery date.
3. Avoid novelty fonts; choose clean typography.
4. Ensure it’s dishwasher-safe from the product details.
5. Order with protective packaging enabled.

---

### Hip-Hop Inspired Beanie or Cap (Minimal Branding)

A simple cap or beanie with understated hip-hop influence fits most styles and avoids sizing complexity.

**How to get it:**

1. Search *“hip hop cap minimalist”* or *“streetwear beanie”*.
2. Filter Prime and price under 30 CAD.
3. Choose adjustable caps or one-size beanies.
4. Check reviews for fit and fabric quality.
5. Order neutral colors to keep it versatile.

---

## Questions for you

1. Do you know their favorite hip-hop era (90s, 2000s, modern)?
2. Any specific artists they constantly mention?
3. Is this a conservative office environment or casual?
4. Would you prefer something decorative or something they can use daily?
`,
  },
];

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
    const response = await openai.chat.completions.create({
      // model: process.env.AI_MODEL,
      model: 'gpt-4o-mini',
      stream: true,
      // temperature: 1,
      // top_p: 0.5,
      messages: [
        ...initialMessage,
        {
          role: 'user',
          content: `Generate fresh gift ideas for this new user request: ${userPrompt}`,
        },
      ],
    });

    let fullResponse = '';
    for await (const chunk of response) {
      const content = chunk.choices[0].delta?.content;

      if (content) {
        fullResponse += content;
        responseElement.innerHTML = DOMPurify.sanitize(marked.parse(fullResponse));
      }
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
