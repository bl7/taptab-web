
🌐 TAPTAB WEBSITE DRAFT
Tagline: “Smart Ordering. Happy Tables.”

🔁 1. Site Map Overview
Page	URL	SEO Purpose
Home	/	Keyword-rich landing
Features	/features	POS + QR ordering keywords
How it Works	/how-it-works	Funnel for user understanding
Pricing	/pricing	Monetization & plan conversion
FAQ	/faq	SEO-rich queries & organic traffic
Contact	/contact	Trust, conversion
Dashboard (Login)	/login	Auth landing

🎨 2. Vibe & Aesthetic
Visual Style: Vector illustrations of restaurant staff, guests, kitchens, cozy hospitality scenes

Inspiration: The image you sent — curved containers, modern sans-serif fonts, warm playful colors (similar to Stripe, Notion, Framer)

Animations:

GSAP + Framer Motion

Floating stars/steam effects around food

Table order animations

Sticky pricing CTA

🏠 3. Home Page (/)
Hero Section:
Title: “Revolutionize Table Service with TapTab”

Subtitle: “From QR ordering to smart printing, TapTab makes restaurants run smoother.”

CTA: Try it Free and See How It Works

Features Preview:
Icons for: QR Menu, Waiter App, Bluetooth Printing, Admin Dashboard

Visual:
Restaurant scene with guests scanning QR

Waiter holding a tablet with TapTab UI

Social Proof:
“Trusted by 500+ Restaurants in the UK”

Partner logos (filler if none yet)

Testimonials:
Carousel of 3 happy owners with photos

CTA Strip:
“Take orders in 30 seconds flat – Start Free Today”

⚙️ 4. Features Page (/features)
Break features by use-case:

🪑 Guest Features
QR table ordering

Real-time order status

Multi-language support

🧍 Staff Features
Waiter tablet app

Manual Bluetooth print override

Cancel/edit tickets

Order status tracking (served, pending)

👨‍🍳 Kitchen/Printer
One-click print to kitchen from Admin device

Auto printing & retries

Offline mode queue

🧑‍💻 Admin Dashboard
Menu sync

Modifier/tag support

Printer pairing

Table management

Each block animated in from left/right with framer-motion.

💡 5. How It Works (/how-it-works)
Step-by-step illustration:

Guest scans QR → selects items

Kitchen receives print

Waiter updates status

Admin tracks orders + syncs

With animated SVG line between them + interaction on hover.

💰 6. Pricing Page (/pricing)
Plan	Price	Features
Starter	Free	Up to 5 tables, QR ordering
Pro	£29/mo	Bluetooth printing, dashboard, modifiers
Premium	£59/mo	All features, unlimited devices

Animated pricing switcher (monthly/yearly)

Comparison Table:
Tick & cross layout for feature comparison

❓ 7. FAQ Page (/faq)
Use structured data (FAQPage) for SEO.
Sample questions:

How do guests place orders?
Guests scan a QR code and browse your live menu — no app needed.

Does TapTab work offline?
Yes. Orders are queued and synced when back online.

Can we use our existing printers?
TapTab works with most Sunmi/Android-based Bluetooth thermal printers.

Can I control which orders get printed?
Yes, only admin devices can auto-print. Staff can manually trigger print too.

📬 8. Contact Page (/contact)
Contact Form (Netlify/NextJS API)

Email + WhatsApp link

Support hours

Map (optional)

🔐 9. Login Page (/login)
Simple branded form:

Email + password

OTP flow ready (in future)

CTA: “Need a restaurant account? [Start Free Trial]”

🔧 10. Technical Plan
Tech	Stack
Frontend	Next.js + Tailwind + Framer Motion
Backend	Next.js API + PostgreSQL via pg
Auth	Magic link / password login (NextAuth or custom)
Print Logic	Capacitor plugin for Sunmi/Bluetooth
PWA	Mobile-friendly, offline queueing
SEO	Structured Data, Open Graph, full meta tagging

✅ 11. Cursor-Compatible TODO List (in .taptab.todo.md)
markdown
Copy
Edit
- [ ] Create Next.js project
- [ ] Setup Tailwind CSS
- [ ] Add GSAP / Framer Motion
- [ ] Build `/` Home page with animated hero + CTA
- [ ] Build `/features` with icon sections
- [ ] Build `/how-it-works` timeline
- [ ] Build `/pricing` with toggle + table
- [ ] Build `/faq` with schema markup
- [ ] Build `/contact` with form
- [ ] Implement SEO meta tags on all pages
- [ ] Add `/login` with future-proofed flow
- [ ] Setup PWA capabilities