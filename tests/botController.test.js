// filepath: tests/botController.test.js
import { jest } from '@jest/globals';
import { handleMessage } from '../src/controllers/botController.js';

// Mock the WhatsApp utils
jest.mock('../src/utils/whatsapp.js', () => ({
  sendList: jest.fn(),
  sendButtons: jest.fn(),
  sendText: jest.fn(),
}));

describe('Bot Controller', () => {
  it('should handle welcome triggers', async () => {
    const mockSendList = require('../src/utils/whatsapp.js').sendList;
    mockSendList.mockResolvedValue({});
    
    await handleMessage('1234567890', 'hi', null, null);
    expect(mockSendList).toHaveBeenCalled();
  });

  // Add more tests for other handlers...
});