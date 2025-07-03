import { type CoreMessage, generateText } from 'ai';
import { createWorkersAI } from 'workers-ai-provider';

interface Env {
  AI: Ai;
  NODE_ENV: 'development' | 'preview' | 'production';
}

const PROMPT: CoreMessage = {
  role: 'system',
  content: 'You are a succinct helpful assistant',
} as const;

const MAX_TOKENS = 150;

/**
 * POST /api/chat
 *
 * @param context - Event context.
 * @returns - Response.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { messages } = await context.request.json<{
      messages: CoreMessage[];
    }>();

    messages.unshift(PROMPT);

    const workersai = createWorkersAI({ binding: context.env.AI });

    // https://sdk.vercel.ai/providers/community-providers/cloudflare-workers-ai#generatetext
    const result = await generateText({
      model: workersai('@cf/meta/llama-3.1-8b-instruct'),
      maxTokens: MAX_TOKENS,
      messages,
    });

    return new Response(result.text, getResponseInit(context));
  } catch (error) {
    // InferenceUpstreamError: you have used up your daily free allocation of 10,000 neurons, please upgrade to Cloudflare's Workers Paid plan if you would like to continue usage.
    if (
      error instanceof Error &&
      /you have used up your daily free allocation/.test(error.message)
    ) {
      return new Response('Daily quota exceeded.', {
        ...getResponseInit(context),
        status: 429,
      });
    } else {
      throw error;
    }
  }
};

/**
 * OPTIONS /api/chat
 *
 * @param context - Event context.
 * @returns - Response.
 */
export const onRequestOptions: PagesFunction<Env> = async (context) => {
  return new Response(null, { ...getResponseInit(context), status: 204 });
};

/**
 * Get response init.
 *
 * @param context - Event context.
 * @returns - Response init.
 */
function getResponseInit(
  context: EventContext<Env, '', unknown>,
): ResponseInit {
  if (context.env.NODE_ENV === 'development') {
    return {
      headers: {
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Origin': '*',
      },
    };
  }
}
