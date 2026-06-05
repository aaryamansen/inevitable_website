import { useEffect, useRef, useState } from 'react'
import { animate, scrambleText } from 'animejs'

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
      'An idealized arrangement that never existed — the “impossible bouquet”; also wealth and transience.',
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
    artist: { src: '/artist3.png', text: 'A photographer who frames; light draws the image.' },
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
    artist: { src: '/artist1.png', text: 'No single author — a crowd of posters, remixers and re-uploaders.' },
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
    artist: { src: '/artist3.png', text: 'Photographer + algorithms + engineers.' },
    viewer: { src: '/viewer2.png', text: 'Everyone, instantly, on phones.' },
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
    artist: { src: '/artist1.png', text: 'Prompt-writer + model + millions of uncredited people.' },
    viewer: { src: '/viewer3.png', text: 'Everyone; and the next model.' },
    tools: { src: '/tools3.png', text: 'Neural net trained on scraped datasets; GANs (2014), diffusion (2022).' },
    conception:
      'Prompt and raw material. The human shrinks to a text string that steers the model — and expands into the millions of scraped images and labels that fed it. And when AI looks (face recognition), the human is simply the thing detected. The human is the corpus, and the object of the gaze.',
  },
]

const STOPS_PER_IMAGE = 3 // flat, skewed, flat
const STOPS = SLIDES.length * STOPS_PER_IMAGE
const LAST_T = STOPS - 1 // max scroll position in stop-units
const INTRO_STOPS = 1 // one viewport of scroll room for the intro, before slide 0

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
    pos: { right: '14%', top: '10%' } as React.CSSProperties,
    align: 'flex-end' as const,
    cardBelow: true,
    pull: -26,
    img: { width: 'min(34vw, 34vh)', transform: 'rotateY(-22deg) translateZ(-120px)' } as React.CSSProperties,
  },
  artist: {
    heading: 'Who created it',
    pos: { left: '14%', bottom: '6%' } as React.CSSProperties,
    align: 'flex-start' as const,
    cardBelow: false,
    pull: -100,
    img: { width: 'min(56vw, 56vh)', transform: 'rotateY(16deg) translateZ(80px)' } as React.CSSProperties,
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

type ScrambleProps = {
  text: string
  chars?: string
  delay?: number
  revealRate?: number
  settleDuration?: number
  style?: React.CSSProperties
}

function Scramble({
  text,
  chars = 'a-zA-Z0-9!#$%&*?',
  delay = 0,
  revealRate = 90,
  settleDuration = 220,
  style,
}: ScrambleProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    node.textContent = text
    const anim = animate(node, {
      textContent: scrambleText({
        chars,
        ease: 'outQuad',
        revealRate,
        settleDuration,
        delay,
      }),
    })
    return () => {
      anim.pause()
      node.textContent = text
    }
  }, [text, chars, delay, revealRate, settleDuration])

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

export default function Manifesto() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const centralRefs = useRef<(HTMLImageElement | null)[]>([])
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([])
  const introRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const descRef = useRef<HTMLDivElement>(null)
  const activeIndexRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)

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

      // Intro text crossfades out as the first slide fades in; the rest of the
      // fixed overlays (title, description) stay hidden until past the intro.
      if (introRef.current) introRef.current.style.opacity = String(1 - enter)
      if (titleRef.current) titleRef.current.style.opacity = String(enter)
      if (descRef.current) descRef.current.style.opacity = String(enter)

      // Central images: opacity drives the dissolve between images, transform
      // drives the in-place flat <-> skewed morph + size reduction.
      centralRefs.current.forEach((img, idx) => {
        if (!img) return
        const p = clamp01(skewFor(t, idx))
        img.style.opacity = String(opacityFor(t, idx) * enter)
        img.style.transform = `rotateY(${-24 * p}deg) skewY(${-6 * p}deg) scale(${1 - 0.22 * p})`
      })

      // Each slide's scene (accents + cards) fades in with that slide's skew.
      sceneRefs.current.forEach((layer, slideIdx) => {
        if (layer) layer.style.opacity = String(clamp01(skewFor(t, slideIdx)))
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
      {/* Intro — sits over the first viewport, crossfades into slide 01 */}
      <div
        ref={introRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 7,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '0 clamp(28px, 9vw, 140px)',
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(52px, 11vw, 150px)',
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            color: 'rgba(0, 0, 0, 0.82)',
          }}
        >
          <div>What is an</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.18em' }}>
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
                objectFit: 'cover',
                borderRadius: 6,
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.5)',
                opacity: idx === 0 ? 1 : 0,
                willChange: 'transform, opacity',
              }}
            />
          ))}
        </div>

        {/* One scroll section per stop, plus the intro's scroll room */}
        {Array.from({ length: STOPS + INTRO_STOPS }).map((_, idx) => (
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
          { ...ROLE.tools, src: s.tools.src, text: s.tools.text },
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
                    objectFit: 'contain',
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
            <InfoCard
              heading="Conception of the Human"
              large
              icon="person"
              style={{ position: 'absolute', right: '3%', bottom: '6%' }}
            >
              {s.conception}
            </InfoCard>
          </div>
        )
      })}

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
        <Scramble
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
