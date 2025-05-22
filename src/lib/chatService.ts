import type { Message } from './types';

const BASE_WEBHOOK_URL = "https://myamigo.app.n8n.cloud/webhook/a04b6c7c-bb85-4f77-ac9f-06c3fa7743fa/chat";

interface WebhookResponse {
  // Adjusted based on amigo-chat-v3 script's expectation
  text?: string;
  output?: string; 
  // Handle array response as well, though less common for single reply
  // For simplicity, we'll primarily check text/output first.
  // If it's an array: responseData[0]?.text
  error?: string; 
}

export async function sendMessageToWebhook(
  userMessageText: string,
  sessionId: string
): Promise<Message | null> {
  const fullWebhookUrl = `${BASE_WEBHOOK_URL}?action=sendMessage`;
  try {
    const response = await fetch(fullWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatInput: userMessageText, // Changed from 'message' to 'chatInput'
        sessionId: sessionId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Webhook response not OK:', response.status, errorData);
      // Return a bot message indicating an error, or null to handle upstream
      return {
        id: crypto.randomUUID(),
        text: `Error: Could not connect to the chat service (status: ${response.status}). Please try again later.`,
        sender: 'bot',
        timestamp: new Date(),
      };
    }

    const data: WebhookResponse = await response.json();

    if (data.error) {
      console.error('Webhook returned an error:', data.error);
      return {
        id: crypto.randomUUID(),
        text: `Chat service error: ${data.error}`, // Keep this for explicit errors from webhook
        sender: 'bot',
        timestamp: new Date(),
      };
    }

    // Adjusted to match amigo-chat-v3 logic for finding response text
    const botResponseText = data.text || data.output; 
    // Could also add: || (Array.isArray(data) && (data[0] as WebhookResponse)?.text)
    // but keeping it simpler for now.

    if (botResponseText) {
      return {
        id: crypto.randomUUID(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
      };
    } else {
      console.warn('Webhook response did not contain expected text or output fields.');
      return {
        id: crypto.randomUUID(),
        text: "Sorry, I received an unexpected response from the chat service.",
        sender: 'bot',
        timestamp: new Date(),
      };
    }
  } catch (error) {
    console.error('Failed to send message to webhook:', error);
    // Return a bot message indicating a network or parsing error
    return {
      id: crypto.randomUUID(),
      text: "Error: Failed to communicate with the chat service. Please check your connection and try again.",
      sender: 'bot',
      timestamp: new Date(),
    };
  }
}
