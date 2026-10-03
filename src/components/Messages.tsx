import type { UIMessage } from 'ai';
import clsx from 'clsx';
import { useEffect, useRef } from 'preact/hooks';

interface Props {
  messages: UIMessage[];
}

export default function Messages(props: Props) {
  const { messages } = props;
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div class="flex-1 space-y-4 overflow-auto px-6" ref={messagesRef}>
      {messages.map(({ id, parts, role }) => (
        <p
          class={clsx(
            'flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
            (role === 'assistant' || role === 'system') && 'bg-gray-100',
            role === 'user' && 'ml-auto bg-blue-600 text-gray-100',
          )}
          key={id}
        >
          {parts.map((part, index) =>
            part.type === 'text' ? <span key={index}>{part.text}</span> : null,
          )}
        </p>
      ))}
    </div>
  );
}
