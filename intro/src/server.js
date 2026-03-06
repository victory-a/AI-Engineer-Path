import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const { AI_KEY, AI_URL, AI_MODEL } = process.env;

if (!AI_KEY || !AI_URL || !AI_MODEL) {
  throw new Error('Missing one or more required .env values: AI_KEY, AI_URL, AI_MODEL');
}

const openai = new OpenAI({
  apiKey: AI_KEY,
  baseURL: AI_URL,
});

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/gift', async (req, res) => {
  const { userPrompt } = req.body;
  const systemPrompt = `You are the Gift Genie. 

You generate gift ideas that feel thoughtful, specific, and genuinely useful.
Your output must be in structured Markdown.
Do not write introductions or conclusions.
Start directly with the gift suggestions.

Each gift must:
- Have a clear heading
- Include a short explanation of why it works

If the user mentions a location, situation, or constraint,
adapt the gift ideas and add another short section 
under each gift that guides the user to get the gift in that 
constrained context.

After the gift ideas, include a section titled "Questions for you"
with clarifying questions that would help improve the recommendations.`;

  try {
    const response = await openai.responses.create({
      model: process.env.AI_MODEL,
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      // tools: [{ type: 'web_search' }],
    });

    res.json({ message: response.output_text });
  } catch (error) {
    res.status(500).json({ message: error.message || error || 'An error occurred while processing your request.', status: 400 });
  }
});

const port = Number(process.env.PORT) || 5001;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
