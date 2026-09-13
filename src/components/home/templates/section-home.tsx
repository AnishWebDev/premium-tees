import Link from "next/link";
import type { HomeSectionItem } from "@/lib/home-sections";
import {
  resolveContentCards,
  resolveGalleryImages,
  resolveMosaicCells,
  sectionText,
} from "@/lib/home-sections";
import {
  galleryAspectClass,
  galleryBandClass,
  galleryRoundedClass,
  ImageGallery,
} from "@/components/home/blocks/image-gallery";
import {
  columnsClass,
  overridesSectionPaddingY,
  sectionSpacingClass,
} from "@/lib/section-spacing";
import { cn } from "@/lib/utils";
import { Carousel, HorizontalScroll, HorizontalScrollItem, Marquee, Reveal } from "@/components/effects";
import { Hero } from "@/components/home/hero";
import { HomeStory } from "@/components/home/home-story";
import { Testimonials } from "@/components/home/testimonials";
import { CategoriesSection } from "@/components/home/categories-section";
import { InstagramGallery } from "@/components/home/instagram-gallery";
import { ChapterBand } from "@/components/home/blocks/chapter-band";
import { LookTile } from "@/components/home/blocks/look-tile";
import { StaticHero } from "@/components/home/blocks/static-hero";
import { MediaHero } from "@/components/home/blocks/media-hero";
import { ValuePillars } from "@/components/home/blocks/value-pillars";
import { MissionStatement } from "@/components/home/blocks/mission-statement";
import { InlineNewsletter } from "@/components/home/blocks/inline-newsletter";
import { ContentAccordion } from "@/components/home/blocks/content-accordion";
import { PromoBanner } from "@/components/home/blocks/promo-banner";
import { CategoryPills } from "@/components/home/blocks/category-pills";
import { ProductShelf } from "@/components/home/blocks/product-shelf";
import { EditorialMasthead } from "@/components/home/blocks/editorial-masthead";
import { FeatureDrop } from "@/components/home/blocks/feature-drop";
import { PullQuote } from "@/components/home/blocks/pull-quote";
import { ProductRowList } from "@/components/home/blocks/product-row-list";
import { ImageMosaic } from "@/components/home/blocks/image-mosaic";
import { StackedPanels } from "@/components/home/blocks/stacked-panels";
import { EmbedFrame } from "@/components/home/blocks/embed-frame";
import { CountdownOffer } from "@/components/home/blocks/countdown-offer";
import {
  VideoPlayerBlock,
  videoPlayerSettingsFromProps,
} from "@/components/home/blocks/video-player-block";
import { countdownParts } from "@/lib/promo-schedule";
import { TrailHero } from "@/components/home/blocks/trail-hero";
import { TrustBar } from "@/components/home/blocks/trust-bar";
import {
  ContentCard,
  type ContentCardAnimation,
  type ContentCardAspect,
  type ContentCardBg,
  type ContentCardLayout,
  type ContentCardPadding,
  type ContentCardRadius,
} from "@/components/home/blocks/content-card";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/shared/section-heading";
import type { HomeTemplateProps } from "@/components/home/templates/types";

const FALLBACK =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1600&q=80";

