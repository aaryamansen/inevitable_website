import { useRef, useEffect, useState } from 'react'
import { animate, splitText, stagger } from 'animejs'

export function TextSplitReveal({
  text,
  enabled = true,
  onDone,
}: {
  text: string
  enabled?: boolean
  onDone?: () => void
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const node = ref.current
    if (!node || !enabled) return
    node.textContent = text
    const split = splitText(node, { chars: true, words: true })
    const anim = animate(node, { opacity: [0, 1], duration: 120, ease: 'linear' })
    const charsAnim = animate(split.chars, {
      opacity: [0, 1],
      y: ['0.28em', '0em'],
      duration: 700,
      delay: stagger(22),
      ease: 'outExpo',
      onComplete: () => onDoneRef.current?.(),
    })
    return () => {
      anim.pause()
      charsAnim.pause()
      split.revert()
      node.textContent = text
    }
  }, [enabled, text])
  return <span ref={ref}>{text}</span>
}

export function TextSplitInView({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    let anim: ReturnType<typeof animate> | undefined
    let split: ReturnType<typeof splitText> | undefined
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        io.disconnect()
        node.textContent = text
        split = splitText(node, { chars: true, words: true })
        anim = animate(split.chars, {
          opacity: [0, 1],
          y: ['0.24em', '0em'],
          duration: 620,
          delay: stagger(18),
          ease: 'outExpo',
        })
      },
      { threshold: 0.5 },
    )
    io.observe(node)
    return () => {
      io.disconnect()
      anim?.pause()
      split?.revert()
    }
  }, [text])
  return <span ref={ref}>{text}</span>
}

const navGroups = [
  {
    label: 'Home',
    href: '/',
    items: [
      { label: 'Tracks', href: '/#tracks' },
      { label: 'Fellowship', href: '/#fellowship' },
      { label: 'Research', href: '/#research' },
    ],
  },
  {
    label: 'About',
    href: '/about',
    items: [
      { label: 'Manifesto', href: '/about#manifesto' },
      { label: 'Philosophy', href: '/about#philosophy' },
      { label: 'Team', href: '/about#team' },
    ],
  },
]

export function LeftNav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <nav className="fixed left-8 top-40 z-50 hidden md:flex flex-col gap-7">
        {navGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-2.5">
            <a
              href={group.href}
              className="w-fit text-[15px] leading-snug text-neutral-900/90 underline underline-offset-[3px] decoration-neutral-400 hover:decoration-neutral-900 transition-colors duration-200 whitespace-nowrap"
            >
              {group.label}
            </a>
            {group.items.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="w-fit text-[14px] leading-snug text-neutral-500 hover:text-neutral-800 transition-colors duration-200 whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </div>
        ))}
      </nav>

      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="fixed right-[18px] top-[18px] z-[60] flex h-11 w-11 flex-col items-center justify-center gap-[7px] border border-neutral-900/50 bg-[#f2ead6]/85 backdrop-blur-sm md:hidden"
      >
        <span className="block h-px w-[18px] bg-neutral-900" />
        <span className="block h-px w-[18px] bg-neutral-900" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] overflow-y-auto md:hidden"
          style={{
            backgroundColor: '#f2ead6',
            backgroundImage: 'url(/bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            animation: 'trackIn 280ms ease both',
          }}
        >
          <div className="pointer-events-none fixed inset-2">
            <div className="absolute inset-0 border-2 border-neutral-900" />
            <div className="absolute inset-[4px] border border-neutral-900" />
          </div>

          <span className="absolute left-8 top-7 font-serif text-2xl">Inevitable</span>

          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="absolute right-[18px] top-[18px] flex h-11 w-11 items-center justify-center"
          >
            <span className="relative block h-[18px] w-[18px]">
              <span className="absolute left-0 top-1/2 block h-px w-full rotate-45 bg-neutral-900" />
              <span className="absolute left-0 top-1/2 block h-px w-full -rotate-45 bg-neutral-900" />
            </span>
          </button>

          <nav className="flex min-h-full flex-col justify-center gap-12 px-10 py-24">
            {navGroups.map((group) => (
              <div key={group.label} className="flex flex-col gap-4">
                <a
                  href={group.href}
                  onClick={close}
                  className="w-fit font-serif text-[40px] leading-none text-neutral-900"
                >
                  {group.label}
                </a>
                <div className="flex flex-col gap-3">
                  {group.items.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={close}
                      className="w-fit text-[17px] leading-snug text-neutral-500"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}

export function PageFrame() {
  return (
    <div className="fixed inset-2 z-[55] pointer-events-none">
      <div className="absolute inset-0 border-2 border-neutral-900" />
      <div className="absolute inset-[4px] border border-neutral-900" />
    </div>
  )
}

export function PageHeader({ style }: { style?: React.CSSProperties }) {
  return (
    <header className="absolute md:fixed left-8 top-7 z-50 w-[210px]" style={style}>
      <a href="/" className="font-serif text-2xl hover:opacity-70 transition-opacity duration-200">
        Inevitable
      </a>
      <p className="mt-3 text-[15px] text-neutral-900/90 leading-snug">
        Philosophical &amp; Psychological Capital
      </p>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="max-w-5xl mx-auto px-6 pt-10 pb-16">
      <div className="border-t border-neutral-300/60 mb-8" style={{ borderTopWidth: '0.5px' }} />
      <p className="text-center text-[14px] text-neutral-400">© Ranjan Jagannathan 2026</p>
    </footer>
  )
}
