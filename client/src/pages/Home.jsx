import { useNavigate } from 'react-router-dom';
import { useRef, useCallback } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import {
  Terminal, Network, ShieldCheck, ArrowRight,
  Lock, GitBranch, Zap, FileCode, Cpu
} from 'lucide-react';
import TerminalPanel from '../components/TerminalPanel/TerminalPanel';

/* ── Log stream data ───────────────────────────────────── */
const ENTRIES = [
  {
    dot: '#ff6b5e', file: 'auth.controller.ts',
    title: 'JWT middleware detected',
    body: 'Token validation chain mapped across 4 routes. Expiry logic flagged as inconsistent.',
    tag: 'SECURITY', tagColor: '#ff6b5e',
    Icon: Lock,
  },
  {
    dot: '#3ddc84', file: 'database.service.ts',
    title: 'Relational schema mapped',
    body: 'Users -> Posts -> Comments linked. N+1 query risk detected on line 47.',
    tag: 'PERFORMANCE', tagColor: '#3ddc84',
    Icon: GitBranch,
  },
  {
    dot: '#ffb454', file: 'sorting.utils.js',
    title: 'O(n^2) bubble sort found',
    body: 'Replace with Array.sort() for O(n log n). Affects lists > 500 items significantly.',
    tag: 'OPTIMIZE', tagColor: '#ffb454',
    Icon: Zap,
  },
  {
    dot: '#8fa3ff', file: 'api.routes.ts',
    title: 'REST layer documented',
    body: '12 endpoints catalogued. Missing rate-limiting on /upload and /export routes.',
    tag: 'API', tagColor: '#8fa3ff',
    Icon: Network,
  },
  {
    dot: '#3ddc84', file: 'payment.service.ts',
    title: 'Stripe integration healthy',
    body: 'Webhook signature validation present. Idempotency keys missing on retry logic.',
    tag: 'SECURITY', tagColor: '#ff6b5e',
    Icon: ShieldCheck,
  },
  {
    dot: '#8fa3ff', file: 'render.pipeline.ts',
    title: 'Async waterfall resolved',
    body: 'Promise chain untangled. 3 unhandled rejection paths found and documented.',
    tag: 'LOGIC', tagColor: '#8fa3ff',
    Icon: Cpu,
  },
  {
    dot: '#ffb454', file: 'parser.wasm.js',
    title: 'WASM boundary annotated',
    body: 'Memory allocation pattern documented. Buffer overflow risk on large file inputs.',
    tag: 'MEMORY', tagColor: '#ffb454',
    Icon: FileCode,
  },
  {
    dot: '#3ddc84', file: 'cache.layer.ts',
    title: 'Redis TTL strategy mapped',
    body: 'LRU eviction documented. Stale-while-revalidate pattern recommended for /feed.',
    tag: 'PERFORMANCE', tagColor: '#3ddc84',
    Icon: Terminal,
  },
];

function LogEntry({ dot, file, title, body, tag, tagColor, Icon }) {
  return (
    <div className="log-entry">
      <div className="log-entry-head">
        <span className="dot" style={{ background: dot }} />
        <span>{file}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <Icon size={15} color={tagColor} style={{ marginTop: '3px', flexShrink: 0 }} />
        <div>
          <div className="log-entry-title">{title}</div>
          <div className="log-entry-body">{body}</div>
          <span className="log-entry-tag" style={{ color: tagColor }}>{tag}</span>
        </div>
      </div>
    </div>
  );
}

const TRACK = [...ENTRIES, ...ENTRIES];

const CAPABILITIES = [
  {
    Icon: Terminal,
    title: 'Syntax preservation',
    body: 'Exact indentation and formatting kept across JS, Python, C++, Go, and more.',
  },
  {
    Icon: Network,
    title: 'Relational mapping',
    body: 'Controllers, models, and routes automatically linked in the Postgres vault.',
  },
  {
    Icon: ShieldCheck,
    title: 'Vulnerability scans',
    body: 'Security risks, Big-O inefficiencies, and deprecated methods flagged on save.',
  },
];

function Home() {
  const navigate = useNavigate();
  const featuresRef = useRef(null);

  const scrollToFeatures = useCallback(() => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden', position: 'relative', zIndex: 1 }}>

      {/* ── Top bar ────────────────────────────────────────── */}
      <nav className="topbar">
        <div className="topbar-logo">
          <span className="path">~/</span>vault-os
        </div>
        <div className="topbar-links">
          <span className="topbar-link">docs</span>
          <span className="topbar-link">pricing</span>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn btn-text">sign in</button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="btn btn-primary">Enter the vault<ArrowRight size={14} /></button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <button onClick={() => navigate('/workspace')} className="btn btn-primary">
              Open vault<ArrowRight size={14} />
            </button>
          </SignedIn>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero-grid">
        <div className="hero-copy">
          <div className="eyebrow" style={{ marginBottom: '18px' }}>vault_os · v1.0 · status: online</div>
          <h1>Your codebase,<br /><em>finally documented.</em></h1>
          <p>
            Paste a snippet. The AI maps its architecture, flags vulnerabilities,
            and writes the docs your team keeps procrastinating on.
          </p>
          <div className="hero-cta-row">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn btn-primary">Try the vault free<ArrowRight size={14} /></button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <button onClick={() => navigate('/workspace')} className="btn btn-primary">
                Open vault<ArrowRight size={14} />
              </button>
            </SignedIn>
            <button onClick={scrollToFeatures} className="btn btn-ghost">See how it works</button>
          </div>
        </div>

        <TerminalPanel />
      </section>

      {/* ── Log stream ─────────────────────────────────────── */}
      <div className="log-outer">
        <div className="log-track">
          {TRACK.map((entry, i) => (
            <LogEntry key={i} {...entry} />
          ))}
        </div>
      </div>

      {/* ── Capability strip ─────────────────────────────────── */}
      <section ref={featuresRef} className="cap-strip">
        {CAPABILITIES.map(({ Icon, title, body }, i) => (
          <div key={title} className="cap-block">
            <Icon size={18} color="var(--signal)" />
            <h3 style={{ marginTop: '16px' }}>{title}</h3>
            <p>{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Home;