function renderSection(section: HomeSectionItem, props: HomeTemplateProps) {
  const { content, featured, bestSellers, newArrivals, categories } = props;
  const home = content.home;
  const o = section.props ?? {};
  const type = section.type;
  const limit = (fallback: number) =>
    typeof o.productLimit === "number" && o.productLimit > 0
      ? o.productLimit
      : fallback;

  const heroContent = {
    ...content.hero,
    brand: sectionText(o.brand, content.hero.brand),
    headline: sectionText(o.headline, content.hero.headline),
    subheadline: sectionText(o.subheadline, content.hero.subheadline),
    imageUrl: sectionText(o.imageUrl, content.hero.imageUrl),
    videoUrl: sectionText(o.videoUrl, content.hero.videoUrl ?? ""),
    primaryCtaLabel: sectionText(o.ctaLabel, content.hero.primaryCtaLabel),
    primaryCtaHref: sectionText(o.ctaHref, content.hero.primaryCtaHref),
    secondaryCtaLabel: sectionText(
      o.secondaryCtaLabel,
      content.hero.secondaryCtaLabel
    ),
    secondaryCtaHref: sectionText(
      o.secondaryCtaHref,
      content.hero.secondaryCtaHref
    ),
  };

  switch (type) {
    case "heroCinematic":
      return <Hero content={heroContent} />;
    case "heroStatic":
      return <StaticHero content={heroContent} />;
    case "trailHero":
      return (
        <TrailHero
          eyebrow={o.eyebrow}
          brand={sectionText(o.brand, content.hero.brand)}
          headline={sectionText(o.headline, "GO SLOW.\nGET OUTSIDE.")}
          subheadline={sectionText(o.subheadline, content.hero.subheadline)}
          imageUrl={sectionText(o.imageUrl, content.hero.imageUrl)}
          ctaLabel={sectionText(o.ctaLabel, content.hero.primaryCtaLabel)}
          ctaHref={sectionText(o.ctaHref, content.hero.primaryCtaHref)}
          trustLine={o.subtitle?.trim() || undefined}
          trustHref={o.linkHref?.trim() || undefined}
          trustLinkLabel={o.linkLabel?.trim() || undefined}
        />
      );
    case "trustBar":
      return (
        <TrustBar
          title={sectionText(
            o.title,
            "Free shipping on orders over ₹2,000 · More wandering, less worrying"
          )}
          subtitle={o.subtitle}
          href={o.linkHref}
          linkLabel={o.linkLabel}
        />
      );
    case "productGrid": {
      const products = bestSellers.slice(0, limit(8));
      if (products.length === 0) return null;
      return (
        <section className="section-padding">
          <div className="container-tight">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
                  {sectionText(o.title, home.bestSellers.title)}
                </h2>
                <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)]">
                  {sectionText(o.subtitle, home.bestSellers.subtitle)}
                </p>
              </div>
              <Link
                href={sectionText(o.linkHref, "/shop?sort=best")}
                className="theme-link text-sm"
              >
                {sectionText(o.linkLabel, "Shop bestsellers")}
              </Link>
            </div>
            <div className="product-grid mt-10">
              {products.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={i < 4}
                />
              ))}
            </div>
          </div>
        </section>
      );
    }
    case "heroMedia":
      return <MediaHero content={heroContent} />;
    case "editorialMasthead":
      return (
        <EditorialMasthead
          site={{
            ...content.site,
            name: sectionText(o.brand, content.site.name),
          }}
          hero={heroContent}
        />
      );
    case "carousel": {
      const slides = [
        {
          id: "hero",
          image: sectionText(o.imageUrl, content.hero.imageUrl),
          title: sectionText(o.title, content.hero.headline),
          subtitle: sectionText(o.subtitle, content.hero.subheadline),
        },
        {
          id: "story",
          image: home.story.imageUrl,
          title: home.story.title,
          subtitle: home.story.body,
        },
        ...categories.slice(0, 2).map((c) => ({
          id: c.id,
          image: c.image ?? FALLBACK,
          title: c.name,
          subtitle: c.description ?? "Explore the collection",
        })),
      ];
      return <Carousel slides={slides} autoPlayMs={5500} />;
    }
    case "marquee": {
      const items = sectionText(o.marqueeItems, home.marqueeItems.join(", "))
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return (
        <Marquee
          items={[...(items.length ? items : home.marqueeItems), content.site.name]}
          durationSec={36}
        />
      );
    }
    case "promoBanner":
      return (
        <PromoBanner
          eyebrow={sectionText(o.eyebrow, "This week")}
          title={sectionText(o.title, home.essentials.subtitle)}
          href={sectionText(o.ctaHref, "/shop")}
          ctaLabel={sectionText(o.ctaLabel, content.hero.primaryCtaLabel)}
        />
      );
    case "categoryPills":
      return (
        <CategoryPills
          categories={categories}
          title={sectionText(o.title, "Quick shop")}
        />
      );
    case "valuePillars":
      return (
        <ValuePillars
          pillars={content.about.values.slice(0, 3).map((v) => ({
            title: v.title,
            body: v.body,
          }))}
        />
      );
    case "chapterStory":
      return (
        <ChapterBand
          image={sectionText(o.imageUrl, home.story.imageUrl)}
          chapter={sectionText(o.chapter, "01 — Craft")}
          title={sectionText(o.title, home.story.title)}
          body={sectionText(o.body, home.story.body)}
          ctaLabel={sectionText(o.ctaLabel, home.story.ctaLabel)}
          ctaHref={sectionText(o.ctaHref, home.story.ctaHref)}
          align="left"
        />
      );
    case "chapterAlt": {
      const secondImage =
        sectionText(o.imageUrl, "") ||
        categories[0]?.image ||
        home.story.imageUrl ||
        content.hero.imageUrl;
      return (
        <ChapterBand
          image={secondImage}
          chapter={sectionText(o.chapter, "02 — Wear")}
          title={sectionText(o.title, home.categories.title)}
          body={sectionText(o.body, home.categories.subtitle)}
          ctaLabel={sectionText(o.ctaLabel, "Shop collections")}
          ctaHref={sectionText(o.ctaHref, "/collections")}
          align="right"
        />
      );
    }
    case "lookScroll": {
      const looks = featured.slice(0, limit(5));
      if (looks.length === 0) return null;
      return (
        <section className="bg-[var(--foreground)] py-16 text-[var(--background)] sm:py-24">
          <div className="container-tight">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.28em] opacity-60">
                {sectionText(o.title, home.essentials.title)}
              </p>
              <h2 className="font-display mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-5xl">
                {sectionText(o.subtitle, home.essentials.subtitle)}
              </h2>
            </Reveal>
          </div>
          <div className="mt-12">
            <HorizontalScroll label={sectionText(o.title, home.essentials.title)}>
              {looks.map((product, i) => (
                <HorizontalScrollItem
                  key={product.id}
                  className="max-w-none w-[72vw] sm:w-[42vw] lg:w-[28vw]"
                >
                  <LookTile
                    product={product}
                    priority={i < 1}
                    className="aspect-[3/4] w-full"
                  />
                </HorizontalScrollItem>
              ))}
            </HorizontalScroll>
          </div>
          <div className="container-tight mt-10">
            <Link
              href={sectionText(o.linkHref, "/shop")}
              className="text-sm underline underline-offset-4 opacity-80 transition-opacity hover:opacity-100"
            >
              {sectionText(o.linkLabel, "Enter the shop")}
            </Link>
          </div>
        </section>
      );
    }
    case "lookGrid": {
      const looks = featured.slice(0, limit(4));
      if (looks.length === 0) return null;
      return (
        <section className="bg-[var(--background)] py-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {looks.map((product, i) => (
              <LookTile
                key={product.id}
                product={product}
                priority={i < 2}
                className="aspect-[4/5] min-h-[55vh] w-full sm:min-h-[70vh]"
              />
            ))}
          </div>
        </section>
      );
    }
    case "essentialsGrid": {
      const products = featured.slice(0, limit(4));
      if (products.length === 0) return null;
      return (
        <section className="section-padding">
          <div className="container-tight">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
                  {sectionText(o.title, home.essentials.title)}
                </h2>
                <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)]">
                  {sectionText(o.subtitle, home.essentials.subtitle)}
                </p>
              </div>
              <Link href={sectionText(o.linkHref, "/shop")} className="theme-link text-sm">
                {sectionText(o.linkLabel, "Shop all")}
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
              {products.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={i < 2}
                />
              ))}
            </div>
          </div>
        </section>
      );
    }
    case "essentialsFeatured": {
      if (featured.length === 0) return null;
      return (
        <section className="border-y border-[var(--border)] bg-[var(--muted)] section-padding">
          <div className="container-tight">
            <SectionHeading
              title={sectionText(o.title, home.essentials.title)}
              subtitle={sectionText(o.subtitle, home.essentials.subtitle)}
              linkHref={sectionText(o.linkHref, "/shop")}
              linkLabel={sectionText(o.linkLabel, "View all")}
            />
            <div className="product-grid mt-10">
              {featured.slice(0, limit(8)).map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={i < 2}
                />
              ))}
            </div>
          </div>
        </section>
      );
    }
    case "featureDrop": {
      const drop = featured[0];
      if (!drop) return null;
      return (
        <FeatureDrop
          product={drop}
          eyebrow={sectionText(o.eyebrow, "Selected")}
          body={sectionText(o.body, home.essentials.subtitle)}
        />
      );
    }
    case "pullQuote":
      return (
        <PullQuote
          eyebrow={sectionText(o.eyebrow, home.story.eyebrow)}
          quote={sectionText(o.body, home.story.body)}
          attribution={content.site.name}
        />
      );
    case "productRows":
      return (
        <ProductRowList
          products={featured.slice(1, 1 + limit(6))}
          title={sectionText(o.title, home.essentials.title)}
          linkHref={sectionText(o.linkHref, "/shop")}
          linkLabel={sectionText(o.linkLabel, "Full catalogue")}
        />
      );
    case "bestSellersShelf":
      return (
        <ProductShelf
          products={bestSellers.slice(0, limit(8))}
          title={sectionText(o.title, home.bestSellers.title)}
          subtitle={sectionText(o.subtitle, home.bestSellers.subtitle)}
          linkHref={sectionText(o.linkHref, "/shop?sort=best")}
          linkLabel={sectionText(o.linkLabel, "Shop bestsellers")}
        />
      );
    case "newArrivalsShelf":
      return (
        <ProductShelf
          products={newArrivals.slice(0, limit(8))}
          title={sectionText(o.title, home.newArrivals.title)}
          subtitle={sectionText(o.subtitle, home.newArrivals.subtitle)}
          linkHref={sectionText(o.linkHref, "/shop?sort=new")}
          linkLabel={sectionText(o.linkLabel, "Shop new")}
        />
      );
    case "categoriesCards":
      return (
        <CategoriesSection
          categories={categories}
          title={sectionText(o.title, home.categories.title)}
          subtitle={sectionText(o.subtitle, home.categories.subtitle)}
        />
      );
    case "categoriesList":
      if (categories.length === 0) return null;
      return (
        <section className="border-t border-[var(--border)]">
          <div className="container-tight py-12 sm:py-16">
            <h2 className="font-display text-xl font-semibold tracking-tight text-[var(--foreground)]">
              {sectionText(o.title, home.categories.title)}
            </h2>
            <ul className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/shop?category=${category.slug}`}
                    className="flex items-center justify-between gap-4 py-4 text-[var(--foreground)] transition-opacity hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
                  >
                    <span className="font-display text-lg sm:text-xl">
                      {category.name}
                    </span>
                    <span className="text-sm text-[var(--muted-foreground)]">
                      Shop →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      );
    case "imageMosaic": {
      const customCells = resolveMosaicCells(o);
      const mosaicCells = customCells
        ? customCells
            .filter((cell) => cell.imageUrl.trim())
            .map((cell, index) => ({
              id: `mosaic-${index}`,
              image: cell.imageUrl,
              title: cell.title,
              href: cell.linkHref || undefined,
              alt: cell.imageAlt,
              span: cell.span,
            }))
        : [
            {
              id: "story",
              image: home.story.imageUrl,
              title: home.story.title,
              href: home.story.ctaHref,
              span: "tall" as const,
            },
            ...categories.slice(0, 3).map((c, i) => ({
              id: c.id,
              image: c.image ?? FALLBACK,
              title: c.name,
              href: `/shop?category=${c.slug}`,
              span: (i === 0 ? "wide" : "square") as "wide" | "square",
            })),
            ...featured.slice(0, 2).map((p) => ({
              id: p.id,
              image: p.images[0]?.url ?? FALLBACK,
              title: p.name,
              href: `/product/${p.slug}`,
              span: "square" as const,
            })),
          ].slice(0, 6);
      return (
        <ImageMosaic
          cells={mosaicCells}
          eyebrow={sectionText(o.eyebrow, "Campaign")}
          title={sectionText(o.title, home.essentials.title)}
        />
      );
    }
    case "imageGallery": {
      const images = resolveGalleryImages(o)
        .filter((img) => img.imageUrl.trim())
        .map((img, index) => ({
          id: `gallery-${index}`,
          image: img.imageUrl,
          alt: img.imageAlt || img.title,
          title: img.title || undefined,
          caption: img.caption || undefined,
          href: img.linkHref || undefined,
        }));
      if (images.length === 0) return null;
      const columns = Math.min(
        6,
        Math.max(2, parseInt(o.columns ?? "3", 10) || 3)
      );
      return (
        <ImageGallery
          title={sectionText(o.title, "Gallery")}
          subtitle={o.subtitle}
          images={images}
          columns={columns}
          aspectClass={galleryAspectClass(o.mediaAspect)}
          roundedClass={galleryRoundedClass(o.borderRadius)}
          bandClass={galleryBandClass(o.bgStyle, o.backgroundColor)}
          backgroundColor={o.backgroundColor}
        />
      );
    }
    case "stackedPanels": {
      const panels = categories.slice(0, 3).map((c) => ({
        id: c.id,
        image: c.image ?? content.hero.imageUrl,
        title: c.name,
        subtitle: c.description ?? home.categories.subtitle,
        href: `/shop?category=${c.slug}`,
      }));
      if (panels.length === 0) return null;
      return <StackedPanels panels={panels} />;
    }
    case "storySplit":
      return (
        <HomeStory
          content={{
            ...home.story,
            eyebrow: sectionText(o.eyebrow, home.story.eyebrow),
            title: sectionText(o.title, home.story.title),
            body: sectionText(o.body, home.story.body),
            ctaLabel: sectionText(o.ctaLabel, home.story.ctaLabel),
            ctaHref: sectionText(o.ctaHref, home.story.ctaHref),
            imageUrl: sectionText(o.imageUrl, home.story.imageUrl),
          }}
          variant="split"
        />
      );
    case "storyInline":
      return (
        <section className="border-t border-[var(--border)]">
          <div className="container-tight flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                {sectionText(o.eyebrow, home.story.eyebrow)}
              </p>
              <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
                {sectionText(o.title, home.story.title)}
              </h2>
              <p className="mt-2 max-w-lg text-sm text-[var(--muted-foreground)]">
                {sectionText(o.body, home.story.body)}
              </p>
            </div>
            <Link href={sectionText(o.ctaHref, home.story.ctaHref)} className="theme-link text-sm">
              {sectionText(o.ctaLabel, home.story.ctaLabel)}
            </Link>
          </div>
        </section>
      );
    case "mission":
      return (
        <MissionStatement
          eyebrow={sectionText(o.eyebrow, home.story.eyebrow)}
          title={sectionText(o.title, home.story.title)}
          body={sectionText(o.body, home.story.body)}
          ctaLabel={sectionText(o.ctaLabel, home.story.ctaLabel)}
          ctaHref={sectionText(o.ctaHref, home.story.ctaHref)}
        />
      );
    case "testimonials":
      return (
        <Testimonials
          content={{
            ...content.testimonials,
            title: sectionText(o.title, content.testimonials.title),
            subtitle: sectionText(o.subtitle, content.testimonials.subtitle),
          }}
        />
      );
    case "faq":
      return (
        <div>
          <ContentAccordion
            title={sectionText(o.title, content.faq.title)}
            subtitle={sectionText(o.subtitle, content.faq.subtitle)}
            items={content.faq.items.slice(0, limit(6))}
          />
          <div className="container-tight -mt-8 pb-12">
            <Link href="/faq" className="theme-link text-sm">
              All questions
            </Link>
          </div>
        </div>
      );
    case "instagram":
      return (
        <InstagramGallery
          content={{
            ...content.instagram,
            title: sectionText(o.title, content.instagram.title),
            subtitle: sectionText(o.subtitle, content.instagram.subtitle),
            profileUrl: sectionText(o.profileUrl, content.instagram.profileUrl),
          }}
        />
      );
    case "newsletter":
      return (
        <InlineNewsletter
          content={{
            ...content.newsletter,
            title: sectionText(o.title, content.newsletter.title),
            subtitle: sectionText(o.subtitle, content.newsletter.subtitle),
          }}
          variant="light"
        />
      );
    case "newsletterBand":
      return (
        <InlineNewsletter
          content={{
            ...content.newsletter,
            title: sectionText(o.title, content.newsletter.title),
            subtitle: sectionText(o.subtitle, content.newsletter.subtitle),
          }}
          variant="band"
        />
      );
    case "embedFrame":
      return (
        <EmbedFrame
          eyebrow={sectionText(o.eyebrow, "Film")}
          title={sectionText(o.title, "Campaign film")}
          src={
            o.embedUrl?.trim() ||
            o.videoUrl?.trim() ||
            content.hero.videoUrl?.trim() ||
            ""
          }
          caption={o.subtitle?.trim() ? o.subtitle : undefined}
        />
      );
    case "videoPlayer": {
      const playback = videoPlayerSettingsFromProps(o);
      return (
        <VideoPlayerBlock
          title={sectionText(o.title, "Watch our story")}
          subtitle={o.subtitle}
          videoUrl={sectionText(o.videoUrl, content.hero.videoUrl ?? "")}
          embedUrl={o.embedUrl}
          posterImageUrl={sectionText(o.posterImageUrl, content.hero.imageUrl)}
          ctaLabel={o.ctaLabel}
          ctaHref={o.ctaHref}
          mediaAspect={o.mediaAspect}
          borderRadius={o.borderRadius}
          bgStyle={o.bgStyle}
          backgroundColor={o.backgroundColor}
          textColor={o.textColor}
          {...playback}
        />
      );
    }
    case "promoHelloBar":
      return null;
    case "countdownOffer":
      return (
        <CountdownOffer
          title={sectionText(o.title, "Launch weekend sale")}
          subtitle={o.subtitle}
          scheduleStartAt={o.scheduleStartAt}
          countdownTargetAt={o.countdownTargetAt}
          expiredMessage={sectionText(
            o.countdownExpiredMessage,
            "This offer has ended."
          )}
          ctaLabel={o.ctaLabel}
          ctaHref={o.ctaHref}
          bgStyle={o.bgStyle}
          backgroundColor={o.backgroundColor}
          textColor={o.textColor}
          borderRadius={o.borderRadius}
          initialParts={countdownParts(o.countdownTargetAt, o.scheduleStartAt)}
        />
      );
    case "contentCard": {
      const cards = resolveContentCards(o);
      const cols = o.columns?.trim() || "1";
      const multi = cards.length > 1 || cols !== "1";
      const layout = (
        multi
          ? "top"
          : ((o.mediaLayout as ContentCardLayout | undefined) ?? "left")
      ) as ContentCardLayout;
      const shared = {
        layout,
        animation:
          (o.animation as ContentCardAnimation | undefined) ?? "fadeUp",
        borderRadius:
          (o.borderRadius as ContentCardRadius | undefined) ?? "lg",
        background: (o.bgStyle as ContentCardBg | undefined) ?? "muted",
        backgroundColor: o.backgroundColor,
        textColor: o.textColor,
        padding: (o.padding as ContentCardPadding | undefined) ?? "md",
        mediaAspect:
          (o.mediaAspect as ContentCardAspect | undefined) ?? "video",
      };

      if (!multi && cards.length === 1) {
        const c = cards[0];
        return (
          <ContentCard
            eyebrow={c.eyebrow || o.eyebrow}
            title={sectionText(c.title || o.title, home.story.title)}
            body={sectionText(c.body || o.body, home.story.body)}
            imageUrl={sectionText(
              c.imageUrl || o.imageUrl,
              home.story.imageUrl
            )}
            videoUrl={c.videoUrl || o.videoUrl}
            ctaLabel={sectionText(
              c.ctaLabel || o.ctaLabel,
              home.story.ctaLabel
            )}
            ctaHref={sectionText(c.ctaHref || o.ctaHref, home.story.ctaHref)}
            {...shared}
          />
        );
      }

      return (
        <section className="section-padding">
          <div className={cn("container-tight", columnsClass(cols))}>
            {cards.map((c, i) => (
              <ContentCard
                key={`${section.id}-card-${i}`}
                framed={false}
                eyebrow={c.eyebrow}
                title={c.title || `Card ${i + 1}`}
                body={c.body}
                imageUrl={c.imageUrl}
                videoUrl={c.videoUrl}
                ctaLabel={c.ctaLabel}
                ctaHref={c.ctaHref}
                {...shared}
              />
            ))}
          </div>
        </section>
      );
    }
    default:
      return null;
  }
}

/** Renders an ordered, enabled section list (homepage or CMS pages). */
export function PageSectionsView({
  sections,
  ...props
}: HomeTemplateProps & { sections: HomeSectionItem[] }) {
  const visible = sections.filter((s) => s.enabled);

  return (
    <>
      {visible.map((section) => {
        const spacing = sectionSpacingClass(section.props);
        const killDefaultY = overridesSectionPaddingY(section.props);
        return (
          <div
            key={section.id}
            className={cn(
              spacing,
              killDefaultY &&
                "[&_.section-padding]:!py-0 [&_.section-padding]:!pt-0 [&_.section-padding]:!pb-0"
            )}
          >
            {renderSection(section, props)}
          </div>
        );
      })}
    </>
  );
}

/** Renders homepage from SuperAdmin-ordered section list. */
export function SectionHome(
  props: HomeTemplateProps & { sections?: HomeSectionItem[] }
) {
  const sections = props.sections ?? props.content.home.sections;
  return <PageSectionsView {...props} sections={sections} />;
}
