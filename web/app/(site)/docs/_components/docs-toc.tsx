"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  title: string;
}

export function DocsToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    observerRef.current?.disconnect();

    // find the scrollable main container
    const scrollRoot =
      (document.querySelector("main") as HTMLElement | null) ?? null;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // pick the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      {
        root: scrollRoot,
        rootMargin: "0px 0px -55% 0px",
        threshold: 0,
      }
    );

    headings.forEach((h) => observerRef.current?.observe(h));
    return () => observerRef.current?.disconnect();
  }, [items]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="hidden xl:flex flex-col w-52 shrink-0 sticky top-0 self-start pt-10 pr-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50 mb-3 px-2">
        On this page
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <button
              data-hover
              onClick={() => handleClick(item.id)}
              className={cn(
                "w-full text-left text-sm px-2 py-1.5 rounded-md transition-all duration-200",
                active === item.id
                  ? "text-primary font-medium bg-primary/8"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6 h-px bg-border" />
      <p className="text-[11px] text-muted-foreground/40 mt-4 px-2 leading-relaxed">
        Binboi Documentation
      </p>
    </nav>
  );
}
