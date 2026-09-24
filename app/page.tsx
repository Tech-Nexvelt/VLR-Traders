import type { Metadata } from "next";
import Link from "next/link";
import { getWhatsAppUrl, getCallUrl } from "@/lib/whatsapp";
import { ShieldCheck, Sliders, Award, Truck, Package, Users, Zap, Layers, Wrench } from "lucide-react";
import { getCategoriesWithCoverImage } from "@/lib/categories-store";
import { getAllProducts } from "@/lib/products-store";
import { getAllProjects } from "@/lib/projects-store";
import { getWebsiteSettings } from "@/lib/website-settings-store";
import styles from "./home.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "VLR Traders — Plywood, Hardware & Locks",
  description:
    "Quality plywood & boards, hardware, and locks from trusted brands like Century, Hettich, and Godrej. Affordable pricing, strong service support — VLR Traders.",
};

// ── Data ──────────────────────────────────────────────────────

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  plywood: "/cat_panels.jpg",
  hardware: "/cat_kitchens.jpg",
  locks: "/cat_custom.jpg",
};
const DEFAULT_FALLBACK_IMAGE = "/cat_panels.jpg";

const PRODUCT_FALLBACK_IMAGE = "/hero_kitchen.jpg";

const features = [
  {
    icon: <ShieldCheck className="w-5 h-5 text-teal-600" />,
    title: "Quality Materials",
    desc: "We source only the best brands and materials.",
  },
  {
    icon: <Sliders className="w-5 h-5 text-teal-600" />,
    title: "Custom Designs",
    desc: "Tailored solutions for every space.",
  },
  {
    icon: <Award className="w-5 h-5 text-teal-600" />,
    title: "Trusted Service",
    desc: "A reliable partner for your projects.",
  },
  {
    icon: <Truck className="w-5 h-5 text-teal-600" />,
    title: "Fast Delivery",
    desc: "On-time delivery, always.",
  },
];

const PROJECT_FALLBACK_IMAGE = "/hero_kitchen.jpg";

const testimonials = [
  {
    quote:
      "Excellent product quality and professional service. VLR Traders made our interior work smooth and hassle-free.",
    name: "Ramesh Kumar",
    role: "Home Owner, Coimbatore",
    rating: 5,
    initials: "RK",
    color: "#1B4F8A",
  },
  {
    quote:
      "Wide range of plywood, hardware, and lock brands with great pricing support. Highly recommended for interior material sourcing.",
    name: "Priya Menon",
    role: "Interior Designer",
    rating: 5,
    initials: "PM",
    color: "#0D9488",
  },
  {
    quote:
      "Reliable, responsive and best in class service. Our go-to partner for all interior material needs.",
    name: "Arun Raj",
    role: "Contractor",
    rating: 5,
    initials: "AR",
    color: "#7C3AED",
  },
];

// ── Star Rating ───────────────────────────────────────────────
function Stars({ count }: { count: number }) {
  return (
    <div className={styles.stars} aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < count ? styles.starFilled : styles.starEmpty}>
          ★
        </span>
      ))}
    </div>
  );
}

// ── Arrow icon ────────────────────────────────────────────────
function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

