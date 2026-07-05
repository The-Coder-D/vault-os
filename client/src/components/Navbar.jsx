import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Box } from 'lucide-react';
import ShinyText from './ShinyText/ShinyText';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the back button if we are on the Home page
  const isHome = location.pathname === '/';

  return (
    <nav style={{ 
      position: 'relative', 
      zIndex: 20, 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '20px 40px',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      background: 'rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {!isHome && (
          <button 
            onClick={() => navigate(-1)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '5px', 
              background: 'transparent', border: 'none', 
              color: '#a1a1aa', cursor: 'pointer', fontSize: '1rem',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
            onMouseOut={(e) => e.currentTarget.style.color = '#a1a1aa'}
          >
            <ChevronLeft size={20} /> Back
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Box size={24} color="#4f46e5" />
        <ShinyText
          text="Vault OS"
          speed={3}
          color="#a1a1aa"
          shineColor="#ffffff"
          spread={100}
          className="navbar-logo-text"
        />
      </div>
    </nav>
  );
}

export default Navbar;