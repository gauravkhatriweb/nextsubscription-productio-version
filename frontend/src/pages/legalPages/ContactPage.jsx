import React from 'react'
import { Link } from 'react-router-dom'

const ContactPage = () => {
  return (
    <div className='relative min-h-screen w-full bg-[var(--theme-background)] text-[var(--theme-text)] overflow-hidden'>
      <div className='pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[var(--theme-primary)]/20 via-[var(--theme-secondary)]/10 to-[var(--theme-accent)]/10 blur-3xl opacity-40' />
      <div className='pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[var(--theme-primary)]/15 via-[var(--theme-secondary)]/10 to-[var(--theme-accent)]/10 blur-3xl opacity-30' />

      <main className='relative z-10 mx-auto max-w-4xl px-6 py-12 sm:py-16'>
        <header className='mb-6 sm:mb-8'>
          <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--theme-text)]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Contact Us</h1>
          <p className='mt-2 text-[var(--theme-text-secondary)]' style={{ fontFamily: 'Inter, system-ui' }}>Get in touch with Next Subscription – We're here to help!</p>
        </header>

        <article className='prose prose-invert max-w-none'>
          <section className='rounded-2xl border border-[var(--theme-glass-border)] bg-[var(--theme-glass-background)] p-5 sm:p-7 backdrop-blur-md shadow-[var(--theme-glass-shadow)]'>
            <div className='space-y-8'>
              {/* Welcome Message */}
              <div>
                <h2 className='text-xl font-semibold mb-3 text-[var(--theme-primary)]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>We're Here to Help</h2>
                <p className='text-[var(--theme-text-secondary)] leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
                  At Next Subscription, your satisfaction is our priority. Whether you have questions about our services, need technical support, or want to provide feedback, we're always ready to assist you. Our dedicated customer support team is committed to providing you with the best possible experience.
                </p>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className='text-lg font-semibold mb-4 text-[var(--theme-accent)]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Contact Information</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Email Support */}
                  <div className='flex items-start gap-4 p-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)]'>
                    <div className='flex-shrink-0 w-12 h-12 rounded-full bg-[var(--theme-primary)]/20 flex items-center justify-center'>
                      <svg className='w-6 h-6 text-[var(--theme-primary)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                      </svg>
                    </div>
                    <div>
                      <h3 className='font-semibold text-[var(--theme-text)] mb-1' style={{ fontFamily: 'Inter, system-ui' }}>Email Support</h3>
                      <p className='text-sm text-[var(--theme-text-secondary)] mb-2' style={{ fontFamily: 'Inter, system-ui' }}>Send us your questions anytime</p>
                      <a href='mailto:customersupport@nextsubscription.com' className='text-[var(--theme-primary)] hover:text-[var(--theme-accent)] text-sm font-medium transition-colors'>
                        customersupport@nextsubscription.com
                      </a>
                    </div>
                  </div>

                  {/* Phone Support */}
                  <div className='flex items-start gap-4 p-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)]'>
                    <div className='flex-shrink-0 w-12 h-12 rounded-full bg-[var(--theme-secondary)]/20 flex items-center justify-center'>
                      <svg className='w-6 h-6 text-[var(--theme-secondary)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                      </svg>
                    </div>
                    <div>
                      <h3 className='font-semibold text-[var(--theme-text)] mb-1' style={{ fontFamily: 'Inter, system-ui' }}>Support Helpline</h3>
                      <p className='text-sm text-[var(--theme-text-secondary)] mb-2' style={{ fontFamily: 'Inter, system-ui' }}>Call us for immediate assistance</p>
                      <a href='tel:+922112345678' className='text-[var(--theme-secondary)] hover:text-[var(--theme-primary)] text-sm font-medium transition-colors'>
                        +92-21-12345678
                      </a>
                    </div>
                  </div>

                  {/* Office Address */}
                  <div className='flex items-start gap-4 p-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] md:col-span-2'>
                    <div className='flex-shrink-0 w-12 h-12 rounded-full bg-[var(--theme-accent)]/20 flex items-center justify-center'>
                      <svg className='w-6 h-6 text-[var(--theme-accent)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                      </svg>
                    </div>
                    <div>
                      <h3 className='font-semibold text-[var(--theme-text)] mb-1' style={{ fontFamily: 'Inter, system-ui' }}>Head Office</h3>
                      <p className='text-sm text-[var(--theme-text-secondary)] mb-2' style={{ fontFamily: 'Inter, system-ui' }}>Visit us at our main location</p>
                      <p className='text-[var(--theme-accent)] text-sm font-medium'>
                        5th Floor, Tech Park, Sharah-e-Faisal, Karachi
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div>
                <h2 className='text-lg font-semibold mb-4 text-[var(--theme-secondary)]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Business Hours</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='p-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)]'>
                    <h3 className='font-semibold text-[var(--theme-text)] mb-2' style={{ fontFamily: 'Inter, system-ui' }}>User Support</h3>
                    <p className='text-[var(--theme-text-secondary)]' style={{ fontFamily: 'Inter, system-ui' }}>Monday - Sunday: 24/7</p>
                    <p className='text-xs text-[var(--theme-text-subtle)] mt-1' style={{ fontFamily: 'Inter, system-ui' }}>Email and phone support available round the clock</p>
                  </div>
                  <div className='p-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)]'>
                    <h3 className='font-semibold text-[var(--theme-text)] mb-2' style={{ fontFamily: 'Inter, system-ui' }}>Office Visits</h3>
                    <p className='text-[var(--theme-text-secondary)]' style={{ fontFamily: 'Inter, system-ui' }}>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className='text-xs text-[var(--theme-text-subtle)] mt-1' style={{ fontFamily: 'Inter, system-ui' }}>Please call ahead to schedule an appointment</p>
                  </div>
                </div>
              </div>

              {/* Quick Support Options */}
              <div>
                <h2 className='text-lg font-semibold mb-4 text-[var(--theme-accent)]' style={{ fontFamily: 'Poppins, Inter, system-ui' }}>Quick Support</h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                  <div className='text-center p-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] transition-colors'>
                    <Link to='/legal/faq' className='block'>
                      <div className='w-8 h-8 mx-auto mb-2 text-[var(--theme-primary)]'>
                        <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                      </div>
                      <h3 className='text-sm font-semibold text-[var(--theme-text)] mb-1' style={{ fontFamily: 'Inter, system-ui' }}>FAQ</h3>
                      <p className='text-xs text-[var(--theme-text-subtle)]' style={{ fontFamily: 'Inter, system-ui' }}>Find quick answers</p>
                    </Link>
                  </div>
                  <div className='text-center p-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] transition-colors'>
                    <div className='w-8 h-8 mx-auto mb-2 text-[var(--theme-secondary)]'>
                      <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                    </div>
                    <h3 className='text-sm font-semibold text-[var(--theme-text)] mb-1' style={{ fontFamily: 'Inter, system-ui' }}>Help Center</h3>
                    <p className='text-xs text-[var(--theme-text-subtle)]' style={{ fontFamily: 'Inter, system-ui' }}>Browse our guides</p>
                  </div>
                  <div className='text-center p-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] transition-colors'>
                    <div className='w-8 h-8 mx-auto mb-2 text-[var(--theme-accent)]'>
                      <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z' />
                      </svg>
                    </div>
                    <h3 className='text-sm font-semibold text-[var(--theme-text)] mb-1' style={{ fontFamily: 'Inter, system-ui' }}>Live Chat</h3>
                    <p className='text-xs text-[var(--theme-text-subtle)]' style={{ fontFamily: 'Inter, system-ui' }}>Chat with support</p>
                  </div>
                  <div className='text-center p-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-hover)] transition-colors'>
                    <div className='w-8 h-8 mx-auto mb-2 text-[var(--theme-accent)]'>
                      <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                      </svg>
                    </div>
                    <h3 className='text-sm font-semibold text-[var(--theme-text)] mb-1' style={{ fontFamily: 'Inter, system-ui' }}>Report Issue</h3>
                    <p className='text-xs text-[var(--theme-text-subtle)]' style={{ fontFamily: 'Inter, system-ui' }}>Report a problem</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className='border-t border-[var(--theme-border)] pt-6'>
                <p className='text-[var(--theme-text-secondary)] leading-relaxed' style={{ fontFamily: 'Inter, system-ui' }}>
                  If you have any questions, concerns, or complaints regarding our services, privacy policy, or data practices, please don't hesitate to reach out to us using any of the contact methods above. We value your feedback and are committed to resolving any issues promptly and professionally.
                </p>
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

export default ContactPage