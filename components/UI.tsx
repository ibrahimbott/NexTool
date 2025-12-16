import React from 'react';
import { Star } from 'lucide-react';

// Ad Placeholder
export const AdPlaceholder: React.FC<{ className?: string, label?: string }> = ({ className = "h-32", label = "Advertisement Space" }) => (
  <div className={`bg-gray-100 dark:bg-slate-800/50 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg flex items-center justify-center text-gray-400 dark:text-slate-500 text-sm font-medium ${className}`}>
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
    className="group relative bg-white dark:bg-slate-800 p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full active:scale-[0.98]"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex gap-2">
        {tags && tags.length > 0 && (
          <div className="flex gap-1">
            {tags.map(tag => (
              <span key={tag} className={`text-[10px] font-bold px-2 py-1 rounded-full ${tag === 'New' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400'}`}>
                {tag}
              </span>
            ))}
          </div>
        )}
        <button 
          onClick={onToggleFavorite}
          className={`p-1.5 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-slate-600'}`}
        >
          <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2 mb-4 flex-grow leading-relaxed">{description}</p>
    <div className="mt-auto pt-4 border-t border-gray-50 dark:border-slate-700/50 flex justify-between items-center text-xs font-medium text-gray-400 dark:text-slate-500">
      <span>{category} Tools</span>
      <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-blue-500">Use Tool &rarr;</span>
    </div>
  </div>
);

// Button
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'danger'; size?: 'sm' | 'md' | 'lg' }> = ({ className = '', variant = 'primary', size = 'md', ...props }) => {
  const baseStyle = "rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center";
  const sizeStyles = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-2.5 text-base", // Larger touch target
    lg: "px-6 py-3.5 text-lg"
  };
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-md shadow-blue-500/20",
    secondary: "bg-gray-800 text-white hover:bg-gray-900 dark:bg-slate-700 dark:hover:bg-slate-600",
    outline: "border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 bg-transparent",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 border border-transparent"
  };
  return <button className={`${baseStyle} ${sizeStyles[size]} ${variants[variant]} ${className}`} {...props} />;
};

// Text Area
export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea 
    className="w-full p-4 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-sans text-base md:text-sm bg-white dark:bg-slate-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 resize-y min-h-[120px]"
    {...props}
  />
);

// Generic Input styling helper
export const inputClasses = "w-full p-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-base md:text-sm bg-white dark:bg-slate-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500";
