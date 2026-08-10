import { useState, useEffect } from 'react'

// ─── Color tokens ───────────────────────────────────────────────────────────
// Primary (deep blue):  #0d1f3c
// Dark navy (sections): #091525
// Footer dark:          #060e1a
// Accent (crimson):     #c41e3a
// Light bg:             #eef2f8
// White:                #ffffff

// ─── Image paths ─────────────────────────────────────────────────────────────
// Drop files into the media/ folder and update the paths below:
//   Logo:         media/repository/logo.jpeg
//   Leaders:      media/leaders/<name>.jpg
//   Facilitators: media/Facilitators/<name>.<ext>
//   Events:       media/events/<slug>.<ext>

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Leadership', href: '#leadership' },
  { label: 'Facilitators', href: '#facilitators' },
  { label: 'Repository', href: '#repository' },
  { label: 'Events', href: '#events' },
  { label: 'Contact', href: '#contact' },
]

const SERVICES = [
  { n: '01', title: 'Research Mentorship', desc: 'Guided research support from experienced mentors in pharmaceutical sciences and clinical research.' },
  { n: '02', title: 'Research Facilities', desc: 'Access to research labs, equipment, and analytical tools at partner institutions.' },
  { n: '03', title: 'Data Analysis', desc: 'Statistical and data analysis support for research projects and publications.' },
  { n: '04', title: 'Writing Guidance', desc: 'Proposal writing, manuscript development, and publication support for students.' },
  { n: '05', title: 'Collaborations', desc: 'Research collaborations and networking opportunities across Kenya and beyond.' },
  { n: '06', title: 'Workshops', desc: 'Scientific writing, methodology, and professional skills development workshops.' },
  { n: '07', title: 'Conferences', desc: 'Support for conference participation, abstract submission, and scientific presentations.' },
  { n: '08', title: 'Innovation Lab', desc: 'Innovation incubation and project support from concept to prototype and market readiness.' },
]

const LEADERSHIP = [
  {
    role: 'Chairperson',
    name: 'Kenerdy Owino',
    institution: 'Kisii University',
    status: 'confirmed',
    photo: '/leaders/Kenerdy.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&auto=format',
    quote: 'Good pharmacy research bridges laboratory innovation with real-world patient impact.',
  },
  {
    role: 'Vice Chairperson',
    name: 'Ian Gitau',
    institution: 'University of Nairobi',
    status: 'confirmed',
    photo: '/leaders/Ian Gitau.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&auto=format',
    quote: 'The future of pharmacy is written in every clinical question we choose to investigate.',
  },
  {
    role: 'Secretary General',
    name: 'Prudence Akinyi',
    institution: 'KEPhSA Research Hub',
    status: 'confirmed',
    photo: '/leaders/Prudence Akinyi.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&auto=format',
    quote: 'Research empowers pharmacists to turn evidence into safer, smarter care.',
  },
  {
    role: 'Treasurer',
    name: 'Ruth Gachie',
    institution: 'USIU Africa',
    status: 'confirmed',
    photo: '/leaders/Ruth.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&auto=format',
    quote: 'Pharmacy research turns data into treatments and ambition into health outcomes.',
  },
  {
    role: 'Project Coordinator',
    name: 'TBA',
    institution: 'KEMU',
    status: 'pending',
    photo: '',
    fallbackPhoto: '',
    quote: 'This leadership role will soon guide our hub’s research vision.',
  },
  {
    role: 'Media & Publicity Officer',
    name: 'Gloria Sofiya',
    institution: 'KEMU',
    status: 'confirmed',
    photo: '/leaders/Gloria Sofiya.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&auto=format',
    quote: 'Public health research makes every medicine story more meaningful.',
  },
]

