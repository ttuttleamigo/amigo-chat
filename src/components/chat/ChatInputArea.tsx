import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react"; // Using the icon now
import React from 'react'; // Removed useState as it's not used
import type { Dispatch, SetStateAction } from 'react';

interface ChatInputAreaProps {
  inputValue: string;
  onInputChange: Dispatch<SetStateAction<string>> | ((value: string) => void); // Allow flexible setter
  onSendMessage: (text: string) => void; // Can be async if needed, but void for now
}

export default function ChatInputArea({ 
  inputValue, 
  onInputChange, 
  onSendMessage 
}: ChatInputAreaProps) {
  
  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      // Parent component (ChatPage) is responsible for clearing its own inputValue state
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof onInputChange === 'function' && 'call' in onInputChange && 'apply' in onInputChange) {
       // Check if it's a Dispatch<SetStateAction<string>>
      (onInputChange as Dispatch<SetStateAction<string>>)(e.target.value);
    } else if (typeof onInputChange === 'function') {
      // Check if it's a simple (value: string) => void
      (onInputChange as (value: string) => void)(e.target.value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2 p-2">
      <Input 
        type="text" 
        placeholder="Type your message..." 
        className="flex-grow" 
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent newline on Enter
            handleSubmit();
          }
        }}
      />
      <Button 
        type="submit" 
        className="bg-amigo-blue hover:bg-amigo-blue/90 text-white"
        disabled={!inputValue.trim()}
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}
