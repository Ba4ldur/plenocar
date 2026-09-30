'use client'

import type { ReactElement } from 'react'
import type Lenis from 'lenis'

type Motion = any
type Select = (key: string) => HTMLElement | null

/** Claude Design v2, adapted to the existing Pleno Car navbar, Lenis and real next section. */
export function CinematicHero({ budgetUrl }: { budgetUrl: string }): ReactElement {
  return (
    <section id="inicio" className="hero-cinema pc-hero">
      <div className="pc-stage" data-pc="stage">
        <div className="pc-aperture-shell" data-pc="apS">
          <div className="pc-aperture-inner" data-pc="apI">
            <div className="pc-photo-out" data-pc="photoOut">
              <div className="pc-photo-in" data-pc="photoIn">
                <img src="/img/hero.png" alt="Carro esportivo em estúdio de estética automotiva" fetchPriority="high" className="pc-photo" />
              </div>
            </div>
            <div className="pc-dark" data-pc="dark" />
            <div className="pc-sweep" data-pc="sweep" />
            <div className="pc-photo-topshade" />
            <div className="pc-photo-bottomshade" />
            <div className="pc-dim" data-pc="dim" />
          </div>
        </div>
        <div className="pc-ignition pc-ignition-top" data-pc="iTop">
          <span className="pc-ignition-core" /><span className="pc-ignition-glow" data-pc="iGlow" />
        </div>
        <div className="pc-ignition pc-ignition-bottom" data-pc="iBot">
          <span className="pc-ignition-core" /><span className="pc-ignition-glow" data-pc="iGlow" />
        </div>

        <div className="pc-kicker pc-ui"><span data-pc="eyeI">ESTÉTICA AUTOMOTIVA · TERESINA</span></div>
        <h1 className="pc-title" aria-label="PLENO CAR">
          <span className="pc-pleno" data-pc="plWrap" aria-hidden="true">
            <span className="pc-pleno-text" data-pc="plText">PLENO</span>
          </span>
          <span className="pc-car" data-pc="car" aria-hidden="true">
            <span className="pc-car-clip" data-pc="carClip"><span data-pc="carL">CAR</span></span>
          </span>
        </h1>
        <div className="pc-scroll pc-ui" data-pc="scrollInd" aria-hidden="true">
          <span>SCROLL</span><i><b data-pc="scrollLine" /></i>
        </div>
        <div className="pc-footer pc-ui">
          <div className="pc-footer-rule" data-pc="rule" />
          <div className="pc-footer-inner">
            <p><span data-pc="botI">Proteção, personalização<br />e acabamento de alto padrão.</span></p>
            <a href={budgetUrl} target="_blank" rel="noopener noreferrer"><span data-pc="botI">ENTRAR NO PADRÃO&nbsp; ↗</span></a>
          </div>
        </div>
        <div className="pc-exit-line" data-pc="sLine"><span data-pc="sLineCore" /></div>
      </div>
    </section>
  )
}

