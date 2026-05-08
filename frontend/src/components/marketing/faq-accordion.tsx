"use client";

import { marketingFaqItems } from "@/components/marketing/faq-data";

interface FaqAccordionProps {
  className?: string;
  itemClassName?: string;
  firstOpen?: boolean;
  limit?: number;
}

export function FaqAccordion({
  className = "faq-page-list",
  itemClassName = "faq-page-item",
  firstOpen = true,
  limit,
}: FaqAccordionProps) {
  const items = typeof limit === "number" ? marketingFaqItems.slice(0, limit) : marketingFaqItems;

  return (
    <div className={className}>
      {items.map((item, index) => (
        <details
          key={item.question}
          className={`${itemClassName} reveal-section${firstOpen && index === 0 ? " open" : ""}`}
          data-reveal
          open={firstOpen && index === 0}
        >
          <summary>
            <span>{item.question}</span>
            <span className="faq-page-icon">+</span>
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
