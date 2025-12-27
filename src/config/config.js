import dotenv from 'dotenv';

dotenv.config();

export const config = {
  VERIFY_TOKEN: process.env.VERIFY_TOKEN || 'kapil_whatsapp_bot_2025',
  PHONE_NUMBER_ID: process.env.PHONE_NUMBER_ID,
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp_bot',
};

if (!config.PHONE_NUMBER_ID || !config.WHATSAPP_TOKEN) {
  console.error('❌ Missing env vars: PHONE_NUMBER_ID or WHATSAPP_TOKEN');
  process.exit(1);
}