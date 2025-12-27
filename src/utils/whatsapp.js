import axios from 'axios';
import { config } from '../config/config.js';

// Create axios instance for WhatsApp API
export const whatsappApi = axios.create({
  baseURL: `https://graph.facebook.com/v20.0/${config.PHONE_NUMBER_ID}`,
  headers: {
    Authorization: `Bearer ${config.WHATSAPP_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// WhatsApp safe clamp function
export const clamp = (s, max) => Array.from(String(s || '')).slice(0, max).join('');

// Send text message
export async function sendText(to, body) {
  return whatsappApi.post('/messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body },
  });
}

// Send interactive buttons
export async function sendButtons(to, bodyText, buttons) {
  return whatsappApi.post('/messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: bodyText },
      action: { buttons },
    },
  });
}

// Send interactive list
export async function sendList(to, bodyText, buttonText, sections) {
  const safeSections = (sections || []).map((sec) => ({
    title: clamp(sec.title, 24),
    rows: (sec.rows || []).map((r) => ({
      id: r.id,
      title: clamp(r.title, 24),
      description: r.description ? clamp(r.description, 72) : undefined,
    })),
  }));

  return whatsappApi.post('/messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: bodyText },
      action: { button: clamp(buttonText, 20), sections: safeSections },
    },
  });
}