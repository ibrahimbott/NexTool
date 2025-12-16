import React from 'react';
import { Star } from 'lucide-react';

// Ad Placeholder
export const AdPlaceholder: React.FC<{ className?: string, label?: string }> = ({ className = "h-32", label = "Advertisement Space" }) => (
  <div className={`bg-gray-100 dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-slate-500 text-sm font-medium ${className}`}>
    {label}
  </div>
);

// Tool Card
interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  category: string;
  tags?: ('Popular' | 'New')[];
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ title, description, icon: Icon, onClick, category, tags, isFavorite, onToggleFavorite }) => (
  <div 
    onClick={onClick}
    className="group relative bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/30 transition-all cursor-pointer flex flex-col h-full"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex gap-2">
        {tags && tags.length > 0 && (
          <div className="flex gap-1">
            {tags.map(tag => (
              <span key={tag} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tag === 'New' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400'}`}>
                {tag}
              </span>
            ))}
          </div>
        )}
        <button 
          onClick={onToggleFavorite}
          className={`p-1 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-slate-600'}`}
        >
          <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
    <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2 mb-4 flex-grow">{description}</p>
    <div className="mt-auto pt-4 border-t border-gray-50 dark:border-slate-700/50 flex justify-between items-center text-xs text-gray-400 dark:text-slate-500">
      <span>{category} Tools</span>
      <span className="group-hover:translate-x-1 transition-transform">Use Tool &rarr;</span>
    </div>
  </div>
);

// Button
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline'; size?: 'sm' | 'md' | 'lg' }> = ({ className = '', variant = 'primary', size = 'md', ...props }) => {
  const baseStyle = "rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-sm",
    secondary: "bg-gray-800 text-white hover:bg-gray-900 dark:bg-slate-700 dark:hover:bg-slate-600",
    outline: "border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-800"
  };
  return <button className={`${baseStyle} ${sizeStyles[size]} ${variants[variant]} ${className}`} {...props} />;
};

// Text Area
export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea 
    className="w-full p-4 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm bg-gray-50 dark:bg-slate-900 dark:text-slate-200"
    {...props}
  />
);