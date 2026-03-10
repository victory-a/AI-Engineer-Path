/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import OpenAI from 'openai';

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

const headers = {
	'Content-Type': 'text/plain; charset=utf-8',
	'Cache-Control': 'no-cache',
	Connection: 'keep-alive',
	//cors headers
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
	'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers });
		}

		if (request.method !== 'POST') {
			return new Response('Not found', { status: 404 });
		}

		const openai = new OpenAI({
			apiKey: env.OPENAI_API_KEY,
			baseURL: env.AI_URL,
		});

		try {
			const body = await request.json();
			const stream = await openai.responses.create({
				model: env.AI_MODEL,
				input: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: body.userPrompt },
				],
				stream: true,
			});

			const { readable, writable } = new TransformStream();
			const writer = writable.getWriter();

			const encoder = new TextEncoder();
			(async () => {
				for await (const event of stream) {
					if (event.type === 'response.output_text.delta' && event.delta) {
						await writer.write(encoder.encode(event.delta));
					}
				}
				await writer.close();
			})();

			return new Response(readable, {
				headers: {
					'Content-Type': 'text/plain; charset=utf-8',
					'Cache-Control': 'no-cache',
					Connection: 'keep-alive',
				},
			});
		} catch (error) {
			console.log(`Error processing request: ${error}`);
			return new Response(JSON.stringify({ error: error.message }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	},
};
