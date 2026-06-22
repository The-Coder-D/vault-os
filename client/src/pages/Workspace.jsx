import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Database, Play, Loader2, FileCode, Clock, ShieldCheck, Download, Trash2, Search, Wand2 } from 'lucide-react';
import { useAuth, UserButton } from '@clerk/clerk-react';
import ReactMarkdown from 'react-markdown'; // FIX #1: was used in JSX but never imported -> crashed the component

// DEPLOYMENT PREP: reads the backend URL from a Vite env variable (VITE_API_URL).
// Locally this falls back to localhost:3000 automatically, since VITE_API_URL
// won't be set until you configure it in Vercel for the deployed build.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Workspace() {
  const [codeSnippet, setCodeSnippet] = useState('// Paste code here to analyze and permanently save it to the Vault...\n\n');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [savedVaults, setSavedVaults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && userId) {
      fetchVaultHistory();
    }
  }, [isLoaded, userId]);

  const fetchVaultHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/snippets`, {
        headers: {
          'x-user-id': userId
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedVaults(data);
      }
    } catch (err) {
      console.error("Could not load history", err);
    }
  };

  const handleAnalyze = async () => {
    if (!userId) return; // FIX #4: guard against firing a request before Clerk has loaded a user

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAiError(null);

    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ codeSnippet })
      });

      const textResponse = await response.text();
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (err) {
        throw new Error("Backend returned invalid data. Check your Express terminal.");
      }

      if (!response.ok) {
        throw new Error(data.error || `Server Error: ${response.status}`);
      }

      setAnalysisResult(data);
      fetchVaultHistory();

    } catch (error) {
      console.error("Backend Error:", error);
      setAiError(error.message || "The AI model failed to process this snippet.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefactor = async () => {
    if (!userId) return;
    setIsRefactoring(true); setAiError(null);
    try {
      const response = await fetch(`${API_URL}/api/refactor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ codeSnippet })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setCodeSnippet(data.optimizedCode);
      setAnalysisResult({
        summary: data.explanation,
        language: "Optimized Code",
        complexity: "Improved",
        vulnerability: "Resolved",
        tags: ["Refactored"]
      });
    } catch (error) { setAiError("Refactor Failed."); }
    finally { setIsRefactoring(false); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this snippet from the Vault?")) return;
    try {
      await fetch(`${API_URL}/api/snippets/${id}`, { // FIX: was hardcoded to localhost:3000
        method: 'DELETE',
        headers: { 'x-user-id': userId }
      });
      fetchVaultHistory();
    } catch (err) { console.error(err); }
  };

  const handleExport = async () => {
    if (!userId) return;
    setIsExporting(true);

    try {
      const response = await fetch(`${API_URL}/api/export`, { // FIX: was hardcoded to localhost:3000
        headers: {
          'x-user-id': userId
        }
      });

      if (!response.ok) throw new Error("Export failed");

      const htmlText = await response.text();

      const blob = new Blob([htmlText], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = 'VaultOS-Documentation.html';
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating documentation:", error);
      alert("Failed to export documentation.");
    } finally {
      setIsExporting(false);
    }
  };

  const loadSnippet = (snippet) => {
    setCodeSnippet(snippet.rawCode);
    setAnalysisResult({
      summary: snippet.summary,
      language: snippet.language,
      complexity: snippet.timeComplexity,
      vulnerability: snippet.vulnerabilities,
      tags: snippet.tags || [] // FIX #5: tags were dropped when reloading a snippet from history
    });
    setAiError(null);
  };

  const handleNewSnippet = () => {
    setCodeSnippet('// Paste code here to analyze and permanently save it to the Vault...\n\n');
    setAnalysisResult(null);
    setAiError(null);
  };

  const filteredVaults = savedVaults.filter(s =>
    s.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.language?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.tags && s.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 85px)', width: '100%', boxSizing: 'border-box', padding: '20px', gap: '20px', overflow: 'hidden' }}>

      {/* Sidebar Area */}
      <aside className="glass-panel-premium" style={{ width: '300px', flexShrink: 0, padding: '25px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>
          <Database size={24} color="#4f46e5" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: '500', color: '#fff' }}>Vault History</h2>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '0 0 15px 0' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#a1a1aa" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text" placeholder="Search code or tags..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 38px', boxSizing: 'border-box', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
            />
          </div>
        </div>

        {/* FIX #3: this single block replaces the two duplicate render blocks that
            used to both loop over the vault history (once filtered, once unfiltered) */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {savedVaults.length === 0 ? (
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', fontStyle: 'italic' }}>No snippets saved yet.</p>
          ) : filteredVaults.length === 0 ? (
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem', fontStyle: 'italic' }}>No matches found.</p>
          ) : (
            filteredVaults.map((snippet) => (
              <div key={snippet.id} onClick={() => loadSnippet(snippet)} style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.02)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>{snippet.language} Snippet</span>
                  <Trash2 size={16} color="#ef4444" style={{ cursor: 'pointer', opacity: 0.7 }} onClick={(e) => handleDelete(e, snippet.id)} />
                </div>
                <p style={{ color: '#a1a1aa', fontSize: '0.8rem', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{snippet.summary}</p>

                <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {snippet.tags && snippet.tags.map((tag, i) => (
                    <span key={i} style={{ background: 'rgba(79, 70, 229, 0.2)', color: '#a5b4fc', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px' }}>#{tag}</span>
                  ))}
                </div>

                <span style={{ color: '#a1a1aa', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                  <Clock size={12} /> {new Date(snippet.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Container Area */}
      <main className="glass-panel-premium" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

        <div style={{ padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <span style={{ fontFamily: 'monospace', color: '#a1a1aa' }}>workspace / secure-editor</span>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

            <button
              onClick={handleExport}
              disabled={isExporting || savedVaults.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', borderRadius: '8px', color: '#a1a1aa', cursor: (isExporting || savedVaults.length === 0) ? 'not-allowed' : 'pointer', fontWeight: '500', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', opacity: (isExporting || savedVaults.length === 0) ? 0.5 : 1 }}
              onMouseOver={(e) => { if (!isExporting && savedVaults.length > 0) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; } }}
              onMouseOut={(e) => { if (!isExporting && savedVaults.length > 0) { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; } }}
            >
              {isExporting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
              Export Docs
            </button>

            <button
              onClick={handleNewSnippet}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', borderRadius: '8px', color: '#a1a1aa', cursor: 'pointer', fontWeight: '500', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              + New
            </button>

            <button onClick={handleRefactor} disabled={isRefactoring} className="btn-premium" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', padding: '8px 20px', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 'bold' }}>
              {isRefactoring ? <Loader2 size={16} className="spin" /> : <Wand2 size={16} />} Auto-Refactor
            </button>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="btn-premium"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', borderRadius: '8px', color: 'white', cursor: isAnalyzing ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: isAnalyzing ? 0.7 : 1, border: 'none' }}
            >
              {isAnalyzing ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={16} fill="white" />}
              {isAnalyzing ? 'Analyzing & Saving...' : 'Analyze Snippet'}
            </button>

            <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
              <UserButton afterSignOutUrl="/" />
            </div>

          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'block' }}>

          <div style={{ height: '400px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: '#1e1e1e', marginBottom: '20px' }}>
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={codeSnippet}
              onChange={(value) => setCodeSnippet(value)}
              options={{ minimap: { enabled: false }, fontSize: 16, padding: { top: 15 }, fontFamily: "'Space Grotesk', monospace", scrollBeyondLastLine: false }}
            />
          </div>

          {aiError && (
            <div style={{ padding: '15px 20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>⚠️</span> {aiError}
            </div>
          )}

          {analysisResult && !aiError && (
            <div style={{ padding: '25px', background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.3)', borderRadius: '12px', animation: 'slideUp 0.3s ease-out' }}>
              <h3 style={{ color: '#a5b4fc', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem' }}>
                <ShieldCheck size={24} /> AI Engine Analysis Complete
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div>
                  <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Summary</p>
                  {/* FIX #2: summary used to be rendered twice (a raw <p> AND ReactMarkdown below it) -
                      now rendered once, via ReactMarkdown, inside a <div> instead of a <p>
                      since ReactMarkdown can output block elements that aren't valid inside a <p> */}
                  <div style={{ color: '#fff', lineHeight: '1.6', fontSize: '1.05rem' }}>
                    <ReactMarkdown>{String(analysisResult.summary)}</ReactMarkdown>
                  </div>
                </div>
                <div>
                  <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Detected Language</p>
                  <p style={{ color: '#fff', fontSize: '1.05rem' }}>{String(analysisResult.language)}</p>
                </div>
                <div>
                  <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Time Complexity</p>
                  <p style={{ color: '#fbbf24', fontFamily: 'monospace', fontSize: '1.1rem', background: 'rgba(0,0,0,0.3)', padding: '5px 10px', borderRadius: '6px', display: 'inline-block' }}>{String(analysisResult.complexity)}</p>
                </div>
                <div>
                  <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Security Check</p>
                  <p style={{ color: '#ef4444', lineHeight: '1.5', fontSize: '1.05rem' }}>{String(analysisResult.vulnerability)}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}

export default Workspace;