import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { blogArticles } from '@/config/business';

export default function Blog() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20 space-y-12">
      {/* Title */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          Technical Ledger & Logs
        </span>
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          Technician Articles & Guides
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Technical insights regarding mobile heat margins, liquid decontamination, and OLED panel care.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogArticles.map((post, idx) => (
          <article 
            key={idx} 
            className="glass border border-border rounded-xl p-6 flex flex-col justify-between hover:translate-y-[-4px] hover:shadow-md transition-all duration-300 bg-card/40"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-xs text-muted-foreground font-semibold">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readTime}
                </span>
              </div>
              
              <h3 className="font-extrabold text-xl text-foreground leading-snug hover:text-primary transition-colors">
                {post.title}
              </h3>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {post.desc}
              </p>
            </div>

            <div className="border-t border-border mt-6 pt-4">
              <Link 
                href={`/blog`} 
                className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-accent focus:outline-none focus:ring-1 focus:ring-primary rounded"
                aria-label={`Read article: ${post.title}`}
              >
                Read Full Guide
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
