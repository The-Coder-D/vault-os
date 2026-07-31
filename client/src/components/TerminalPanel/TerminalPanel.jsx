import { useEffect, useRef, useState } from 'react';

// Lines are typed out char-by-char, then the whole thing holds,
// clears, and repeats. Each line carries a className for its color.
const SCRIPT = [
  { text: '$ vault scan snippet.ts', cls: 'terminal-prompt' },
  { text: '> parsing imports.................. 4 files', cls: '' },
  { text: '> mapping relations................ auth -> db -> routes', cls: '' },
  { text: '> flagging risks.................... 1 found (JWT expiry)', cls: 'terminal-warn' },
  { text: '> writing documentation............. done', cls: 'terminal-ok' },
  { text: '> ACCESS GRANTED', cls: 'terminal-grant' },
];

const TYPE_MS = 18;
const LINE_PAUSE_MS = 260;
const HOLD_MS = 2400;

function TerminalPanel() {
  const [lines, setLines] = useState([]);
  const [current, setCurrent] = useState('');
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (reducedMotion.current) {
      // Show the final state immediately, no animation.
      setLines(SCRIPT);
      setCurrent('');
      return;
    }

    let cancelled = false;
    let timeouts = [];

    const run = async () => {
      while (!cancelled) {
        setLines([]);
        for (const line of SCRIPT) {
          if (cancelled) return;
          for (let i = 1; i <= line.text.length; i++) {
            if (cancelled) return;
            await new Promise(r => timeouts.push(setTimeout(r, TYPE_MS)));
            setCurrent(line.text.slice(0, i));
          }
          await new Promise(r => timeouts.push(setTimeout(r, LINE_PAUSE_MS)));
          setLines(prev => [...prev, line]);
          setCurrent('');
        }
        await new Promise(r => timeouts.push(setTimeout(r, HOLD_MS)));
      }
    };

    run();
    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="terminal">
      <div className="terminal-head">
        <span className="terminal-dot" />
        <span className="terminal-dot" />
        <span className="terminal-dot" />
        <span className="terminal-title">snippet.ts — vault scan</span>
      </div>
      <div className="terminal-body">
        {lines.map((l, i) => (
          <div key={i} className={l.cls}>{l.text}</div>
        ))}
        {current && <div>{current}<span className="cursor" /></div>}
        {!current && lines.length === SCRIPT.length && <span className="cursor" />}
      </div>
    </div>
  );
}

export default TerminalPanel;
