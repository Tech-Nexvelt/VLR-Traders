"use client";

import { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Product, products } from "@/data/products";
import { getWhatsAppUrl, getCallUrl } from "@/lib/whatsapp";
import { siteConfig } from "@/config/site";
import { trackWhatsAppClick, trackCallClick } from "@/lib/analytics";
import ProductEnquiryModal from "@/components/enquiry/ProductEnquiryModal";
import { Award, MessageCircle, Sliders, ZoomIn, PlayCircle, FileText, Users, Truck, ShieldCheck, X } from "lucide-react";
import styles from "./product-detail.module.css";

interface ProductDetailClientProps {
  product: Product;
  prevProduct?: { slug: string; name: string } | null;
  nextProduct?: { slug: string; name: string } | null;
}

export default function ProductDetailClient({
  product,
  prevProduct,
  nextProduct,
}: ProductDetailClientProps) {
  // ── 1. Image Gallery State & Zoom ───────────────────────────
  const allImages = useMemo(() => {
    if (product.images && product.images.length > 0) return product.images;
    return ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=85"];
  }, [product.images]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ display: "none", backgroundPosition: "0% 0%" });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: "block",
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none", backgroundPosition: "0% 0%" });
  };

  // ── 2. Variant Selection State ─────────────────────────────
  const defaultVariants = useMemo(() => {
    const initial: Record<string, string> = {};
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((v) => {
        if (v.options.length > 0) {
          initial[v.label] = v.options[0].value;
        }
      });
    } else {
      // Fallback default selections if no explicit variants defined
      if (product.finish) initial["Finish Options"] = product.finish;
      if (product.material) initial["Material Options"] = product.material;
    }
    return initial;
  }, [product]);

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(defaultVariants);

  const handleVariantSelect = (label: string, value: string) => {
    setSelectedVariants((prev) => ({ ...prev, [label]: value }));
  };

  // ── 3. Tabs State (Overview, Specs, FAQs) ──────────────────
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "faq">("overview");

  // ── 4. FAQ Accordion State ─────────────────────────────────
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is the best price for this product?",
      a: "Pricing depends on quantity, size, and project requirements. Message us on WhatsApp for an instant quote — we keep our pricing affordable and transparent.",
    },
    {
      q: "Is this available for bulk orders?",
      a: "Yes, we supply both retail and bulk quantities. Reach out on WhatsApp or by phone and our team will confirm availability and delivery timelines.",
    },
    {
      q: "Can I get more details or samples before ordering?",
      a: "Absolutely. Contact our sales team on WhatsApp or by phone — we're happy to answer questions and help you pick the right product for your project.",
    },
    {
      q: "What warranty or support is included?",
      a: "Warranty terms follow the manufacturer's policy for this brand. Our team provides ongoing service support — contact us on WhatsApp for specifics on this product.",
    },
  ];

  // ── 5. WhatsApp & Call URL Generation ──────────────────────
  const formattedVariantsText = useMemo(() => {
    const entries = Object.entries(selectedVariants);
    if (entries.length === 0) return "";
    return entries.map(([k, v]) => `${k}: ${v}`).join(", ");
  }, [selectedVariants]);

  const whatsappMessage = useMemo(() => {
    let msg = `Hi, I am interested in ${product.name} from VLR Traders.\n\nCategory: ${product.categoryName}`;
    if (product.brand) msg += `\nBrand: ${product.brand}`;
    if (product.material) msg += `\nMaterial: ${product.material}`;
    if (product.finish) msg += `\nFinish: ${product.finish}`;
    if (formattedVariantsText) {
      msg += `\nSelected Options: [${formattedVariantsText}]`;
    }
    msg += `\n\nCould you please share pricing details, lead times, and customization options?\nProduct link: ${siteConfig.url}/product/${product.slug}`;
    return msg;
  }, [product, formattedVariantsText]);

  const whatsappUrl = getWhatsAppUrl(whatsappMessage);
  const callUrl = getCallUrl(siteConfig.whatsapp);

  // If the admin has attached planner sheets / spec PDFs for this product,
  // show those front-and-center instead of the built-out details/specs page —
  // the PDF already has everything a customer needs to see.
  const hasDocuments = Boolean(product.documents && product.documents.length > 0);

  // ── 6. Related Products ────────────────────────────────────
  const relatedProducts = useMemo(() => {
    return products
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  // ── 7. Specs Fallback ──────────────────────────────────────
  const displaySpecs = useMemo(() => {
    if (product.specs && product.specs.length > 0) return product.specs;
    const specs = [
      { key: "Product Code", value: product.id.toUpperCase() },
      { key: "Category", value: product.categoryName },
      { key: "Brand", value: product.brand || "—" },
    ];
    if (product.material) specs.push({ key: "Material", value: product.material });
    if (product.finish) specs.push({ key: "Finish", value: product.finish });
    specs.push(
      { key: "Warranty", value: "As per manufacturer terms" },
      { key: "Minimum Order", value: "1 Unit" }
    );
    return specs;
  }, [product]);

  // ── 8. Features Fallback ───────────────────────────────────
  const displayFeatures = useMemo(() => {
    if (product.features && product.features.length > 0) return product.features;
    return [
      { icon: <Award className="w-5 h-5 text-teal-600" />, title: "Trusted Brand", desc: product.brand ? `Genuine ${product.brand} product` : "Sourced from trusted brands" },
      { icon: <MessageCircle className="w-5 h-5 text-teal-600" />, title: "WhatsApp Support", desc: "Instant pricing & availability" },
      { icon: <Sliders className="w-5 h-5 text-teal-600" />, title: "Custom Requirements", desc: "Tailored to your project" },
    ];
  }, [product]);

  // Shared enquiry CTA block — used in both the full details view and the
  // PDF-first view, so it isn't duplicated.
  const ctaBox = (
    <div className={styles.ctaBox}>
      <div className={styles.ctaHeader}>
        <span className={styles.ctaTitle}>Need a Quote or Project Pricing?</span>
        <span className={styles.ctaSub}>Get instant support & technical assistance</span>
      </div>

      <div className={styles.ctaButtonGroup}>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsappCtaBtn}
          onClick={() => trackWhatsAppClick(product.name, product.categoryName, selectedVariants)}
        >
          <svg className={styles.whatsappSvg} viewBox="0 0 24 24" width="22" height="22">
            <path
              fill="currentColor"
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"
            />
            <path
              fill="currentColor"
              d="M12 2C6.477 2 2 6.477 2 12c0 2.019.537 3.91 1.473 5.54L2 22l4.633-1.428A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.748 0-3.376-.452-4.787-1.242l-.343-.193-2.766.852.868-2.678-.215-.357A7.958 7.958 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"
            />
          </svg>
          <span>Enquire on WhatsApp</span>
        </a>

        <button
          type="button"
          className={styles.callCtaBtn}
          onClick={() => setIsEnquiryModalOpen(true)}
          style={{ background: "var(--color-teal-600, #0d9488)", borderColor: "var(--color-teal-500, #14b8a6)" }}
        >
          <FileText size={16} />
          <span>Request Quote Form</span>
        </button>

        <a
          href={callUrl}
          className={styles.callCtaBtn}
          onClick={() => trackCallClick(product.name, product.categoryName)}
        >
          <svg className={styles.callSvg} viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="currentColor"
              d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
            />
          </svg>
          <span>Call Now</span>
        </a>
      </div>

      {/* Trust Badges Bar */}
      <div className={styles.ctaTrustBadges}>
        <span className={styles.trustBadgeItem}><Users size={14} /> Trusted by 100+ Contractors</span>
        <span className={styles.trustBadgeDot}>•</span>
        <span className={styles.trustBadgeItem}><Truck size={14} /> Fast Delivery Available</span>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* ── TOP BREADCRUMB & PREV/NEXT BAR ───────────────────── */}
      <div className={styles.topBar}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className={styles.slash}>/</span>
          <Link href="/catalog">Catalog</Link>
          <span className={styles.slash}>/</span>
          <Link href={`/catalog?categoryId=${product.categoryId}`}>
            {product.categoryName}
          </Link>
          <span className={styles.slash}>/</span>
          <span className={styles.current}>{product.name}</span>
        </nav>

        <div className={styles.navControls}>
          {prevProduct ? (
            <Link
              href={`/product/${prevProduct.slug}`}
              className={styles.navBtn}
              title={`Previous: ${prevProduct.name}`}
            >
              ← Prev
            </Link>
          ) : (
            <span className={`${styles.navBtn} ${styles.disabled}`}>← Prev</span>
          )}
          {nextProduct ? (
            <Link
              href={`/product/${nextProduct.slug}`}
              className={styles.navBtn}
              title={`Next: ${nextProduct.name}`}
            >
              Next →
            </Link>
          ) : (
            <span className={`${styles.navBtn} ${styles.disabled}`}>Next →</span>
          )}
        </div>
      </div>

      {!hasDocuments && (
      <>
      {/* ── MAIN PRODUCT GRID ────────────────────────────────── */}
      <div className={styles.mainGrid}>
        {/* LEFT: IMAGE GALLERY & ZOOM */}
        <div className={styles.galleryColumn}>
          <div className={styles.mainImageWrapper}>
            <div
              className={styles.imageZoomBox}
              ref={imageContainerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <Image
                src={allImages[activeImageIndex]}
                alt={`${product.name} - View ${activeImageIndex + 1}`}
                fill
                priority
                className={styles.mainImg}
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Hover Zoom Lens Layer */}
              <div
                className={styles.zoomLens}
                style={{
                  ...zoomStyle,
                  backgroundImage: `url(${allImages[activeImageIndex]})`,
                }}
              />
            </div>

            {/* Badge overlay */}
            {product.badge && (
              <span className={`${styles.badge} ${styles[product.badge.toLowerCase()]}`}>
                {product.badge}
              </span>
            )}

            <div className={styles.zoomHint}>
              <ZoomIn size={14} /> Hover to zoom image
            </div>
          </div>

          {/* Thumbnails list */}
          <div className={styles.thumbnailRow}>
            {allImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                className={`${styles.thumbBtn} ${activeImageIndex === idx ? styles.activeThumb : ""}`}
                onClick={() => setActiveImageIndex(idx)}
                aria-label={`View image ${idx + 1}`}
              >
                <Image src={img} alt="" width={70} height={70} className={styles.thumbImg} />
              </button>
            ))}

            {/* Simulated 3D / Video Tour Thumbnail */}
            <button
              type="button"
              className={styles.videoThumbBtn}
              onClick={() => setIsVideoModalOpen(true)}
              title="Watch Product Video & Showcase"
            >
              <PlayCircle size={16} />
              <span className={styles.videoLabel}>Video Tour</span>
            </button>
          </div>
        </div>

        {/* RIGHT: PRODUCT INFO & VARIANTS & CTAS */}
        <div className={styles.detailsColumn}>
          <div className={styles.categoryBadge}>{product.categoryName}</div>
          <h1 className={styles.productTitle}>{product.name}</h1>

          {/* Quick Specifications list */}
          <div className={styles.quickSpecs}>
            {product.brand && (
              <span className={styles.specPill}>
                <strong>Brand:</strong> {product.brand}
              </span>
            )}
            {product.material && (
              <span className={styles.specPill}>
                <strong>Material:</strong> {product.material}
              </span>
            )}
            {product.finish && (
              <span className={styles.specPill}>
                <strong>Finish:</strong> {product.finish}
              </span>
            )}
            <span className={styles.specPill}>
              <strong>ID:</strong> #{product.id.toUpperCase()}
            </span>
          </div>

          <p className={styles.shortDescription}>{product.description}</p>

          {/* Feature Highlights Grid */}
          <div className={styles.featuresGrid}>
            {displayFeatures.map((feat, i) => (
              <div key={i} className={styles.featureCard}>
                <span className={styles.featureIcon}>{feat.icon}</span>
                <div>
                  <h4 className={styles.featureTitle}>{feat.title}</h4>
                  <p className={styles.featureDesc}>{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <hr className={styles.divider} />

          {/* VARIANTS SELECTOR */}
          <div className={styles.variantsSection}>
            {/* If variants exist in product, render them dynamically */}
            {product.variants && product.variants.length > 0 ? (
              product.variants.map((vGroup, idx) => (
                <div key={idx} className={styles.variantGroup}>
                  <div className={styles.variantHeader}>
                    <label className={styles.variantLabel}>{vGroup.label}</label>
                    <span className={styles.selectedValue}>
                      {selectedVariants[vGroup.label] || vGroup.options[0]?.value}
                    </span>
                  </div>

                  {vGroup.type === "color" ? (
                    /* Color Swatches */
                    <div className={styles.colorSwatches}>
                      {vGroup.options.map((opt, oIdx) => {
                        const isSelected = selectedVariants[vGroup.label] === opt.value;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            className={`${styles.colorSwatchBtn} ${isSelected ? styles.selectedSwatch : ""}`}
                            onClick={() => handleVariantSelect(vGroup.label, opt.value)}
                            title={opt.value}
                          >
                            <span
                              className={styles.colorCircle}
                              style={{ backgroundColor: opt.hex || "#cccccc" }}
                            />
                            <span className={styles.colorText}>{opt.value}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Button Options (Finish / Size) */
                    <div className={styles.buttonSwatches}>
                      {vGroup.options.map((opt, oIdx) => {
                        const isSelected = selectedVariants[vGroup.label] === opt.value;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            className={`${styles.optionBtn} ${isSelected ? styles.selectedOption : ""}`}
                            onClick={() => handleVariantSelect(vGroup.label, opt.value)}
                          >
                            {opt.value}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            ) : (
              /* Default Brand / Material / Finish Selection if no explicit variants */
              <div className={styles.variantGroup}>
                <label className={styles.variantLabel}>Selected Configuration</label>
                <div className={styles.buttonSwatches}>
                  <button type="button" className={`${styles.optionBtn} ${styles.selectedOption}`}>
                    {[product.brand, product.material, product.finish && `${product.finish} Finish`]
                      .filter(Boolean)
                      .join(" • ") || product.categoryName}
                  </button>
                  <button type="button" className={styles.optionBtn}>
                    Custom Dimensions
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PRIMARY ENQUIRY CTAS */}
          {ctaBox}
        </div>
      </div>
      </>
      )}

      {/* ── PDF-FIRST VIEW: shown instead of the details/specs page
           when the admin has attached planner sheets / spec PDFs ────── */}
      {hasDocuments && (
        <div className={styles.mainGrid}>
          <div className={styles.galleryColumn}>
            {product.documents!.map((doc, i) => (
              <div key={i} style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: "0.9375rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                    <FileText size={16} color="#1b4f8a" /> {doc.name}
                  </span>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-primary)" }}
                  >
                    Open in new tab ↗
                  </a>
                </div>
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                    height: "85vh",
                    minHeight: "600px",
                  }}
                >
                  <embed
                    src={`${doc.url}#view=FitH`}
                    type="application/pdf"
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={styles.detailsColumn}>
            <div className={styles.categoryBadge}>{product.categoryName}</div>
            <h1 className={styles.productTitle}>{product.name}</h1>
            {product.brand && (
              <p style={{ fontWeight: 600, color: "var(--color-text-secondary)", margin: "-0.5rem 0 0.5rem" }}>
                Brand: {product.brand}
              </p>
            )}
            <p className={styles.shortDescription}>{product.description}</p>
            {ctaBox}
          </div>
        </div>
      )}

      {!hasDocuments && (
      <>
      {/* ── TABS SECTION: OVERVIEW, SPECS, FAQS ───────────────────── */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabHeaders}>
          <button
            type="button"
            className={`${styles.tabHeaderBtn} ${activeTab === "overview" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Product Overview
          </button>
          <button
            type="button"
            className={`${styles.tabHeaderBtn} ${activeTab === "specs" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("specs")}
          >
            Technical Specifications
          </button>
          <button
            type="button"
            className={`${styles.tabHeaderBtn} ${activeTab === "faq" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("faq")}
          >
            Frequently Asked Questions
          </button>
        </div>

        <div className={styles.tabContent}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className={styles.overviewPane}>
              <h3 className={styles.paneTitle}>About {product.name}</h3>
              <p className={styles.longDesc}>
                {product.longDescription ||
                  `${product.name}${product.brand ? ` from ${product.brand}` : ""} — a ${product.categoryName.toLowerCase()} solution engineered for durability and reliable performance, backed by VLR Traders' service support.${
                    product.material ? ` Made from ${product.material}` : ""
                  }${product.finish ? ` with a ${product.finish} finish.` : "."}`}
              </p>

              <h4 className={styles.paneSubTitle}>Why Choose This Product</h4>
              <ul className={styles.bulletsList}>
                <li>
                  <strong>Quality Assured:</strong> {product.brand ? `Genuine ${product.brand} product, ` : ""}sourced for reliable, long-lasting performance.
                </li>
                <li>
                  <strong>Affordable Pricing:</strong> Competitive rates without compromising on quality.
                </li>
                <li>
                  <strong>Strong Service Support:</strong> Our team assists with selection, sizing, and delivery.
                </li>
                <li>
                  <strong>Fast Response:</strong> Message us on WhatsApp for instant pricing and availability.
                </li>
              </ul>
            </div>
          )}

          {/* TAB 2: TECHNICAL SPECS */}
          {activeTab === "specs" && (
            <div className={styles.specsPane}>
              <h3 className={styles.paneTitle}>Detailed Specifications</h3>
              <div className={styles.specsTableWrapper}>
                <table className={styles.specsTable}>
                  <tbody>
                    {displaySpecs.map((spec, i) => (
                      <tr key={i} className={i % 2 === 0 ? styles.evenRow : styles.oddRow}>
                        <td className={styles.specKey}>{spec.key}</td>
                        <td className={styles.specVal}>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FAQ ACCORDION */}
          {activeTab === "faq" && (
            <div className={styles.faqPane}>
              <h3 className={styles.paneTitle}>Frequently Asked Questions</h3>
              <div className={styles.accordionList}>
                {faqs.map((faq, i) => {
                  const isOpen = openFaqIndex === i;
                  return (
                    <div key={i} className={styles.accordionItem}>
                      <button
                        type="button"
                        className={styles.accordionHeader}
                        onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      >
                        <span>{faq.q}</span>
                        <span className={styles.accordionToggle}>{isOpen ? "−" : "+"}</span>
                      </button>
                      {isOpen && <div className={styles.accordionBody}>{faq.a}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      </>
      )}

      {/* ── RELATED PRODUCTS SECTION ─────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.relatedHeader}>
            <h2 className={styles.relatedTitle}>More from {product.categoryName}</h2>
            <Link href={`/catalog?categoryId=${product.categoryId}`} className={styles.viewMoreLink}>
              View Category Catalog →
            </Link>
          </div>

          <div className={styles.relatedGrid}>
            {relatedProducts.map((rel) => (
              <Link key={rel.id} href={`/product/${rel.slug}`} className={styles.relCard}>
                <div className={styles.relImgWrapper}>
                  <Image
                    src={rel.images[0]}
                    alt={rel.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className={styles.relImg}
                  />
                  {rel.badge && <span className={styles.relBadge}>{rel.badge}</span>}
                </div>
                <div className={styles.relBody}>
                  <span className={styles.relCategory}>{rel.categoryName}</span>
                  <h3 className={styles.relName}>{rel.name}</h3>
                  {rel.brand && (
                    <div className={styles.relTags}>
                      <span>{rel.brand}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── STICKY MOBILE CTA BAR ─────────────────────────────── */}
      <div className={styles.mobileStickyBar}>
        <div className={styles.mobileBarProduct}>
          <span className={styles.mobileBarName}>{product.name}</span>
          <span className={styles.mobileBarCategory}>{product.categoryName}</span>
        </div>
        <div className={styles.mobileBarActions}>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mobileWhatsappBtn}
            onClick={() => trackWhatsAppClick(product.name, product.categoryName, selectedVariants)}
          >
            WhatsApp
          </a>
          <a
            href={callUrl}
            className={styles.mobileCallBtn}
            onClick={() => trackCallClick(product.name, product.categoryName)}
          >
            Call
          </a>
        </div>
      </div>

      {/* ── VIDEO MODAL ─────────────────────────────────────── */}
      {isVideoModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsVideoModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={() => setIsVideoModalOpen(false)}
            >
              <X size={18} />
            </button>
            <h3 className={styles.modalTitle}>{product.name} Showcase</h3>
            <div className={styles.videoPlaceholder}>
              <div className={styles.playCenterCircle} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PlayCircle size={36} color="#ffffff" />
              </div>
              <p>Virtual Product Showcase & Finish Tour Video</p>
              <p className={styles.videoSubText}>
                Contact us on WhatsApp to receive a live video walkthrough of material samples from our showroom!
              </p>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappCtaBtn}
              style={{ marginTop: "1rem" }}
            >
              Request Live Video Showcase on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* ── PRODUCT ENQUIRY POPUP MODAL (SOURCE: PRODUCT) ─────── */}
      <ProductEnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        productName={product.name}
        productId={product.id}
        productImage={allImages[0]}
        productSubtitle={`${product.categoryName}${product.brand ? " • " + product.brand : ""}`}
        source="product"
      />
    </div>
  );
}
