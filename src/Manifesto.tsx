import { useEffect, useRef, useState } from 'react'
import { animate, splitText, stagger } from 'animejs'

// Each slide is one image type. As you scroll, the central image morphs
// flat -> skewed -> flat in place, then dissolves to the next image. Three
// scroll stops per image: flat, skewed, flat, [dissolve], ...
//
// At the skewed stop a "scene" fades in around the object: three accent images
// (artist / viewer / tools) at the corners, each with a small card, plus one
// large "Conception of the Human" card at the bottom-right.
type Slide = {
  src: string
  label: string
  // Shown under the object.
  object: string // what it is as an object
  represents: string[] // what it represents
  // Small cards attached to the three accent images.
  artist: { src: string; text: string } // who created it
  viewer: { src: string; text: string } // who sees it
  tools: { src: string; text: string } // how it was created
  // Large card, bottom-right.
  conception: string
}

const SLIDES: Slide[] = [
  {
    src: '/painting.png',
    label: 'Painting',
    object: 'A unique handmade object, one of a kind, in one place.',
    represents: [
      "A representation of what was seen or unseen from the artist's perspective.",
    ],
    artist: { src: '/artist1.png', text: 'A named human, by hand, sometimes over years.' },
    viewer: { src: '/viewer1.png', text: 'One viewer at a time: the owner, then a museum.' },
    tools: { src: '/tools1.png', text: 'Hand, brush, oil paint.' },
    conception:
      'Maker and connoisseur. The image is one person’s account. The viewer is the owner-connoisseur whose single viewpoint the whole picture is geometrically built around. The human is author, owner, and the center of the world the image depicts.',
  },
  {
    src: '/photo.png',
    label: 'Photo',
    object: 'A chemical imprint of light on paper.',
    represents: [
      'A specific real vase that sat in front of the lens. “That-has-been.”',
      'A snapshot of time and place.',
    ],
    artist: { src: '/artist2.png', text: 'A photographer who frames; light draws the image.' },
    viewer: { src: '/viewer2.png', text: 'Many, through reproduction.' },
    tools: { src: '/tools2.png', text: 'Camera + chemistry (1839).' },
    conception:
      'Witness and judge. The human steps back from making — light does that now — and takes up two new jobs: selecting the moment, and authenticating it. The human becomes the one who reads the image as evidence and vouches that it’s true.',
  },
  {
    src: '/digiphoto.png',
    label: 'Digital Photo',
    object: 'A grid of numbers; no original; infinitely editable.',
    represents: [
      'A real vase light touched — now rewritable.',
      'Light and time as co-creator with the human.',
    ],
    artist: { src: '/artist3.png', text: 'Photographer plus whoever edits.' },
    viewer: { src: '/viewer3.png', text: 'Anyone, anywhere, instantly.' },
    tools: { src: '/tools3.png', text: 'Sensor + computer + internet.' },
    conception:
      'Editor, and one node among many. Anyone can alter the image, so no human is a trustworthy single author anymore. The human dissolves into a network of copiers and sharers — neither sole maker nor sole witness.',
  },
  {
    src: '/networked.png',
    label: 'Networked Image',
    object: 'A file that exists only as it circulates; defined by its spread, not its origin.',
    represents: [
      'Not a thing seen but a thing shared — the meme, the post, the unit of attention.',
      'A picture whose meaning is rewritten by every caption, crop and repost.',
    ],
    artist: { src: '/artist4.png', text: 'No single author — a crowd of posters, remixers and re-uploaders.' },
    viewer: { src: '/viewer4.png', text: 'Millions at once; the feed decides who sees it.' },
    tools: { src: '/tools1.png', text: 'Platforms, feeds, algorithms (2004–).' },
    conception:
      'Participant and signal. The human is no longer maker or witness but a node that forwards. Value moves from the image to its circulation; the self is measured in reach. The human becomes both the audience the network optimizes for and the labor that spreads it.',
  },
  {
    src: '/comp.png',
    label: 'Computational Image',
    object: 'A fusion of many frames plus machine inference.',
    represents: [
      'A best guess of what the vase should look like.',
    ],
    artist: { src: '/artist5.png', text: 'Photographer + algorithms + engineers.' },
    viewer: { src: '/viewer5.png', text: 'Everyone, instantly, on phones.' },
    tools: { src: '/tools2.png', text: 'Smartphone: sensor + chip + ML (~2016).' },
    conception:
      'The one being modeled. The device anticipates your taste and “improves” the shot toward what it predicts you wanted. The human is no longer the maker — the hand is replaced by engineers’ priors — but the one whose desires are guessed and served.',
  },
  {
    src: '/aigen.png',
    label: 'AI-Generated Image',
    object: 'A sample from a probability distribution; no capture.',
    represents: [
      'The average of millions of flower pictures; no referent.',
    ],
    artist: { src: '/artist6.png', text: 'Prompt-writer + model + millions of uncredited people.' },
    viewer: { src: '/viewer6.png', text: 'Everyone; and the next model.' },
    tools: { src: '/tools3.png', text: 'Neural net trained on scraped datasets; GANs (2014), diffusion (2022).' },
    conception:
      'Prompt and raw material. The human shrinks to a text string that steers the model — and expands into the millions of scraped images and labels that fed it. And when AI looks (face recognition), the human is simply the thing detected. The human is the corpus, and the object of the gaze.',
  },
]