const FACILITATORS = [
  {
    name: 'Prof. Ermia Terefe',
    module: 'Introduction to Research & Innovation',
    bio: 'Consultant Pharmacologist and Assistant Professor with a strong focus on research mentorship.',
    institution: 'USIU-Africa',
    dept: 'Pharmacology',
    linkedin: true,
    photo: '/Facilitators/Prof. Ermias Terefe.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=120&fit=crop&auto=format',
  },
  {
    name: 'Dr. Chris Muraguri',
    module: 'Conceptualization in Innovation',
    bio: 'Visionary pharmacist and healthcare innovator, pioneering 3D printing in maxillofacial surgery in Kenya.',
    institution: 'USIU-Africa',
    dept: 'Pharmacy',
    linkedin: false,
    photo: '/Facilitators/Dr. Chris Muraguri.jfif',
    fallbackPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&auto=format',
  },
  {
    name: 'Dr. Nortan Hashad',
    module: 'Literature Review',
    bio: 'PhD in Clinical Pharmacy, academic program chair at Higher Colleges of Technology, Dubai, and Fellow of the Higher Education Academy.',
    institution: 'Robert Gordon University',
    dept: 'Pharmacology',
    linkedin: false,
    photo: '/Facilitators/Dr.Nortan Hashad.png',
    fallbackPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&auto=format',
  },
  {
    name: 'Dr. Fred Monari',
    module: 'Research Methodology & Design',
    bio: 'Statistician, lecturer and PhD holder in applied statistics with expertise in data analysis and disease modelling.',
    institution: 'Kisii University',
    dept: 'Mathematics & Actuarial Sciences',
    linkedin: true,
    photo: '/Facilitators/Dr. Fred Monari.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&auto=format',
  },
  {
    name: 'Dr. Victor Mobegi',
    module: 'Data Collection & Analysis',
    bio: 'Senior lecturer in biochemistry and expert in pathogen genomics and bioinformatics.',
    institution: 'University of Nairobi',
    dept: 'Biochemistry',
    linkedin: false,
    photo: '/Facilitators/Dr. victor Mobegi.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=120&h=120&fit=crop&auto=format',
  },
  {
    name: 'Dr. Godswill Uzoechina',
    module: 'Writing a Scientific Paper',
    bio: 'Medical researcher and peer reviewer specialising in neuro-oncology and scientific communication.',
    institution: 'University of Nigeria',
    dept: 'Medicine',
    linkedin: true,
    photo: '/Facilitators/Dr. Godwill Ozoechina.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&h=120&fit=crop&auto=format',
  },
  {
    name: 'Miss Vani Dhaka',
    module: 'Citation, Referencing & Plagiarism',
    bio: 'Research support facilitator with a focus on scholarly writing standards and academic integrity.',
    institution: 'IJMRRS',
    dept: 'Research',
    linkedin: false,
    photo: '',
    fallbackPhoto: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=120&h=120&fit=crop&auto=format',
  },
  {
    name: 'Prof. Sunday Okafor',
    module: 'Prototyping, MVP & Validation',
    bio: 'Associate Professor of medicinal chemistry and drug design, supporting innovation from concept to prototype.',
    institution: 'University of Nigeria',
    dept: 'Medicinal Chemistry',
    linkedin: false,
    photo: '/Facilitators/Dr. Sunday Okafor.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=120&h=120&fit=crop&auto=format',
  },
  {
    name: 'Jenner Akwale',
    module: 'Commercialization & Market Readiness',
    bio: 'Registered patent attorney, graduate engineer and IP strategist supporting commercialization pathways.',
    institution: 'JKUAT',
    dept: 'IP & Law',
    linkedin: false,
    photo: '/Facilitators/Jenner Akwale.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&auto=format',
  },
]

