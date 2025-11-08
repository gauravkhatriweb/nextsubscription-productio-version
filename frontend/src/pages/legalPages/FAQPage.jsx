import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const FAQPage = () => {
  const [openFAQ, setOpenFAQ] = useState(null)

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const faqs = [
    {
      question: "How do I create an account?",
      answer: "Sign up using your email or phone number, set a password, and verify with OTP."
    },
    {
      question: "How do I manage my subscriptions?",
      answer: "Enter your subscription details, choose a plan type, and confirm."
    },
    {
      question: "What subscription types are available?",
      answer: "Monthly, quarterly, annual, and custom billing cycle options."
    },
    {
      question: "What is Premium Plan?",
      answer: "A premium subscription service with added benefits and features for subscribers."
    },
    {
      question: "How do I pay for my subscription?",
      answer: "Pay via cash, JazzCash, EasyPaisa, or integrated digital wallets."
    },
    {
      question: "Can I switch languages?",
      answer: "Yes, English, Urdu, and Roman Urdu are available in-app."
    },
    {
      question: "How is my security ensured?",
      answer: "Verified providers, secure payments, and data encryption."
    },
    {
      question: "What if a provider cancels?",
      answer: "Another provider is automatically assigned to minimize disruption."
    },
    {
      question: "How do I contact my provider?",
      answer: "Call or chat securely via the in-app communication system."
    },
    {
      question: "Can I schedule payments in advance?",
      answer: "Yes, schedule payments for a later time and date directly from the app."
    },
    {
      question: "How do I rate my service?",
      answer: "After each service, submit your rating and optional feedback in the app."
    },
    {
      question: "Can I share my subscription details with family/friends?",
      answer: "Yes, share your subscription info for collaborative management."
    },
    {
      question: "Is Next Subscription available in my city?",
      answer: "Currently available in major urban cities; expansion is ongoing."
    },
    {
      question: "What if I lose access to my account?",
      answer: "Contact our support team through the app for account recovery assistance."
    },
    {
      question: "Can I manage multiple subscriptions?",
      answer: "Yes, you can add and manage multiple subscriptions in one dashboard."
    },
    {
      question: "Are the pricing fixed or dynamic?",
      answer: "Pricing may vary slightly based on plan type and billing cycle."
    },
    {
      question: "How do I cancel a subscription?",
      answer: "Use the cancel option in the app; cancellation charges may apply."
    },
    {
      question: "Do I need an account to manage subscriptions?",
      answer: "Yes, registration is required to ensure verified and secure service."
    },
    {
      question: "Can I use Next Subscription for business services?",
      answer: "Yes, select the business service option and provide service details."
    },
    {
      question: "How do I contact Next Subscription support?",
      answer: "Tap the help/support section in the app to chat, email, or call."
    }
  ]

  return (
    <div className='relative min-h-screen w-full bg-[var(--theme-background)] text-[var(--theme-text)] overflow-hidden'>
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[var(--theme-primary)]/20 via-[var(--theme-secondary)]/10 to-[var(--theme-accent)]/10 blur-3xl opacity-40' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[var(--theme-primary)]/15 via-[var(--theme-secondary)]/10 to-[var(--theme-accent)]/10 blur-3xl opacity-30' />

      <main className='relative z-10 mx-auto max-w-4xl px-6 py-12 sm:py-16'>
        <header className='mb-6 sm:mb-8'>
          <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--theme-text)]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
            Frequently Asked Questions
          </h1>
          <p className='mt-2 text-[var(--theme-text-secondary)]' style={{ fontFamily: 'Inter, system-ui' }}>
            Find quick answers to common questions about Next Subscription
          </p>
        </header>

        <article className='prose prose-invert max-w-none'>
          <section className='rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-glass-background)] p-5 sm:p-7 backdrop-blur-md shadow-[var(--theme-glass-shadow)]'>
            {/* Introduction */}
            <div className='mb-8'>
              <h2 className='text-xl font-semibold mb-3 text-[var(--theme-primary)]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Next Subscription User FAQs
              </h2>
              <p className='text-[var(--theme-text-secondary)] leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
                Welcome to our comprehensive FAQ section! Here you'll find answers to the most commonly asked questions about using Next Subscription. 
                Whether you're a new user getting started or an existing subscriber looking for specific information, we've got you covered.
              </p>
            </div>

            {/* FAQ Categories */}
            <div className='mb-8'>
              <h3 className='text-lg font-semibold mb-4 text-[var(--theme-accent)]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Quick Categories
              </h3>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                <div className='text-center p-3 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] transition-colors'>
                  <div className='w-6 h-6 mx-auto mb-2 text-[var(--theme-primary)]'>
                    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                    </svg>
                  </div>
                  <span className='text-xs font-medium text-[var(--theme-text)]' style={{ fontFamily: 'Inter, system-ui' }}>Account</span>
                </div>
                <div className='text-center p-3 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] transition-colors'>
                  <div className='w-6 h-6 mx-auto mb-2 text-[var(--theme-secondary)]'>
                    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' />
                    </svg>
                  </div>
                  <span className='text-xs font-medium text-[var(--theme-text)]' style={{ fontFamily: 'Inter, system-ui' }}>Subscriptions</span>
                </div>
                <div className='text-center p-3 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] transition-colors'>
                  <div className='w-6 h-6 mx-auto mb-2 text-[var(--theme-accent)]'>
                    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                    </svg>
                  </div>
                  <span className='text-xs font-medium text-[var(--theme-text)]' style={{ fontFamily: 'Inter, system-ui' }}>Security</span>
                </div>
                <div className='text-center p-3 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] transition-colors'>
                  <div className='w-6 h-6 mx-auto mb-2 text-[var(--theme-accent)]'>
                    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' />
                    </svg>
                  </div>
                  <span className='text-xs font-medium text-[var(--theme-text)]' style={{ fontFamily: 'Inter, system-ui' }}>Payment</span>
                </div>
              </div>
            </div>

            {/* FAQ List */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold mb-4 text-[var(--theme-secondary)]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                All Frequently Asked Questions
              </h3>
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className='rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] overflow-hidden hover:bg-[var(--theme-surface-hover)] transition-colors'
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className='w-full text-left p-4 sm:p-5 flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-opacity-50'
                  >
                    <h4 className='text-sm sm:text-base font-semibold text-[var(--theme-text)] pr-4' style={{ fontFamily: 'Inter, system-ui' }}>
                      {faq.question}
                    </h4>
                    <div className={`flex-shrink-0 w-6 h-6 text-[var(--theme-primary)] transition-transform duration-200 ${openFAQ === index ? 'rotate-180' : ''}`}>
                      <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7' />
                      </svg>
                    </div>
                  </button>
                  {openFAQ === index && (
                    <div className='px-4 sm:px-5 pb-4 sm:pb-5'>
                      <p className='text-[var(--theme-text-secondary)] leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Additional Help Section */}
            <div className='mt-8 pt-6 border-t border-[var(--theme-border)]'>
              <h3 className='text-lg font-semibold mb-4 text-[var(--theme-accent)]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>
                Still Need Help?
              </h3>
              <div className='rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5'>
                <p className='text-[var(--theme-text-secondary)] mb-4' style={{ fontFamily: 'Inter, system-ui' }}>
                  If you couldn't find the answer to your question, our support team is here to help. 
                  We're available 24/7 to assist you with any issues or concerns you may have.
                </p>
                <div className='flex flex-col sm:flex-row gap-3'>
                  <Link 
                    to='/legal/contact' 
                    className='inline-flex items-center justify-center rounded-full bg-[var(--theme-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-[var(--theme-shadow-brand)] hover:scale-[1.02] transition-transform'
                    style={{ fontFamily: 'Inter, system-ui' }}
                  >
                    Contact Support
                  </Link>
                  <Link 
                    to='/user/login' 
                    className='inline-flex items-center justify-center rounded-full bg-[var(--theme-surface)] px-5 py-2.5 text-sm font-bold text-[var(--theme-text)] border border-[var(--theme-border)] shadow-[var(--theme-shadow-small)] hover:scale-[1.02] transition-transform'
                    style={{ fontFamily: 'Inter, system-ui' }}
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <div className='mt-8 flex items-center justify-center'>
            <Link
              to='/'
              className='inline-flex items-center justify-center rounded-full bg-[var(--theme-surface)] px-6 py-3 text-sm font-bold text-[var(--theme-text)] ring-1 ring-[var(--theme-border)] shadow-[var(--theme-shadow-small)] hover:scale-[1.01] transition'
              style={{ fontFamily: 'Inter, system-ui' }}
            >
              Back to Home
            </Link>
          </div>

          <footer className='mt-6 text-xs text-[var(--theme-text-subtle)]' style={{ fontFamily: 'Inter, system-ui' }}>
            Last updated: {new Date().toLocaleDateString()}
          </footer>
        </article>
      </main>
    </div>
  )
}

export default FAQPage