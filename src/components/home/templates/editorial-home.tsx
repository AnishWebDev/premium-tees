import Link from "next/link";
import { EditorialMasthead } from "@/components/home/blocks/editorial-masthead";
import { ProductRowList } from "@/components/home/blocks/product-row-list";
import { FeatureDrop } from "@/components/home/blocks/feature-drop";
import { InlineNewsletter } from "@/components/home/blocks/inline-newsletter";
import { ContentAccordion } from "@/components/home/blocks/content-accordion";
import { PullQuote } from "@/components/home/blocks/pull-quote";
import { HomeStory } from "@/components/home/home-story";
import type { HomeTemplateProps } from "@/components/home/templates/types";

/**
 * SSENSE / magazine retail.
 * Type masthead, feature drop, pull quote, product rows, sticky story, accordion FAQ.
 */
export function EditorialHome({ content, featured }: HomeTemplateProps) {
  const drop = featured[0];
  const index = featured.slice(1, 7);
  const faqs = content.faq.items.slice(0, 6);

  return (
    <>
      <EditorialMasthead site={content.site} hero={content.hero} />

      {drop ? (
        <FeatureDrop
          product={drop}
          eyebrow="Selected"
          body={content.home.essentials.subtitle}
        />
      ) : null}

      <PullQuote
        eyebrow={content.home.story.eyebrow}
        quote={content.home.story.body}
        attribution={content.site.name}
      />

      <ProductRowList
        products={index}
        title={content.home.essentials.title}
        linkHref="/shop"
        linkLabel="Full catalogue"
      />

      <HomeStory content={content.home.story} variant="split" />

      {faqs.length > 0 && (
        <div>
          <ContentAccordion
            title={content.faq.title}
            subtitle={content.faq.subtitle}
            items={faqs}
          />
          <div className="container-tight -mt-8 pb-12">
            <Link href="/faq" className="theme-link text-sm">
              All questions
            </Link>
          </div>
        </div>
      )}

      <InlineNewsletter content={content.newsletter} variant="band" />
    </>
  );
}
