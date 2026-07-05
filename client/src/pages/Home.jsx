import { useNavigate } from 'react-router-dom';
import { useRef, useCallback } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import {
  Terminal, Network, ShieldCheck, ChevronRight,
  Box, Zap, GitBranch, Lock, FileCode, Cpu
} from 'lucide-react';
import ShinyText from '../components/ShinyText/ShinyText';

/* ── Marquee card data ─────────────────────────────────── */
const CARDS = [
  {
    dot: '#6366f1', file: 'auth.controller.ts',
    title: 'JWT middleware detected',
    body: 'Token validation chain mapped across 4 routes. Expiry logic flagged as inconsistent.',
    tag: 'Security', tagColor: '#ef4444', tagBg: 'rgba(239,68,68,0.1)',
    Icon: Lock, iconColor: '#ef4444',
  },
  {
    dot: '#22c55e', file: 'database.service.ts',
    title: 'Relational schema mapped',
    body: 'Users → Posts → Comments linked. N+1 query risk detected on line 47.',
    tag: 'Performance', tagColor: '#22c55e', tagBg: 'rgba(34,197,94,0.1)',
    Icon: GitBranch, iconColor: '#22c55e',
  },
  {
    dot: '#6366f1', file: 'sorting.utils.js',
    title: 'O(n²) bubble sort found',
    body: 'Replace with Array.sort() for O(n log n). Affects lists > 500 items significantly.',
    tag: 'Optimise', tagColor: '#f59e0b', tagBg: 'rgba(245,158,11,0.1)',
    Icon: Zap, iconColor: '#f59e0b',
  },
  {
    dot: '#8b5cf6', file: 'api.routes.ts',
    title: 'REST layer documented',
    body: '12 endpoints catalogued. Missing rate-limiting on /upload and /export routes.',
    tag: 'API', tagColor: '#8b5cf6', tagBg: 'rgba(139,92,246,0.1)',
    Icon: Network, iconColor: '#8b5cf6',
  },
  {
    dot: '#22c55e', file: 'payment.service.ts',
    title: 'Stripe integration healthy',
    body: 'Webhook signature validation present. Idempotency keys missing on retry logic.',
    tag: 'Security', tagColor: '#ef4444', tagBg: 'rgba(239,68,68,0.1)',
    Icon: ShieldCheck, iconColor: '#34d399',
  },
  {
    dot: '#6366f1', file: 'render.pipeline.ts',
    title: 'Async waterfall resolved',
    body: 'Promise chain untangled. 3 unhandled rejection paths found and documented.',
    tag: 'Logic', tagColor: '#6366f1', tagBg: 'rgba(99,102,241,0.1)',
    Icon: Cpu, iconColor: '#6366f1',
  },
  {
    dot: '#f59e0b', file: 'parser.wasm.js',
    title: 'WASM boundary annotated',
    body: 'Memory allocation pattern documented. Buffer overflow risk on large file inputs.',
    tag: 'Memory', tagColor: '#f59e0b', tagBg: 'rgba(245,158,11,0.1)',
    Icon: FileCode, iconColor: '#f59e0b',
  },
  {
    dot: '#22c55e', file: 'cache.layer.ts',
    title: 'Redis TTL strategy mapped',
    body: 'LRU eviction documented. Stale-while-revalidate pattern recommended for /feed.',
    tag: 'Performance', tagColor: '#22c55e', tagBg: 'rgba(34,197,94,0.1)',
    Icon: Terminal, iconColor: '#22c55e',
  },
];

function MarqueeCard({ dot, file, title, body, tag, tagColor, tagBg, Icon, iconColor }) {
  return (
    <div className="marquee-card">
      <div className="marquee-card-header">
        <span className="marquee-card-dot" style={{ background: dot }} />
        <span className="marquee-card-filename">{file}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <Icon size={16} color={iconColor} style={{ marginTop: '3px', flexShrink: 0 }} />
        <div>
          <div className="marquee-card-title">{title}</div>
          <div className="marquee-card-body">{body}</div>
          <span
            className="marquee-card-tag"
            style={{ color: tagColor, background: tagBg, border: `1px solid ${tagColor}22` }}
          >
            {tag}
          </span>
        </div>
      </div>
    </div>
  );
}

const TRACK = [...CARDS, ...CARDS];

