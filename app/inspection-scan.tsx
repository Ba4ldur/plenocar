'use client'

import type Lenis from 'lenis'
import type { ReactElement } from 'react'

type Motion = any

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (t: number) => t * t * (3 - 2 * t)

export function InspectionScanSection(): ReactElement {
  return (
    <section id="estudio" className="inspection-scan" data-inspection-scan>
      <div className="inspection-frame" data-scan="frame">
        <div className="inspection-wrap" data-scan="wrap">
          <img className="inspection-img" data-scan="img" src="/img/alto-padrao.png" alt="BMW no estúdio Pleno Car" />
          <img className="inspection-img inspection-highlight" data-scan="hi" src="/img/alto-padrao.png" alt="" aria-hidden="true" />
          <div className="inspection-micro inspection-micro-1" data-scan="m1" />
          <div className="inspection-micro inspection-micro-2" data-scan="m2" />
          <div className="inspection-micro inspection-micro-3" data-scan="m3" />
        </div>
        <div className="inspection-shade" />
        <div className="inspection-band" data-scan="band" />
        <div className="inspection-veil" data-scan="veil" />
      </div>

      <div className="inspection-title" data-scan="title">
        <div className="inspection-alto" data-scan="alto">ALTO</div>
        <div className="inspection-padrao-wrap">
          <span className="inspection-padrao inspection-padrao-stroke" data-scan="stroke">PADRÃO</span>
          <span className="inspection-padrao inspection-padrao-fill" data-scan="fill" aria-hidden="true">PADRÃO</span>
        </div>
      </div>

      <div className="inspection-body" data-scan="body">
        <span>Cada superfície, cada acabamento, cada entrega.</span>
        <span>Nada aqui é tratado como serviço comum.</span>
      </div>
    </section>
  )
}