// Drop event images at: media/events/<slug>.<ext>
const EVENTS = [
  {
    title: 'Research Bootcamp 2026',
    date: 'August 30 – September 1, 2026',
    location: 'USIU-Africa, Nairobi',
    type: 'Bootcamp',
    desc: 'An intensive three-day research training bootcamp covering methodology, data analysis, and scientific writing for pharmacy students.',
    photo: '/events/bootcamp-2026.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=400&fit=crop&auto=format',
    upcoming: true,
  },
  {
    title: 'Innovation Pitch Night',
    date: 'October 15, 2026',
    location: 'Kisii University',
    type: 'Innovation',
    desc: 'Students pitch pharmaceutical innovation projects to a panel of industry experts and potential collaborators.',
    photo: '/events/pitch-night-2026.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=400&fit=crop&auto=format',
    upcoming: true,
  },
  {
    title: 'KEPhSA Research Symposium',
    date: 'November 22, 2026',
    location: 'University of Nairobi',
    type: 'Conference',
    desc: 'Annual student research symposium featuring poster presentations, oral abstracts, and keynote speakers from the pharmaceutical sciences.',
    photo: '/events/symposium-2026.jpg',
    fallbackPhoto: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop&auto=format',
    upcoming: true,
  },
]

// ─── Photo helper: tries local path, falls back to Unsplash ──────────────────
function PersonPhoto({
  photo,
  fallbackPhoto,
  name,
  className = '',
  style = {},
}: {
  photo: string
  fallbackPhoto: string
  name: string
  className?: string
  style?: React.CSSProperties
}) {
  const [src, setSrc] = useState(photo || fallbackPhoto)

  return (
    <img
      src={src}
      alt={name}
      className={className}
      style={style}
      onError={() => {
        if (src !== fallbackPhoto) setSrc(fallbackPhoto)
      }}
    />
  )
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(13,31,60,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.10)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3">
          {!logoError ? (
            <img
              src="/repository/logo.jpeg"
              alt="KEPhSA Research Hub"
              className="h-10 w-auto rounded"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div
              className="w-10 h-10 flex items-center justify-center rounded border"
              style={{ borderColor: scrolled ? 'rgba(196,30,58,0.5)' : 'rgba(196,30,58,0.7)' }}
            >
              <span className="font-mono-label text-sm font-medium" style={{ color: '#c41e3a' }}>K</span>
            </div>
          )}
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-display text-sm font-medium" style={{ color: scrolled ? '#ffffff' : '#0d1f3c' }}>
              KEPhSA
            </span>
            <span className="font-mono-label text-[10px] uppercase tracking-[0.18em]" style={{ color: scrolled ? 'rgba(255,255,255,0.75)' : 'rgba(13,31,60,0.6)' }}>
              Research Hub
            </span>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="font-mono-label text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
              style={{ color: scrolled ? 'rgba(255,255,255,0.75)' : 'rgba(13,31,60,0.7)', letterSpacing: '0.12em' }}
            >
              {label}
            </a>
          ))}
        </nav>

        <a
          href="mailto:kephsa.research.hub@gmail.com"
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-xs font-medium font-mono-label uppercase tracking-wider transition-all hover:opacity-90"
          style={{ backgroundColor: '#c41e3a', color: '#ffffff', letterSpacing: '0.1em' }}
        >
          Join Us
        </a>

        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ color: scrolled ? '#ffffff' : '#0d1f3c' }}
        >
          <div className="w-5 h-px mb-1.5" style={{ backgroundColor: 'currentColor' }} />
          <div className="w-5 h-px mb-1.5" style={{ backgroundColor: 'currentColor' }} />
          <div className="w-3 h-px" style={{ backgroundColor: 'currentColor' }} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden px-6 pb-6 pt-2" style={{ backgroundColor: 'rgba(13,31,60,0.97)' }}>
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="block py-3 font-mono-label text-xs uppercase tracking-widest border-b"
              style={{ color: 'rgba(255,255,255,0.80)', borderColor: 'rgba(255,255,255,0.10)' }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col"
      style={{ backgroundColor: '#0d1f3c' }}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1602052577122-f73b9710adba?w=1600&h=900&fit=crop&auto=format)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'luminosity',
        }}
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,31,60,0.5) 0%, rgba(13,31,60,0.96) 100%)' }} />

      <div className="relative flex-1 flex flex-col justify-end max-w-7xl mx-auto px-6 pb-20 pt-40 w-full">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px w-12" style={{ backgroundColor: '#c41e3a' }} />
          <span className="font-mono-label text-xs uppercase tracking-widest" style={{ color: '#c41e3a' }}>
            Est. 2024 · Nairobi, Kenya
          </span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light leading-none mb-6" style={{ color: '#ffffff' }}>
          KEPhSA<br />
          <em className="italic" style={{ color: '#c41e3a' }}>Research</em><br />
          Hub
        </h1>

        <p className="max-w-xl text-base md:text-lg font-light leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.75)' }}>
          The research and innovation arm of the Kenya Pharmaceutical Students' Association — cultivating the next generation of evidence-based healthcare leaders.
        </p>

        <div className="flex flex-wrap gap-4">
          <a
            href="#about"
            className="inline-flex items-center gap-3 px-6 py-3 font-mono-label text-xs uppercase tracking-widest transition-all hover:gap-5"
            style={{ backgroundColor: '#c41e3a', color: '#ffffff' }}
          >
            Discover More <span>→</span>
          </a>
          <a
            href="#services"
            className="inline-flex items-center gap-3 px-6 py-3 font-mono-label text-xs uppercase tracking-widest border transition-all"
            style={{ borderColor: 'rgba(255,255,255,0.30)', color: 'rgba(255,255,255,0.85)' }}
          >
            Our Programs
          </a>
        </div>
      </div>

      <div className="relative border-t" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { n: '9+', label: 'Expert Facilitators' },
            { n: '6', label: 'Universities Represented' },
            { n: '8', label: 'Research Programs' },
            { n: '2026', label: 'Active Cohort' },
          ].map(({ n, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-3xl font-light" style={{ color: '#c41e3a' }}>{n}</div>
              <div className="font-mono-label text-xs mt-1" style={{ color: 'rgba(255,255,255,0.50)', letterSpacing: '0.08em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── About ────────────────────────────────────────────────────────────────────
function AboutSection() {
  return (
    <section id="about" className="py-24 md:py-32" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono-label text-xs" style={{ color: '#c41e3a' }}>§ 001</span>
              <div className="h-px flex-1" style={{ backgroundColor: 'rgba(13,31,60,0.15)' }} />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-light leading-snug mb-6" style={{ color: '#0d1f3c' }}>
              About the<br /><em className="italic">Hub</em>
            </h2>
            <div
              className="w-full aspect-[4/5] overflow-hidden"
              style={{ backgroundColor: '#c5d0e0' }}
            >
              <img
                src="https://images.unsplash.com/photo-1486825586573-7131f7991bdd?w=600&h=750&fit=crop&auto=format"
                alt="Pharmaceutical research"
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          </div>

          <div className="md:col-span-8 flex flex-col justify-center">
            <p className="font-display text-xl md:text-2xl font-light italic leading-relaxed mb-10" style={{ color: '#0d1f3c' }}>
              "We empower pharmacy students to become innovative researchers capable of addressing healthcare challenges through evidence-based solutions while building lasting academic and professional networks."
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="border-l-2 pl-5" style={{ borderColor: '#c41e3a' }}>
                <div className="font-mono-label text-xs uppercase tracking-widest mb-2" style={{ color: '#c41e3a' }}>Mission</div>
                <p className="text-sm leading-relaxed" style={{ color: '#4a5568' }}>
                  To provide pharmacy students with a dynamic platform where they can explore, innovate, collaborate, and excel in pharmaceutical research.
                </p>
              </div>
              <div className="border-l-2 pl-5" style={{ borderColor: '#0d1f3c' }}>
                <div className="font-mono-label text-xs uppercase tracking-widest mb-2" style={{ color: '#0d1f3c' }}>Vision</div>
                <p className="text-sm leading-relaxed" style={{ color: '#4a5568' }}>
                  To inspire and empower the next generation of pharmacy researchers and healthcare innovators in Kenya through impactful research, collaboration, and professional excellence.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="font-mono-label text-xs uppercase tracking-widest mb-4" style={{ color: '#4a5568' }}>Strategic Goals</div>
              {[
                'Build research capacity among pharmacy students',
                'Promote innovation in pharmaceutical sciences',
                'Connect students with experienced research mentors',
                'Support conference participation and scientific presentations',
                'Develop a national network of young Kenyan researchers',
              ].map((goal, i) => (
                <div key={i} className="flex items-start gap-4 py-3 border-b" style={{ borderColor: 'rgba(13,31,60,0.1)' }}>
                  <span className="font-mono-label text-xs mt-0.5" style={{ color: '#c41e3a' }}>0{i + 1}</span>
                  <span className="text-sm leading-relaxed" style={{ color: '#0d1f3c' }}>{goal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Services ─────────────────────────────────────────────────────────────────
function ServicesSection() {
  return (
    <section id="services" style={{ backgroundColor: '#0d1f3c' }} className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono-label text-xs" style={{ color: '#c41e3a' }}>§ 002</span>
          <div className="h-px flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-light leading-snug" style={{ color: '#ffffff' }}>
            What We<br /><em className="italic" style={{ color: '#c41e3a' }}>Offer</em>
          </h2>
          <p className="max-w-sm text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>
            Eight integrated programs designed to take a pharmacy student from curiosity to published researcher and innovator.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px" style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}>
          {SERVICES.map(({ n, title, desc }) => (
            <div
              key={n}
              className="p-7 transition-all duration-300 cursor-default"
              style={{ backgroundColor: '#0d1f3c' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#091525')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0d1f3c')}
            >
              <div className="font-mono-label text-xs mb-6" style={{ color: '#c41e3a' }}>{n}</div>
              <h3 className="font-display text-lg font-light mb-3 leading-snug" style={{ color: '#ffffff' }}>{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Leadership ───────────────────────────────────────────────────────────────
function LeadershipSection() {
  const [active, setActive] = useState(0)
  const leader = LEADERSHIP[active]

  return (
    <section id="leadership" className="py-24 md:py-32" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono-label text-xs" style={{ color: '#c41e3a' }}>§ 003</span>
          <div className="h-px flex-1" style={{ backgroundColor: 'rgba(13,31,60,0.15)' }} />
        </div>
        <h2 className="font-display text-3xl md:text-5xl font-light leading-snug mb-4" style={{ color: '#0d1f3c' }}>
          Leadership
        </h2>
        <p className="text-sm mb-14" style={{ color: '#4a5568' }}>
          Meet the visionary minds driving KEPhSA Research Hub. Details confirmed as they are announced.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px" style={{ backgroundColor: 'rgba(13,31,60,0.10)' }}>
          {LEADERSHIP.map(({ role, name, institution, status, photo, fallbackPhoto }, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-pressed={active === i}
              className="text-left p-4 transition-all duration-200 text-left"
              style={{
                backgroundColor: active === i ? '#0d1f3c' : '#ffffff',
                color: active === i ? '#ffffff' : '#0d1f3c',
              }}
            >
              <div
                className="w-full aspect-square mb-4 overflow-hidden rounded-xl"
                style={{ backgroundColor: active === i ? '#091525' : '#eef2f8' }}
              >
                {status === 'pending' ? (
                  <div
                    className="w-full h-full flex items-center justify-center font-display text-3xl font-light"
                    style={{ color: active === i ? 'rgba(255,255,255,0.25)' : 'rgba(13,31,60,0.2)' }}
                  >
                    ?
                  </div>
                ) : (
                  <PersonPhoto
                    photo={photo}
                    fallbackPhoto={fallbackPhoto}
                    name={name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="font-mono-label text-[10px] mb-1 uppercase tracking-[0.24em]" style={{ color: active === i ? 'rgba(255,255,255,0.65)' : 'rgba(13,31,60,0.65)' }}>
                {role}
              </div>
              <div className="font-display text-sm font-light leading-snug mb-1">
                {status === 'pending' ? 'Coming Soon' : name}
              </div>
              <div className="text-[11px] opacity-70">{institution}</div>
            </button>
          ))}
        </div>

        <div
          className="mt-4 rounded-3xl p-6 shadow-[0_30px_80px_-55px_rgba(0,0,0,0.35)]"
          style={{ backgroundColor: '#0d1f3c' }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="font-mono-label text-[11px] uppercase tracking-[0.28em] mb-2" style={{ color: '#c41e3a' }}>
                {leader.role}
              </div>
              <div className="font-display text-3xl font-light" style={{ color: '#ffffff' }}>
                {leader.status === 'pending' ? 'Position to be announced' : leader.name}
              </div>
            </div>
            <div className="text-sm text-right" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {leader.institution}
            </div>
          </div>
          <div className="mt-6 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.78)' }}>
            {leader.status === 'pending'
              ? 'This leadership role will soon guide our hub’s research vision.'
              : leader.quote}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Facilitators ─────────────────────────────────────────────────────────────
function FacilitatorsSection() {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <section id="facilitators" className="py-24 md:py-32" style={{ backgroundColor: '#eef2f8' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono-label text-xs" style={{ color: '#c41e3a' }}>§ 004</span>
          <div className="h-px flex-1" style={{ backgroundColor: 'rgba(13,31,60,0.15)' }} />
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <h2 className="font-display text-3xl md:text-5xl font-light leading-snug" style={{ color: '#0d1f3c' }}>
            Facilitators
          </h2>
          <p className="max-w-sm text-sm leading-relaxed" style={{ color: '#4a5568' }}>
            Our facilitators support workshops, bootcamps and research training across 9 specialized modules.
          </p>
        </div>

        <div className="space-y-px">
          {FACILITATORS.map((f, i) => (
            <div key={i} style={{ backgroundColor: '#ffffff' }}>
              <button
                className="w-full text-left px-6 py-5 flex items-center gap-5 transition-colors group"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <span className="font-mono-label text-xs w-6 shrink-0" style={{ color: '#c41e3a' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div
                  className="w-10 h-10 shrink-0 overflow-hidden"
                  style={{ backgroundColor: '#eef2f8' }}
                >
                  <PersonPhoto
                    photo={f.photo}
                    fallbackPhoto={f.fallbackPhoto}
                    name={f.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 grid md:grid-cols-3 gap-2 items-center">
                  <div className="font-display text-base font-light" style={{ color: '#0d1f3c' }}>{f.name}</div>
                  <div className="font-mono-label text-xs col-span-2" style={{ color: '#4a5568' }}>{f.module}</div>
                </div>
                <span
                  className="w-5 h-5 shrink-0 flex items-center justify-center border transition-transform duration-200"
                  style={{
                    borderColor: 'rgba(13,31,60,0.2)',
                    transform: expanded === i ? 'rotate(45deg)' : 'none',
                  }}
                >
                  <span className="font-mono-label text-xs">+</span>
                </span>
              </button>
              {expanded === i && (
                <div className="px-6 pb-7 pt-4 border-t" style={{ borderColor: 'rgba(13,31,60,0.08)' }}>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div
                      className="aspect-square overflow-hidden"
                      style={{ backgroundColor: '#eef2f8' }}
                    >
                      <PersonPhoto
                        photo={f.photo}
                        fallbackPhoto={f.fallbackPhoto}
                        name={f.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="font-display text-lg font-light mb-2" style={{ color: '#0d1f3c' }}>{f.name}</div>
                      <p className="text-sm leading-relaxed mb-4" style={{ color: '#4a5568' }}>{f.bio}</p>
                      {f.linkedin && (
                        <span className="font-mono-label text-xs px-3 py-1" style={{ backgroundColor: '#0d1f3c', color: '#ffffff' }}>
                          LinkedIn Available
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-mono-label text-xs uppercase tracking-wider mb-1" style={{ color: '#c41e3a' }}>Institution</div>
                      <div className="text-sm font-medium mb-3" style={{ color: '#0d1f3c' }}>{f.institution}</div>
                      <div className="font-mono-label text-xs uppercase tracking-wider mb-1" style={{ color: '#c41e3a' }}>Department</div>
                      <div className="text-sm" style={{ color: '#4a5568' }}>{f.dept}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Repository ───────────────────────────────────────────────────────────────
function RepositorySection() {
  return (
    <section id="repository" className="py-24 md:py-32" style={{ backgroundColor: '#0d1f3c' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono-label text-xs" style={{ color: '#c41e3a' }}>§ 005</span>
          <div className="h-px flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
        </div>
        <h2 className="font-display text-3xl md:text-5xl font-light leading-snug mb-4" style={{ color: '#ffffff' }}>
          Research<br /><em className="italic" style={{ color: '#c41e3a' }}>Repository</em>
        </h2>
        <p className="max-w-xl text-sm leading-relaxed mb-14" style={{ color: 'rgba(255,255,255,0.60)' }}>
          A digital archive containing undergraduate research projects, conference abstracts, published articles, research posters, innovation projects, student publications, and downloadable resources.
        </p>

        <div className="grid md:grid-cols-3 gap-px" style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}>
          {[
            {
              icon: '📄',
              title: 'Student Projects',
              desc: 'Browse student-led research projects, posters, and publications stored in the publications folder.',
              cta: 'Open Publications',
              href: '#',
            },
            {
              icon: '📊',
              title: 'Annual Reports',
              desc: 'Explore annual reports and hub updates that document our growth, partnerships, and achievements.',
              cta: 'Open Reports',
              href: '#',
            },
            {
              icon: '✉',
              title: 'Submit Your Work',
              desc: 'Send your project summary, abstract, or publication to the hub for review and visibility.',
              cta: 'Email the Hub',
              href: 'mailto:kephsa.research.hub@gmail.com',
            },
          ].map(({ icon, title, desc, cta, href }) => (
            <div key={title} className="p-8" style={{ backgroundColor: '#0d1f3c' }}>
              <div className="text-2xl mb-5">{icon}</div>
              <h3 className="font-display text-xl font-light mb-3" style={{ color: '#ffffff' }}>{title}</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>{desc}</p>
              <a
                href={href}
                className="inline-flex items-center gap-2 font-mono-label text-xs uppercase tracking-widest transition-all hover:gap-4"
                style={{ color: '#c41e3a' }}
              >
                {cta} <span>→</span>
              </a>
            </div>
          ))}
        </div>

        <div className="mt-px p-8" style={{ backgroundColor: '#091525' }}>
          <div className="font-mono-label text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Featured Media
          </div>
          <div className="aspect-[16/9] overflow-hidden rounded-xl border" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/jDr3SmdPzxo?si=693teTJdFGoXCIFV"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Events ───────────────────────────────────────────────────────────────────
function EventsSection() {
  return (
    <section id="events" className="py-24 md:py-32" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono-label text-xs" style={{ color: '#c41e3a' }}>§ 006</span>
          <div className="h-px flex-1" style={{ backgroundColor: 'rgba(13,31,60,0.15)' }} />
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-light" style={{ color: '#0d1f3c' }}>
            Upcoming Events
          </h2>
          <p className="max-w-xs text-sm" style={{ color: '#4a5568' }}>
            Join the latest conferences, workshops, and community gatherings from the KEPhSA network.
          </p>
        </div>

        {EVENTS.length === 0 ? (
          <div
            className="p-16 flex flex-col items-center justify-center text-center border"
            style={{ borderColor: 'rgba(13,31,60,0.1)', borderStyle: 'dashed' }}
          >
            <div className="w-12 h-12 border flex items-center justify-center mb-6" style={{ borderColor: 'rgba(13,31,60,0.2)' }}>
              <span className="font-mono-label text-sm" style={{ color: '#c41e3a' }}>∅</span>
            </div>
            <p className="font-display text-xl font-light mb-2" style={{ color: '#0d1f3c' }}>No events available right now</p>
            <p className="text-sm" style={{ color: '#4a5568' }}>New opportunities and gatherings will appear here soon.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-px" style={{ backgroundColor: 'rgba(13,31,60,0.10)' }}>
            {EVENTS.map((ev, i) => (
              <div key={i} className="flex flex-col" style={{ backgroundColor: '#ffffff' }}>
                <div className="relative overflow-hidden" style={{ aspectRatio: '16/9', backgroundColor: '#c5d0e0' }}>
                  <PersonPhoto
                    photo={ev.photo}
                    fallbackPhoto={ev.fallbackPhoto}
                    name={ev.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(13,31,60,0.7) 100%)' }} />
                  <span
                    className="absolute top-3 left-3 font-mono-label text-xs px-2 py-1 uppercase tracking-wider"
                    style={{ backgroundColor: '#c41e3a', color: '#ffffff' }}
                  >
                    {ev.type}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="font-mono-label text-xs mb-2" style={{ color: '#c41e3a' }}>{ev.date}</div>
                  <h3 className="font-display text-lg font-light mb-2 leading-snug" style={{ color: '#0d1f3c' }}>{ev.title}</h3>
                  <div className="font-mono-label text-xs mb-3" style={{ color: '#4a5568' }}>📍 {ev.location}</div>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: '#4a5568' }}>{ev.desc}</p>
                  <div className="mt-5 pt-4 border-t" style={{ borderColor: 'rgba(13,31,60,0.08)' }}>
                    <a
                      href="#contact"
                      className="font-mono-label text-xs uppercase tracking-widest inline-flex items-center gap-2 hover:gap-4 transition-all"
                      style={{ color: '#0d1f3c' }}
                    >
                      Learn More <span>→</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const [logoError, setLogoError] = useState(false)

  return (
    <footer id="contact" style={{ backgroundColor: '#060e1a' }} className="pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 pb-12 border-b" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
          <div>
            <div className="flex items-center gap-3 mb-4">
              {!logoError ? (
                <img
                  src="/repository/logo.jpeg"
                  alt="KEPhSA Research Hub"
                  className="h-9 w-auto"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <>
                  <div className="w-8 h-8 flex items-center justify-center border" style={{ borderColor: 'rgba(196,30,58,0.4)' }}>
                    <span className="font-mono-label text-xs" style={{ color: '#c41e3a' }}>K</span>
                  </div>
                  <div>
                    <div className="font-display text-sm font-medium" style={{ color: '#ffffff' }}>KEPhSA Research Hub</div>
                    <div className="font-mono-label text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>Nairobi, Kenya</div>
                  </div>
                </>
              )}
            </div>
            <p className="text-xs leading-relaxed mt-4" style={{ color: 'rgba(255,255,255,0.45)' }}>
              The research and innovation arm of the Kenya Pharmaceutical Students' Association, dedicated to cultivating evidence-based healthcare leaders.
            </p>
          </div>

          <div>
            <div className="font-mono-label text-xs uppercase tracking-widest mb-5" style={{ color: '#c41e3a' }}>Contact</div>
            <div className="space-y-3">
              <a href="mailto:kephsa.research.hub@gmail.com" className="block text-xs hover:opacity-80 transition-opacity" style={{ color: 'rgba(255,255,255,0.70)' }}>
                kephsa.research.hub@gmail.com
              </a>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.70)' }}>+254 708 321 799</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.70)' }}>+254 758 827 813</div>
            </div>
          </div>

          <div>
            <div className="font-mono-label text-xs uppercase tracking-widest mb-5" style={{ color: '#c41e3a' }}>Quick Links</div>
            <div className="space-y-3">
              {NAV_LINKS.map(({ label, href }) => (
                <a key={label} href={href} className="block text-xs hover:opacity-100 transition-opacity" style={{ color: 'rgba(255,255,255,0.50)' }}>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="font-mono-label text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
            © 2026 KEPhSA Research Hub · All rights reserved
          </div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Website by Morgan Kwalya (BPharm) ·{' '}
            <a href="mailto:kwalyamorgan042@gmail.com" className="hover:opacity-60 transition-opacity">
              kwalyamorgan042@gmail.com
            </a>
            {' '}· WhatsApp: +254 748 052 811
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <Navbar />
      <Hero />
      <AboutSection />
      <ServicesSection />
      <LeadershipSection />
      <FacilitatorsSection />
      <RepositorySection />
      <EventsSection />
      <Footer />
    </div>
  )
}
