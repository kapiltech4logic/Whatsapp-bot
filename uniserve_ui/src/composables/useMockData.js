import { ref } from 'vue';

/**
 * Mock Data Generator for UniServe MVP
 * Based on MVP_DATABASE_SCHEMA.md
 */
export function useMockData() {
  // USERS Table Mock Data
  const users = ref([
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      phone_number: '+919876543210',
      name: 'Rajesh Kumar',
      language: 'hi',
      user_type: 'ACTIVE',
      first_seen: new Date('2025-12-01T10:00:00Z').toISOString(),
      last_active: new Date('2025-12-27T08:30:00Z').toISOString(),
      created_at: new Date('2025-12-01T10:00:00Z').toISOString(),
      updated_at: new Date('2025-12-27T08:30:00Z').toISOString()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      phone_number: '+919876543211',
      name: 'Priya Sharma',
      language: 'en',
      user_type: 'RETURNING',
      first_seen: new Date('2025-12-15T14:20:00Z').toISOString(),
      last_active: new Date('2025-12-26T16:45:00Z').toISOString(),
      created_at: new Date('2025-12-15T14:20:00Z').toISOString(),
      updated_at: new Date('2025-12-26T16:45:00Z').toISOString()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      phone_number: '+919876543212',
      name: 'Amit Patel',
      language: 'gu',
      user_type: 'NEW',
      first_seen: new Date('2025-12-27T06:15:00Z').toISOString(),
      last_active: new Date('2025-12-27T06:20:00Z').toISOString(),
      created_at: new Date('2025-12-27T06:15:00Z').toISOString(),
      updated_at: new Date('2025-12-27T06:20:00Z').toISOString()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      phone_number: '+919876543213',
      name: 'Sneha Desai',
      language: 'en',
      user_type: 'ACTIVE',
      first_seen: new Date('2025-11-20T09:00:00Z').toISOString(),
      last_active: new Date('2025-12-27T11:00:00Z').toISOString(),
      created_at: new Date('2025-11-20T09:00:00Z').toISOString(),
      updated_at: new Date('2025-12-27T11:00:00Z').toISOString()
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      phone_number: '+919876543214',
      name: null, // Test case for null name
      language: 'hi',
      user_type: 'RETURNING',
      first_seen: new Date('2025-12-10T12:30:00Z').toISOString(),
      last_active: new Date('2025-12-25T18:20:00Z').toISOString(),
      created_at: new Date('2025-12-10T12:30:00Z').toISOString(),
      updated_at: new Date('2025-12-25T18:20:00Z').toISOString()
    }
  ]);

  // SESSIONS Table Mock Data
  const sessions = ref([
    // Rajesh Kumar's sessions (ACTIVE user - 3 sessions)
    {
      id: '650e8400-e29b-41d4-a716-446655440001',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      source: 'QR_CODE',
      channel: 'WHATSAPP',
      start_time: new Date('2025-12-27T08:00:00Z').toISOString(),
      end_time: new Date('2025-12-27T08:15:00Z').toISOString(),
      duration_seconds: 900,
      is_active: false,
      metadata: {
        device_type: 'mobile',
        utm_campaign: 'launch_2025',
        user_agent: 'WhatsApp/2.23.1'
      }
    },
    {
      id: '650e8400-e29b-41d4-a716-446655440002',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      source: 'DIRECT_LINK',
      channel: 'WHATSAPP',
      start_time: new Date('2025-12-26T10:30:00Z').toISOString(),
      end_time: new Date('2025-12-26T10:45:00Z').toISOString(),
      duration_seconds: 900,
      is_active: false,
      metadata: { device_type: 'mobile' }
    },
    {
      id: '650e8400-e29b-41d4-a716-446655440003',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      source: 'ORGANIC',
      channel: 'WHATSAPP',
      start_time: new Date('2025-12-25T14:00:00Z').toISOString(),
      end_time: new Date('2025-12-25T14:20:00Z').toISOString(),
      duration_seconds: 1200,
      is_active: false,
      metadata: { device_type: 'mobile' }
    },
    
    // Priya Sharma's sessions (RETURNING user - 2 sessions)
    {
      id: '650e8400-e29b-41d4-a716-446655440004',
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      source: 'AD_CLICK',
      channel: 'WHATSAPP',
      start_time: new Date('2025-12-26T16:00:00Z').toISOString(),
      end_time: new Date('2025-12-26T16:30:00Z').toISOString(),
      duration_seconds: 1800,
      is_active: false,
      metadata: {
        utm_campaign: 'facebook_ads',
        utm_medium: 'social'
      }
    },
    {
      id: '650e8400-e29b-41d4-a716-446655440005',
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      source: 'REFERRAL',
      channel: 'WHATSAPP',
      start_time: new Date('2025-12-24T09:00:00Z').toISOString(),
      end_time: new Date('2025-12-24T09:10:00Z').toISOString(),
      duration_seconds: 600,
      is_active: false,
      metadata: { referrer: 'friend_123' }
    },
    
    // Amit Patel's session (NEW user - 1 session)
    {
      id: '650e8400-e29b-41d4-a716-446655440006',
      user_id: '550e8400-e29b-41d4-a716-446655440003',
      source: 'QR_CODE',
      channel: 'WHATSAPP',
      start_time: new Date('2025-12-27T06:15:00Z').toISOString(),
      end_time: new Date('2025-12-27T06:20:00Z').toISOString(),
      duration_seconds: 300,
      is_active: false,
      metadata: { device_type: 'mobile' }
    },
    
    // Sneha Desai's sessions (ACTIVE user - 3 sessions)
    {
      id: '650e8400-e29b-41d4-a716-446655440007',
      user_id: '550e8400-e29b-41d4-a716-446655440004',
      source: 'DIRECT_LINK',
      channel: 'WHATSAPP',
      start_time: new Date('2025-12-27T10:30:00Z').toISOString(),
      end_time: new Date('2025-12-27T11:00:00Z').toISOString(),
      duration_seconds: 1800,
      is_active: false,
      metadata: { device_type: 'desktop' }
    },
    {
      id: '650e8400-e29b-41d4-a716-446655440008',
      user_id: '550e8400-e29b-41d4-a716-446655440004',
      source: 'ORGANIC',
      channel: 'WHATSAPP',
      start_time: new Date('2025-12-26T15:00:00Z').toISOString(),
      end_time: new Date('2025-12-26T15:25:00Z').toISOString(),
      duration_seconds: 1500,
      is_active: false,
      metadata: { device_type: 'mobile' }
    },
    
    // User with null name - 1 session
    {
      id: '650e8400-e29b-41d4-a716-446655440009',
      user_id: '550e8400-e29b-41d4-a716-446655440005',
      source: 'AD_CLICK',
      channel: 'WHATSAPP',
      start_time: new Date('2025-12-25T18:00:00Z').toISOString(),
      end_time: new Date('2025-12-25T18:15:00Z').toISOString(),
      duration_seconds: 900,
      is_active: false,
      metadata: { utm_campaign: 'google_ads' }
    }
  ]);

  // SESSION_FLOWS Table Mock Data
  const sessionFlows = ref([
    // Flows for Rajesh's first session (650e8400-e29b-41d4-a716-446655440001)
    {
      id: 'flow-001',
      session_id: '650e8400-e29b-41d4-a716-446655440001',
      flow_step: 'WELCOME',
      step_order: 1,
      step_timestamp: new Date('2025-12-27T08:00:00Z').toISOString(),
      step_data: { greeting: 'Hi Rajesh!', language: 'hi' }
    },
    {
      id: 'flow-002',
      session_id: '650e8400-e29b-41d4-a716-446655440001',
      flow_step: 'MENU_MAIN',
      step_order: 2,
      step_timestamp: new Date('2025-12-27T08:02:00Z').toISOString(),
      step_data: { selection: 'Browse Products', display_time_seconds: 5 }
    },
    {
      id: 'flow-003',
      session_id: '650e8400-e29b-41d4-a716-446655440001',
      flow_step: 'BROWSE_CATALOG',
      step_order: 3,
      step_timestamp: new Date('2025-12-27T08:05:00Z').toISOString(),
      step_data: { category: 'Electronics', items_viewed: 12 }
    },
    {
      id: 'flow-004',
      session_id: '650e8400-e29b-41d4-a716-446655440001',
      flow_step: 'SEARCH',
      step_order: 4,
      step_timestamp: new Date('2025-12-27T08:10:00Z').toISOString(),
      step_data: { query: 'laptop', results_count: 15 }
    },
    {
      id: 'flow-005',
      session_id: '650e8400-e29b-41d4-a716-446655440001',
      flow_step: 'FEEDBACK',
      step_order: 5,
      step_timestamp: new Date('2025-12-27T08:14:00Z').toISOString(),
      step_data: { rating: 5, comment: 'Great experience!' }
    },
    
    // Flows for Rajesh's second session
    {
      id: 'flow-006',
      session_id: '650e8400-e29b-41d4-a716-446655440002',
      flow_step: 'WELCOME',
      step_order: 1,
      step_timestamp: new Date('2025-12-26T10:30:00Z').toISOString(),
      step_data: { greeting: 'Welcome back, Rajesh!' }
    },
    {
      id: 'flow-007',
      session_id: '650e8400-e29b-41d4-a716-446655440002',
      flow_step: 'FAQ',
      step_order: 2,
      step_timestamp: new Date('2025-12-26T10:35:00Z').toISOString(),
      step_data: { query: 'How to track order', article_id: 'FAQ-123' }
    },
    {
      id: 'flow-008',
      session_id: '650e8400-e29b-41d4-a716-446655440002',
      flow_step: 'CONTACT_SUPPORT',
      step_order: 3,
      step_timestamp: new Date('2025-12-26T10:42:00Z').toISOString(),
      step_data: { issue: 'Order status inquiry', agent_assigned: false }
    },
    
    // Flows for Priya's first session
    {
      id: 'flow-009',
      session_id: '650e8400-e29b-41d4-a716-446655440004',
      flow_step: 'WELCOME',
      step_order: 1,
      step_timestamp: new Date('2025-12-26T16:00:00Z').toISOString(),
      step_data: { greeting: 'Hi Priya!', language: 'en' }
    },
    {
      id: 'flow-010',
      session_id: '650e8400-e29b-41d4-a716-446655440004',
      flow_step: 'MENU_MAIN',
      step_order: 2,
      step_timestamp: new Date('2025-12-26T16:03:00Z').toISOString(),
      step_data: { selection: 'Special Offers' }
    },
    {
      id: 'flow-011',
      session_id: '650e8400-e29b-41d4-a716-446655440004',
      flow_step: 'BROWSE_CATALOG',
      step_order: 3,
      step_timestamp: new Date('2025-12-26T16:10:00Z').toISOString(),
      step_data: { category: 'Fashion', items_viewed: 8 }
    },
    {
      id: 'flow-012',
      session_id: '650e8400-e29b-41d4-a716-446655440004',
      flow_step: 'SEARCH',
      step_order: 4,
      step_timestamp: new Date('2025-12-26T16:20:00Z').toISOString(),
      step_data: { query: 'winter jacket', results_count: 23 }
    },
    
    // Flows for Amit's session (NEW user - simple journey)
    {
      id: 'flow-013',
      session_id: '650e8400-e29b-41d4-a716-446655440006',
      flow_step: 'WELCOME',
      step_order: 1,
      step_timestamp: new Date('2025-12-27T06:15:00Z').toISOString(),
      step_data: { greeting: 'Welcome to UniServe!', is_first_time: true }
    },
    {
      id: 'flow-014',
      session_id: '650e8400-e29b-41d4-a716-446655440006',
      flow_step: 'MENU_MAIN',
      step_order: 2,
      step_timestamp: new Date('2025-12-27T06:17:00Z').toISOString(),
      step_data: { selection: 'Learn More' }
    },
    
    // Flows for Sneha's first session
    {
      id: 'flow-015',
      session_id: '650e8400-e29b-41d4-a716-446655440007',
      flow_step: 'WELCOME',
      step_order: 1,
      step_timestamp: new Date('2025-12-27T10:30:00Z').toISOString(),
      step_data: { greeting: 'Welcome back, Sneha!' }
    },
    {
      id: 'flow-016',
      session_id: '650e8400-e29b-41d4-a716-446655440007',
      flow_step: 'MENU_MAIN',
      step_order: 2,
      step_timestamp: new Date('2025-12-27T10:33:00Z').toISOString(),
      step_data: { selection: 'My Orders' }
    },
    {
      id: 'flow-017',
      session_id: '650e8400-e29b-41d4-a716-446655440007',
      flow_step: 'BROWSE_CATALOG',
      step_order: 3,
      step_timestamp: new Date('2025-12-27T10:40:00Z').toISOString(),
      step_data: { category: 'Books', items_viewed: 5 }
    },
    {
      id: 'flow-018',
      session_id: '650e8400-e29b-41d4-a716-446655440007',
      flow_step: 'SEARCH',
      step_order: 4,
      step_timestamp: new Date('2025-12-27T10:50:00Z').toISOString(),
      step_data: { query: 'science fiction', results_count: 34 }
    },
    {
      id: 'flow-019',
      session_id: '650e8400-e29b-41d4-a716-446655440007',
      flow_step: 'FEEDBACK',
      step_order: 5,
      step_timestamp: new Date('2025-12-27T10:58:00Z').toISOString(),
      step_data: { rating: 4, comment: 'Good selection' }
    },
    
    // Flows for null-name user session
    {
      id: 'flow-020',
      session_id: '650e8400-e29b-41d4-a716-446655440009',
      flow_step: 'WELCOME',
      step_order: 1,
      step_timestamp: new Date('2025-12-25T18:00:00Z').toISOString(),
      step_data: { greeting: 'Hello!' }
    },
    {
      id: 'flow-021',
      session_id: '650e8400-e29b-41d4-a716-446655440009',
      flow_step: 'FAQ',
      step_order: 2,
      step_timestamp: new Date('2025-12-25T18:10:00Z').toISOString(),
      step_data: { query: 'Shipping information', article_id: 'FAQ-456' }
    }
  ]);

  return {
    users,
    sessions,
    sessionFlows
  };
}