const STOPS_PER_IMAGE = 3 // flat, skewed, flat
const STOPS = SLIDES.length * STOPS_PER_IMAGE
const LAST_T = STOPS - 1 // max scroll position in stop-units
const INTRO_STOPS = 1 // one viewport of scroll room for the intro, before slide 0
const FINAL_STOPS = 1 // one final snap after the last image stop

const FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif'
const SERIF = '"Goudy Bookletter 1911", ui-serif, Georgia, serif'

// Shared composition for every slide: the accent image position/perspective and
// the position of its attached card. Artist nearest at lower-left, viewer at
// upper-right, tools at upper-left; the conception card sits bottom-right.
// Each accent is an image with its card stacked flush against it (in a flex
// wrapper), so the card always touches the nearest edge of the image regardless
// of the image's rendered height. `pos` anchors the wrapper; `align` aligns the
// card to the image's left/right edge; `cardBelow` puts the card under (vs over)
// the image; `pull` nudges the card to sit tight against the perspective image.
const ROLE = {
  tools: {
    heading: 'How it was created',
    pos: { left: '6%', top: '4%' } as React.CSSProperties,
    align: 'flex-start' as const,
    cardBelow: true,
    pull: -18,
    img: { width: 'min(32vw, 32vh)', transform: 'rotateY(20deg) translateZ(-40px)' } as React.CSSProperties,
  },
  viewer: {
    heading: 'Who sees it',
    pos: { right: '10%', top: '24%' } as React.CSSProperties,
    align: 'flex-end' as const,
    cardBelow: true,
    pull: -34,
    img: { width: 'min(46vw, 46vh)', transform: 'rotateY(-22deg) translateZ(-80px)' } as React.CSSProperties,
  },
  artist: {
    heading: 'Who created it',
    pos: { left: '2%', bottom: '16%' } as React.CSSProperties,
    align: 'flex-start' as const,
    cardBelow: false,
    pull: -10,
    img: { width: 'min(68vw, 68vh)', transform: 'rotateY(16deg) translateZ(120px)' } as React.CSSProperties,
  },
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

// How skewed image `idx` is at scroll position `t` (in stop-units).
// Rises 0->1 over its first interval, falls 1->0 over its second.
const skewFor = (t: number, idx: number): number => {
  const a = idx * STOPS_PER_IMAGE
  if (t <= a || t >= a + 2) return 0
  return t <= a + 1 ? t - a : 1 - (t - (a + 1))
}

// Opacity of central image `idx`. Full while it is the active image (across its
// three stops); fades in/out only during the dissolves to neighbouring images.
const opacityFor = (t: number, idx: number): number => {
  const a = idx * STOPS_PER_IMAGE // first full stop
  const b = a + 2 // last full stop
  if (t <= a - 1 || t >= b + 1) return 0
  if (t < a) return t - (a - 1) // dissolve in
  if (t <= b) return 1
  return 1 - (t - b) // dissolve out
}

type TextSplitRevealProps = {
  text: string
  chars?: string
  delay?: number
  revealRate?: number
  settleDuration?: number
  style?: React.CSSProperties
}

function TextSplitReveal({
  text,
  delay = 0,
  revealRate = 36,
  settleDuration = 700,
  style,
}: TextSplitRevealProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    node.textContent = text
    const split = splitText(node, {
      chars: true,
      words: false,
    })
    const anim = animate(split.chars, {
      opacity: [0, 1],
      y: ['0.24em', '0em'],
      duration: settleDuration,
      delay: stagger(revealRate, { start: delay }),
      ease: 'outExpo',
    })
    return () => {
      anim.pause()
      split.revert()
      node.textContent = text
    }
  }, [text, delay, revealRate, settleDuration])

  return (
    <span ref={ref} style={style}>
      {text}
    </span>
  )
}

