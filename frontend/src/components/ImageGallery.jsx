import React from 'react';
import { Image as ImageIcon, ExternalLink } from 'lucide-react';

export default function ImageGallery({ images = [] }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold uppercase tracking-wider text-slate-400 text-xs">
          Captured Media & Brand Logos
        </h3>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="glass-card shrink-0 w-64 rounded-xl overflow-hidden relative group flex flex-col justify-between"
          >
            {/* Image Wrapper */}
            <div className="h-36 bg-slate-900 flex items-center justify-center overflow-hidden border-b border-white/5 relative">
              <img
                src={img.url}
                alt={img.caption || 'Research asset'}
                onError={(e) => {
                  // If image fails to load, replace it with a clean visual fallback placeholder
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = `
                    <div class="flex flex-col items-center text-slate-600 gap-1.5 p-4">
                      <svg class="w-8 h-8 opacity-40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="text-[10px] uppercase font-mono tracking-wider">${img.source || 'Visual asset'}</span>
                    </div>
                  `;
                }}
                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2 p-1.5 bg-slate-950/80 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <a href={img.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                </a>
              </div>
            </div>

            {/* Meta */}
            <div className="p-3 text-left">
              <span className="text-[9px] text-slate-500 font-mono block uppercase">
                Source: {img.source}
              </span>
              <p className="text-white text-xs font-medium mt-1 leading-snug line-clamp-2">
                {img.caption || 'Extracted brand identity asset'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
