import { useState, useEffect } from 'react'
import { TextSplitReveal, TextSplitInView, LeftNav, PageFrame, PageHeader, Footer } from './shared'

export default function AboutUs() {
  const [revealed, setRevealed] = useState(false)
  const revealStyle: React.CSSProperties = {
    opacity: revealed ? 1 : 0,
    transition: 'opacity 1000ms ease',
  }

  useEffect(() => {
    const id = setTimeout(() => setRevealed(true), 3000)
    return () => clearTimeout(id)
  }, [])

  return (
    <div
      className="min-h-screen text-neutral-900/90 font-sans"
      style={{
        backgroundColor: '#f2ead6',
        backgroundImage: 'url(/bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <PageFrame />

      <div style={revealStyle}>
        <LeftNav />
      </div>

      <PageHeader style={revealStyle} />

      {/* Hero */}
      <section id="inevitable" className="max-w-6xl mx-auto px-6 pt-44 pb-20 text-center">
        <h1
          className="font-serif leading-[1.04] tracking-[-0.02em] mb-10"
          style={{ fontSize: 'clamp(48px, 9vw, 128px)' }}
        >
          <span style={{ display: 'block' }}>
            <TextSplitReveal text="Technology as a" />
          </span>
          <span className="block md:whitespace-nowrap">
            <TextSplitReveal text="Human-Making Project" onDone={() => setRevealed(true)} />
          </span>
        </h1>
      </section>

      <div style={revealStyle}>
        {/* Manifesto */}
        <section id="manifesto" className="max-w-4xl mx-auto px-6 pb-24">
          <h2 className="font-serif text-[2.25rem] text-center mb-8">
            <TextSplitInView text="Play our Manifesto" />
          </h2>

          <a
            href="/manifesto"
            aria-label="Enter the Manifesto"
            className="group block mx-auto w-fit cursor-pointer"
          >
            <img
              src="/cryptex.png"
              alt="The image cryptex"
              draggable={false}
              className="mx-auto w-auto object-contain transition-transform duration-700 ease-out group-hover:scale-105"
              style={{ maxWidth: 'min(620px, 88vw)', filter: 'drop-shadow(0 28px 56px rgba(30,18,4,0.32))' }}
            />
            <span className="mt-6 block text-center text-[14px] text-neutral-500 opacity-0 translate-y-1 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
              Enter the Manifesto →
            </span>
          </a>
        </section>

        {/* What makes Inevitable unique? */}
        <section id="philosophy" className="max-w-3xl mx-auto px-6 pt-16 pb-20">
          <div className="border-t border-neutral-200 mb-16" style={{ borderTopWidth: '0.5px' }} />

          <div className="mb-20">
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: 4,
                border: '1px solid rgba(70, 52, 22, 0.5)',
                background:
                  'radial-gradient(125% 120% at 50% -10%, rgba(255,251,238,0.7) 0%, rgba(243,231,203,0) 55%),' +
                  'radial-gradient(110% 110% at 50% 115%, rgba(120,90,40,0.12) 0%, rgba(243,231,203,0) 60%),' +
                  '#f1e3c4',
                boxShadow:
                  '0 2px 4px rgba(0,0,0,0.05),' +
                  '0 10px 22px rgba(0,0,0,0.09),' +
                  '0 30px 60px rgba(58,40,12,0.22),' +
                  'inset 0 1px 0 rgba(255,255,255,0.55),' +
                  'inset 0 0 110px rgba(120,90,40,0.10)',
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: 'url(/story-bg.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.16,
                  mixBlendMode: 'multiply',
                }}
              />
              <div className="pointer-events-none absolute inset-[14px] border" style={{ borderColor: 'rgba(70, 52, 22, 0.4)' }} />
              <div className="pointer-events-none absolute inset-[19px] border-[0.5px]" style={{ borderColor: 'rgba(70, 52, 22, 0.28)' }} />

              {['top-[26px] left-[26px]', 'top-[26px] right-[26px]', 'bottom-[26px] left-[26px]', 'bottom-[26px] right-[26px]'].map((pos) => (
                <span key={pos} className={`pointer-events-none absolute ${pos} font-serif text-[15px] leading-none`} style={{ color: 'rgba(90, 68, 30, 0.55)' }}>
                  ✦
                </span>
              ))}

              <div className="relative px-10 py-14 sm:px-16 sm:py-16">
                <h2 className="font-serif text-[2.25rem] leading-[1.16] tracking-[-0.01em] text-center mb-9" style={{ color: '#3f3320' }}>
                  <TextSplitInView text="What makes Inevitable unique?" />
                </h2>

                <div
                  className="mx-auto mb-10 max-w-md pl-5"
                  style={{ borderLeft: '2px solid rgba(90, 68, 30, 0.4)' }}
                >
                  <p className="font-serif text-[1.32rem] leading-relaxed italic mb-4" style={{ color: '#4a3f2a' }}>
                    "I think we need new great philosophers to come about, hopefully in the next 5 to 10 years, to understand the implications of this."
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[13px]" style={{ color: 'rgba(90, 68, 30, 0.8)' }}>
                    <span className="font-medium">Demis Hassabis on the implications of AI</span>
                    <span style={{ opacity: 0.45 }}>·</span>
                    <span style={{ opacity: 0.8 }}>CEO, Google DeepMind</span>
                  </div>
                </div>

                <div className="space-y-5 font-serif text-[20px] leading-[1.7]" style={{ color: '#4a3f2a' }}>
                  <p>
                    <span
                      className="float-left font-serif mr-3"
                      style={{ fontSize: '4.2rem', lineHeight: 0.8, color: '#3f3320', marginTop: 4 }}
                    >
                      W
                    </span>
                    e&apos;re the only Humanities Capital in the world.
                  </p>
                  <p>Humanities is the differentiator. When anything can be built, what to build and how that builds us is what differentiates us.</p>
                  <p>How do you build in a world that&apos;s changing every day? You build around something that&apos;s constant: human nature.</p>
                  <p>We think of products as materialized philosophy. Great products create new users.</p>
                  <p>We see — and help founders see — the philosophical stakes of building products.</p>
                  <p>Most startups don&apos;t have a systematic way to understand the laws of human nature.</p>
                  <p>Knowing which parts of human nature are malleable and which ones are most resistant to change could be the difference between a winning product and otherwise.</p>
                  <p>We love founders who reimagine what it means to be human in an AI-native world.</p>
                  <p>We overlay the conceptual newness that AI affords with the scientific principles of human nature.</p>
                  <p>We forge what&apos;s changing and what&apos;s constant in a crucible of what&apos;s possible, thinkable and experienceable.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section id="team" className="max-w-xl mx-auto px-6 py-20">
          <h2 className="font-serif text-[2.25rem] text-center mb-12">
            <TextSplitInView text="Brought to you by" />
          </h2>

          <div className="flex flex-col sm:flex-row gap-10 items-start">
            <img
              src="/ranjan.png"
              alt="Ranjan Jagannathan"
              className="w-44 h-52 shrink-0 rounded-sm object-cover object-top mx-auto sm:mx-0"
            />

            <div className="pt-1 flex-1">
              <h3 className="font-serif text-[1.6rem] mb-2">Ranjan Jagannathan</h3>
              <p className="text-[17px] text-neutral-400 mb-7 leading-relaxed">
                Ranjan Jagannathan is a founder turned accidental behavioral scientist and philosopher. He invented notification batching — based on which notification summaries in Apple is built. He was a Philosophy &amp; AI Fellow and Guest Lecturer at ToftH. A program supported by Reid Hoffman.
              </p>

              <div className="space-y-0">
                {[
                  {
                    logo: '/logos/yahoo.png',
                    title: 'Yahoo',
                    desc: 'Ran internal incubator and built the largest innovation program at Yahoo',
                  },
                  {
                    logo: '/logos/daywise.png',
                    title: 'Founder, Daywise',
                    desc: 'Invented notification batching — focus layer for the internet. Influenced Apple and Google to build Screen Time in every phone.',
                  },
                  {
                    logo: '/logos/berkeley.png',
                    title: 'Philosophy × AI Fellow, Berkeley',
                    desc: 'Supported by Reid Hoffman',
                  },
                  {
                    logo: '/logos/duke.png',
                    title: 'Behavioral Science Researcher, Duke',
                    desc: 'Research on the science of human nature and decision-making',
                  },
                  {
                    logo: '/logos/cred.webp',
                    title: 'Head of Behavioral Science, CRED',
                    desc: 'Founder of moonshot lab at CRED',
                  },
                  {
                    logo: null,
                    title: 'Advisor',
                    desc: 'Advisor to 100+ startups across the globe',
                  },
                ].map((item, i) => (
                  <div key={i}>
                    {i > 0 && <div className="border-t border-neutral-100" />}
                    <div className="flex items-start gap-3 py-3">
                      <div className="w-6 h-6 shrink-0 mt-0.5 flex items-center justify-center">
                        {item.logo ? (
                          <img src={item.logo} alt={item.title} className="w-5 h-5 object-contain opacity-60" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-neutral-200" />
                        )}
                      </div>
                      <div>
                        <p className="text-[15px] font-medium text-neutral-700 leading-snug">{item.title}</p>
                        <p className="text-[14px] text-neutral-400 leading-relaxed mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