type InfoCardProps = {
  heading: string
  children: React.ReactNode
  large?: boolean
  icon?: string
  style?: React.CSSProperties
}

function InfoCard({ heading, children, large = false, icon, style }: InfoCardProps) {
  return (
    <div
      style={{
        width: large ? 'min(360px, 30vw)' : 'min(220px, 22vw)',
        padding: large ? '20px 22px' : '12px 14px',
        background: large ? 'rgba(245, 241, 234, 0.55)' : 'transparent',
        backdropFilter: large ? 'blur(6px)' : undefined,
        WebkitBackdropFilter: large ? 'blur(6px)' : undefined,
        border: large
          ? '1px solid rgba(0, 0, 0, 0.18)'
          : '1px solid rgba(0, 0, 0, 0.35)',
        borderRadius: 10,
        boxShadow: large ? '0 18px 50px rgba(0, 0, 0, 0.18)' : undefined,
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: icon ? 8 : 0,
          fontFamily: FONT,
          fontSize: large ? 13 : 11.5,
          fontWeight: 600,
          color: 'rgba(0, 0, 0, 0.6)',
          marginBottom: large ? 10 : 7,
        }}
      >
        {icon && (
          <span
            className="material-symbols-rounded"
            style={{ fontSize: large ? 22 : 18, lineHeight: 1 }}
          >
            {icon}
          </span>
        )}
        <span>{heading}</span>
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: large ? 14.5 : 13,
          lineHeight: large ? 1.5 : 1.45,
          fontWeight: 400,
          color: 'rgba(0, 0, 0, 0.6)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

function splitRoleDescription(text: string) {
  const sentenceEnd = text.indexOf('.')
  if (sentenceEnd === -1) return { role: text, description: '' }
  return {
    role: text.slice(0, sentenceEnd + 1),
    description: text.slice(sentenceEnd + 1).trim(),
  }
}

function ConceptionCard({ text }: { text: string }) {
  const { role, description } = splitRoleDescription(text)

  return (
    <div
      style={{
        position: 'absolute',
        right: '3%',
        bottom: '6%',
        width: 'min(390px, 32vw)',
        padding: '22px 24px',
        background: 'rgba(245, 241, 234, 0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        border: '1px solid rgba(0, 0, 0, 0.18)',
        borderRadius: 10,
        boxShadow: '0 18px 50px rgba(0, 0, 0, 0.18)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: FONT,
          fontSize: 13,
          fontWeight: 600,
          color: '#7a4d2b',
          marginBottom: 10,
        }}
      >
        <span
          className="material-symbols-rounded"
          style={{
            fontSize: 30,
            lineHeight: 1,
            color: '#7a4d2b',
            fontVariationSettings: "'wght' 300, 'FILL' 0, 'GRAD' 0, 'opsz' 48",
          }}
        >
          accessibility_new
        </span>
        <span>Conception of the Human</span>
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 'clamp(26px, 2.4vw, 38px)',
          lineHeight: 1.02,
          color: '#7a4d2b',
          marginBottom: description ? 12 : 0,
        }}
      >
        {role}
      </div>
      {description && (
        <div
          style={{
            fontFamily: FONT,
            fontSize: 14.5,
            lineHeight: 1.5,
            fontWeight: 400,
            color: 'rgba(0, 0, 0, 0.6)',
          }}
        >
          {description}
        </div>
      )}
    </div>
  )
}

