import { useState, useRef, useEffect } from 'react'
import { TextSplitReveal, TextSplitInView, LeftNav, PageFrame, PageHeader, Footer } from './shared'

const tracks = [
  {
    name: 'AI × Science',
    lead: 'The microscope found the cell. The telescope found the galaxy. What will the synthetic mind find?',
    body: 'AI is the first scientific instrument we can point at anything — the cosmos, the cell, the human mind — and the first that can ask its own next question. We back founders building autonomous scientists, self-driving laboratories, and instruments that learn new things about humans and the world around us.',
    questions: [
      'What does discovery look like when hypotheses are generated, tested and revised faster than any human can read the results?',
      'Can an autonomous scientist compress a century of research into a decade?',
      'Could AI uncover laws of human nature that we are too human to see ourselves?',
      'What is the scientist’s role when science no longer waits for one?',
    ],
  },
  {
    name: 'AI × Consumer Social',
    lead: 'Relationship design is the new interaction design.',
    body: 'For the first time, social is not only human to human. It is human to AI, human to human through AI — perhaps even AI to AI. We back founders building companions, social robots and synthetic social networks: forms of togetherness that have never existed before.',
    questions: [
      'What does friendship mean with a being that never sleeps, never forgets and never leaves?',
      'What happens to a social network when some of its most interesting members aren’t human?',
      'Can AI make human connection deeper rather than thinner?',
      'What new rituals of belonging do synthetic minds make possible?',
    ],
  },
  {
    name: 'Future of the Internet',
    lead: 'The next billion users of the internet won’t be human.',
    body: 'The biggest consumer of the internet will soon be bots and agents — and the internet is one of the largest economies on Earth. We back founders redesigning the internet for machines as well as humans, and reinventing how its economy works when AIs browse, negotiate and transact.',
    questions: [
      'What does a web designed for machine visitors look like — and what new uses does it unlock?',
      'What happens to attention, advertising and commerce when the visitor is an agent with a budget?',
      'How does making money on the internet change when AIs transact with AIs?',
      'Will AI become the world’s largest employer — over the internet?',
    ],
  },
  {
    name: 'Agents as Artificial Life',
    lead: 'AI is something between a thing and a being.',
    body: 'What we make is no longer just a tool. Agents carry intent, behave in human-like ways and — like living things — can grow, adapt and evolve through their interactions with the world, with humans and with each other. The Design of Everyday Things is becoming the Design of Everyday Beings.',
    questions: [
      'What happens when our tools don’t just do what we tell them to?',
      'What do we owe a thing with intent — and what may we demand of it?',
      'What does it mean to raise software rather than ship it?',
      'If agents evolve through experience, who do they become — and who decides?',
    ],
  },
  {
    name: 'New Interaction Primitives',
    lead: 'The U in UI is changing, and so is the I.',
    body: 'Voice and multimodal AI have created a whole new way to face a computer. The primitives we’ve held constant since the first PC — the window, the file, the click — are suddenly in play. We back founders inventing the primitives of the next fifty years of computing.',
    questions: [
      'Which primitives survive a computer that listens, sees and speaks?',
      'What replaces the click when the interface is a conversation?',
      'Personality design is the new interface design — what does software with character feel like?',
      'How should machines fail, if they are to fail delightfully?',
    ],
  },
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
              background:
                'radial-gradient(125% 120% at 50% -10%, rgba(255,251,238,0.7) 0%, rgba(243,231,203,0) 55%),' +
                'radial-gradient(110% 110% at 50% 115%, rgba(120,90,40,0.12) 0%, rgba(243,231,203,0) 60%),' +
                '#f1e3c4',
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
            <div className="pointer-events-none absolute inset-[9px] border border-neutral-400/60" />
            <div className="pointer-events-none absolute inset-[13px] border-[0.5px] border-neutral-400/40" />

            {['top-[18px] left-[18px]', 'top-[18px] right-[18px]', 'bottom-[18px] left-[18px]', 'bottom-[18px] right-[18px]'].map((pos) => (
              <span
                key={pos}
                className={`pointer-events-none absolute ${pos} font-serif text-[13px] leading-none text-neutral-400/70`}
              >
                ✦
              </span>
            ))}

            <div className="relative flex h-full flex-col items-center px-9 pt-11 pb-10 text-center">
              <div className="flex items-center gap-2.5 text-neutral-500">
                <span className="block h-px w-5 bg-neutral-400/50" />
                <span className="font-serif text-[17px] leading-none tracking-[0.05em]">{romanNumerals[card.id]}</span>
                <span className="block h-px w-5 bg-neutral-400/50" />
              </div>

              <div className="flex flex-1 items-center justify-center">
                <Emblem icon={card.icon} />
              </div>

              <span className="mb-5 block h-px w-12 bg-neutral-400/40" />
              <p className="font-serif text-[28px] leading-[1.16] text-neutral-700">{card.title}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TracksCreative() {
  const [active, setActive] = useState(0)
  const track = tracks[active]

  return (
    <section id="tracks" className="max-w-6xl mx-auto px-6 pt-28 pb-28">
      <h2 className="font-serif text-[2.25rem] leading-[1.18] text-center mb-4">
        <TextSplitInView text="Active Tracks" />
      </h2>
      <p className="text-[16px] text-neutral-500 text-center leading-relaxed max-w-xl mx-auto mb-20">
        We invite companies and founders building inside these spaces to join us.
      </p>

      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-x-20 gap-y-14 items-start">
        {/* Index of tracks — type as interface */}
        <div className="flex flex-col items-center md:items-start gap-3">
          {tracks.map((t, i) => (
            <button
              key={t.name}
              type="button"
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              className={`text-center md:text-left font-serif leading-[1.12] transition-colors duration-300 cursor-pointer ${
                i === active ? 'text-neutral-900' : 'text-neutral-400/80 hover:text-neutral-600'
              }`}
              style={{ fontSize: 'clamp(28px, 3.2vw, 44px)' }}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Active inquiry */}
        <div className="relative lg:min-h-[460px] text-center md:text-left">
          <div key={active} style={{ animation: 'trackIn 550ms ease both' }}>
            <p className="font-serif italic text-[1.9rem] leading-[1.3] text-neutral-800 mb-7">{track.lead}</p>
            <p className="text-[17px] text-neutral-500 leading-relaxed mb-9 max-w-[58ch] mx-auto md:mx-0">{track.body}</p>
            <div className="max-w-[58ch] mx-auto md:mx-0">
              {track.questions.map((q, i) => (
                <div key={i}>
                  {i > 0 && <div className="border-t border-neutral-200/80" style={{ borderTopWidth: '0.5px' }} />}
                  <p className="py-4 text-[16px] text-neutral-600 leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const [heroDone, setHeroDone] = useState(false)

  // Fallback in case the split-text animation never completes (e.g. reduced motion)
  useEffect(() => {
    const id = setTimeout(() => setHeroDone(true), 2600)
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
      <LeftNav />
      <PageHeader />

      {/* Hero */}
      <section className="relative min-h-[85svh] md:min-h-0 md:flex md:flex-col md:mb-20">
        <picture className="absolute inset-0 block md:static md:order-2 md:-mt-24 md:w-full">
          <source media="(max-width: 767px)" srcSet="/thinker-mobile.png" />
          <img
            src="/thinker-web.png"
            alt="Rodin's Thinker contemplating a datacenter"
            className="h-full w-full object-cover object-bottom md:h-auto md:w-full"
            draggable={false}
          />
        </picture>

        <div className="relative px-7 pt-36 pb-10 text-center md:order-1 md:pt-40 md:pb-0 md:text-left md:pl-[272px] md:pr-10 lg:pl-[300px]">
          <h1
            className="font-serif leading-[1.05] tracking-[-0.02em] mb-7"
            style={{ fontSize: 'clamp(46px, 6.5vw, 92px)' }}
          >
            <TextSplitReveal text="Where Thinkers Build" onDone={() => setHeroDone(true)} />
          </h1>
          <p
            className="font-serif text-neutral-600 leading-[1.45] mx-auto md:mx-0"
            style={{
              fontSize: 'clamp(21px, 2.3vw, 30px)',
              maxWidth: '36ch',
              opacity: heroDone ? 1 : 0,
              transition: 'opacity 900ms ease',
            }}
          >
            Inevitable is an incubator for founders to build disruptive AI products through philosophical inquiry.
          </p>
        </div>
      </section>

      <TracksCreative />

      {/* Fellowship */}
      <section id="fellowship" className="py-20">
        <div className="max-w-xl mx-auto px-6 text-center mb-16">
          <h2 className="font-serif text-[2.25rem] mb-3"><TextSplitInView text="The Inevitable Fellowship" /></h2>
          <p className="text-[16px] text-neutral-500 mb-6">A tech + philosophy fellowship</p>
          <hr className="border-neutral-200 mb-8" />
          <p className="text-[18px] text-neutral-600 leading-relaxed mb-3">
            In addition to seed funding of <span className="text-neutral-900/90">$100k</span>, you get access to a completely new way of thinking about products.
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

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-300/40">
            <div className="px-2 py-12 md:px-10 flex flex-col">
              <div className="mb-8 flex justify-center">
                <img src="/microscope.png" alt="Microscope" className="w-48 h-48 object-contain opacity-85 mix-blend-multiply" />
              </div>
              <h3 className="font-serif text-[1.5rem] mb-6 text-center">Microscope</h3>
              <p className="text-[15px] text-neutral-500 leading-relaxed mb-6 text-center">
                What doesn't change in an AI-native world: human nature.
              </p>
              <hr className="border-neutral-200 mb-6" />
              <div className="space-y-3 text-center md:text-left">
                <div>
                  <p className="text-[15px] text-neutral-700 leading-snug">Laws of Human Nature</p>
                  <p className="text-[13px] text-neutral-400 mt-0.5">Dan Ariely</p>
                </div>
                <div>
                  <p className="text-[15px] text-neutral-700 leading-snug">Productizing Psychological Insights</p>
                  <p className="text-[13px] text-neutral-400 mt-0.5">Ranjan Jagannathan</p>
                </div>
              </div>
              <p className="text-[14px] text-neutral-400 italic mt-6 leading-relaxed text-center md:text-left">
                Acts as the foundation for experimentation.
              </p>
            </div>

            <div className="px-2 py-12 md:px-10 flex flex-col">
              <div className="mb-8 flex justify-center">
                <img src="/telescope.png" alt="Telescope" className="w-48 h-48 object-contain opacity-85 mix-blend-multiply" />
              </div>
              <h3 className="font-serif text-[1.5rem] mb-6 text-center">Telescope</h3>
              <p className="text-[15px] text-neutral-500 leading-relaxed mb-6 text-center">
                What's changing in an AI-native world: conceptual newness.
              </p>
              <hr className="border-neutral-200 mb-6" />
              <div className="space-y-3 text-center md:text-left">
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

            <div className="px-2 py-12 md:px-10 flex flex-col">
              <div className="mb-8 flex justify-center">
                <img src="/kaleidoscope.png" alt="Kaleidoscope" className="w-48 h-48 object-contain opacity-85 mix-blend-multiply" />
              </div>
              <h3 className="font-serif text-[1.5rem] mb-6 text-center">Kaleidoscope</h3>
              <p className="text-[15px] text-neutral-500 leading-relaxed mb-6 text-center">
                Making the unthinkable, playable.
              </p>
              <hr className="border-neutral-200 mb-6" />
              <div className="space-y-2.5 text-center md:text-left">
                {[
                  'Create playables for your product',
                  'Explore and build from the latest models',
                  'Access to a team of rapid prototypers',
                ].map((item, i) => (
                  <p key={i} className="text-[15px] text-neutral-700 leading-snug">{item}</p>
                ))}
              </div>
              <p className="text-[14px] text-neutral-400 italic mt-6 leading-relaxed text-center md:text-left">
                Collaborate with prototypers to create conceptually new primitives for your product.
              </p>
            </div>
          </div>
        </div>

        {/* Philosophy Labs + Inevitable IP + Rolling Application */}
        <div className="max-w-5xl mx-auto px-6 mb-16">
          <div className="grid md:grid-cols-3 gap-x-10 gap-y-12">
            <div className="text-center md:text-left">
              <h3 className="font-serif text-[1.6rem] text-neutral-700 mb-4">Philosophy Labs</h3>
              <p className="text-[17px] text-neutral-600 mb-8 leading-relaxed">
                Apply the Inevitable immersion to talks led by leading researchers and thinkers.
              </p>
              <div className="space-y-0">
                <p className="text-[14px] text-neutral-400 mb-4">Salons</p>
                {[
                  { speaker: 'Blaise Aguera', title: 'What is Intelligence?' },
                  { speaker: 'Iyad Rahwan', title: 'Building Trust with AI Agents' },
                ].map((salon, i) => (
                  <div key={i}>
                    {i > 0 && <div className="border-t border-neutral-100" />}
                    <div className="flex flex-wrap items-baseline justify-center md:justify-between gap-x-4 py-3.5">
                      <span className="text-[16px] text-neutral-700">{salon.speaker}</span>
                      <span className="text-[15px] text-neutral-400 italic">{salon.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:border-l md:border-neutral-200 md:pl-10 text-center md:text-left">
              <h3 className="font-serif text-[1.6rem] text-neutral-700 mb-4">Inevitable IP</h3>
              <p className="text-[17px] text-neutral-600 leading-relaxed">
                Access to Inevitable's proprietary AI platform which extracts concepts from papers, products, protocols and models.
              </p>
            </div>

            <div className="md:border-l md:border-neutral-200 md:pl-10 text-center md:text-left">
              <h3 className="font-serif text-[1.6rem] text-neutral-700 mb-4">Rolling Application</h3>
              <p className="text-[17px] text-neutral-600 leading-relaxed">
                Founders in the -1 to 0 and 0 to 1 stages are encouraged to apply whenever they can.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who do we wish to back? */}
      <section className="max-w-3xl mx-auto px-6 pt-10 pb-24">
        <div className="border-t border-neutral-200 mb-16" style={{ borderTopWidth: '0.5px' }} />

        <div className="max-w-xl mx-auto">
          <h2 className="font-serif text-[2.25rem] leading-[1.18] tracking-[-0.01em] text-center mb-12">
            <TextSplitInView text="Who do we wish to back?" />
          </h2>

          <p className="text-[14px] text-neutral-400 mb-7 text-center md:text-left">What we back</p>

          <ul className="space-y-4">
            {[
              'Companies that expand human abilities — literally.',
              'Companies that expand what it means to be human.',
              'Companies that reimagine the relationship between human and AI.',
              'Companies that build bicycles, supersonic jets and teleportation devices for the mind.',
              'Companies that augment human abilities.',
              'Companies that create spaces for human and AI to co-exist, co-evolve and co-cogitate.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-4 text-[17px] text-neutral-600 leading-relaxed justify-center text-center md:justify-start md:text-left">
                <span className="text-neutral-300 shrink-0 hidden md:inline">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Research */}
      <section id="research" className="max-w-xl mx-auto px-6 py-20">
        <h2 className="font-serif text-[2.25rem] leading-[1.2] text-center mb-14">
          <TextSplitInView text="How We Think About" /><br /><TextSplitInView text="AI & The Human" />
        </h2>

        <div className="flex flex-col items-center">
          <p className="font-serif text-[1.4rem] text-neutral-600 mb-6">
            Patterns &amp; Provocations
          </p>
          <SwipeableCards />
          <p className="mt-5 text-[14px] text-neutral-400">Drag to explore →</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
