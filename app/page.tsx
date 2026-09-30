'use client'

import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { ArrowRight, ArrowUpRight, Menu, MessageCircle, X } from 'lucide-react'
import { CinematicHero, startCinematicHero } from './cinematic-hero'
import './cinematic-hero.css'

const SITE = {
  phone: '5586999666046', phoneDisplay: '(86) 99966-6046',
  lenoPhone: '5586988472024', lenoDisplay: '(86) 98847-2024',
  instagram: 'https://www.instagram.com/plenocar/', instagramHandle: '@plenocar',
  street: 'Rua Angélica, 1450', city: 'Teresina – PI',
  maps: 'https://www.google.com/maps/search/?api=1&query=Rua+Ang%C3%A9lica%2C+1450%2C+Teresina+-+PI',
}
const wa = (msg: string) => `https://wa.me/${SITE.phone}?text=${encodeURIComponent(msg)}`
const WA_DEFAULT = wa('Olá, vim pelo site e gostaria de solicitar um orçamento.')

const SERVICES = [
  ['01','PPF','Proteção invisível. Impacto mínimo na estética, máximo na preservação.','/img/serviçoppf.png'],
  ['02','Ceramic','Brilho profundo, toque liso e proteção de longa duração.','/img/serviçoceramica.png'],
  ['03','Black Piano','Personalização precisa para um acabamento mais agressivo e exclusivo.','/img/serivçoblackpiano.png'],
  ['04','Pintura','Correção, recuperação e pintura com processo controlado.','/img/serviçopintura.png'],
] as const

function Brand(){return <a href="#inicio" className="brand" aria-label="Pleno Car"><img src="/img/logo-simbolo.png" alt=""/><span>PLENO CAR</span></a>}

