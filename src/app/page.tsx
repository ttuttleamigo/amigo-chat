"use client";

import { useState, useEffect, useRef } from 'react'; // Re-added useRef
import Image from 'next/image'; 
import ChatHeader from "@/components/chat/ChatHeader";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { ChatBubble, ChatBubbleMessage } from "@/components/ui/chat/chat-bubble";
import type { Message } from '../lib/types';
import { sendMessageToWebhook } from '../lib/chatService';
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ChatInput } from "@/components/ui/chat/chat-input";
// import {
//   ExpandableChat,
//   ExpandableChatHeader,
//   ExpandableChatBody,
//   ExpandableChatFooter,
// } from "@/components/ui/chat/expandable-chat"; // To be removed
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageSquare, X } from "lucide-react"; // For FAB

export default function ChatPage() {
  // No need for logo URL as it's now hardcoded in ChatHeader
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      text: "👋 Need some assistance? I'm a virtual assistant here to help you get the support you need.", // Separated text
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // For FAB
  const [showQuickOptions, setShowQuickOptions] = useState(true); // For quick options visibility
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(true); // For privacy banner visibility
  const [showClosedChatPrompt, setShowClosedChatPrompt] = useState(true); // For initial closed chat prompt
  const messagesEndRef = useRef<HTMLDivElement | null>(null); // Re-added messagesEndRef

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!sessionId) {
      setSessionId(crypto.randomUUID());
    }
  }, [sessionId]);

  useEffect(() => {
    // Scroll to bottom when messages change, or when the initial options/banner appear/disappear
    scrollToBottom();
  }, [messages, showQuickOptions, showPrivacyBanner]); // Trigger on these state changes

  const handleSendMessage = async (text: string, isQuickOption: boolean = false) => {
    if (!text.trim() || !sessionId) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    
    if (!isQuickOption) {
      setInputValue(""); // Clear input only for typed messages
      // setShowQuickOptions(false); // Hide quick options after any user interaction (typed)
      // setShowPrivacyBanner(false); // Hide privacy banner after any user interaction (typed)
      try {
        const botResponse = await sendMessageToWebhook(text, sessionId);
        if (botResponse) {
          setMessages((prevMessages) => [...prevMessages, botResponse]);
        }
      } catch (error) {
        console.error("Error sending message from ChatPage:", error);
        const errorResponseMessage: Message = {
          id: crypto.randomUUID(),
          text: "Sorry, there was an error sending your message. Please try again.",
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, errorResponseMessage]);
      }
    } else {
      // Handle "faked" bot response for quick options
      setTimeout(() => {
        let botText = "Please select an option or type your message.";
        if (text.includes("Get Help")) {
          botText = "Sure! Please describe the issue you're having with your Amigo, and I'll do my best to assist.";
        } else if (text.includes("Explore Product Features")) {
          botText = "Great! Amigo offers a range of features including X, Y, and Z. Which one are you interested in?";
        } else if (text.includes("Access User Manuals")) {
          botText = "You can find the user manuals at [link to manuals]. Is there a specific section you're looking for?";
        }
        const fakeBotResponse: Message = {
          id: crypto.randomUUID(),
          text: botText,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, fakeBotResponse]);
      }, 600);
      setShowQuickOptions(false); // Hide quick options after one is selected
      setShowPrivacyBanner(false); // Also hide privacy banner when a quick option is chosen
    }
  };
  
  const quickOptions = [
    { text: "🛠️ Get Help With My Amigo", emoji: "🛠️" },
    { text: "✨ Explore Product Features", emoji: "✨" },
    { text: "📖 Access User Manuals", emoji: "📖" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative bg-background text-foreground"> {/* Added theme-aware background/text */}
      {/* Chat Widget */}
      {isChatOpen && (
      <div className="fixed bottom-20 right-4 w-[410px] h-[620px] bg-white dark:bg-slate-900 text-card-foreground rounded-lg shadow-xl flex flex-col overflow-hidden border border-border"> {/* Increased width, fixed colors for light/dark mode */}
          <ChatHeader
            onFaqClick={() => setIsFaqOpen(true)}
            onCloseClick={() => setIsChatOpen(false)}
            showCloseButton={true}
          />
          <div className={`flex-grow overflow-y-auto p-4 bg-[#F0F8FF] dark:bg-slate-800 relative`}> {/* Light mode: bg-[#F0F8FF] (AliceBlue), Dark mode: bg-slate-800 */}
            <ChatMessageList> 
              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  variant={msg.sender === 'user' ? 'sent' : 'received'}
                  avatarSrc={msg.sender === 'bot' ? "/amigo-logo-outlined.png" : undefined}
                  showActivityIndicator={msg.sender === 'bot' ? true : undefined}
                  className={`${
                    msg.sender === 'user' 
                      ? "bg-primary text-primary-foreground" // User bubbles
                      : "text-slate-900 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-600 max-w-lg dark:bg-slate-700" // Bot bubbles: removed bg-white for light mode
                  } font-montserrat`} 
                >
                  <ChatBubbleMessage className="font-montserrat">{msg.text}</ChatBubbleMessage>
                </ChatBubble>
              ))}
              {/* Conditional rendering for initial state elements (Quick Options & "Ask me...") */}
              {messages.length === 1 && messages[0].sender === 'bot' && (
                <div className="flex flex-col items-center w-full flex-shrink-0 mt-2"> {/* Added mt-2 for spacing from first message */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-montserrat my-2 px-2 text-center">Ask me or select an option below.</p>
                  {showQuickOptions && (
                    <div className="mt-1 mb-2 space-y-2 px-2 w-full"> 
                      {quickOptions.map(optionObj => (
                        <Button
                          key={optionObj.text}
                          type="button"
                          variant="outline"
                          className="w-full bg-white dark:bg-slate-700 text-[#0070A8] dark:text-slate-100 border border-[#0070A8] dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 flex justify-start items-center space-x-2 font-montserrat text-sm py-2 h-auto" // Adjusted quick option style for better contrast
                          onClick={() => handleSendMessage(optionObj.text, true)}
                        >
                          <span className="font-montserrat text-lg">{optionObj.emoji}</span>
                          <span className="font-montserrat text-sm leading-tight">{optionObj.text.substring(optionObj.emoji.length).trim()}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} /> {/* Add messagesEndRef here, inside ChatMessageList's children */}
            </ChatMessageList> 
          </div>

          {/* Privacy Banner as Overlay - Placed before message composer */}
          {showPrivacyBanner && (
            <div className="absolute bottom-[76px] left-4 right-4 p-3 z-20 bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-slate-300 dark:border-slate-700"> 
              <p className="text-xs text-slate-700 dark:text-slate-200 font-montserrat"> {/* Adjusted light text for privacy banner */}
                Amigo uses the information you provide to us to contact you about our relevant content, products, and services. You may unsubscribe from these communications at any time. For more information, check out our <a href="#" className="underline text-primary dark:text-blue-400">privacy policy</a>.
              </p>
              <button
                onClick={() => setShowPrivacyBanner(false)}
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-100 p-0.5" // Adjusted hover/text for dark
                aria-label="Close privacy notice"
              >
                <X size={14} />
              </button>
            </div>
          )}
          
          {/* Message composer area remains in the footer */}
          <div className="p-3 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 relative z-0"> {/* Ensure composer is not overlapped by banner if z-index issues */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="flex w-full items-center space-x-2"
            >
              <ChatInput
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Write a message" // Figma placeholder
                className="flex-grow resize-none border-input rounded-md focus:ring-ring focus:border-primary font-montserrat bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" // Added text/placeholder colors
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }
                }}
              />
              <Button
                type="submit"
                className="bg-amigo-light-blue hover:bg-amigo-light-blue/90 text-amigo-navy-blue rounded-md p-2" // Using amigo-light-blue background with navy text for better contrast
                disabled={!inputValue.trim()}
              >
                <Send className="h-5 w-5" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Initial Closed Chat Prompt */}
      {!isChatOpen && showClosedChatPrompt && (
        <div className="fixed bottom-24 right-4 w-auto max-w-xs z-40 animate-fadeIn"> {/* Position near FAB, adjust bottom-24 as needed */}
          {/* Avatar positioned above the bubble */}
          <div className="relative mb-[-20px] ml-5 h-10 w-10 z-10"> {/* Negative margin to pull avatar over bubble, adjust ml-5 for centering */}
            <Image
              src="/amigo-virtual-assistant.png" 
              alt="Amigo Avatar"
              width={40} // Slightly larger avatar for the prompt
              height={40}
              className="rounded-full bg-white p-0.5 shadow-md" 
            />
          </div>
          {/* Prompt Bubble */}
          <div className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-4 rounded-xl shadow-lg relative font-montserrat text-sm">
            <button
              onClick={() => setShowClosedChatPrompt(false)}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
              aria-label="Close prompt"
            >
              <X size={16} />
            </button>
            <p className="pr-4">👋 Need some assistance? I&#39;m a virtual assistant here to help you get the support you need.</p> {/* Escaped apostrophe */}
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => {
          setIsChatOpen(!isChatOpen);
          if (!isChatOpen) { // If we are opening the chat
            setShowClosedChatPrompt(false); // Hide the prompt
          }
        }}
        className="fixed bottom-4 right-4 w-14 h-14 bg-[#0070A8] rounded-full text-white flex items-center justify-center shadow-lg hover:bg-[#005c8a] transition-colors z-50" // Ensure FAB is on top
        aria-label={isChatOpen ? "Close chat" : "Open chat"}
      >
        {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* FAQ Drawer */}
      <Drawer open={isFaqOpen} onOpenChange={setIsFaqOpen}>
        <DrawerContent className="max-h-[80vh] overflow-y-auto">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-oswald">FREQUENTLY ASKED QUESTIONS</DrawerTitle>
            <DrawerDescription className="font-montserrat">
              Here are some common questions about Amigo.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="font-montserrat font-medium">What is Amigo Virtual Assistant?</AccordionTrigger>
                <AccordionContent>
                  Amigo is an AI-powered virtual assistant designed to help you with your unit and provide support.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="font-montserrat font-medium">How do I find my unit&#39;s serial number?</AccordionTrigger>
                <AccordionContent className="font-montserrat">
                  The serial number is usually located on a sticker or plate on the frame of the unit, often near the battery or the seat post. It will typically start with &quot;AMI&quot;.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="font-montserrat font-medium">What if I can&#39;t find the serial number?</AccordionTrigger>
                <AccordionContent className="font-montserrat">
                  If you can&#39;t find the serial number, Amigo can try to help you with a few common troubleshooting spots or other identifying information.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="font-montserrat font-medium">Is my conversation with Amigo private?</AccordionTrigger>
                <AccordionContent className="font-montserrat">
                  Yes, your conversation is processed securely. We prioritize your privacy. For more details, please refer to our privacy policy.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Close FAQ</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
