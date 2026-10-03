import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'preact/hooks';
import { API_URL, DEV } from 'src/constants';

import ChatError from './ChatError';
import Form from './Form';
import Header from './Header';
import Messages from './Messages';

export default function Chat() {
  // https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
  // https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat
  const { error, messages, regenerate, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: `${API_URL}/api/chat` }),

    messages: [
      {
        id: '1',
        role: 'assistant',
        parts: [{ type: 'text', text: 'How may I help you?' }],
      },
    ],

    onError(error) {
      if (DEV) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    },
  });

  const [input, setInput] = useState('');

  return (
    <section class="flex h-screen flex-col rounded-xl bg-white sm:h-[70vh] sm:border sm:shadow-sm">
      <Header />
      <ChatError error={error} onRetry={() => void regenerate()} />
      <Messages messages={messages} />
      <Form
        disabled={status === 'submitted' || status === 'streaming'}
        onChange={setInput}
        onSubmit={(event) => {
          event.preventDefault();

          if (input) {
            sendMessage({ text: input });
            setInput('');
          }
        }}
        value={input}
      />
    </section>
  );
}
