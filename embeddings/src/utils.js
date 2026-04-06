export function checkEnvironment() {
  // if (!process.env.API_PROXY_TARGET) {
  //   throw new Error('Missing API_PROXY_TARGET. This tells where the API requests should be proxied.');
  // }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY. This is required to authenticate with the OpenAI API.');
  }
}
