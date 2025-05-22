import type { Message } from '../../lib/types'; // Adjusted path
import { ScrollArea } from "@/components/ui/scroll-area"; // For better scrolling
import { useEffect, useRef } from 'react';

interface ChatMessageListProps {
  messages: Message[];
}

export default function ChatMessageList({ messages }: ChatMessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="text-center text-gray-400 italic">
          No messages yet. Start the conversation!
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-grow" ref={scrollAreaRef}>
      <div className="space-y-4 p-4" ref={viewportRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`p-3 rounded-lg max-w-xs lg:max-w-md break-words shadow ${
                message.sender === 'user'
                  ? 'bg-amigo-blue text-white'
                  : 'bg-amigo-gray text-dark-gray'
              }`}
            >
              {message.text}
              {/* Optional: Display timestamp */}
              {/* {message.timestamp && (
                <div className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              )} */}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
