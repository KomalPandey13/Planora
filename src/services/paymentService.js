/**
 * Planora Secure Payment Service
 * Production client-side validation helpers and PCI-DSS compliant simulated checkout gateway.
 *
 * SECURITY POLICY:
 * Never accept, return, or persist raw card numbers, CVVs, expiry dates, or UPI PINs
 * outside ephemeral form component memory.
 */

import { sanitizeInput } from '../utils/security';

export const SUPPORTED_BANKS = [
  { code: 'SBI', name: 'State Bank of India' },
  { code: 'HDFC', name: 'HDFC Bank' },
  { code: 'ICICI', name: 'ICICI Bank' },
  { code: 'Axis', name: 'Axis Bank' },
  { code: 'PNB', name: 'Punjab National Bank' }
];

/**
 * Validates UPI Virtual Payment Address (VPA) format
 * @param {string} upiId
 * @returns {{ isValid: boolean, message: string }}
 */
export function validateUPI(upiId) {
  if (!upiId || typeof upiId !== 'string') {
    return { isValid: false, message: 'UPI ID is required.' };
  }

  const cleanUPI = sanitizeInput(upiId.trim());
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

  if (!upiRegex.test(cleanUPI)) {
    return {
      isValid: false,
      message: 'Invalid UPI ID format. Expected format: username@bank (e.g. student@okhdfcbank).'
    };
  }

  return { isValid: true, message: '' };
}

/**
 * Luhn checksum algorithm implementation
 * @param {string} digits
 * @returns {boolean}
 */
function checkLuhn(digits) {
  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (isNaN(digit)) return false;

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Validates credit/debit card fields according to industry standards
 * @param {object} card - { number, expiry, cvv, name }
 * @returns {{ isValid: boolean, message: string }}
 */
export function validateCard({ number = '', expiry = '', cvv = '', name = '' }) {
  // Validate Cardholder Name
  const cleanName = sanitizeInput(name);
  if (!cleanName || cleanName.length < 2) {
    return { isValid: false, message: 'Please enter the cardholder name (minimum 2 characters).' };
  }

  // Validate Card Number (strip spaces and dashes)
  const cleanNumber = String(number).replace(/[\s-]/g, '');
  if (!/^\d{13,19}$/.test(cleanNumber)) {
    return { isValid: false, message: 'Card number must contain between 13 and 19 numeric digits.' };
  }

  if (!checkLuhn(cleanNumber)) {
    return { isValid: false, message: 'Invalid card number checksum. Please re-check the digits.' };
  }

  // Validate Expiry (MM/YY format, not expired)
  const cleanExpiry = expiry.trim();
  const expiryMatch = cleanExpiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!expiryMatch) {
    return { isValid: false, message: 'Invalid expiry date format. Use MM/YY (e.g. 08/28).' };
  }

  const expMonth = parseInt(expiryMatch[1], 10);
  const expYear = parseInt('20' + expiryMatch[2], 10);

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return { isValid: false, message: 'The card has expired. Please use a valid card.' };
  }

  // Validate CVV (3 or 4 digits)
  const cleanCVV = String(cvv).trim();
  if (!/^\d{3,4}$/.test(cleanCVV)) {
    return { isValid: false, message: 'CVV must be 3 or 4 digits.' };
  }

  return { isValid: true, message: '' };
}

/**
 * Validates Net Banking selection
 * @param {string} bankCode
 * @returns {{ isValid: boolean, message: string }}
 */
export function validateNetBanking(bankCode) {
  if (!bankCode) {
    return { isValid: false, message: 'Please select your bank for Net Banking payment.' };
  }

  const validCodes = SUPPORTED_BANKS.map((b) => b.code);
  if (!validCodes.includes(bankCode)) {
    return { isValid: false, message: 'Unsupported bank selected. Choose from SBI, HDFC, ICICI, Axis, or PNB.' };
  }

  return { isValid: true, message: '' };
}

/**
 * Simulates gateway payment authorization
 * SECURITY: Never persists or accepts raw card credentials or PINs in returned payloads.
 *
 * @param {object} params
 * @param {string} params.eventId
 * @param {string} params.userId
 * @param {number} params.quantity
 * @param {number} params.unitPrice
 * @param {string} params.method - 'UPI' | 'Card' | 'NetBanking'
 * @returns {Promise<object>} Payment authorization receipt
 */
export async function processPayment({ eventId, userId, quantity = 1, unitPrice = 0, method = 'UPI' }) {
  if (!eventId) throw new Error('Missing event ID for payment processing.');
  if (quantity < 1 || quantity > 5) throw new Error('Ticket quantity must be between 1 and 5.');

  const totalAmount = Number(unitPrice) * Number(quantity);

  // Simulate gateway latency
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const bookingId = `PLN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const transactionId = `TXN${Date.now()}`;
  const paidAt = new Date().toISOString();

  return {
    success: true,
    bookingId,
    transactionId,
    paidAt,
    quantity,
    unitPrice: Number(unitPrice),
    totalAmount,
    method
  };
}