function Home() {
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const glowRef = useRef(null);
  const pageRef = useRef(null);

  /* ── Mouse-tracked glow ───────────────────────────────── */
  const handleMouseMove = useCallback((e) => {
    if (!glowRef.current || !pageRef.current) return;
    const rect = pageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top + pageRef.current.scrollTop;
    glowRef.current.style.transform = `translate(${x - 300}px, ${y - 300}px)`;
  }, []);

  /* ── Smooth scroll to features ───────────────────────── */
  const scrollToFeatures = useCallback(() => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div
      ref={pageRef}
      onMouseMove={handleMouseMove}
      style={{
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* ── Mouse-tracked glow orb ────────────────────────── */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
          transition: 'transform 0.12s ease-out',
          willChange: 'transform',
        }}
      />

      {/* ── Top Pill Nav ──────────────────────────────────── */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        padding: '20px 20px 0',
        pointerEvents: 'none',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 8px 8px 16px',
          borderRadius: '999px',
          background: 'rgba(9,9,11,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          pointerEvents: 'auto',
        }}>
          <Box size={18} color="#6366f1" />
          <ShinyText
            text="Vault OS"
            speed={3}
            color="#a1a1aa"
            shineColor="#ffffff"
            spread={100}
            className="navbar-logo-text"
          />

          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />

          {/* Decorative nav links — no pages yet */}
          {['Features', 'Docs', 'Pricing'].map(link => (
            <button key={link} style={{
              background: 'none', border: 'none',
              color: '#71717a', fontSize: '0.85rem',
              fontWeight: '500', cursor: 'default',
              padding: '6px 10px', borderRadius: '6px',
              fontFamily: 'inherit',
            }}>
              {link}
            </button>
          ))}

          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

          <SignedOut>
            <SignInButton mode="modal">
              <button style={{
                background: 'none', border: 'none',
                color: '#71717a', fontSize: '0.85rem',
                fontWeight: '500', cursor: 'pointer',
                padding: '6px 10px', borderRadius: '6px',
                fontFamily: 'inherit',
                transition: 'color 0.15s',
              }}
                onMouseOver={e => e.currentTarget.style.color = '#fafafa'}
                onMouseOut={e => e.currentTarget.style.color = '#71717a'}
              >
                Login
              </button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="btn-premium" style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 18px', borderRadius: '999px',
                color: 'white', fontSize: '0.85rem',
                fontWeight: '600', cursor: 'pointer', border: 'none',
              }}>
                Get Started <ChevronRight size={14} />
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <button
              onClick={() => navigate('/workspace')}
              className="btn-premium"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 18px', borderRadius: '999px',
                color: 'white', fontSize: '0.85rem',
                fontWeight: '600', cursor: 'pointer', border: 'none',
              }}
            >
              Open Vault <ChevronRight size={14} />
            </button>
          </SignedIn>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <header style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        padding: '80px 20px 0',
        position: 'relative', zIndex: 10,
      }}>
        <div className="eyebrow-badge" style={{ marginBottom: '28px' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          <ShinyText text="Vault OS v1.0 — now live" speed={3.5} color="#a5b4fc" shineColor="#e0e7ff" spread={90} />
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
          fontWeight: '800',
          letterSpacing: '-0.04em',
          lineHeight: '1.05',
          maxWidth: '820px',
          marginBottom: '24px',
          color: '#fafafa',
        }}>
          Your codebase,{' '}
          <span className="gradient-text">finally documented.</span>
        </h1>

        <p style={{
          color: '#71717a',
          fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
          maxWidth: '520px',
          marginBottom: '40px',
          lineHeight: '1.7',
          fontWeight: '400',
        }}>
          Paste a snippet. The AI maps its architecture, flags vulnerabilities,
          and writes the docs your team keeps procrastinating on.
        </p>

        {/* CTA row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '72px' }}>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn-premium" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '13px 28px', borderRadius: '10px',
                color: 'white', fontSize: '0.95rem',
                fontWeight: '600', cursor: 'pointer', border: 'none',
              }}>
                Try the Vault free <ChevronRight size={16} />
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <button
              onClick={() => navigate('/workspace')}
              className="btn-premium"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '13px 28px', borderRadius: '10px',
                color: 'white', fontSize: '0.95rem',
                fontWeight: '600', cursor: 'pointer', border: 'none',
              }}
            >
              Open Vault <ChevronRight size={16} />
            </button>
          </SignedIn>

          {/* ✅ Fixed: scrolls to features section instead of navigating */}
          <button
            onClick={scrollToFeatures}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '13px 28px', borderRadius: '10px',
              color: '#a1a1aa', fontSize: '0.95rem',
              fontWeight: '500', cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.color = '#fafafa';
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#a1a1aa';
            }}
          >
            See how it works
          </button>
        </div>
      </header>

      {/* ── Infinite Marquee ──────────────────────────────── */}
      <div className="marquee-outer" style={{ paddingBottom: '80px' }}>
        <div className="marquee-track">
          {TRACK.map((card, i) => (
            <MarqueeCard key={i} {...card} />
          ))}
        </div>
      </div>

      {/* ── Feature Grid (scroll target) ─────────────────── */}
      <section
        ref={featuresRef}
        style={{
          maxWidth: '1100px', margin: '0 auto 100px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px', padding: '0 24px',
          position: 'relative', zIndex: 10,
          scrollMarginTop: '40px',
        }}
      >
        {[
          {
            Icon: Terminal, color: '#6366f1',
            title: 'Syntax Preservation',
            body: 'Perfect indentation and formatting kept across JS, Python, C++, Go, and more.',
          },
          {
            Icon: Network, color: '#8b5cf6',
            title: 'Relational Mapping',
            body: 'Controllers, models, and routes automatically linked in the PostgreSQL vault.',
          },
          {
            Icon: ShieldCheck, color: '#22c55e',
            title: 'Vulnerability Scans',
            body: 'Security risks, Big-O inefficiencies, and deprecated methods flagged instantly.',
          },
        ].map(({ Icon, color, title, body }) => (
          <div key={title} className="glass-panel-premium" style={{ padding: '32px', borderRadius: '16px' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '10px',
              background: `${color}18`,
              border: `1px solid ${color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '18px',
            }}>
              <Icon size={20} color={color} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: '#fafafa' }}>{title}</h3>
            <p style={{ color: '#71717a', lineHeight: '1.6', fontSize: '0.875rem' }}>{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Home;