// ── Phone icon ────────────────────────────────────────────────
function PhoneIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default async function HomePage() {
  const [settings, liveCategories, allProducts, allProjects] = await Promise.all([
    getWebsiteSettings(),
    getCategoriesWithCoverImage(),
    getAllProducts(),
    getAllProjects(),
  ]);

  const businessName = settings.business_name || settings.name || "VLR Traders";
  const heroTitle = settings.hero_title || settings.heroTitle;
  const heroSubtitle = settings.hero_subtitle || settings.heroSubtitle;
  const heroImageUrl = settings.hero_image_url || settings.heroImageUrl || "/hero_kitchen.jpg";
  const whatsappNumber = settings.whatsapp_number || settings.whatsappNumber;
  const salesPhone = settings.phone || settings.salesPhone;

  const activeProducts = allProducts.filter((p) => p.status !== "Inactive");
  const featuredProducts = [
    ...activeProducts.filter((p) => p.featured),
    ...activeProducts.filter((p) => !p.featured),
  ].slice(0, 6);

  const recentProjects = [
    ...allProjects.filter((p) => p.featured),
    ...allProjects.filter((p) => !p.featured),
  ].slice(0, 5);

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          1. HERO SECTION
      ══════════════════════════════════════════════════════ */}
      <section className={styles.heroSection} id="hero">
        <div className={`container ${styles.heroContainer}`}>
          {/* Left Column: Content */}
          <div className={styles.heroContent}>
            {/* 1. Small Eyebrow Text */}
            <div className={styles.heroEyebrow}>
              <span className={styles.eyebrowBadge}>
                <span className={styles.eyebrowDot} />
                {settings.tagline || "Trusted Interior Material Supplier"}
              </span>
            </div>

            {/* 2. Main Headline */}
            <h1 className={styles.heroTitle}>
              {heroTitle}
            </h1>

            {/* 3. Subtext */}
            <p className={styles.heroSubtext}>
              {heroSubtitle}
            </p>

            {/* Brand Chips */}
            <div className={styles.heroBrandsRow}>
              <span className={styles.brandChip}>Plywood: Century, Sylvan, Vanam</span>
              <span className={styles.brandChip}>Hardware: Hettich, Simor, Nimmi</span>
              <span className={styles.brandChip}>Locks: Godrej, Europa</span>
            </div>

            {/* 4. Primary & Secondary CTA Buttons */}
            <div className={styles.heroActions}>
              <Link
                href="/catalog"
                className={`btn btn-primary btn-lg ${styles.heroCtaPrimary}`}
                id="hero-explore-catalog"
              >
                Explore Catalog
                <ArrowRight />
              </Link>

              <a
                href={getWhatsAppUrl(
                  `Hello ${businessName}! I would like to inquire about interior materials for my project.`,
                  whatsappNumber
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-whatsapp btn-lg ${styles.heroCtaSecondary}`}
                id="hero-chat-whatsapp"
              >
                <WhatsAppIcon size={20} />
                WhatsApp Now
              </a>
            </div>

            {/* 5. Trust Indicators */}
            <div className={styles.heroTrustGrid}>
              <div className={styles.trustItem}>
                <div className={styles.trustIconWrap}><Package className="w-5 h-5 text-slate-700" /></div>
                <div>
                  <span className={styles.trustValue}>1000+</span>
                  <span className={styles.trustLabel}>Products</span>
                </div>
              </div>

              <div className={styles.trustDivider} />

              <div className={styles.trustItem}>
                <div className={styles.trustIconWrap}><Users className="w-5 h-5 text-slate-700" /></div>
                <div>
                  <span className={styles.trustValue}>Trusted by</span>
                  <span className={styles.trustLabel}>Contractors</span>
                </div>
              </div>

              <div className={styles.trustDivider} />

              <div className={styles.trustItem}>
                <div className={styles.trustIconWrap}><Zap className="w-5 h-5 text-slate-700" /></div>
                <div>
                  <span className={styles.trustValue}>Fast</span>
                  <span className={styles.trustLabel}>Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual */}
          <div className={styles.heroVisual}>
            <div className={styles.imageCardWrapper}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImageUrl}
                alt={businessName}
                width={640}
                height={520}
                className={styles.heroImage}
              />
              <div className={styles.heroImageOverlay} />

              {/* Floating UI Card 1 (Top Left) */}
              <div className={`${styles.floatingCard} ${styles.floatingCardTopLeft}`}>
                <div className={styles.floatingCardIcon}><Layers className="w-5 h-5 text-slate-700" /></div>
                <div>
                  <p className={styles.floatingCardTitle}>Century & Sylvan Plywood</p>
                  <p className={styles.floatingCardSub}>100% Waterproof & Termite Proof</p>
                </div>
              </div>

              {/* Floating UI Card 2 (Bottom Right) */}
              <div className={`${styles.floatingCard} ${styles.floatingCardBottomRight}`}>
                <div className={styles.floatingCardHeader}>
                  <span className={styles.onlineBadge}>
                    <span className={styles.onlinePulse} />
                    Active Now
                  </span>
                  <span className={styles.responseTime}>Response &lt; 5 mins</span>
                </div>
                <div className={styles.floatingCardBody}>
                  <p className={styles.floatingCardTitle}>Instant Bulk Quote</p>
                  <p className={styles.floatingCardSub}>Connect directly on WhatsApp</p>
                </div>
              </div>

              {/* Floating UI Card 3 (Middle Right) */}
              <div className={`${styles.floatingCard} ${styles.floatingCardMiddleRight}`}>
                <div className={styles.floatingCardIcon}><Wrench className="w-5 h-5 text-slate-700" /></div>
                <div>
                  <p className={styles.floatingCardTitle}>Hettich & Godrej Locks</p>
                  <p className={styles.floatingCardSub}>Direct Wholesale Pricing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          2. CATEGORY PREVIEW
      ══════════════════════════════════════════════════════ */}
      <section className={`section ${styles.categorySection}`} id="categories">
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <span className="section-label">Explore Our Range</span>
              <h2 className={styles.sectionTitle}>Product Categories</h2>
            </div>
            <Link href="/catalog" className={styles.viewAll} id="categories-view-all">
              View All Categories <ArrowRight />
            </Link>
          </div>

          <div className={styles.categoryGrid}>
            {liveCategories.map((cat) => {
              const img =
                cat.coverImage ||
                CATEGORY_FALLBACK_IMAGES[cat.slug] ||
                DEFAULT_FALLBACK_IMAGE;
              return (
                <Link
                  key={cat.id}
                  href={`/catalog?categoryId=${cat.id}`}
                  className={styles.categoryCard}
                  id={`category-${cat.id}`}
                >
                  <div className={styles.categoryImgWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={cat.name}
                      className={styles.categoryImg}
                      loading="lazy"
                    />
                    <div className={styles.categoryOverlay} />
                  </div>
                  <div className={styles.categoryInfo}>
                    <div>
                      <h3 className={styles.categoryTitle}>{cat.name}</h3>
                    </div>
                    <span className={styles.categoryArrow}><ArrowRight /></span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          3. FEATURED PRODUCTS
      ══════════════════════════════════════════════════════ */}
      <section className={`section ${styles.productsSection}`} id="featured-products">
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <span className="section-label">Featured Products</span>
              <h2 className={styles.sectionTitle}>Popular Products</h2>
            </div>
            <Link href="/catalog" className={styles.viewAll} id="products-view-all">
              View All Products <ArrowRight />
            </Link>
          </div>

          <div className={styles.productsScroll}>
            {featuredProducts.length === 0 ? (
              <p style={{ color: "var(--gray-500)", padding: "2rem 0" }}>
                Products coming soon — check back shortly!
              </p>
            ) : (
              featuredProducts.map((prod) => {
                const img = prod.images?.[0] || PRODUCT_FALLBACK_IMAGE;
                return (
                  <div key={prod.id} className={styles.productCard} id={`product-${prod.id}`}>
                    <div className={styles.productImgWrap}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={prod.name}
                        className={styles.productImg}
                        loading="lazy"
                      />
                      {prod.badge && (
                        <span className={styles.productTag}>{prod.badge}</span>
                      )}
                    </div>
                    <div className={styles.productInfo}>
                      <h3 className={styles.productName}>{prod.name}</h3>
                      <div className={styles.productActions}>
                        <Link
                          href={`/product/${prod.slug}`}
                          className={`btn btn-outline btn-sm ${styles.detailsBtn}`}
                        >
                          View Details
                        </Link>
                        <a
                          href={getWhatsAppUrl(prod.name, whatsappNumber)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-whatsapp btn-sm"
                          id={`product-wa-${prod.id}`}
                        >
                          <WhatsAppIcon size={14} />
                          Enquire
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          4. WHY CHOOSE US
      ══════════════════════════════════════════════════════ */}
      <section className={`section ${styles.whySection}`} id="why-choose-us">
        <div className="container">
          <div className={styles.whyInner}>
            <div className={styles.whyLeft}>
              <span className="section-label">Why Choose {businessName}</span>
              <h2 className={styles.whyTitle}>
                Our Commitment<br />to Your Success
              </h2>
              <p className={styles.whySub}>
                We partner with architects, designers, and contractors to
                deliver materials that meet the highest standards — on time,
                every time.
              </p>
              <Link href="/about" className={`btn btn-primary ${styles.whyBtn}`} id="why-learn-more">
                Learn More <ArrowRight />
              </Link>
            </div>
            <div className={styles.featureGrid}>
              {features.map((f) => (
                <div key={f.title} className={styles.featureCard}>
                  <span className={styles.featureIcon}>{f.icon}</span>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          5. RECENT PROJECTS
      ══════════════════════════════════════════════════════ */}
      <section className={`section ${styles.projectsSection}`} id="recent-projects">
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <span className="section-label">Our Work Speaks</span>
              <h2 className={styles.sectionTitle}>Recent Projects</h2>
            </div>
            <Link href="/projects" className={styles.viewAll} id="projects-view-all">
              View All Projects <ArrowRight />
            </Link>
          </div>

          <div className={styles.projectsGrid}>
            {recentProjects.length === 0 ? (
              <p style={{ color: "var(--gray-500)", gridColumn: "1 / -1", padding: "2rem 0" }}>
                Projects coming soon — check back shortly!
              </p>
            ) : (
              recentProjects.map((project, i) => {
                const img = project.images?.[0] || PROJECT_FALLBACK_IMAGE;
                return (
                  <div
                    key={project.id}
                    className={`${styles.projectItem} ${i === 0 ? styles.projectItemLarge : ""}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={project.title}
                      className={styles.projectImg}
                      loading="lazy"
                    />
                    <div className={styles.projectOverlay}>
                      <Link href={`/projects/${project.slug}`} className={styles.projectViewBtn}>
                        {project.title} <ArrowRight />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          6. TESTIMONIALS
      ══════════════════════════════════════════════════════ */}
      <section className={`section ${styles.testimonialsSection}`} id="testimonials">
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <span className="section-label">Trusted by Our Clients</span>
              <h2 className={styles.sectionTitle}>What Our Clients Say</h2>
            </div>
          </div>

          <div className={styles.testimonialsGrid}>
            {testimonials.map((t) => (
              <div key={t.name} className={styles.testimonialCard}>
                <span className={styles.quoteIcon}>&ldquo;</span>
                <p className={styles.testimonialText}>{t.quote}</p>
                <Stars count={t.rating} />
                <div className={styles.testimonialAuthor}>
                  <div
                    className={styles.avatar}
                    style={{ backgroundColor: t.color }}
                    aria-hidden="true"
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className={styles.authorName}>{t.name}</p>
                    <p className={styles.authorRole}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          7. CONTACT STRIP
      ══════════════════════════════════════════════════════ */}
      <section className={styles.contactStrip} id="contact-strip">
        <div className="container">
          <div className={styles.contactStripInner}>
            <div className={styles.contactStripText}>
              <span className={styles.contactStripLabel}>Let&apos;s Build Together</span>
              <h2 className={styles.contactStripTitle}>
                Ready to start your project?
              </h2>
              <p className={styles.contactStripSub}>
                Get in touch with our team for the best solutions and expert guidance.
              </p>
            </div>
            <div className={styles.contactStripActions}>
              <a
                href={getCallUrl(salesPhone ? salesPhone.replace(/\D/g, "") : undefined)}
                className={`btn btn-lg ${styles.callBtn}`}
                id="contact-strip-call"
              >
                <PhoneIcon />
                Call Now
              </a>
              <a
                href={getWhatsAppUrl(
                  `Hello ${businessName}! I would like to inquire about interior materials for my project.`,
                  whatsappNumber
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn btn-whatsapp btn-lg ${styles.waBtn}`}
                id="contact-strip-whatsapp"
              >
                <WhatsAppIcon />
                WhatsApp Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
