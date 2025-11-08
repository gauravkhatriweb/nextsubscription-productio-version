/**
 * Landing Page Content Constants
 * 
 * Centralized copy for the landing page to enable easy A/B testing
 */

export const LANDING_CONTENT = {
  // Hero Section
  hero: {
    headline: "Premium Subscriptions.\n<span class='text-[var(--theme-primary)]'>Pay Less.</span>\nStay Secure.",
    subheadline: "Access Netflix, Adobe, GPT & more — verified vendors, warranties, worry-free sharing.",
    primaryCta: "Start Saving Today",
    secondaryCta: "How It Works"
  },
  
  // Benefits Section
  benefits: {
    headline: "Why Pay More?",
    subheadline: "Get everything you need without the premium price tag",
    items: [
      {
        title: "Warranty Included",
        description: "Every subscription comes with our 100% satisfaction guarantee. Not happy? We'll fix it or refund you.",
        icon: "shield"
      },
      {
        title: "Verified Vendors",
        description: "All our vendors are thoroughly vetted and regularly audited to ensure reliability and quality service.",
        icon: "verified"
      },
      {
        title: "Safe Payments",
        description: "Bank-level encryption keeps your financial information secure. We never store your payment details.",
        icon: "lock"
      }
    ]
  },
  
  // Pricing Comparison
  pricing: {
    headline: "Why Pay More?",
    subheadline: "Compare the cost of premium subscriptions vs Next Subscription",
    original: {
      title: "Original Price",
      items: [
        { name: "Netflix Premium", price: "$19.99/mo" },
        { name: "Spotify Premium", price: "$12.99/mo" },
        { name: "Adobe Creative Suite", price: "$79.99/mo" }
      ],
      total: "$112.97"
    },
    nextSubscription: {
      title: "Next Subscription",
      items: [
        { name: "Netflix Premium", price: "$5.99/mo" },
        { name: "Spotify Premium", price: "$3.99/mo" },
        { name: "Adobe Creative Suite", price: "$19.99/mo" }
      ],
      total: "$29.97",
      savings: "Save 73% Monthly!"
    }
  },
  
  // Process
  process: {
    headline: "How It Works",
    subheadline: "Get instant access to premium subscriptions in three simple steps",
    steps: [
      {
        number: "1",
        title: "Choose Plan",
        description: "Browse our selection of premium subscriptions and choose the ones you need."
      },
      {
        number: "2",
        title: "Checkout",
        description: "Complete your purchase with our secure checkout process in under 2 minutes."
      },
      {
        number: "3",
        title: "Access Instantly",
        description: "Get immediate access to all your subscriptions with login credentials delivered instantly."
      }
    ]
  },
  
  // Trust
  trust: {
    headline: "Peace of Mind",
    subheadline: "Your security and satisfaction are our top priorities",
    items: [
      {
        title: "Verified Vendor Shield",
        description: "All our vendors undergo rigorous verification and are regularly audited to ensure quality and reliability."
      },
      {
        title: "Secure Transactions",
        description: "Bank-level encryption and secure payment processing ensure your financial information is always protected."
      }
    ]
  },
  
  // Testimonials
  testimonials: {
    headline: "Our Members Save Up to 80% — Here's Proof",
    subheadline: "Join thousands of satisfied customers saving every month",
    items: [
      {
        id: 1,
        text: "Saved 70% on my Netflix Pro Plan. The service is just as good and I get instant access every month!",
        author: "Sarah K."
      },
      {
        id: 2,
        text: "I was skeptical at first, but after 6 months of flawless service, I'm a believer. Worth every penny!",
        author: "Michael T."
      },
      {
        id: 3,
        text: "Cut my monthly subscription costs by more than half. The customer support team is also super responsive.",
        author: "Jennifer L."
      }
    ]
  },
  
  // Final CTA
  finalCta: {
    headline: "Join Thousands Saving Every Month",
    subheadline: "Get instant access to premium subscriptions at a fraction of the price. Secure, simple, and guaranteed.",
    primaryCta: "Get Your Subscription Now"
  },
  
  // Mini FAQ
  faq: {
    headline: "Frequently Asked Questions",
    items: [
      {
        question: "How is this legal and safe?",
        answer: "Our service operates through verified vendors who provide legitimate account sharing options. All vendors undergo rigorous verification, and we provide a 100% satisfaction guarantee with warranty protection for all subscriptions."
      },
      {
        question: "What warranties do you offer?",
        answer: "We offer a 30-day replacement guarantee window. If your subscription stops working, we'll replace it or provide a full refund. Our customer support team is available 24/7 to assist with any issues."
      },
      {
        question: "How does access work?",
        answer: "Depending on the vendor, you'll receive either an invite link, shared account credentials, or a license key. All access methods are verified and tested by our team before being offered to customers."
      },
      {
        question: "How do I get help?",
        answer: "Our support team is available 24/7 through our help center. You can also contact us directly via email at support@nextsubscription.com or through the live chat feature in your account dashboard."
      }
    ]
  },
  
  // Stats
  stats: {
    activeSubscriptions: "12,842",
    satisfiedCustomers: "98%",
    averageSavings: "73%"
  }
};

export default LANDING_CONTENT;