import { useNavigate } from 'react-router-dom';
import { Terminal, Network, ShieldCheck, ChevronRight, Code2 } from 'lucide-react';

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ height: 'calc(100vh - 75px)', overflowY: 'auto', paddingBottom: '100px' }}>
      
      {/* Hero Section */}
      <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '120px 20px 60px', position: 'relative', zIndex: 10 }}>
        <div style={{ background: 'rgba(79, 70, 229, 0.2)', border: '1px solid rgba(79, 70, 229, 0.5)', padding: '8px 16px', borderRadius: '30px', marginBottom: '24px', color: '#a5b4fc', fontSize: '0.9rem', fontWeight: '500' }}>
          Vault OS v1.0 is now live
        </div>
        
        <h1 className="gradient-text" style={{ fontSize: '5rem', fontWeight: '800', letterSpacing: '-2px', lineHeight: '1.1', maxWidth: '900px', marginBottom: '24px' }}>
          The intelligent memory bank for your best code.
        </h1>
        
        <p style={{ color: '#a1a1aa', fontSize: '1.25rem', maxWidth: '600px', marginBottom: '40px', lineHeight: '1.6' }}>
          Stop losing complex logic in old repositories. Paste blocks, let our AI engine analyze the architecture, and automatically generate relational documentation.
        </p>

        <button 
          onClick={() => navigate('/workspace')}
          className="btn-premium"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 40px', borderRadius: '12px', color: 'white', fontSize: '1.2rem', fontWeight: '700', cursor: 'pointer', border: 'none' }}
        >
          Enter the Vault <ChevronRight size={20} />
        </button>
      </header>

      {/* Feature Grid */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        
        <div className="glass-panel-premium" style={{ padding: '40px', textAlign: 'left', borderRadius: '20px' }}>
          <Terminal size={32} color="#4f46e5" style={{ marginBottom: '20px' }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Syntax Preservation</h3>
          <p style={{ color: '#a1a1aa', lineHeight: '1.5' }}>Maintains perfect indentation, syntax highlighting, and formatting across Javascript, Python, C++, and more.</p>
        </div>

        <div className="glass-panel-premium" style={{ padding: '40px', textAlign: 'left', borderRadius: '20px' }}>
          <Network size={32} color="#c026d3" style={{ marginBottom: '20px' }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Relational Mapping</h3>
          <p style={{ color: '#a1a1aa', lineHeight: '1.5' }}>Automatically links related controllers, models, and routes together in the PostgreSQL database.</p>
        </div>

        <div className="glass-panel-premium" style={{ padding: '40px', textAlign: 'left', borderRadius: '20px' }}>
          <ShieldCheck size={32} color="#34d399" style={{ marginBottom: '20px' }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Vulnerability Scans</h3>
          <p style={{ color: '#a1a1aa', lineHeight: '1.5' }}>The AI engine instantly flags potential security risks, Big-O inefficiencies, and deprecated methods.</p>
        </div>

      </section>
    </div>
  );
}

export default Home;