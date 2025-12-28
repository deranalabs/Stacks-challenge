
import React from 'react';

interface ComponentCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  category?: string;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ title, description, children, category }) => {
  return (
    <div className="group relative flex flex-col bg-black border border-zinc-800 rounded-xl overflow-hidden transition-all hover:border-zinc-600 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] h-full">
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-zinc-100 tracking-tight">{title}</h3>
          {category && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded">
              {category}
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          {description}
        </p>
        <div className="flex-grow flex flex-col justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ComponentCard;