export function startInspectionScan(gsap: Motion, ScrollTrigger: Motion, lenis: Lenis): () => void {
  const root = document.querySelector<HTMLElement>('[data-inspection-scan]')
  if (!root) return () => {}

  const q = (key: string) => root.querySelector<HTMLElement>('[data-scan="' + key + '"]')
  const frame = q('frame')
  const wrap = q('wrap')
  const img = q('img') as HTMLImageElement | null
  const hi = q('hi') as HTMLImageElement | null
  const m1 = q('m1')
  const m2 = q('m2')
  const m3 = q('m3')
  const band = q('band')
  const veil = q('veil')
  const title = q('title')
  const alto = q('alto')
  const stroke = q('stroke')
  const fill = q('fill')
  const body = q('body')

  if ([frame, wrap, img, hi, m1, m2, m3, band, veil, title, alto, stroke, fill, body].some(x => !x)) {
    root.classList.add('inspection-ready')
    return () => {}
  }

  gsap.registerPlugin(ScrollTrigger)

  type Geo = {
    vw: number
    wl: number
    ww: number
    tl: number
    al: number
    bl: number
    px: (f: number) => number
  }

  let geo: Geo | null = null
  let mobile = window.innerWidth < 768
  let ctx: Motion = null
  let mm: Motion = null

  const measure = () => {
    const sr = root.getBoundingClientRect()
    const vw = window.innerWidth
    const wl = (wrap as HTMLElement).offsetLeft
    const ww = (wrap as HTMLElement).offsetWidth
    const tl = (fill as HTMLElement).getBoundingClientRect().left - sr.left
    const al = (alto as HTMLElement).getBoundingClientRect().left - sr.left
    const bl = (body as HTMLElement).getBoundingClientRect().left - sr.left
    geo = { vw, wl, ww, tl, al, bl, px: (f: number) => wl + f * ww }
  }

  const scanX = (p: number) => {
    if (!geo) return 0
    const money = geo.px(.65)
    const start = -.14 * geo.vw
    const end = 1.16 * geo.vw
    if (p < .58) {
      const t = p / .58
      return start + (money - start) * (1 - Math.pow(1 - t, 1.6))
    }
    if (p < .74) return money + .018 * geo.vw * ((p - .58) / .16)
    const t = (p - .74) / .26
    const a = money + .018 * geo.vw
    return a + (end - a) * Math.pow(t, 1.5)
  }

  const mask = (x: number, half: number) => {
    const f = (o: number) => (x + o * half).toFixed(1) + 'px'
    return 'linear-gradient(90deg, transparent ' + f(-1) +
      ', rgba(0,0,0,.18) ' + f(-.7) +
      ', rgba(0,0,0,.6) ' + f(-.38) +
      ', #000 ' + f(-.12) +
      ', #000 ' + f(.12) +
      ', rgba(0,0,0,.6) ' + f(.38) +
      ', rgba(0,0,0,.18) ' + f(.7) +
      ', transparent ' + f(1) + ')'
  }

  const render = (p: number) => {
    if (!geo) return
    const g = geo
    const width = (mobile ? 34 : 15) / 100 * g.vw
    const half = width / 2
    const sx = scanX(p)

    const sc = 1.025 - .025 * smooth(clamp(p / .74))
    const dx = mobile ? 0 : 15 * (1 - smooth(clamp(p / .74)))
    ;(wrap as HTMLElement).style.transform = 'translate3d(' + dx.toFixed(2) + 'px,0,0) scale(' + sc.toFixed(4) + ')'

    const mx = (sx - g.wl) / sc
    const hiMask = mask(mx, half * 1.05 / sc)
    ;(hi as HTMLElement).style.webkitMaskImage = hiMask
    ;(hi as HTMLElement).style.maskImage = hiMask
    ;(hi as HTMLElement).style.opacity = '1'

    const bx = 'translate3d(' + (sx - half).toFixed(1) + 'px,0,0)'
    ;(band as HTMLElement).style.transform = bx
    ;(veil as HTMLElement).style.transform = bx
    ;(band as HTMLElement).style.opacity = '.85'

    const near = (f: number, spread: number) =>
      Math.exp(-Math.pow((sx - g.px(f)) / (half * spread), 2))

    ;(m1 as HTMLElement).style.opacity = (near(.535, 1.1) * .9).toFixed(3)
    ;(m2 as HTMLElement).style.opacity = (near(.42, 1.3) * .75).toFixed(3)
    ;(m3 as HTMLElement).style.opacity = (near(.66, 1.0) * .95).toFixed(3)

    const fillMask = mask(sx - g.tl, half * .8)
    ;(fill as HTMLElement).style.webkitMaskImage = fillMask
    ;(fill as HTMLElement).style.maskImage = fillMask

    const strokeA = .32 + .4 * smooth(clamp((sx - g.tl + half) / (g.vw * .5)))
    ;(stroke as HTMLElement).style.setProperty('--scan-stroke-alpha', strokeA.toFixed(3))

    const at = smooth(clamp((sx - (g.al - g.vw * .22)) / (g.vw * .24)))
    ;(alto as HTMLElement).style.letterSpacing = (.40 - .22 * at).toFixed(4) + 'em'
    ;(alto as HTMLElement).style.opacity = (.35 + .65 * at).toFixed(3)

    const bt = smooth(clamp((sx - (g.bl - g.vw * .15)) / (g.vw * .3)))
    ;(body as HTMLElement).style.opacity = (.5 + .42 * bt).toFixed(3)
  }

  const build = (isMobile: boolean, reduce: boolean) => {
    mobile = isMobile
    measure()

    if (reduce) {
      render(.66)
      ;(frame as HTMLElement).style.clipPath = 'none'
      return () => {}
    }

    const proxy = { p: 0 }
    render(0)
    const pin = mobile ? 80 : 170

    ctx = gsap.context(() => {
      gsap.fromTo(
        frame,
        { clipPath: mobile ? 'inset(4% 4% 4% 4%)' : 'inset(5% 5% 5% 5%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'power1.out',
          scrollTrigger: { trigger: root, start: 'top bottom', end: 'top top', scrub: true }
        }
      )

      gsap.to(proxy, {
        p: 1,
        ease: 'none',
        onUpdate: () => render(proxy.p),
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=' + pin + '%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: () => {
            measure()
            render(proxy.p)
          }
        }
      })

      gsap.fromTo(
        title,
        { opacity: 1, filter: 'blur(0px)' },
        {
          opacity: 0,
          filter: 'blur(3px)',
          ease: 'power1.in',
          scrollTrigger: { trigger: root, start: 'bottom 85%', end: 'bottom 30%', scrub: true }
        }
      )
    }, root)

    ScrollTrigger.refresh()
    if (typeof (lenis as any).resize === 'function') (lenis as any).resize()

    return () => {
      if (ctx) {
        ctx.revert()
        ctx = null
      }
    }
  }

  mm = gsap.matchMedia()
  mm.add(
    { mobile: '(max-width: 767px)', reduce: '(prefers-reduced-motion: reduce)' },
    (context: any) => {
      const conditions = context.conditions || {}
      return build(Boolean(conditions.mobile), Boolean(conditions.reduce))
    }
  )

  const onLoad = () => ScrollTrigger.refresh()
  if (img && !img.complete) img.addEventListener('load', onLoad, { once: true })

  const onRefresh = () => {
    measure()
    if (typeof (lenis as any).resize === 'function') (lenis as any).resize()
  }
  ScrollTrigger.addEventListener('refresh', onRefresh)

  return () => {
    img?.removeEventListener('load', onLoad)
    ScrollTrigger.removeEventListener('refresh', onRefresh)
    if (mm) mm.revert()
    if (ctx) ctx.revert()
  }
}
