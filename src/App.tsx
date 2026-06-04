import { useState, useRef } from 'react'

const navItems = [
  { label: 'INEVITABLE', href: '#inevitable' },
  { label: 'FELLOWSHIP', href: '#fellowship' },
  { label: 'RESEARCH', href: '#research' },
  { label: 'TEAM', href: '#team' },
]

const researchCards = [
  { id: 1, icon: 'neurology', title: 'AI is a synthetic mind' },
  { id: 2, icon: 'person_raised_hand', title: 'The Design of Everyday Things is now the Design of Everyday Beings' },
  { id: 3, icon: 'public', title: 'The future of the internet is the future of employment' },
  { id: 4, icon: 'swap_horiz', title: 'The U in UI is changing and the I in UI is changing' },
  { id: 5, icon: 'brush', title: 'Personality design is the new interface design' },
  { id: 6, icon: 'auto_awesome', title: 'Design to fail delightfully' },
  { id: 7, icon: 'diversity_3', title: 'Relationship design is the new interaction design' },
  { id: 8, icon: 'bolt', title: 'Make human effort explicit and foster joy in being the cause' },
  { id: 9, icon: 'all_inclusive', title: 'Build around what doesn\'t change about the human' },
]

const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

const faqs = [
  'Who is this fellowship for?',
  'Do I need a co-founder to apply?',
  'Is the fellowship remote or in-person?',
  'What does funding look like at the end?',
]

function LeftNav() {
  return (
    <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
      {navItems.map((item) => (
        <a key={item.label} href={item.href} className="group flex items-center gap-3">
          <div className="w-6 h-[1.5px] bg-neutral-300 group-hover:w-8 group-hover:bg-neutral-600 transition-all duration-300" />
          <span
            className="text-[11px] tracking-[0.2em] text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
          >
            {item.label}
          </span>
        </a>
      ))}
    </nav>
  )
}

function Emblem({ icon }: { icon: string }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 196, height: 196 }}>
      <svg
        viewBox="0 0 150 150"
        className="absolute inset-0 h-full w-full text-neutral-500"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="75" cy="75" r="44" strokeWidth="0.75" opacity="0.55" />
        <circle cx="75" cy="75" r="62" strokeWidth="0.5" opacity="0.3" />
        {Array.from({ length: 32 }).map((_, i) => {
          const a = (i / 32) * Math.PI * 2 - Math.PI / 2
          const long = i % 2 === 0
          const r1 = 48
          const r2 = long ? 60 : 55
          return (
            <line
              key={i}
              x1={75 + Math.cos(a) * r1}
              y1={75 + Math.sin(a) * r1}
              x2={75 + Math.cos(a) * r2}
              y2={75 + Math.sin(a) * r2}
              strokeWidth="0.75"
              opacity={long ? 0.5 : 0.3}
            />
          )
        })}
      </svg>
      <span
        className="material-symbols-rounded text-neutral-600"
        style={{ fontSize: 74, fontVariationSettings: "'wght' 100, 'FILL' 0, 'GRAD' 0, 'opsz' 48" }}
      >
        {icon}
      </span>
    </div>
  )
}

