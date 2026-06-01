import React, { useState, useRef, useLayoutEffect } from "react";
import { cn } from "../../lib/utils";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  isOpenDefault?: boolean;
}

export function AccordionItem({ title, children, isOpenDefault = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const [maxH, setMaxH] = useState<string>(isOpenDefault ? "9999px" : "0px");
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (contentRef.current) {
      setMaxH(isOpen ? `${contentRef.current.scrollHeight}px` : "0px");
    }
  }, [isOpen]);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <li
      className={cn(
        "group w-full flex flex-col border-b border-black/20 py-8 lg:py-14 relative cursor-pointer yvy-transition",
        isOpen && "pb-0"
      )}
      onClick={toggleAccordion}
    >
      <div className="grid grid-cols-6 lg:grid-cols-12 gap-x-6 items-center">
        {/* Accordion Title */}
        <h3
          className={cn(
            "col-span-4 lg:col-span-10 text-3xl lg:text-4xl leading-none font-barlowcn uppercase tracking-wide yvy-transition",
            isOpen ? "text-yvy-royal" : "text-yvy-navy"
          )}
        >
          {title}
        </h3>

        {/* Corporate Rotating Custom Arrow */}
        <div className="col-span-2 lg:col-span-2 relative w-12 h-12 ml-auto flex justify-end items-center">
          <svg
            width="45"
            height="45"
            viewBox="0 0 45 45"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn(
              "w-[20px] h-[20px] lg:w-[32px] lg:h-[32px] yvy-transition duration-300",
              isOpen ? "rotate-180 text-yvy-royal" : "text-yvy-navy"
            )}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M45 0V37.335L37.335 45V13.085L6.265 44.16H0.845V38.74L31.92 7.665H0L7.665 0H45.005H45Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Collapsible Panel Content */}
        <div
          ref={contentRef}
          className="col-span-6 lg:col-span-4 lg:col-start-9 overflow-hidden yvy-panel-transition w-full z-30 relative"
          style={{
            maxHeight: maxH,
          }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
        >
          <div className="my-6 lg:my-10 text-lg font-light font-barlow text-yvy-navy">
            {children}
          </div>
        </div>
      </div>
    </li>
  );
}

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ children, className }: AccordionProps) {
  return (
    <ul className={cn("max-w-[1366px] w-full mx-auto flex flex-col", className)}>
      {children}
    </ul>
  );
}
