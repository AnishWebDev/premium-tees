"use client";

import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type EditorSection = {
  id: string;
  title: string;
  content: ReactNode;
};

type EditorSectionsAccordionProps = {
  sections: EditorSection[];
  defaultOpen?: string[];
};

export function EditorSectionsAccordion({
  sections,
  defaultOpen,
}: EditorSectionsAccordionProps) {
  if (sections.length === 0) return null;

  return (
    <Accordion
      type="multiple"
      defaultValue={defaultOpen ?? [sections[0]?.id].filter(Boolean) as string[]}
      className="rounded-xl border border-neutral-200 px-4"
    >
      {sections.map((section) => (
        <AccordionItem key={section.id} value={section.id}>
          <AccordionTrigger className="text-sm font-medium text-neutral-950 hover:no-underline">
            {section.title}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4 text-neutral-950">
            {section.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
