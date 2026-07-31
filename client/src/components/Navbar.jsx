import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {!isHome && (
          <button
            onClick={() => navigate(-1)}
            className="btn btn-text"
            style={{ textTransform: 'none' }}
          >
            <ArrowLeft size={15} /> back
          </button>
        )}
      </div>

      <div className="topbar-logo">
        <span className="path">~/</span>vault-os
      </div>
    </nav>
  );
}

export default Navbar;
