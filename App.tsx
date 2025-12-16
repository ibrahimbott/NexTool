import React, { useState, useEffect, useMemo } from 'react';
import { APP_NAME, CATEGORIES } from './constants';
import { TOOLS } from './data/toolsRegistry';
import { Category, Tool } from './types';
import { ToolCard, AdPlaceholder, Button } from './components/UI';
import { LayoutGrid, Search, Menu, X, ChevronRight, Home, Github, Terminal, Sun, Moon, Star } from 'lucide-react';

// --- Components (Inline for single file structural integrity in App.tsx) ---

const Sidebar: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  activeCategory: Category | 'All';
  onCategorySelect: (c: Category | 'All') => void;
  favorites: string[];
  tools: Tool[];
  onNavigate: (path: string) => void;
}> = ({ isOpen, onClose, activeCategory, onCategorySelect, favorites, tools, onNavigate }) => {
  const favoriteTools = tools.filter(t => favorites.includes(t.id));

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-50 transform transition-transform md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-500">
            <LayoutGrid className="w-6 h-6" /> {APP_NAME}
          </div>
          <button onClick={onClose} className="md:hidden text-gray-500 dark:text-slate-400"><X /></button>
        </div>
        
        <div className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-80px)]">
          <button 
            onClick={() => { onCategorySelect('All'); onClose(); }}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeCategory === 'All' ? 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
          >
            <Home className="w-4 h-4" /> All Tools
          </button>
          
          {favorites.length > 0 && (
            <div className="mb-4">
               <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                 <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> Favorites
               </div>
               <div className="space-y-1">
                 {favoriteTools.map(tool => (
                   <button
                     key={tool.id}
                     onClick={() => { onNavigate(tool.path); onClose(); }}
                     className="w-full text-left px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 truncate"
                   >
                     {tool.name}
                   </button>
                 ))}
               </div>
            </div>
          )}

          <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Categories</div>
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => { onCategorySelect(cat); onClose(); }}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${activeCategory === cat ? 'bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
            >
              {cat}
            </button>
          ))}

          <div className="mt-8 px-4">
             <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 text-white text-center shadow-lg">
                <Github className="w-8 h-8 mx-auto mb-2" />
                <p className="text-xs text-gray-400 mb-3">Like this project?</p>
                <a 
                  href="https://github.com/Ibrahim-Tayyab?tab=" 
                  target="_blank" 
                  rel="noreferrer"
                  className="block w-full py-2 bg-white text-gray-900 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
                >
                  Follow on GitHub
                </a>
             </div>
          </div>
        </div>
      </aside>
    </>
  );
};

// --- Page Components ---

const HomePage: React.FC<{ 
  tools: Tool[], 
  onNavigate: (path: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}> = ({ tools, onNavigate, favorites, onToggleFavorite }) => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const quotes = [
      "Code is like humor. When you have to explain it, it’s bad.",
      "First, solve the problem. Then, write the code.",
      "Simplicity is the soul of efficiency.",
      "Make it work, make it right, make it fast.",
      "Software is a great combination between artistry and engineering.",
      "Clean code always looks like it was written by someone who cares.",
      "Programming is thinking, not typing."
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center py-10 px-4 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 rounded-3xl border border-blue-100 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5">
           <Terminal className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            Next-Gen Developer Tools
          </h1>
          <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-2 italic">
            "{quote}"
          </p>
          <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto mt-4">
            A powerful suite of 50+ free, client-side utilities. No login required. Safe, fast, and open source.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <a 
              href="https://github.com/Ibrahim-Tayyab?tab=" 
              target="_blank"
              className="inline-flex items-center gap-2 px-5 py-2 bg-gray-900 dark:bg-slate-700 text-white rounded-full font-medium hover:bg-gray-800 dark:hover:bg-slate-600 transition-colors"
            >
              <Github className="w-4 h-4" /> Follow Ibrahim-Tayyab
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map(tool => (
          <ToolCard 
            key={tool.id}
            title={tool.name}
            description={tool.description}
            icon={tool.icon}
            category={tool.category}
            tags={[...(tool.isPopular ? ['Popular' as const] : []), ...(tool.isNew ? ['New' as const] : [])]}
            onClick={() => onNavigate(tool.path)}
            isFavorite={favorites.includes(tool.id)}
            onToggleFavorite={(e) => {
              e.stopPropagation();
              onToggleFavorite(tool.id);
            }}
          />
        ))}
        {tools.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-400 dark:text-slate-500">
            No tools found matching your search.
          </div>
        )}
      </div>

      <div className="py-8">
         <AdPlaceholder className="h-32 w-full" label="Horizontal Ad Banner" />
      </div>
    </div>
  );
};

