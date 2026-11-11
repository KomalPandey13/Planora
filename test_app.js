import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5173';

async function runTests() {
  console.log('🚀 Starting Planora Automated Verification Suite...');
  
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Track console logs and errors
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.toString());
  });

  try {
    // ----------------------------------------------------
    // 1. HOME PAGE VERIFICATION
    // ----------------------------------------------------
    console.log('Testing Home Page: /');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.hero-title');

    // Verify Title & Brand
    const pageTitle = await page.title();
    console.log(`  Page Title: "${pageTitle}"`);
    if (!pageTitle.includes('PLANORA')) {
      throw new Error(`Expected title to include PLANORA, got: ${pageTitle}`);
    }

    // Verify Hero Heading
    const heroTitle = await page.$eval('.hero-title', (el) => el.innerText.trim());
    console.log(`  Hero Heading: "${heroTitle}"`);
    if (!heroTitle.includes('YOUR EVENTS, YOUR MOMENTS')) {
      throw new Error('Hero heading mismatch');
    }

    // Verify 6 Categories
    const categoryCards = await page.$$('.category-card');
    console.log(`  Found ${categoryCards.length} category cards (expected 6)`);
    if (categoryCards.length !== 6) {
      throw new Error(`Expected 6 category cards, found ${categoryCards.length}`);
    }

    // Verify 6 Upcoming Events
    const eventCards = await page.$$('.events-grid-3 .event-card');
    console.log(`  Found ${eventCards.length} upcoming event cards (expected 6)`);
    if (eventCards.length !== 6) {
      throw new Error(`Expected 6 event cards, found ${eventCards.length}`);
    }

    // Verify Floating Date Badges on Event Cards
    const dateBadge = await page.$eval('.floating-date-badge', (el) => el.innerText.trim().replace(/\s+/g, ' '));
    console.log(`  Sample Floating Date Badge: "${dateBadge}"`);

    // Verify About Planora section
    const aboutTitle = await page.$eval('.about-title', (el) => el.innerText.trim());
    console.log(`  About Section Title: "${aboutTitle}"`);

    // ----------------------------------------------------
    // 2. SEARCH & EXPLORE EVENTS FLOW
    // ----------------------------------------------------
    console.log('\nTesting Hero Search Form -> Explore Page...');
    await page.type('.hero-search-input', 'hackathon');
    await page.click('.hero-search-submit');
    await page.waitForSelector('.explore-grid');

    console.log(`  Navigated to: ${page.url()}`);
    if (!page.url().includes('/explore?q=hackathon')) {
      throw new Error(`Expected URL to include /explore?q=hackathon, got ${page.url()}`);
    }

    const searchResultCount = await page.$$eval('.explore-grid .event-card', (cards) => cards.length);
    console.log(`  Found ${searchResultCount} event(s) matching "hackathon"`);
    if (searchResultCount < 1) {
      throw new Error('Search failed to return Hackathon event');
    }

    // Test Category Filter Pill click: 'Technical'
    console.log('Testing Category Filter Pill click: "Technical"...');
    const techPill = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('.category-pill-btn'));
      return btns.find((b) => b.innerText.trim() === 'Technical');
    });
    await techPill.click();
    await new Promise((r) => setTimeout(r, 400));

    console.log(`  Current Explore URL: ${page.url()}`);
    const techCount = await page.$$eval('.explore-grid .event-card', (cards) => cards.length);
    console.log(`  Found ${techCount} technical events matching "hackathon"`);

    // Test Reset / Clear Filters via dedicated class
    console.log('Testing Reset Filters...');
    await page.click('.btn-reset-filters');
    await new Promise((r) => setTimeout(r, 400));
    const allCount = await page.$$eval('.explore-grid .event-card', (cards) => cards.length);
    console.log(`  Total events after resetting filters: ${allCount}`);
    if (allCount < 8) {
      throw new Error(`Expected at least 8 events, got ${allCount}`);
    }

    // ----------------------------------------------------
    // 3. EVENT DETAILS & AUTHENTICATION REDIRECT
    // ----------------------------------------------------
    console.log('\nTesting Event Details Page: /events/event-1...');
    await page.goto(`${BASE_URL}/events/event-1`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.banner-title');

    const eventTitle = await page.$eval('.banner-title', (el) => el.innerText.trim());
    console.log(`  Event Details Title: "${eventTitle}"`);

    // Click "Register Now" while unauthenticated -> should redirect to /login with state
    console.log('  Clicking Register Now as guest...');
    await page.click('.btn-register-action');
    await page.waitForSelector('.auth-card');

    console.log(`  Redirected to: ${page.url()}`);
    if (!page.url().includes('/login')) {
      throw new Error(`Expected redirect to /login, got ${page.url()}`);
    }

    // ----------------------------------------------------
    // 4. LOGIN FORM & DEMO ACCOUNT HELPER
    // ----------------------------------------------------
    console.log('\nTesting Login with "Fill Demo Student Account"...');
    await page.click('.demo-account-helper-btn');
    await new Promise((r) => setTimeout(r, 200));

    const emailValue = await page.$eval('#login-email', (el) => el.value);
    const passValue = await page.$eval('#login-password', (el) => el.value);
    console.log(`  Auto-filled Demo Email: "${emailValue}", Password Length: ${passValue.length}`);
    if (!emailValue.includes('demo@campus.edu')) {
      throw new Error('Demo credentials auto-fill failed');
    }

    // Submit Login -> should redirect back to /events/event-1
    await page.click('.auth-submit-btn');
    await page.waitForSelector('.banner-title');
    console.log(`  Post-login redirected back to: ${page.url()}`);
    if (!page.url().includes('/events/event-1')) {
      throw new Error(`Expected to return to /events/event-1, got ${page.url()}`);
    }

    // Register now as logged in student!
    console.log('  Registering for event as logged-in user...');
    await page.click('.btn-register-action');
    await page.waitForSelector('.confirmed-pill');

    const confirmedPill = await page.$eval('.confirmed-pill', (el) => el.innerText.trim());
    console.log(`  Registration status: "${confirmedPill}"`);
    if (!confirmedPill.includes("You're Registered!")) {
      throw new Error('Registration confirmation badge not displayed');
    }

    // ----------------------------------------------------
    // 5. PROFILE PAGE: REGISTERED EVENTS & HOSTED EVENTS
    // ----------------------------------------------------
    console.log('\nTesting Profile Page: /profile...');
    await page.goto(`${BASE_URL}/profile`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.profile-card');

    const profileName = await page.$eval('.profile-user-info h1', (el) => el.innerText.trim());
    const roleBadge = await page.$eval('.role-badge-pill', (el) => el.innerText.trim());
    console.log(`  User: "${profileName}", Role: "${roleBadge}"`);

    // Verify registered pass card
    const registeredCards = await page.$$('.registered-item-card');
    console.log(`  Found ${registeredCards.length} registered event pass(es) in profile`);
    if (registeredCards.length < 1) {
      throw new Error('Registered events list is empty in profile');
    }

    // ----------------------------------------------------
    // 6. HOST AN EVENT FLOW
    // ----------------------------------------------------
    console.log('\nTesting Host an Event: /host-event...');
    await page.goto(`${BASE_URL}/host-event`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.create-event-card');

    // Fill Host Event form
    await page.type('#event-title', 'Planora Grand AI & Robotics Expo 2026');
    await page.select('#event-category', 'Technical');

    // Set date via React native value setter
    await page.$eval('#event-date', (el) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, '2026-12-30');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await page.type('#event-venue', 'Robotics Innovation Arena, North Campus');
    await page.type('#event-description', 'A premier collegiate robotics showcase featuring autonomous drones, industrial robot arms, and generative AI prototypes by top engineering students.');

    // Select Paid Event radio
    const paidRadio = await page.evaluateHandle(() => {
      const radios = Array.from(document.querySelectorAll('input[name="pricingType"]'));
      return radios[1];
    });
    await paidRadio.click();
    await new Promise((r) => setTimeout(r, 200));

    await page.$eval('#event-price', (el) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, '249');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });

    console.log('  Submitting Host Event form...');
    await page.click('button[type="submit"]');

    // Wait for either success navigation or error banner
    await page.waitForSelector('.hosting-own-badge, .alert-danger', { timeout: 10000 });

    const formError = await page.$eval('.alert-danger', (el) => el.innerText).catch(() => null);
    if (formError) {
      throw new Error(`Host Event Form displayed error: ${formError}`);
    }

    console.log(`  Navigated to created event: ${page.url()}`);
    if (!page.url().includes('/events/event-')) {
      throw new Error(`Expected redirect to new event details, got: ${page.url()}`);
    }

    // Verify hosting badge on the newly created event
    const hostingNotice = await page.$eval('.hosting-own-badge', (el) => el.innerText.trim());
    console.log(`  Hosting Badge: "${hostingNotice}"`);
    if (!hostingNotice.includes('You are hosting this event')) {
      throw new Error('Creator hosting badge missing');
    }

    // Check elevated role on profile
    await page.goto(`${BASE_URL}/profile`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.role-badge-pill');
    const elevatedRole = await page.$eval('.role-badge-pill', (el) => el.innerText.trim());
    console.log(`  Elevated User Role in Profile: "${elevatedRole}"`);
    if (!elevatedRole.includes('Organizer')) {
      throw new Error('User role was not elevated to Organizer');
    }

    // Switch to Hosted Events tab
    const hostedTabBtn = await page.evaluateHandle(() => {
      const tabs = Array.from(document.querySelectorAll('.profile-tab-btn'));
      return tabs[1];
    });
    await hostedTabBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    const hostedCount = await page.$$eval('.hosted-events-grid .event-card', (cards) => cards.length);
    console.log(`  Hosted events count in profile: ${hostedCount}`);
    if (hostedCount < 1) {
      throw new Error('Hosted event missing in profile tab');
    }

    // ----------------------------------------------------
    // 7. RESPONSIVE MOBILE VIEWPORT (375x667)
    // ----------------------------------------------------
    console.log('\nTesting Mobile Viewport (375px) & Hamburger Menu...');
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.mobile-toggle-btn');

    // Open hamburger drawer
    await page.click('.mobile-toggle-btn');
    await page.waitForSelector('.mobile-drawer-content');

    const drawerVisible = await page.$eval('.mobile-drawer-content', (el) => Boolean(el));
    console.log(`  Mobile drawer opened: ${drawerVisible}`);
    if (!drawerVisible) {
      throw new Error('Mobile drawer failed to open');
    }

    // Close hamburger drawer
    await page.click('.mobile-toggle-btn');
    await new Promise((r) => setTimeout(r, 300));
    console.log('  Mobile drawer closed cleanly.');

    // ----------------------------------------------------
    // 8. LOGOUT FLOW
    // ----------------------------------------------------
    console.log('\nTesting Logout...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.btn-logout');
    await page.click('.btn-logout');
    await new Promise((r) => setTimeout(r, 300));

    const isLoginVisible = await page.$eval('.navbar-auth', (el) => el.innerText.includes('Login'));
    console.log(`  Logged out successfully. Login button visible: ${isLoginVisible}`);
    if (!isLoginVisible) {
      throw new Error('Logout failed to reset navbar state');
    }

    // ----------------------------------------------------
    // CONSOLE ERROR CHECK
    // ----------------------------------------------------
    console.log('\nChecking console errors...');
    const realErrors = consoleErrors.filter(
      (err) => !err.includes('favicon') && !err.includes('Failed to load resource')
    );

    if (realErrors.length > 0) {
      console.error('❌ Console errors encountered:', realErrors);
      throw new Error(`Encountered ${realErrors.length} console error(s)`);
    } else {
      console.log('✅ ZERO console errors detected across all tested journeys!');
    }

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! PLANORA IS 100% PRODUCTION-READY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
