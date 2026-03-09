export function checkEnvironment() {
  if (!process.env.API_PROXY_TARGET) {
    throw new Error("Missing API_PROXY_TARGET. This tells where the API requests should be proxied.");
  }
}