export default function Manifesto() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const centralRefs = useRef<(HTMLImageElement | null)[]>([])
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([])
  const introRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const descRef = useRef<HTMLDivElement>(null)
  const finalRef = useRef<HTMLDivElement>(null)
  const activeIndexRef = useRef(0)
  const finalVisibleRef = useRef(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [finalImageIndex, setFinalImageIndex] = useState(0)
  const [heroImageIndex, setHeroImageIndex] = useState(0)

  // Bottom final-slide morph: 1s per image.
  useEffect(() => {
    const interval = window.setInterval(() => {
      setFinalImageIndex((idx) => (idx + 1) % SLIDES.length)
    }, 1000)
    return () => window.clearInterval(interval)
  }, [])

  // Top intro hero morph: slower, 2s per image.
  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeroImageIndex((idx) => (idx + 1) % SLIDES.length)
    }, 2000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return

    let height = window.innerHeight
    let queued = false
    let frame = 0

    const draw = () => {
      queued = false
      const raw = scrollEl.scrollTop / (height || 1)
      const t = Math.max(0, Math.min(LAST_T, raw - INTRO_STOPS))
      // 0 while sitting on the intro, 1 once the first slide is fully in.
      const enter = clamp01(raw / INTRO_STOPS)
      // The final synthesis slide fades in after the last flat AI image stop.
      const final = clamp01(raw - (INTRO_STOPS + LAST_T))
      const finalVisible = final > 0
      if (finalVisible && !finalVisibleRef.current) setFinalImageIndex(0)
      finalVisibleRef.current = finalVisible

      // Intro text crossfades out as the first slide fades in; the rest of the
      // fixed overlays (title, description) stay hidden until past the intro.
      if (introRef.current) introRef.current.style.opacity = String(1 - enter)
      if (titleRef.current) titleRef.current.style.opacity = String(enter * (1 - final))
      if (descRef.current) descRef.current.style.opacity = String(enter * (1 - final))
      if (finalRef.current) finalRef.current.style.opacity = String(final)

      // Central images: opacity drives the dissolve between images, transform
      // drives the in-place flat <-> skewed morph + size reduction.
      centralRefs.current.forEach((img, idx) => {
        if (!img) return
        const p = clamp01(skewFor(t, idx))
        img.style.opacity = String(opacityFor(t, idx) * enter * (1 - final))
        img.style.transform = `rotateY(${-24 * p}deg) skewY(${-6 * p}deg) scale(${1 - 0.22 * p})`
      })

      // Each slide's scene (accents + cards) fades in with that slide's skew.
      sceneRefs.current.forEach((layer, slideIdx) => {
        if (layer) layer.style.opacity = String(clamp01(skewFor(t, slideIdx)) * (1 - final))
      })

      const focused = Math.floor(Math.round(t) / STOPS_PER_IMAGE)
      if (focused !== activeIndexRef.current) {
        activeIndexRef.current = focused
        setActiveIndex(focused)
      }
    }

    const resize = () => {
      height = window.innerHeight
      draw()
    }

    const onScroll = () => {
      if (queued) return
      queued = true
      frame = requestAnimationFrame(draw)
    }

    draw()
    scrollEl.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', resize)
    return () => {
      scrollEl.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(frame)
    }
  }, [])

  const slide = SLIDES[activeIndex]

  return (
    <>
      {/* Intro — two columns over the first viewport. Left: the "What is an
          Image?" box in the site's bg texture, scaled up and vertically
          centered. Right: the morphing animation cycling every central image.
          The whole thing crossfades into slide 01 as you scroll past it. */}
      <div
        ref={introRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 7,
          pointerEvents: 'none',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
        }}
      >
        {/* Left — the title, vertically centered, scaled 1.5x */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 'clamp(24px, 4vw, 64px)',
          }}
        >
          <div
            style={{
              transform: 'scale(1.5)',
              fontFamily: SERIF,
              fontSize: 'clamp(30px, 4.4vw, 68px)',
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              color: 'rgba(0, 0, 0, 0.82)',
              textAlign: 'center',
            }}
          >
            <div>What is an</div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.18em',
              }}
            >
              <img
                src="/monalisa.png"
                alt=""
                draggable={false}
                style={{
                  height: '0.92em',
                  width: 'auto',
                  borderRadius: 8,
                  objectFit: 'cover',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
                }}
              />
              <span>Image?</span>
            </div>
          </div>
        </div>

        {/* Right — the morphing animation, cycling every central image */}
        <div
          ref={heroRef}
          style={{
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {SLIDES.map((s, idx) => (
            <img
              key={s.src}
              src={s.src}
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: heroImageIndex === idx ? 1 : 0,
                transition: 'opacity 900ms ease',
              }}
            />
          ))}
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{
          position: 'fixed',
          inset: 0,
          height: '100vh',
          width: '100vw',
          overflowY: 'scroll',
          overflowX: 'hidden',
          scrollSnapType: 'y mandatory',
          background: '#0a0a0b url(/story-bg.png) center / cover no-repeat fixed',
          margin: 0,
          padding: 0,
        }}
      >
        {/* Sticky stage holding the central images */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            width: '100%',
            overflow: 'hidden',
            marginBottom: '-100vh',
            zIndex: 0,
            pointerEvents: 'none',
            perspective: 1400,
          }}
        >
          {/* Central images — one per slide, centered, morph in place */}
          {SLIDES.map((s, idx) => (
            <img
              key={s.src}
              ref={(el) => {
                centralRefs.current[idx] = el
              }}
              src={s.src}
              alt={s.label}
              draggable={false}
              style={{
                position: 'absolute',
                inset: 0,
                margin: 'auto',
                width: 'min(48vw, 48vh)',
                height: 'min(48vw, 48vh)',
                objectFit: s.src === '/networked.png' ? 'cover' : 'cover',
                borderRadius: 6,
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5)',
                opacity: idx === 0 ? 1 : 0,
                willChange: 'transform, opacity',
              }}
            />
          ))}
        </div>

        {/* One scroll section per stop, plus the intro and final scroll room */}
        {Array.from({ length: STOPS + INTRO_STOPS + FINAL_STOPS }).map((_, idx) => (
          <section
            key={idx}
            style={{
              height: '100vh',
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always',
            }}
          />
        ))}
      </div>

      {/* Per-slide scene layers — accent images + cards, fade in with skew */}
      {SLIDES.map((s, slideIdx) => {
        const accents = [
          { ...ROLE.viewer, src: s.viewer.src, text: s.viewer.text },
          { ...ROLE.artist, src: s.artist.src, text: s.artist.text },
        ]
        return (
          <div
            key={s.src}
            ref={(el) => {
              sceneRefs.current[slideIdx] = el
            }}
            style={{
              position: 'fixed',
              inset: 0,
              opacity: 0,
              pointerEvents: 'none',
              perspective: 1400,
              zIndex: 5,
            }}
          >
            {accents.map((a) => {
              const img = (
                <img
                  key="img"
                  src={a.src}
                  alt=""
                  draggable={false}
                  style={{
                    display: 'block',
                    objectFit: 'cover',
                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.45))',
                    ...a.img,
                  }}
                />
              )
              const card = (
                <InfoCard
                  key="card"
                  heading={a.heading}
                  style={{ marginTop: a.cardBelow ? a.pull : 0, marginBottom: a.cardBelow ? 0 : a.pull }}
                >
                  {a.text}
                </InfoCard>
              )
              return (
                <div
                  key={a.src}
                  style={{
                    position: 'absolute',
                    perspective: 1400,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: a.align,
                    ...a.pos,
                  }}
                >
                  {a.cardBelow ? [img, card] : [card, img]}
                </div>
              )
            })}
            <ConceptionCard text={s.conception} />
          </div>
        )
      })}

      {/* Final synthesis slide */}
      <div
        ref={finalRef}
        style={{
          position: 'fixed',
          inset: 0,
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 8,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          alignItems: 'center',
          gap: 'clamp(32px, 6vw, 96px)',
          padding: 'clamp(36px, 8vw, 120px)',
          background: 'rgba(245, 241, 234, 0.42)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 'min(440px, 72vw)',
            aspectRatio: '1 / 1',
            justifySelf: 'center',
          }}
        >
          {SLIDES.map((s, idx) => (
            <img
              key={s.src}
              src={s.src}
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: s.src === '/networked.png' ? 'cover' : 'cover',
                borderRadius: 6,
                boxShadow: '0 30px 90px rgba(0, 0, 0, 0.42)',
                opacity: finalImageIndex === idx ? 1 : 0,
                transition: 'opacity 650ms ease',
              }}
            />
          ))}
        </div>
        <div
          style={{
            justifySelf: 'start',
            maxWidth: 620,
            fontFamily: SERIF,
            fontSize: 'clamp(26px, 3.6vw, 52px)',
            lineHeight: 1.12,
            color: 'rgba(0, 0, 0, 0.74)',
          }}
        >
          <span style={{ display: 'block' }}>The image has moved from</span>
          <span style={{ display: 'block' }}>hand-made interpretation</span>
          <span style={{ display: 'block' }}>to mechanical trace</span>
          <span style={{ display: 'block' }}>to editable networked signal</span>
          <span style={{ display: 'block' }}>to algorithmic model</span>
          <span style={{ display: 'block' }}>
            until the world itself is no longer required for the image to exist.
          </span>
        </div>
      </div>

      {/* Title + counter — above the object */}
      <div
        ref={titleRef}
        style={{
          position: 'fixed',
          bottom: 'calc(50% + min(24vw, 24vh) + 22px)',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 6,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(0, 0, 0, 0.6)',
            marginBottom: 10,
          }}
        >
          {String(activeIndex + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
        </div>
        <TextSplitReveal
          key={activeIndex}
          text={slide.label}
          chars="a-zA-Z"
          revealRate={70}
          settleDuration={260}
          style={{
            fontFamily: FONT,
            fontSize: 'clamp(28px, 5vw, 56px)',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            color: 'rgba(0, 0, 0, 0.6)',
          }}
        />
      </div>

      {/* Object description + what it represents — below the object */}
      <div
        ref={descRef}
        style={{
          position: 'fixed',
          top: 'calc(50% + min(24vw, 24vh) + 22px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(520px, 56vw)',
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 6,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 16,
            fontWeight: 500,
            lineHeight: 1.45,
            color: 'rgba(0, 0, 0, 0.6)',
            marginBottom: 10,
          }}
        >
          {slide.object}
        </div>
        {slide.represents.map((line) => (
          <div
            key={line}
            style={{
              fontFamily: FONT,
              fontSize: 13.5,
              lineHeight: 1.5,
              color: 'rgba(0, 0, 0, 0.6)',
              marginTop: 4,
            }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Back to home */}
      <a
        href="/"
        style={{
          position: 'fixed',
          top: 24,
          left: 24,
          zIndex: 10,
          fontFamily: FONT,
          fontSize: 12,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.7)',
          textDecoration: 'none',
        }}
      >
        ← Back
      </a>
    </>
  )
}
