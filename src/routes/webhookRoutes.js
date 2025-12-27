import express from 'express';
import { config } from '../config/config.js';
import { handleMessage } from '../controllers/botController.js';

const router = express.Router();

// Webhook verification
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

// Webhook messages
router.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    // Ignore statuses
    if (value?.statuses?.length) return;

    const msg = value?.messages?.[0];
    if (!msg) return;

    const from = msg.from;
    const text = (msg.text?.body || '').trim().toLowerCase();
    const buttonId = msg.interactive?.button_reply?.id;
    const listId = msg.interactive?.list_reply?.id;

    await handleMessage(from, text, buttonId, listId);
  } catch (e) {
    console.log('ERROR:', e?.response?.data || e.message);
  }
});

export default router;