const ToolView: React.FC<{ 
  tool: Tool; 
  isFavorite: boolean; 
  onToggleFavorite: (id: string) => void; 
}> = ({ tool, isFavorite, onToggleFavorite }) => {
  const Component = tool.component || (() => <div>Not Implemented</div>);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 mb-4">
        <span>Tools</span>
        <ChevronRight className="w-4 h-4" />
        <span>{tool.category}</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-blue-600 dark:text-blue-400 font-medium">{tool.name}</span>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-4 mb-2">
               <div className="p-3 bg-blue-600 text-white rounded-lg">
                  <tool.icon className="w-6 h-6" />
               </div>
               <div>
                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tool.name}</h1>
                 <p className="text-gray-500 dark:text-slate-400 text-sm">{tool.description}</p>
               </div>
             </div>
             <button 
               onClick={() => onToggleFavorite(tool.id)}
               className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
               title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
             >
               <Star className={`w-6 h-6 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 dark:text-slate-500'}`} />
             </button>
           </div>
        </div>

        <div className="p-6 md:p-8">
          <Component />
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 prose prose-blue dark:prose-invert max-w-none dark:text-slate-300">
          <h3 className="dark:text-white">About {tool.name}</h3>
          <p>
            This <strong>{tool.name}</strong> is a free online tool that allows you to {tool.description.toLowerCase()} 
            It works entirely in your browser using client-side JavaScript, ensuring your data remains secure and is never sent to a server.
          </p>
          <h4 className="dark:text-white">How to use {tool.name}</h4>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Enter your input data or upload a file.</li>
            <li>Configure the settings if available.</li>
            <li>View the result instantly or download the processed file.</li>
          </ol>
        </div>
        <div className="space-y-4">
           <AdPlaceholder className="h-64" label="Sidebar Ad" />
        </div>
      </div>
    </div>
  );
};

// --- Main App Logic ---

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Favorites State
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Apply Theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Persist Favorites
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  // Simple Hash Router Logic
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || '#/');
      window.scrollTo(0,0);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const currentTool = useMemo(() => {
    const path = currentPath.replace('#', '');
    return TOOLS.find(t => t.path === path);
  }, [currentPath]);

  // Filtering Logic
  const filteredTools = useMemo(() => {
    return TOOLS.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  // Update Page Title and Meta Description for SEO
  useEffect(() => {
    if (currentTool) {
      document.title = `${currentTool.name} - Free Online Tool - ${APP_NAME}`;
      const descMeta = document.querySelector('meta[name="description"]');
      if(descMeta) {
        descMeta.setAttribute('content', `Use our free online ${currentTool.name}. ${currentTool.description} Fast, secure, and no installation required.`);
      }
    } else {
      document.title = `${APP_NAME} - Ultimate Free Online Tools`;
      const descMeta = document.querySelector('meta[name="description"]');
      if(descMeta) {
        descMeta.setAttribute('content', "A collection of 50+ free online tools for developers, writers, and designers. Fast, secure, and client-side only.");
      }
    }
  }, [currentTool]);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeCategory={activeCategory}
        onCategorySelect={(cat) => {
          setActiveCategory(cat);
          navigate('#/'); // Go home when category changes
        }}
        favorites={favorites}
        tools={TOOLS}
        onNavigate={navigate}
      />

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-30 transition-colors">
          <div className="px-4 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                <Menu />
              </button>
              <div className="flex relative w-full max-w-md">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 w-4 h-4" />
                 <input 
                    type="text" 
                    placeholder="Search tools..." 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (currentPath !== '#/') navigate('#/');
                    }}
                    className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-800 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-48 md:w-64 transition-all focus:w-full dark:text-slate-200 dark:placeholder-slate-500"
                 />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className="p-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <a 
                 href="https://github.com/Ibrahim-Tayyab?tab=" 
                 target="_blank" 
                 rel="noreferrer"
                 className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-700"
              >
                <Github className="w-4 h-4" /> Follow
              </a>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {currentTool ? (
            <ToolView 
              tool={currentTool} 
              isFavorite={favorites.includes(currentTool.id)}
              onToggleFavorite={toggleFavorite}
            />
          ) : (
            <HomePage 
              tools={filteredTools} 
              onNavigate={navigate} 
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-8 px-4 text-center transition-colors">
          <p className="text-gray-500 dark:text-slate-500 text-sm">
            © {new Date().getFullYear()} {APP_NAME}. Built with ❤️ by <a href="https://github.com/Ibrahim-Tayyab?tab=" className="text-blue-600 dark:text-blue-400 hover:underline">Ibrahim Tayyab</a>.
            <br />
            No login required. Client-side secure.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;