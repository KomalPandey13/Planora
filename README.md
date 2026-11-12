# PLANORA – College Event Management Platform

A production-grade, responsive frontend web application built with **React 19**, **JavaScript (ES6+)**, **Vite**, **Modular Responsive CSS with CSS Variables (zero Tailwind)**, **Lucide React**, and **React Router DOM**.

---

## 🌟 Key Features & Highlights

- **Visual Design System**: Soft lavender surfaces (`#FAF8FF`), deep violet brand accents (`#6D28D9`), clean white cards, floating date badges, and typography powered by `Plus Jakarta Sans` and `Inter`.
- **Payment & QR Ticketing Architecture**:
  - Multi-method interactive checkout modal supporting **UPI / VPA** (with quick-fill demo chips for GPay, PhonePe, and Paytm), **Credit/Debit Card** (auto-formatted 16-digit card input, MM/YY expiry, masked CVV), and **Net Banking** (SBI, HDFC, ICICI, Axis, PNB).
  - Client-side payment validation including the **Luhn checksum algorithm** for card numbers, UPI format verification, and expiry checks.
  - Sleek violet-and-white **Boarding-Pass style QR ticket pass** featuring a deterministic SVG QR code derived from the unique `Booking ID` and browser print integration (`window.print()`).
  - 1-click instant registration for Free events with backward-compatible booking pass generation.
- **Security & Privacy Practices**:
  - **PCI-DSS Compliance**: Ephemeral form state handling—raw card numbers, CVVs, expiry dates, or UPI PINs are never persisted to storage or returned in gateway receipts.
  - **SHA-256 Web Crypto API** password hashing (`window.crypto.subtle.digest`).
  - **XSS sanitization** stripping script blocks and HTML entities from all payer and event input fields.
  - **HTML5 Canvas Image Compressor** auto-resizing uploaded event banners to max 800px width at 0.75 JPEG quality to safeguard `localStorage` from quota limits.
- **Dual-Role Progression**: Seamless transition from `Student` to `Organizer` upon hosting an event without creating separate accounts.
- **Hero & Live Explore**: Real-time query search (`?q=`), 6 category filters (`?category=`), empty states, and zero-leak state management.
- **Vercel Cloud Deployment Ready**: Pre-configured `vercel.json` with SPA routing rewrites and hardened HTTP security headers (`nosniff`, `DENY`, `strict-origin-when-cross-origin`).

---

## 👥 Engineering Team & Contributors

| Contributor | Role | GitHub Email | Responsibilities |
| :--- | :--- | :--- | :--- |
| **Shubhangi Mishra** | UI/UX Design & Styling | `mishrashubhangi407@gmail.com` | Visual design system, modular CSS stylesheets, responsive layouts, checkout modal UI, and printable boarding pass ticket styling |
| **Utkarsh Tiwari** | Backend, Auth & Payments | `utkarshtiwarivicky2799@gmail.com` | Mock data models, Web Crypto SHA-256 security utilities, authentication service, and payment validation (Luhn/UPI) service |
| **Komal Pandey** | Core Architecture & Deployment | `komalpandey23139936@gmail.com` | Event API services, global state management, event hosting workflow, Vercel SPA deployment config, and security headers |
| **Vibhanshu** | Frontend Pages & Components | `vibhanshum01@gmail.com` | Reusable UI components (EventCard, CategoryGrid, Auth forms), student pages (Explore, EventDetails, Profile), and interactive flows |

---

## 🚀 Quick Start & Development

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
# Server runs on: http://localhost:5173/

# 3. Run End-to-End Automated Browser Test Suite
npm test

# 4. Build for Production
npm run build
```

---

## 🔒 Security & Vercel Deployment

The project includes `vercel.json` configured for single-page application routing and strict HTTP security response headers:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### To Deploy to Vercel:
1. Connect your GitHub repository to Vercel.
2. Select Framework Preset: **Vite**.
3. Build Command: `npm run build` | Output Directory: `dist`.
4. Deploy!

---

## 🔑 Demo Account Credentials

For instant one-click testing:
- Click the **"Fill Demo Student Account"** button on the `/login` page.
- **Email**: `demo@campus.edu`
- **Password**: `demopass123`
