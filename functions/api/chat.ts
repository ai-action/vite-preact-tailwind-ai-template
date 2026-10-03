import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai';
import { createWorkersAI } from 'workers-ai-provider';

interface Env {
  AI: Ai;
  NODE_ENV: 'development' | 'preview' | 'production';
}

const INSTRUCTIONS = "You're a helpful assistant";

const MAX_OUTPUT_TOKENS = 150;

/**
 * POST /api/chat
 *
 * @param context - Event context.
 * @returns - Response.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { messages } = await context.request.json<{ messages: UIMessage[] }>();

  const workersai = createWorkersAI({ binding: context.env.AI });

  const result = streamText({
    model: workersai('@cf/meta/llama-3.2-1b-instruct'),
    instructions: INSTRUCTIONS,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    headers: getHeaders(context),
    stream: toUIMessageStream({
      stream: result.stream,

      // InferenceUpstreamError: you have used up your daily free allocation of 10,000 neurons, please upgrade to Cloudflare's Workers Paid plan if you would like to continue usage.
      // Streaming flushes the response headers before the model call settles, so this can no
      // longer be reported as an HTTP 429. Report it in the stream instead.
      onError(error) {
        if (
          error instanceof Error &&
          /you have used up your daily free allocation/.test(error.message)
        ) {
          return 'Daily quota exceeded.';
        }

        return 'An error occurred.';
      },
    }),
  });
};

/**
 * OPTIONS /api/chat
 *
 * @param context - Event context.
 * @returns - Response.
 */
export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return new Response(null, { headers: getHeaders(context), status: 204 });
};

/**
 * Get CORS headers.
 *
 * @param context - Event context.
 * @returns - Headers.
 */
function getHeaders(
  context: EventContext<Env, '', unknown>,
): Record<string, string> | undefined {
  return context.env.NODE_ENV === 'development'
    ? {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
      }
    : undefined;
}
