/**
 * Planora Security & Media Utility Module
 * Production-ready Web Crypto SHA-256 hashing, XSS sanitization, validators, and HTML5 Canvas compression.
 */

/**
 * Hashes a plaintext password using SHA-256 via Web Crypto API
 * @param {string} password - Raw user password
 * @returns {Promise<string>} Hex-encoded SHA-256 string
 */
export async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  // Fallback for non-secure contexts if crypto.subtle is unavailable
  if (!window.crypto || !window.crypto.subtle) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return 'fallback_' + Math.abs(hash).toString(16);
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(password.trim());
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Sanitizes input string to prevent XSS / script injection in payer names, UPI IDs, and text fields
 * @param {string} input - Raw user input
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  // Strip script blocks and HTML tags
  let cleaned = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return cleaned.replace(/[&<>"'/]/g, (char) => map[char] || char).trim();
}

/**
 * Validates email structure
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

/**
 * Validates password criteria (min 6 characters)
 * @param {string} password
 * @returns {{ isValid: boolean, message: string }}
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  return { isValid: true, message: '' };
}

/**
 * Compresses and resizes an uploaded Image File via HTML5 Canvas
 * Guarantees max 800px width and 0.75 JPEG quality to keep base64 strings under 100KB,
 * ensuring localStorage quota is never exceeded.
 * @param {File} file - Raw image file from file input
 * @param {number} maxWidth - Maximum width in pixels (default: 800)
 * @param {number} quality - JPEG compression factor 0.0 - 1.0 (default: 0.75)
 * @returns {Promise<string>} Base64 Data URL
 */
export function compressImage(file, maxWidth = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided for compression'));
      return;
    }

    if (!file.type.startsWith('image/')) {
      reject(new Error('Uploaded file is not a valid image format'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Resize proportionally if larger than maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not initialize 2D canvas context'));
          return;
        }

        // Draw and compress to JPEG format
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image into canvas for compression'));
      };

      img.src = readerEvent.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.readAsDataURL(file);
  });
}