function SwipeableCards() {
  const [cards, setCards] = useState(researchCards)
  const [isDragging, setIsDragging] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [dragY, setDragY] = useState(0)
  const startPos = useRef({ x: 0, y: 0 })
  const [dismissed, setDismissed] = useState(false)

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setDismissed(false)
    startPos.current = { x: e.clientX, y: e.clientY }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setDragX(e.clientX - startPos.current.x)
    setDragY(e.clientY - startPos.current.y)
  }

  const onPointerUp = () => {
    if (Math.abs(dragX) > 80) {
      setDismissed(true)
      setTimeout(() => {
        setCards(prev => {
          const [first, ...rest] = prev
          return [...rest, first]
        })
        setDismissed(false)
        setDragX(0)
        setDragY(0)
      }, 300)
    } else {
      setDragX(0)
      setDragY(0)
    }
    setIsDragging(false)
  }

  const visibleCards = cards.slice(0, 4)

  return (
    <div className="relative w-[300px] h-[460px]">
      {[...visibleCards].reverse().map((card, i) => {
        const stackPos = visibleCards.length - 1 - i
        const isTop = stackPos === 0

        const baseRotate = [-2, -1.5, -0.5, 0][stackPos] ?? 0
        const baseOffsetX = [-18, -12, -6, 0][stackPos] ?? 0
        const baseOffsetY = [10, 6, 3, 0][stackPos] ?? 0

        let transform: string
        let transition: string
        let opacity = 1

        if (isTop) {
          if (isDragging) {
            transform = `translateX(${dragX}px) translateY(${dragY}px) rotate(${dragX * 0.04}deg)`
            transition = 'none'
          } else if (dismissed) {
            const dir = dragX > 0 ? 1 : -1
            transform = `translateX(${dir * 400}px) translateY(${dragY}px) rotate(${dir * 20}deg)`
            transition = 'transform 0.3s ease-in, opacity 0.3s ease-in'
            opacity = 0
          } else {
            transform = `translateX(0px) translateY(0px) rotate(0deg)`
            transition = 'transform 0.35s ease'
          }
        } else {
          transform = `translateX(${baseOffsetX}px) translateY(${baseOffsetY}px) rotate(${baseRotate}deg)`
          transition = 'transform 0.35s ease'
        }

        return (
          <div
            key={card.id}
            className="absolute inset-0 rounded-sm select-none overflow-hidden"
            style={{
              backgroundColor: '#faf6ec',
              transform,
              transition,
              opacity,
              zIndex: 10 - stackPos,
              boxShadow: isTop ? '0 4px 20px rgba(0,0,0,0.06)' : '0 1px 4px rgba(0,0,0,0.04)',
              cursor: isTop ? (isDragging ? 'grabbing' : 'grab') : 'default',
            }}
            onPointerDown={isTop ? onPointerDown : undefined}
            onPointerMove={isTop ? onPointerMove : undefined}
            onPointerUp={isTop ? onPointerUp : undefined}
          >
            {/* Tarot frame */}
            <div className="pointer-events-none absolute inset-[9px] border border-neutral-400/60" />
            <div className="pointer-events-none absolute inset-[13px] border-[0.5px] border-neutral-400/40" />

            {/* Corner fleurons */}
            {['top-[18px] left-[18px]', 'top-[18px] right-[18px]', 'bottom-[18px] left-[18px]', 'bottom-[18px] right-[18px]'].map((pos) => (
              <span
                key={pos}
                className={`pointer-events-none absolute ${pos} font-serif text-[13px] leading-none text-neutral-400/70`}
              >
                ✦
              </span>
            ))}

            <div className="relative flex h-full flex-col items-center px-9 pt-11 pb-10 text-center">
              {/* Arcana numeral */}
              <div className="flex items-center gap-2.5 text-neutral-500">
                <span className="block h-px w-5 bg-neutral-400/50" />
                <span className="font-serif text-[17px] leading-none tracking-[0.05em]">{romanNumerals[card.id]}</span>
                <span className="block h-px w-5 bg-neutral-400/50" />
              </div>

              {/* Central emblem */}
              <div className="flex flex-1 items-center justify-center">
                <Emblem icon={card.icon} />
              </div>

              {/* Divider */}
              <span className="mb-5 block h-px w-12 bg-neutral-400/40" />

              {/* Card name */}
              <p className="font-serif text-[28px] leading-[1.16] text-neutral-700">{card.title}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen text-neutral-900 font-sans" style={{ backgroundColor: '#f2ead6' }}>
      <LeftNav />

      {/* Logo */}
      <header className="flex justify-center pt-8 pb-2">
        <div className="border border-neutral-800 rounded-full px-8 py-2.5">
          <span className="font-serif text-3xl tracking-wide">Inevitable</span>
        </div>
      </header>

      {/* Tagline */}
      <div className="text-center py-5">
        <p className="text-[22px] text-neutral-400 tracking-wide">the world's only philosophical and psychological capital</p>
      </div>
      <div className="max-w-xl mx-auto px-6">
        <div className="border-t border-neutral-200" style={{ borderTopWidth: '0.5px' }} />
      </div>

      {/* Hero */}
      <section id="inevitable" className="max-w-xl mx-auto px-6 pt-10 pb-20 text-center">
        <h1 className="font-serif text-[2.75rem] leading-[1.18] tracking-[-0.01em] mb-10">
          Technology has always been a human-making project
        </h1>

        {/* Video placeholder */}
        <div className="relative w-full aspect-video bg-neutral-100 rounded-sm flex items-end justify-center pb-8 group cursor-pointer overflow-hidden">
          <div className="absolute inset-0 bg-neutral-200/0 group-hover:bg-neutral-200/30 transition-colors" />
          <span className="text-[18px] text-neutral-600 font-light relative z-10">Play Our Manifesto</span>
        </div>
      </section>

      {/* Perspectives */}
      <section className="max-w-xl mx-auto px-6 pt-16 pb-20">
        <div className="border-t border-neutral-200 mb-16" style={{ borderTopWidth: '0.5px' }} />

        {/* Q1 */}
        <div className="mb-20">
          <h2 className="font-serif text-[2.25rem] leading-[1.18] tracking-[-0.01em] mb-12">
            What makes Inevitable unique?
          </h2>

          {/* Demis Hassabis quote callout */}
          <div className="rounded-sm p-6 mb-10 border border-neutral-200/60" style={{ backgroundColor: '#faf6ec' }}>
            <p className="font-serif text-[1.2rem] text-neutral-700 leading-relaxed italic mb-5">
              "I think we need new great philosophers to come about, hopefully in the next 5 to 10 years, to understand the implications of this."
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <span className="font-medium text-neutral-600">Demis Hassabis on the implications of AI</span>
              <span className="text-neutral-300">·</span>
              <span className="text-neutral-500">CEO, Google DeepMind</span>
            </div>
          </div>

          <div className="space-y-5 text-[17px] text-neutral-600 leading-relaxed">
            <p>
              We're the only Humanities Capital in the world.
            </p>
            <p>
              Humanities is the differentiator. When anything can be built, what to build and how that builds us is what differentiates us.
            </p>
            <p>
              How do you build in a world that's changing every day? You build around something that's constant: human nature.
            </p>
            <p>
              We think of products as materialized philosophy. Great products create new users.
            </p>
            <p>
              We see — and help founders see — the philosophical stakes of building products.
            </p>
            <p>
              Most startups don't have a systematic way to understand the laws of human nature.
            </p>
            <p>
              Knowing which parts of human nature are malleable and which ones are most resistant to change could be the difference between a winning product and otherwise.
            </p>
            <p>
              We love founders who reimagine what it means to be human in an AI-native world.
            </p>
            <p>
              We overlay the conceptual newness that AI affords with the scientific principles of human nature.
            </p>
            <p>
              We forge what's changing and what's constant in a crucible of what's possible, thinkable and experienceable.
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-200 mb-16" style={{ borderTopWidth: '0.5px' }} />

        {/* Q2 */}
        <div>
          <h2 className="font-serif text-[2.25rem] leading-[1.18] tracking-[-0.01em] mb-12">
            Who do we wish to back?
          </h2>

          <p className="text-[14px] text-neutral-400 mb-7">What we back</p>

          <ul className="space-y-4">
            {[
              'Companies that expand human abilities — literally.',
              'Companies that expand what it means to be human.',
              'Companies that reimagine the relationship between human and AI.',
              'Companies that build bicycles, supersonic jets and teleportation devices for the mind.',
              'Companies that augment human abilities.',
              'Companies that create spaces for human and AI to co-exist, co-evolve and co-cogitate.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-4 text-[17px] text-neutral-600 leading-relaxed">
                <span className="text-neutral-300 shrink-0">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Fellowship */}
      <section id="fellowship" className="py-20">
        {/* Header */}
        <div className="max-w-xl mx-auto px-6 text-center mb-16">
          <h2 className="font-serif text-[2.25rem] mb-3">The Inevitable Fellowship</h2>
          <p className="text-[16px] text-neutral-500 mb-6">A tech + philosophy fellowship</p>
          <hr className="border-neutral-200 mb-8" />
          <p className="text-[18px] text-neutral-600 leading-relaxed mb-3">
            In addition to seed funding of <span className="text-neutral-900">$100k</span>, you get access to a completely new way of thinking about products.
          </p>
          <p className="text-[18px] text-neutral-500 leading-relaxed">
            One that's rooted in science and philosophy.
          </p>
        </div>

        {/* Three Pillars */}
        <div className="max-w-5xl mx-auto px-6 mb-20">
          <p className="font-serif text-center text-[1.4rem] text-neutral-500 mb-12">
            Three core pillars lay the foundations of an Inevitable founder
          </p>

          <div className="grid grid-cols-3 gap-px bg-neutral-200">
            {/* Microscope */}
            <div className="bg-[#f2ead6] px-10 py-12 flex flex-col">
              <div className="mb-8 flex justify-center">
                <img src="/microscope.png" alt="Microscope" className="w-36 h-36 object-contain opacity-85 mix-blend-multiply" />
              </div>
              <h3 className="font-serif text-[1.5rem] mb-6 text-center">Microscope</h3>
              <p className="text-[15px] text-neutral-500 leading-relaxed mb-6 text-center">
                What doesn't change in an AI-native world: human nature.
              </p>
              <hr className="border-neutral-200 mb-6" />
              <div className="space-y-3">
                <div>
                  <p className="text-[15px] text-neutral-700 leading-snug">Laws of Human Nature</p>
                  <p className="text-[13px] text-neutral-400 mt-0.5">Dan Ariely</p>
                </div>
                <div>
                  <p className="text-[15px] text-neutral-700 leading-snug">Productizing Psychological Insights</p>
                  <p className="text-[13px] text-neutral-400 mt-0.5">Ranjan Jagannathan</p>
                </div>
              </div>
              <p className="text-[14px] text-neutral-400 italic mt-6 leading-relaxed">
                Acts as the foundation for experimentation.
              </p>
            </div>

            {/* Telescope */}
            <div className="bg-[#f2ead6] px-10 py-12 flex flex-col">
              <div className="mb-8 flex justify-center">
                <img src="/telescope.png" alt="Telescope" className="w-36 h-36 object-contain opacity-85 mix-blend-multiply" />
              </div>
              <h3 className="font-serif text-[1.5rem] mb-6 text-center">Telescope</h3>
              <p className="text-[15px] text-neutral-500 leading-relaxed mb-6 text-center">
                What's changing in an AI-native world: conceptual newness.
              </p>
              <hr className="border-neutral-200 mb-6" />
              <div className="space-y-3">
                <div>
                  <p className="text-[15px] text-neutral-700 leading-snug">Thinking in Concepts</p>
                  <p className="text-[13px] text-neutral-400 mt-0.5">Tobias Rees</p>
                </div>
                <div>
                  <p className="text-[15px] text-neutral-700 leading-snug">Concepts in the Wild</p>
                  <p className="text-[13px] text-neutral-400 mt-0.5">Ranjan Jagannathan</p>
                </div>
              </div>
            </div>

            {/* Kaleidoscope */}
            <div className="bg-[#f2ead6] px-10 py-12 flex flex-col">
              <div className="mb-8 flex justify-center">
                <img src="/kaleidoscope.png" alt="Kaleidoscope" className="w-36 h-36 object-contain opacity-85 mix-blend-multiply" />
              </div>
              <h3 className="font-serif text-[1.5rem] mb-6 text-center">Kaleidoscope</h3>
              <p className="text-[15px] text-neutral-500 leading-relaxed mb-6 text-center">
                Making the unthinkable, playable.
              </p>
              <hr className="border-neutral-200 mb-6" />
              <div className="space-y-2.5">
                {[
                  'Create playables for your product',
                  'Explore and build from the latest models',
                  'Access to a team of rapid prototypers',
                ].map((item, i) => (
                  <p key={i} className="text-[15px] text-neutral-700 leading-snug">{item}</p>
                ))}
              </div>
              <p className="text-[14px] text-neutral-400 italic mt-6 leading-relaxed">
                Collaborate with prototypers to create conceptually new primitives for your product.
              </p>
            </div>
          </div>
        </div>

        {/* Philosophy Labs */}
        <div className="max-w-xl mx-auto px-6 mb-16">
          <h3 className="font-serif text-[1.6rem] text-neutral-700 mb-6 text-center">Philosophy Labs</h3>
          <p className="text-[17px] text-neutral-600 text-center mb-10 leading-relaxed">
            Apply the Inevitable immersion to talks led by leading researchers and thinkers.
          </p>

          <div className="space-y-0 mb-12">
            <p className="text-[14px] text-neutral-400 mb-5">Salons</p>
            {[
              { speaker: 'Blaise Aguera', title: 'What is Intelligence?' },
              { speaker: 'Iyad Rahwan', title: 'Building Trust with AI Agents' },
            ].map((salon, i) => (
              <div key={i}>
                {i > 0 && <div className="border-t border-neutral-100" />}
                <div className="flex items-baseline justify-between py-3.5">
                  <span className="text-[16px] text-neutral-700">{salon.speaker}</span>
                  <span className="text-[15px] text-neutral-400 italic">{salon.title}</span>
                </div>
              </div>
            ))}
          </div>

          <hr className="border-neutral-200 mb-10" />

          {/* Inevitable IP */}
          <div className="text-center mb-12">
            <p className="font-serif text-[1.4rem] text-neutral-600 mb-4">Inevitable IP</p>
            <p className="text-[16px] text-neutral-600 leading-relaxed">
              Access to Inevitable's proprietary AI platform which extracts concepts from papers, products, protocols and models.
            </p>
          </div>

          <hr className="border-neutral-200 mb-10" />

          {/* FAQ */}
          <div className="text-center">
            <p className="text-[14px] text-neutral-400 mb-5">FAQ</p>
            <ul className="space-y-2.5">
              {faqs.map((q, i) => (
                <li
                  key={i}
                  className="text-[17px] text-neutral-500 hover:text-neutral-900 cursor-pointer transition-colors duration-200"
                >
                  {q}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Research */}
      <section id="research" className="max-w-xl mx-auto px-6 py-20">
        <h2 className="font-serif text-[2.25rem] leading-[1.2] text-center mb-14">
          How We Think About<br />AI &amp; The Human
        </h2>

        <div className="flex flex-col items-center">
          <p className="font-serif text-[1.4rem] text-neutral-600 mb-6">
            Patterns &amp; Provocations
          </p>
          <SwipeableCards />
          <p className="mt-5 text-[14px] text-neutral-400">Drag to explore →</p>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="max-w-xl mx-auto px-6 py-20">
        <h2 className="font-serif text-[2.25rem] text-center mb-12">Brought to you by</h2>

        <div className="flex gap-10 items-start">
          {/* Portrait */}
          <img
            src="/ranjan.png"
            alt="Ranjan Jagannathan"
            className="w-44 h-52 shrink-0 rounded-sm object-cover object-top"
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
                  logo: '/logos/slp-logo.png',
                  title: 'SLP Fellowship',
                  desc: 'Ran SLP fellowship for entrepreneurs',
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

      {/* Footer */}
      <footer className="border-t border-neutral-100 py-16 text-center">
        <p className="font-serif text-[2rem] text-neutral-200">Footer</p>
      </footer>
    </div>
  )
}
