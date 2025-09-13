import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home.jsx';
import Quiz from './pages/Quiz.jsx';
import Directory from './pages/Directory.jsx';
import Timeline from './pages/Timeline.jsx';
import Recommendations from './pages/Recommendations.jsx';
import LoginForm from './components/LoginForm.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import Chatbot from './components/Chatbot.jsx';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const PageTransition = ({ children }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
    {children}
  </motion.div>
);

function AppShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-surfaceAlt shadow-soft sticky top-0 z-20">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-primary">
          <span>🎯 CareerPath</span>
        </Link>
        <nav className="hidden md:flex gap-6 text-sm font-semibold">
          <Link to="/quiz" className="hover:text-primary">Quiz</Link>
          <Link to="/directory" className="hover:text-primary">Colleges</Link>
          <Link to="/timeline" className="hover:text-primary">Timeline</Link>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="btn px-4 py-2 text-sm">Login</Link>
        </div>
      </header>
      <main className="flex-1 px-4 md:px-8 py-8 max-w-6xl w-full mx-auto">
        {children}
      </main>
      <footer className="text-center text-xs py-6 text-softText">© {new Date().getFullYear()} CareerPath Companion</footer>
      <Chatbot />
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.remove('light','dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <AnimatePresence mode="wait">
        <AppShell>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/quiz" element={<PageTransition><Quiz /></PageTransition>} />
            <Route path="/directory" element={<PageTransition><Directory /></PageTransition>} />
            <Route path="/timeline" element={<PageTransition><Timeline /></PageTransition>} />
            <Route path="/recs" element={<PageTransition><Recommendations /></PageTransition>} />
            <Route path="/login" element={<PageTransition><LoginForm /></PageTransition>} />
          </Routes>
        </AppShell>
      </AnimatePresence>
    </ThemeContext.Provider>
  );
}
