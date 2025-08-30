'use client';

import { useState } from 'react';

interface SubAccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

function SubAccordionItem({ title, children, isOpen = false, onToggle }: SubAccordionItemProps) {
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full px-4 py-2 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-300 group"
      >
        <span className="text-sm font-medium text-white group-hover:text-gray-200 transition-colors">
          {title}
        </span>
        <svg
          className={`w-4 h-4 text-white transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-2">
          {children}
        </div>
      </div>
    </div>
  );
}

interface SubAccordionProps {
  items: {
    title: string;
    content: React.ReactNode;
  }[];
}

export default function SubAccordion({ items }: SubAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
      {items.map((item, index) => (
        <SubAccordionItem
          key={index}
          title={item.title}
          isOpen={openIndex === index}
          onToggle={() => handleToggle(index)}
        >
          {item.content}
        </SubAccordionItem>
      ))}
    </div>
  );
}