export function startCinematicHero(gsap: Motion, ScrollTrigger: Motion, lenis: Lenis): () => void {
  const root = document.querySelector<HTMLElement>('.pc-hero')
  if (!root) return () => {}
  const q: Select = (key) => root.querySelector<HTMLElement>('[data-pc="' + key + '"]')
  const qa = (key: string) => Array.from(root.querySelectorAll<HTMLElement>('[data-pc="' + key + '"]'))
  const stage = q('stage')
  const apS = q('apS'), apI = q('apI'), photoOut = q('photoOut'), photoIn = q('photoIn')
  const dark = q('dark'), dim = q('dim'), sweep = q('sweep')
  const iTop = q('iTop'), iBot = q('iBot'), iGlow = qa('iGlow')
  const eyeI = q('eyeI'), rule = q('rule'), botI = qa('botI')
  const scrollInd = q('scrollInd'), scrollLine = q('scrollLine')
  const plWrap = q('plWrap'), plText = q('plText')
  const car = q('car'), carClip = q('carClip'), carL = q('carL')
  const sLine = q('sLine'), sLineCore = q('sLineCore'), ui = Array.from(root.querySelectorAll('.pc-ui'))
  // The intro owns each word. Only the outer title layer belongs to the scroll exit.
  const titleLayer = root.querySelector<HTMLElement>('.pc-title')

  if ([stage, apS, apI, photoOut, photoIn, dark, dim, sweep, iTop, iBot, eyeI, rule, scrollInd,
       scrollLine, plWrap, plText, car, carClip, carL, sLine, sLineCore, titleLayer].some(x => !x)) {
    root.classList.add('pc-visible')
    return () => {}
  }

  gsap.registerPlugin(ScrollTrigger)
  ScrollTrigger.config({ ignoreMobileResize: true })
  let scrollLoop: Motion = null
  let intro: Motion = null
  let stopIntro = false
  const ctx = gsap.context(() => {
    gsap.set(apI, { clipPath: 'inset(50% 0% 50% 0%)' })
    gsap.set(photoIn, { scale: 1.10, transformOrigin: '58% 62%' })
    gsap.set(dark, { opacity: .9 })
    gsap.set(sweep, { xPercent: -120, opacity: 0 })
    gsap.set([iTop, iBot], { top: '50%', scaleX: 0, opacity: 1 })
    gsap.set(iGlow, { opacity: 0 })
    gsap.set(plWrap, { opacity: 1, yPercent: 0 })
    gsap.set(plText, { clipPath: 'inset(0% 0% 100% 0%)', yPercent: 0 })
    gsap.set(carClip, { clipPath: 'inset(0% 100% 0% 0%)' })
    gsap.set(carL, { xPercent: 0 })
    gsap.set([eyeI, ...botI], { yPercent: 110 })
    gsap.set(rule, { scaleX: 0 })
    gsap.set(scrollInd, { opacity: 0 })
    gsap.set(sLine, { opacity: 0 })

    const loopScroll = () => {
      if (stopIntro || !scrollLine) return
      scrollLoop = gsap.timeline({ repeat: -1, repeatDelay: .3 })
        .fromTo(scrollLine, { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: .9, ease: 'expo.inOut' })
        .set(scrollLine, { transformOrigin: '50% 100%' })
        .to(scrollLine, { scaleY: 0, duration: .9, ease: 'expo.inOut' })
    }

    // Defer ScrollTrigger creation until the automatic reveal has COMPLETELY
    // finished. Both timelines previously initialized against the same words
    // and the initial ScrollTrigger render could snap the last intro frame.
    let exitStarted = false
    const startScrollExit = () => {
      if (stopIntro || exitStarted) return
      exitStarted = true
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true
        }
      })
        .fromTo(photoOut, { scale: 1 }, { scale: 1.06, duration: 1 }, 0)
        .fromTo(ui, { opacity: 1 }, { opacity: 0, duration: .23 }, .43)
        // Fade the parent rather than repositioning PLENO and CAR individually.
        // Their size and coordinates must not change at the intro/scroll handoff.
        .fromTo(titleLayer, { opacity: 1 }, { opacity: 0, duration: .24 }, .48)
        .fromTo(sLine, { opacity: 0 }, { opacity: 1, duration: .04 }, .40)
        .fromTo(dim, { opacity: 0 }, { opacity: .28, duration: .5 }, .40)
        .fromTo(sLine, { top: '0%' }, { top: '100%', duration: .52 }, .43)
        .fromTo(apS, { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(100% 0% 0% 0%)', duration: .52 }, .43)
        .fromTo(stage, { backgroundColor: '#080A0C' }, { backgroundColor: '#ece9e2', duration: .53 }, .43)
        .fromTo(sLineCore, { backgroundColor: '#f5f5f2' }, { backgroundColor: '#ff5b14', duration: .1 }, .8)
        .fromTo(sLine, { scaleX: 1 }, { scaleX: 0, duration: .1 }, .91)
        .to(sLine, { opacity: 0, duration: .03 }, 1)
      ScrollTrigger.refresh()
    }

    // Skip the intro if the visitor restores the page mid-scroll.
    const onTop = window.scrollY < 16
    if (onTop) lenis.stop()
    if (onTop) {
      intro = gsap.timeline({
        delay: .16,
        onComplete: () => {
          root.classList.add('pc-intro-complete')
          // Reserve the final layout before restoring wheel scrolling.
          // The scroll timeline starts only after the opening has settled.
          startScrollExit()
          loopScroll()
          if (!document.querySelector('.menu-panel')) lenis.start()
        }
      })
      intro.to([iTop, iBot], { scaleX: 1, duration: .6, ease: 'expo.out' }, 0)
        .to([iTop, iBot], { opacity: .2, duration: .045, repeat: 3, yoyo: true }, .55)
        .to(iGlow, { opacity: 1, duration: .5 }, .9)
        .to(apI, { clipPath: 'inset(33% 0% 33% 0%)', duration: .9, ease: 'expo.inOut' }, .9)
        .to(iTop, { top: '33%', duration: .9, ease: 'expo.inOut' }, .9)
        .to(iBot, { top: '67%', duration: .9, ease: 'expo.inOut' }, .9)
        .to(dark, { opacity: .5, duration: .9 }, .9)
        .to(photoIn, { scale: 1, duration: 3.4, ease: 'power3.out' }, .9)
        .to(sweep, { opacity: 1, duration: .3 }, 1.3)
        .to(sweep, { xPercent: 300, duration: 1.8, ease: 'power2.inOut' }, 1.3)
        .to(sweep, { opacity: 0, duration: .4 }, 2.7)
        .to(apI, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut' }, 1.95)
        .to(iTop, { top: '0%', duration: 1.2, ease: 'expo.inOut' }, 1.95)
        .to(iBot, { top: '100%', duration: 1.2, ease: 'expo.inOut' }, 1.95)
        .to([iTop, iBot], { opacity: 0, duration: .5 }, 2.65)
        .to(dark, { opacity: 0, duration: 1.5 }, 1.95)
        .to(plText, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'power3.inOut' }, 2.45)
        // Reveal CAR continuously in its final position, without a one-frame swap.
        .to(carClip, { clipPath: 'inset(0% 0% 0% 0%)', duration: .95, ease: 'power3.inOut' }, 3.35)
        .to(eyeI, { yPercent: 0, duration: .9, ease: 'expo.out' }, 3.2)
        .to(rule, { scaleX: 1, duration: 1.3, ease: 'expo.inOut' }, 3.5)
        .to(botI, { yPercent: 0, duration: .9, ease: 'expo.out', stagger: .08 }, 3.9)
        .to(scrollInd, { opacity: 1, duration: .6 }, 4.2)
    } else {
      gsap.set(apI, { clipPath: 'inset(0% 0% 0% 0%)' })
      gsap.set(photoIn, { scale: 1 })
      gsap.set([iTop, iBot, dark], { opacity: 0 })
      gsap.set(plText, { clipPath: 'inset(0% 0% 0% 0%)' })
      root.classList.add('pc-intro-complete')
      gsap.set(carClip, { clipPath: 'inset(0% 0% 0% 0%)' })
      gsap.set(carL, { xPercent: 0 })
      gsap.set([eyeI, ...botI], { yPercent: 0 })
      gsap.set(rule, { scaleX: 1 })
      gsap.set(scrollInd, { opacity: 1 })
      startScrollExit()
    }

  }, root)

  return () => {
    stopIntro = true
    if (scrollLoop) scrollLoop.kill()
    if (intro) intro.kill()
    ctx.revert()
    root.classList.remove('pc-intro-complete')
    if (!document.querySelector('.menu-panel')) lenis.start()
  }
}