export default function Page(){
  const [menu,setMenu]=useState(false)
  const [solid,setSolid]=useState(false)
  const lenisRef=useRef<Lenis|null>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    let cancelled = false
    let destroy: (() => void) | null = null

    const loadScript = (id: string, src: string) => new Promise<void>((resolve, reject) => {
      const existing = document.getElementById(id) as HTMLScriptElement | null
      if (existing?.dataset.loaded === 'yes') { resolve(); return }
      const script = existing || document.createElement('script')
      let settled = false
      const done = (err?: Error) => {
        if (settled) return
        settled = true
        window.clearTimeout(timeout)
        script.removeEventListener('load', onLoad)
        script.removeEventListener('error', onError)
        if (err) reject(err)
        else { script.dataset.loaded = 'yes'; resolve() }
      }
      const onLoad = () => done()
      const onError = () => done(new Error('Biblioteca de animação não carregou: ' + id))
      const timeout = window.setTimeout(() => done(new Error('Tempo de carregamento excedido: ' + id)), 8500)
      script.addEventListener('load', onLoad)
      script.addEventListener('error', onError)
      if (!existing) {
        script.id = id
        script.src = src
        script.async = true
        document.head.appendChild(script)
      }
    })

    void (async () => {
      let g: any = null
      let ST: any = null
      try {
        const w = window as typeof window & { gsap?: any; ScrollTrigger?: any }
        if (!w.gsap) {
          await loadScript('pc-gsap', 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js')
        }
        if (!w.ScrollTrigger) {
          await loadScript('pc-scrolltrigger', 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js')
        }
        g = w.gsap
        ST = w.ScrollTrigger
        if (!g || !ST) throw new Error('GSAP indisponível')
        g.registerPlugin(ST)
        ST.config({ ignoreMobileResize: true })
      } catch (err) {
        console.warn('[Pleno Car] Abertura cinematográfica indisponível; exibindo versão estática.', err)
      }
      if (cancelled) return
      const lenis = new Lenis({
        lerp: .075, smoothWheel: true, wheelMultiplier: .9,
        anchors: { offset: -24 }, autoRaf: !g
      })
      lenisRef.current = lenis
      const scenes = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'))
      const horizontals = Array.from(document.querySelectorAll<HTMLElement>('[data-horizontal]'))
      const update = () => {
        const vh = window.innerHeight
        setSolid(lenis.scroll > 80)
        document.documentElement.style.setProperty('--velocity', String(Math.max(-10, Math.min(10, lenis.velocity))))
        document.documentElement.style.setProperty('--global-progress', String(lenis.progress))
        scenes.forEach(el => {
          const r = el.getBoundingClientRect()
          const p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - vh)))
          el.style.setProperty('--p', p.toFixed(4))
          el.style.setProperty('--hero-scale', (1 + p * .12).toFixed(4))
          el.style.setProperty('--hero-y', String(-p * 7) + 'vh')
          el.style.setProperty('--copy-y', String(-p * 36) + 'px')
          el.style.setProperty('--mask', String(12 - p * 12) + '%')
          el.style.setProperty('--media-scale', (1.025 - p * .025).toFixed(4))
        })
        horizontals.forEach(el => {
          const r = el.getBoundingClientRect()
          const p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - vh)))
          const track = el.querySelector<HTMLElement>('[data-track]')
          const viewport = el.querySelector<HTMLElement>('.services-sticky')
          if (track && viewport) {
            const max = Math.max(0, track.scrollWidth - viewport.clientWidth)
            track.style.transform = 'translate3d(' + (-p * max) + 'px,0,0)'
          }
        })
      }
      lenis.on('scroll', update)
      update()
      let cleanHero: (() => void) | null = null
      let ticker: ((time: number) => void) | null = null
      if (g && ST) {
        lenis.on('scroll', ST.update)
        ticker = (time: number) => lenis.raf(time * 1000)
        g.ticker.add(ticker)
        g.ticker.lagSmoothing(0)
        // The same image already exists in the repository: no duplicate assets.
        const img = document.querySelector<HTMLImageElement>('.pc-photo')
        // A late font swap changes text metrics during the last animation frame.
        // Load the exact display weight before showing either word.
        const fontLoad = document.fonts
          ? document.fonts.load('900 160px Archivo', 'PLENO CAR')
              .then(faces => faces.length > 0 && faces.every(face => face.status === 'loaded'))
              .catch(() => false)
          : Promise.resolve(false)
        const fontLoaded = await Promise.race([
          Promise.all([
            img?.decode ? img.decode().catch(() => {}) : Promise.resolve(),
            fontLoad
          ]).then(([, loaded]) => loaded),
          new Promise<boolean>(resolve => window.setTimeout(() => resolve(false), 4000))
        ])
        if (!fontLoaded) {
          // Freeze the already-used site font instead of allowing a late swap.
          document.querySelector('.pc-hero')?.classList.add('pc-font-fallback')
        }
        if (cancelled) {
          if (ticker) g.ticker.remove(ticker)
          lenis.destroy()
          lenisRef.current = null
          return
        }
        try { cleanHero = startCinematicHero(g, ST, lenis) }
        catch (err) {
          console.error('[Pleno Car] Erro ao iniciar o hero:', err)
          document.querySelector('.pc-hero')?.classList.add('pc-visible')
        }
      } else {
        document.querySelector('.pc-hero')?.classList.add('pc-visible')
      }
      if (document.querySelector('.menu-panel')) lenis.stop()
      const resize = () => {
        update()
        if (ST) ST.refresh()
      }
      window.addEventListener('resize', resize)
      destroy = () => {
        window.removeEventListener('resize', resize)
        if (cleanHero) cleanHero()
        if (ticker && g) g.ticker.remove(ticker)
        lenis.destroy()
        lenisRef.current = null
      }
      if (cancelled) destroy()
    })()

    return () => { cancelled = true; if (destroy) destroy() }
  }, [])

  useEffect(()=>{ if(menu) lenisRef.current?.stop(); else lenisRef.current?.start(); document.body.style.overflow=menu?'hidden':''; return()=>{document.body.style.overflow=''} },[menu])

  return <>
    <header className={`topbar ${solid?'solid':''}`}>
      <Brand/>
      <div className="topbar-right">
        <a className="top-wa" href={WA_DEFAULT} target="_blank" rel="noopener">Orçamento <ArrowUpRight size={15}/></a>
        <button className="menu-trigger" onClick={()=>setMenu(true)} aria-label="Abrir menu"><Menu/></button>
      </div>
    </header>
    <div className="scroll-line" aria-hidden/>

    {menu&&<div className="menu-panel">
      <div className="menu-head"><Brand/><button onClick={()=>setMenu(false)}><X/></button></div>
      <nav>
        {['Sobre','Serviços','Estúdio','Contato'].map((x,i)=><a key={x} href={`#${['sobre','servicos','estudio','contato'][i]}`} onClick={()=>setMenu(false)}><small>0{i+1}</small>{x}<ArrowUpRight/></a>)}
      </nav>
      <p>{SITE.street}<br/>{SITE.city}</p>
    </div>}

    <main>
      <CinematicHero budgetUrl={WA_DEFAULT}/>

      <section id="sobre" className="manifesto">
        <div className="manifesto-grid">
          <p className="eyebrow">PLENO CAR / MANIFESTO</p>
          <h2>Seu carro não precisa<br/>de <em>mais um cuidado.</em><br/>Precisa de padrão.</h2>
          <div className="manifesto-side">
            <span className="brand-bars"><i/><i/><i/></span>
            <p>Técnica, processo e obsessão por detalhe. A estética é consequência de fazer cada etapa do jeito certo.</p>
          </div>
        </div>
      </section>

      <section id="servicos" className="services-scene" data-horizontal>
        <div className="services-sticky">
          <div className="services-top"><p className="eyebrow">SERVIÇOS / 04 PROCESSOS</p><span>ROLE PARA EXPLORAR →</span></div>
          <div className="services-track" data-track>
            <article className="service-intro"><h2>NÃO É<br/>CATÁLOGO.<br/><em>É PROCESSO.</em></h2><p>Cada serviço entra onde faz sentido para o carro. Sem pacote genérico.</p></article>
            {SERVICES.map(([n,name,text,img])=><article className="service-card" key={n}>
              <div className="service-photo"><img src={img} alt=""/></div>
              <div className="service-index">{n}</div>
              <h3>{name}</h3><p>{text}</p>
              <a href={wa(`Olá, vim pelo site e tenho interesse em ${name}.`)} target="_blank" rel="noopener">FALAR SOBRE {name.toUpperCase()} <ArrowUpRight/></a>
            </article>)}
          </div>
        </div>
      </section>

      <section id="estudio" className="taycan-scene" data-scene>
        <div className="taycan-sticky">
          <div className="taycan-frame"><img src="/img/alto-padrao.png" alt="Veículo premium no estúdio Pleno Car"/></div>
          <div className="taycan-number">01</div>
          <p className="taycan-kicker">NO ESTÚDIO / PLENO CAR</p>
          <h2><span>ALTO</span><strong>PADRÃO</strong></h2>
          <div className="taycan-caption">Cada superfície, cada acabamento, cada entrega.<br/>Nada aqui é tratado como serviço comum.</div>
        </div>
      </section>

      <section className="studio-gallery">
        <div className="gallery-title"><p className="eyebrow">A UNIDADE</p><h2>Um estúdio<br/>que parece <em>estúdio.</em></h2></div>
        <figure className="g g1"><img src="/img/recepcao-logo.webp" alt="Recepção"/><figcaption>01 / RECEPÇÃO</figcaption></figure>
        <figure className="g g2"><img src="/img/recepcao-lounge-1.webp" alt="Lounge"/><figcaption>02 / LOUNGE</figcaption></figure>
        <figure className="g g3"><img src="/img/recepcao-lounge-2.webp" alt="Ambiente Pleno Car"/><figcaption>03 / CULTURA AUTOMOTIVA</figcaption></figure>
        <figure className="g g4"><img src="/img/escritorio-2.webp" alt="Atendimento"/><figcaption>04 / ATENDIMENTO</figcaption></figure>
      </section>

      <section className="social-cut">
        <div><p>14 MIL+</p><span>ACOMPANHAM O PADRÃO</span></div>
        <a href={SITE.instagram} target="_blank" rel="noopener">{SITE.instagramHandle} <ArrowUpRight/></a>
      </section>

      <section id="contato" className="contact-final">
        <div className="contact-image"><img src="/img/fachada-rua.webp" alt="Fachada Pleno Car"/></div>
        <div className="contact-panel">
          <p className="eyebrow">TERESINA · PI</p>
          <h2>Seu próximo<br/>detalhe começa<br/><em>aqui.</em></h2>
          <p className="address">{SITE.street}<br/>{SITE.city}</p>
          <a className="contact-button" href={WA_DEFAULT} target="_blank" rel="noopener"><MessageCircle/> SOLICITAR ORÇAMENTO <ArrowRight/></a>
          <div className="contact-meta"><a href={`tel:+${SITE.phone}`}>{SITE.phoneDisplay}</a><a href={SITE.maps} target="_blank" rel="noopener">COMO CHEGAR ↗</a></div>
        </div>
      </section>
    </main>

    <footer><Brand/><p>© 2026 PLENO CAR</p><a href={SITE.instagram} target="_blank" rel="noopener">INSTAGRAM ↗</a></footer>
  </>
}
