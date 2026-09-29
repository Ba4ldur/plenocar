import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pleno Car | Estética Automotiva Premium em Teresina',
  description:
    'PPF, proteção cerâmica, personalização, Black Piano, pintura e estética automotiva premium em Teresina-PI. Conheça o Padrão Pleno Car.',
  openGraph: {
    title: 'Pleno Car | Estética Automotiva Premium em Teresina',
    description: 'Proteção, personalização e acabamento premium.',
    type: 'website',
    locale: 'pt_BR',
    images: ['/img/estudio-mercedes-taycan.webp'],
  },
  icons: { icon: '/img/logo-simbolo.png', apple: '/img/logo-simbolo.png' },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#05080B',
}

const schema = {
  '@context': 'https://schema.org',
  '@type': 'AutoRepair',
  name: 'Pleno Car — Estética Automotiva',
  image: '/img/estudio-mercedes-taycan.webp',
  telephone: '+55-86-99966-6046',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rua Angélica, 1450',
    addressLocality: 'Teresina',
    addressRegion: 'PI',
    addressCountry: 'BR',
    // postalCode e bairro: incluir somente após confirmação
  },
  areaServed: 'Teresina',
  sameAs: ['https://www.instagram.com/plenocar/'],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Saira:wdth,wght@100..125,500..900&display=swap"
        />
        <link rel="preload" as="image" href="/img/estudio-mercedes-taycan.webp" />
        {/* Estado inicial das animações só é aplicado com JS e sem reduced-motion */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('js')",
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
