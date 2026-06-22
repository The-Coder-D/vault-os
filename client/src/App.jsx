import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Home from './pages/Home';
import Workspace from './pages/Workspace';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page - Anyone can see this */}
        <Route path="/" element={<Home />} />

        {/* Protected Workspace - Only logged-in users get past this point */}
        <Route 
          path="/workspace" 
          element={
            <>
              {/* If they are signed in, show them the Vault */}
              <SignedIn>
                <Workspace />
              </SignedIn>

              {/* If they are signed out, instantly redirect to the Clerk Login page */}
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;