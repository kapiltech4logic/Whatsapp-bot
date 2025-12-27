// import { sendList, sendButtons, sendText } from './whatsapp.js';
import { sendButtons, sendList, sendText } from '../utils/whatsapp.js';
import {
  CAT_REPORT,
  CAT_CONF,
  CAT_REHAB,
  CAT_ABOUT,
  BTN_MAIN,
  BTN_MORE,
  FAQ_ANSWERS,
  CATEGORY_FAQS,
  FAQ_GEN_REACH,
} from '../utils/constants.js';

// Keep last category for "More FAQs"
const lastCategoryByUser = new Map();

// Send welcome message and main menu
export async function sendWelcomeAndMenu(to) {
  return sendList(
    to,
    '👋 *Welcome to MANAS – National Narcotics Helpline (1933)*\n\n' +
      'Please select an option below. Your information can be shared *confidentially*.\n\n' +
      '_For emergencies, contact local authorities immediately._',
    'Open Menu',
    [
      {
        title: 'Main Menu',
        rows: [
          { id: CAT_REPORT, title: '📢 Report Crime', description: 'Submit a tip / report trafficking' },
          { id: CAT_CONF, title: '👤 Confidentiality', description: 'Privacy, anonymity & safety' },
          { id: CAT_REHAB, title: '🏥 Rehab Support', description: 'De-addiction & counseling help' },
          { id: CAT_ABOUT, title: 'ℹ️ About MANAS', description: 'NCB/MANAS info & NDPS FAQs' },
        ],
      },
    ]
  );
}

// Send FAQ list for a category
export async function sendCategoryFaqList(to, categoryId) {
  const cfg = CATEGORY_FAQS[categoryId];
  if (!cfg) return sendWelcomeAndMenu(to);

  lastCategoryByUser.set(to, categoryId);

  return sendList(
    to,
    `*${cfg.title}*\n\nPlease choose a question below:`,
    cfg.buttonText,
    [{ title: 'FAQs', rows: cfg.rows }]
  );
}

// Send FAQ answer
export async function sendFaqAnswer(to, faqId) {
  const answer = FAQ_ANSWERS[faqId];
  if (!answer) return sendWelcomeAndMenu(to);

  const footer =
    '\n\n—\n📞 *Helpline:* 1933\n📧 info.ncbmanas@gov.in\n🌐 www.ncbmanas.gov.in\n\n' +
    '_You may remain anonymous. Information is handled confidentially._';

  return sendButtons(to, answer + footer, [
    { type: 'reply', reply: { id: BTN_MAIN, title: '⬅️ Main Menu' } },
    { type: 'reply', reply: { id: BTN_MORE, title: '📋 More FAQs' } },
  ]);
}

// Handle incoming message
export async function handleMessage(from, text, buttonId, listId) {
  // Step 1 triggers
  if (['hi', 'hello', 'hii', 'hey', 'menu', 'start', 'manas'].includes(text)) {
    await sendWelcomeAndMenu(from);
    return;
  }

  // Buttons
  if (buttonId === BTN_MAIN) {
    await sendWelcomeAndMenu(from);
    return;
  }

  if (buttonId === BTN_MORE) {
    const lastCat = lastCategoryByUser.get(from) || CAT_REPORT;
    await sendCategoryFaqList(from, lastCat);
    return;
  }

  // Category selection
  if ([CAT_REPORT, CAT_CONF, CAT_REHAB, CAT_ABOUT].includes(listId)) {
    await sendCategoryFaqList(from, listId);
    return;
  }

  // FAQ selection
  if (listId && FAQ_ANSWERS[listId]) {
    await sendFaqAnswer(from, listId);
    return;
  }

  // Optional keyword shortcuts
  if (text.includes('1933') || text.includes('helpline') || text.includes('contact')) {
    await sendFaqAnswer(from, FAQ_GEN_REACH);
    return;
  }

  // Professional fallback
  await sendText(
    from,
    'I can help with reporting, confidentiality, rehab support, and MANAS information.\n\nType *Hi* to open the menu.'
  );
}