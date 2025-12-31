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
import User from '../models/User.js';
import Session from '../models/Session.js';
import ChatMessage from '../models/ChatMessage.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';

// Keep last category for user
const lastCategoryByUser = new Map();
// Keep active sessions
const userSessions = new Map();

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
  try {
    // Normalize phone number to E.164 format (add + if missing)
    const normalizedPhone = from.startsWith('+') ? from : `+${from}`;
    
    // Get or create user
    let user = await User.findOne({ phoneNumber: normalizedPhone });
    if (!user) {
      user = await User.create({
        phoneNumber: normalizedPhone,
        language: 'en',
        userType: 'NEW',
      });
      
      await AnalyticsEvent.create({
        userId: user._id,
        eventCategory: 'User',
        eventAction: 'Registration',
        eventLabel: 'WhatsApp',
        metadata: { source: 'WHATSAPP' },
      });
    }

    // Get or create session
    let sessionId = userSessions.get(from);
    let session = sessionId ? await Session.findById(sessionId) : null;
    
    if (!session || !session.isActive) {
      session = await Session.create({
        userId: user._id,
        source: 'ORGANIC',
        channel: 'WHATSAPP',
        isActive: true,
      });
      userSessions.set(from, session._id);
      
      await AnalyticsEvent.create({
        sessionId: session._id,
        userId: user._id,
        eventCategory: 'User',
        eventAction: 'Session_Start',
        metadata: { channel: 'WHATSAPP' },
      });
    }

    // Save user message
    await ChatMessage.create({
      sessionId: session._id,
      sender: 'USER',
      messageType: text ? 'text' : (buttonId ? 'interactive' : 'interactive'),
      contentPayload: {
        body: text || '',
        buttonId: buttonId || null,
        listId: listId || null,
      },
    });

    // Track interaction event
    await AnalyticsEvent.create({
      sessionId: session._id,
      userId: user._id,
      eventCategory: 'Conversation',
      eventAction: 'Message_Received',
      eventLabel: 'USER',
      metadata: { hasText: !!text, hasButton: !!buttonId, hasList: !!listId },
    });

    // Process message and respond
    let botResponse = null;
    let flowStep = null;

    // Step 1 triggers
    if (['hi', 'hello', 'hii', 'hey', 'menu', 'start', 'manas'].includes(text)) {
      await sendWelcomeAndMenu(from);
      botResponse = 'Welcome message sent';
      flowStep = 'WELCOME';
    }
    // Buttons
    else if (buttonId === BTN_MAIN) {
      await sendWelcomeAndMenu(from);
      botResponse = 'Main menu sent';
      flowStep = 'MENU_MAIN';
    }
    else if (buttonId === BTN_MORE) {
      const lastCat = lastCategoryByUser.get(from) || CAT_REPORT;
      await sendCategoryFaqList(from, lastCat);
      botResponse = 'More FAQs sent';
      flowStep = 'FAQ';
    }
    // Category selection
    else if ([CAT_REPORT, CAT_CONF, CAT_REHAB, CAT_ABOUT].includes(listId)) {
      await sendCategoryFaqList(from, listId);
      botResponse = `Category ${listId} FAQs sent`;
      flowStep = 'BROWSE_CATALOG';
    }
    // FAQ selection
    else if (listId && FAQ_ANSWERS[listId]) {
      await sendFaqAnswer(from, listId);
      botResponse = 'FAQ answer sent';
      flowStep = 'FAQ';
    }
    // Optional keyword shortcuts
    else if (text.includes('1933') || text.includes('helpline') || text.includes('contact')) {
      await sendFaqAnswer(from, FAQ_GEN_REACH);
      botResponse = 'Contact info sent';
      flowStep = 'CONTACT_SUPPORT';
    }
    // Professional fallback
    else {
      await sendText(
        from,
        'I can help with reporting, confidentiality, rehab support, and MANAS information.\n\nType *Hi* to open the menu.'
      );
      botResponse = 'Fallback message sent';
      flowStep = 'WELCOME';
    }

    // Save bot response message
    if (botResponse) {
      await ChatMessage.create({
        sessionId: session._id,
        sender: 'BOT',
        messageType: 'text',
        contentPayload: {
          body: botResponse,
          flowStep: flowStep,
        },
      });
    }

    // Add flow step to session
    if (flowStep) {
      const SessionFlow = (await import('../models/SessionFlow.js')).default;
      const lastFlow = await SessionFlow.findOne({ sessionId: session._id })
        .sort({ stepOrder: -1 });
      const stepOrder = lastFlow ? lastFlow.stepOrder + 1 : 1;
      
      await SessionFlow.create({
        sessionId: session._id,
        flowStep: flowStep,
        stepOrder: stepOrder,
        stepData: { text, buttonId, listId },
      });
      
      await AnalyticsEvent.create({
        sessionId: session._id,
        userId: user._id,
        eventCategory: 'Engagement',
        eventAction: 'Flow_Step',
        eventLabel: flowStep,
      });
    }

    // Update user last active
    await user.updateLastActive();

  } catch (error) {
    console.error('Error in handleMessage:', error);
    // Still try to send welcome message even if DB fails
    try {
      await sendWelcomeAndMenu(from);
    } catch (e) {
      console.error('Failed to send fallback message:', e);
    }
  }
}