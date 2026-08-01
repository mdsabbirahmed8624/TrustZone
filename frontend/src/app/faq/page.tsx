'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { faqsList } from '@/config/business';

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 lg:py-20 space-y-12">
      {/* Title */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          Support Center FAQs
        </span>
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          Frequently Asked Questions
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Clear answers regarding diagnostic counters, warranties, data protection, and service times.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {faqsList.map((faq, index) => (
          <div 
            key={index} 
            className="glass border border-border rounded-xl overflow-hidden bg-card/40 transition-colors hover:bg-card/60"
          >
            <button
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              className="w-full text-left p-6 font-bold text-base text-foreground flex justify-between items-center focus:outline-none focus:bg-secondary/40"
              aria-expanded={openFaq === index}
              aria-label={`Toggle answer for ${faq.q}`}
            >
              <span>{faq.q}</span>
              <HelpCircle 
                className={`h-5 w-5 text-primary shrink-0 transition-transform duration-300 ${
                  openFaq === index ? 'rotate-180' : ''
                }`} 
              />
            </button>
            {openFaq === index && (
              <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4 animate-in slide-in-from-top-2 duration-300">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
