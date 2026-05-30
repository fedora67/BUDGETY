import React from 'react';
import { HelpCircle } from 'lucide-react';

interface HoverHelpProps {
  text: string;
}

export default function HoverHelp({ text }: HoverHelpProps) {
  return (
    <span className="relative group inline-block ml-1.5 cursor-help align-middle">
      <HelpCircle className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-700 transition-colors" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 bg-neutral-900 text-white text-[11px] font-normal p-2.5 rounded-lg shadow-xl leading-normal z-50 text-center select-none">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-sm border-t-neutral-900 border-x-transparent border-b-transparent border-4" />
      </span>
    </span>
  );
}
