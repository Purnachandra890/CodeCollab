import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Brain, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  Dices, 
  Globe, 
  ArrowRight, 
  Target,
  ChevronRight,
  Database,
  Search,
  History,
  X,
  ChevronLeft
} from 'lucide-react';

/**
 * DSA DECK NOTES - STANDALONE PROTOTYPE
 * Includes "Watch Demo" Image Gallery Modal
 */

export default function DSADeck() {
  const [showDemo, setShowDemo] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Mock website images - replace these URLs with your actual hosted image paths
  const demoImages = [
    { url: "/problem_dashboard.png", title: "Personal Dashboard" },
    { url: "/library.png", title: "Problem Library View" },
    { url: "/revision.png", title: "Active Recall Session" },
    { url: "/iac.png", title: "Intuition, Algo & code" }
  ];

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Prevent scrolling when modal is open
    if (showDemo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showDemo]);

  const nextImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % demoImages.length);
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + demoImages.length) % demoImages.length);
  };

  return (
    <div className="dsa-deck-root">
      <style>{cssStyles}</style>
      
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <div className="logo">
            <Brain className="icon-blue" size={28} />
            <span>DSA Deck</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#revision">Revision</a>
            <button className="btn-primary">
              <a href="https://dsa-deck-notes.vercel.app/" style={{color: 'inherit', textDecoration: 'none'}}>Get Early Access</a>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <div className="badge">🚀 Introducing DSA Deck – Notes</div>
          <h1>Practice DSA. <span className="text-gradient">Remember it longer.</span></h1>
          <p className="hero-subtitle">
            A personal space to store problems, write notes, and revise intelligently.
            Built for developers who want to stop forgetting and start mastering.
          </p>
          <div className="hero-btns">
            <button className="btn-lg">
              <a href="https://dsa-deck-notes.vercel.app/" style={{color: 'inherit', textDecoration: 'none'}}>Start Your Deck</a>
            </button>
            <button className="btn-outline" onClick={() => setShowDemo(true)}>Watch Demo</button>
          </div>
        </div>
        <div className="hero-glow"></div>
      </header>

      {/* Demo Modal */}
      {showDemo && (
        <div className="modal-overlay" onClick={() => setShowDemo(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDemo(false)}>
              <X size={24} />
            </button>
            
            <div className="gallery-container">
              <button className="gallery-nav prev" onClick={prevImg}><ChevronLeft size={32} /></button>
              
              <div className="image-wrapper">
                <img 
                  src={demoImages[currentImgIndex].url} 
                  alt={demoImages[currentImgIndex].title}
                  className="demo-image"
                />
                <div className="image-caption">
                  <h3>{demoImages[currentImgIndex].title}</h3>
                  <p>Step {currentImgIndex + 1} of {demoImages.length}</p>
                </div>
              </div>

              <button className="gallery-nav next" onClick={nextImg}><ChevronRight size={32} /></button>
            </div>

            <div className="thumbnails">
              {demoImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`thumb ${idx === currentImgIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImgIndex(idx)}
                >
                  <img src={img.url} alt="thumbnail" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pain Points Section */}
      <section className="section section-pain">
        <div className="container">
          <h2 className="section-title">If you’ve ever felt...</h2>
          <div className="grid grid-3">
            <div className="card pain-card">
              <div className="card-icon icon-red"><History size={24} /></div>
              <h3>“I solved this before, but I forgot how”</h3>
            </div>
            <div className="card pain-card">
              <div className="card-icon icon-red"><Zap size={24} /></div>
              <h3>“I practiced a lot, but revision is messy”</h3>
            </div>
            <div className="card pain-card">
              <div className="card-icon icon-red"><Target size={24} /></div>
              <h3>“I don’t know what to revise next”</h3>
            </div>
          </div>
          <div className="solution-bar">
            👉 <strong>DSA Deck</strong> is built exactly for that.
          </div>
        </div>
      </section>

      {/* Feature Sections (Simplified for briefness, keeping current structure) */}
      <section id="features" className="section section-feature">
        <div className="container grid grid-2 items-center">
          <div className="feature-text">
            <div className="feature-label">01. Problem Library</div>
            <h2>Your Personal DSA Diary</h2>
            <p>Store everything you solve in one organized place. No more scattered screenshots or messy folders.</p>
            <ul className="feature-list">
              <li><CheckCircle2 size={20} className="icon-green" /> <span><strong>Problem Statement</strong></span></li>
              <li><CheckCircle2 size={20} className="icon-green" /> <span><strong>Intuition</strong></span></li>
              <li><CheckCircle2 size={20} className="icon-green" /> <span><strong>Algorithm</strong></span></li>
              <li><CheckCircle2 size={20} className="icon-green" /> <span><strong>Code Snippets</strong></span></li>
            </ul>
          </div>
          <div className="feature-preview">
            <div className="mock-window">
              <div className="mock-header">
                <div className="dots"><span></span><span></span><span></span></div>
                <div className="mock-search"><Search size={14} /> Search problems...</div>
              </div>
              <div className="mock-content">
                <div className="mock-item active">Two Sum • Hash Map • Easy</div>
                <div className="mock-item">Merge Intervals • Sorting • Medium</div>
                <div className="mock-item">Trapping Rain Water • Two Pointers • Hard</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature: Revision Modes */}
      <section id="revision" className="section bg-alt">
        <div className="container">
          <div className="section-header">
            <div className="feature-label center">02. Smart Revision Modes</div>
            <h2 className="center">Revise Smarter, Not Harder</h2>
          </div>
          <div className="grid grid-3">
            <div className="card feature-card">
              <div className="card-icon icon-blue"><Target size={24} /></div>
              <h3>Topic Revision</h3>
              <p>Deep dive into specific tags like DP or Graphs. Resume exactly where you left off.</p>
            </div>
            <div className="card feature-card">
              <div className="card-icon icon-purple"><Dices size={24} /></div>
              <h3>Random Revision</h3>
              <p>Simulate interview pressure by tackling random problems from your entire library.</p>
            </div>
            <div className="card feature-card">
              <div className="card-icon icon-green"><Globe size={24} /></div>
              <h3>Global Revision</h3>
              <p>A complete walkthrough of all your solved problems in chronological order.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-cta">
        <div className="container cta-box">
          <div className="cta-content">
            <RefreshCw size={48} className="icon-blue spin-slow" />
            <h2>Zero Manual Tracking</h2>
            <p>Problems marked as <strong>Partial</strong> or <strong>Forgot</strong> automatically come back to your queue later.</p>
            <button className="btn-lg">
               <a href="https://dsa-deck-notes.vercel.app/" style={{color: 'inherit', textDecoration: 'none'}}>Start Revitalizing Your Prep</a>
            </button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="logo"><Brain className="icon-blue" size={24} /><span>DSA Deck</span></div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 DSA Deck Notes. Built for the persistent coder.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const cssStyles = `
:root {
  --bg: #0a0a0c;
  --bg-alt: #111115;
  --text: #e2e8f0;
  --text-dim: #94a3b8;
  --primary: #2563eb;
  --primary-glow: rgba(37, 99, 235, 0.4);
  --border: rgba(255, 255, 255, 0.1);
  --glass: rgba(255, 255, 255, 0.03);
  --red: #ef4444;
  --green: #10b981;
  --purple: #8b5cf6;
}

.dsa-deck-root {
  background-color: var(--bg);
  color: var(--text);
  font-family: 'Inter', -apple-system, sans-serif;
  line-height: 1.6;
}

.container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }

/* NAVIGATION */
.nav {
  position: fixed; top: 0; left: 0; right: 0; height: 80px;
  background: rgba(10, 10, 12, 0.8); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border); z-index: 1000;
}
.nav-container { display: flex; align-items: center; justify-content: space-between; height: 100%; max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
.logo { display: flex; align-items: center; gap: 0.75rem; font-weight: 800; font-size: 1.25rem; }
.nav-links { display: flex; align-items: center; gap: 2rem; }
.nav-links a { color: var(--text-dim); text-decoration: none; font-weight: 500; }

/* HERO */
.hero { padding: 160px 2rem 100px; text-align: center; position: relative; overflow: hidden; }
.hero-content { position: relative; z-index: 2; max-width: 800px; margin: 0 auto; }
.badge { display: inline-block; background: rgba(37, 99, 235, 0.1); border: 1px solid rgba(37, 99, 235, 0.2); color: #60a5fa; padding: 0.5rem 1.25rem; border-radius: 999px; font-size: 0.875rem; font-weight: 600; margin-bottom: 2rem; }
.hero h1 { font-size: clamp(2.5rem, 8vw, 4.5rem); font-weight: 900; line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -0.04em; }
.text-gradient { background: linear-gradient(to right, #60a5fa, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-subtitle { font-size: 1.25rem; color: var(--text-dim); margin-bottom: 3rem; }
.hero-btns { display: flex; gap: 1rem; justify-content: center; }
.hero-glow { position: absolute; top: -20%; left: 50%; transform: translateX(-50%); width: 100%; height: 400px; background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%); z-index: 1; pointer-events: none; }

/* BUTTONS */
.btn-primary { background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 600; cursor: pointer; }
.btn-lg { background: var(--primary); color: white; border: none; padding: 1.25rem 2.5rem; border-radius: 16px; font-weight: 700; font-size: 1.125rem; cursor: pointer; box-shadow: 0 10px 20px -5px var(--primary-glow); transition: 0.2s; }
.btn-lg:hover { transform: translateY(-2px); box-shadow: 0 15px 30px -5px var(--primary-glow); }
.btn-outline { background: transparent; color: white; border: 1px solid var(--border); padding: 1.25rem 2.5rem; border-radius: 16px; font-weight: 700; font-size: 1.125rem; cursor: pointer; }
.btn-outline:hover { background: var(--glass); }

/* SECTIONS */
.section { padding: 100px 0; }
.bg-alt { background-color: var(--bg-alt); }
.section-title { text-align: center; font-size: 2.5rem; font-weight: 800; margin-bottom: 4rem; }
.grid { display: grid; gap: 2rem; }
.grid-2 { grid-template-columns: 1fr 1fr; }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.items-center { align-items: center; }

/* CARDS */
.card { background: var(--glass); border: 1px solid var(--border); padding: 2.5rem; border-radius: 24px; }
.card-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; }
.icon-blue { color: var(--primary); }
.icon-red { color: var(--red); background: rgba(239, 68, 68, 0.1); }
.icon-purple { color: var(--purple); background: rgba(139, 92, 246, 0.1); }
.icon-green { color: var(--green); }

/* FEATURES */
.feature-label { color: var(--primary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.875rem; margin-bottom: 1rem; }
.feature-label.center { text-align: center; }
.feature-text h2 { font-size: 3rem; font-weight: 800; margin-bottom: 1.5rem; line-height: 1.2; }
.feature-list { list-style: none; padding: 0; margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem; }
.mock-window { background: #1e1e24; border: 1px solid var(--border); border-radius: 20px; overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,0.5); }
.mock-header { height: 50px; background: #18181b; display: flex; align-items: center; padding: 0 1.5rem; gap: 2rem; }
.dots { display: flex; gap: 0.5rem; }
.dots span { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.1); }
.mock-item { height: 40px; display: flex; align-items: center; padding: 0 1rem; margin-bottom: 0.5rem; font-size: 0.875rem; color: var(--text-dim); }
.mock-item.active { background: var(--primary); color: white; border-radius: 8px; }

/* MODAL / DEMO GALLERY */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.95); z-index: 2000;
  display: flex; align-items: center; justify-content: center;
  padding: 2rem; animation: fadeIn 0.3s ease;
}
.modal-content {
  width: 100%; max-width: 1000px; position: relative;
  background: #111115; border-radius: 32px; border: 1px solid var(--border);
  padding: 2.5rem; display: flex; flex-direction: column; gap: 2rem;
}
.modal-close {
  position: absolute; top: 1.5rem; right: 1.5rem;
  background: rgba(255,255,255,0.05); border: none; color: white;
  width: 40px; height: 40px; border-radius: 50%; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.gallery-container {
  display: flex; align-items: center; gap: 1.5rem; position: relative;
}
.image-wrapper {
  flex: 1; border-radius: 16px; overflow: hidden; position: relative;
  background: #000; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}
.demo-image {
  width: 100%; height: auto; max-height: 500px; object-fit: contain;
  display: block; transition: 0.3s;
}
.image-caption {
  padding: 1.5rem; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  position: absolute; bottom: 0; left: 0; right: 0;
}
.image-caption h3 { margin: 0; font-size: 1.5rem; }
.image-caption p { margin: 0.5rem 0 0; color: var(--text-dim); }
.gallery-nav {
  background: rgba(255,255,255,0.05); border: none; color: white;
  width: 56px; height: 56px; border-radius: 50%; cursor: pointer;
  transition: 0.2s;
}
.gallery-nav:hover { background: var(--primary); }
.thumbnails {
  display: flex; gap: 1rem; justify-content: center; overflow-x: auto; padding-bottom: 0.5rem;
}
.thumb {
  width: 100px; height: 60px; border-radius: 8px; overflow: hidden;
  cursor: pointer; border: 2px solid transparent; opacity: 0.5; transition: 0.2s;
}
.thumb.active { border-color: var(--primary); opacity: 1; transform: scale(1.05); }
.thumb img { width: 100%; height: 100%; object-fit: cover; }

/* CTA & FOOTER */
.section-cta { padding: 100px 2rem; }
.cta-box { background: linear-gradient(135deg, #1e1e24 0%, #0a0a0c 100%); border-radius: 48px; padding: 100px 40px; text-align: center; border: 1px solid var(--border); }
.cta-content h2 { font-size: 3.5rem; font-weight: 800; margin: 2rem 0; }
.spin-slow { animation: spin 8s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

@media (max-width: 768px) {
  .grid-2, .grid-3 { grid-template-columns: 1fr; }
  .nav-links { display: none; }
  .modal-content { padding: 1.5rem; }
  .gallery-nav { display: none; }
}
`;