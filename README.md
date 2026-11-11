# PLANORA – College Event Management Platform

A production-grade, responsive frontend web application built with **React 19**, **JavaScript (ES6+)**, **Vite**, **Modular Responsive CSS with CSS Variables (zero Tailwind)**, **Lucide React**, and **React Router DOM**.

---

## Features & Highlights

- **Visual Design System**: Soft lavender surfaces (`#FAF8FF`), deep violet brand accents (`#6D28D9`), clean white cards, floating date badges, and typography powered by `Plus Jakarta Sans` and `Inter`.
- **Security & Media Utilities**:
  - SHA-256 Web Crypto API password hashing (`utils/security.js`).
  - XSS input sanitization and email/password validators.
  - HTML5 Canvas image compressor auto-resizing uploaded event banners to max 800px width at 0.75 JPEG quality to keep localStorage well under quota limits.
- **Dual-Role Progression**: Seamless transition from `Student` to `Organizer` upon hosting an event without creating separate accounts.
- **Instant Digital Passes**: Complete booking metadata with simulated QR code verification, Booking ID, and pass cancellation.
- **Hero & Live Explore**: Real-time query search (`?q=`), 6 category filters (`?category=`), empty states, and zero-leak state management.
- **Zero Console Errors**: End-to-end verified with headless Chrome automation across desktop, laptop, tablet, and mobile views.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
# Server runs on: http://localhost:5173/

# Run End-to-End Automated Browser Test Suite
npm test

# Build for Production
npm run build
```

---

## Demo Account Credentials

For instant one-click testing:
- Click the **"Fill Demo Student Account"** button on the `/login` page.
- **Email**: `demo@campus.edu`
- **Password**: `demopass123`

