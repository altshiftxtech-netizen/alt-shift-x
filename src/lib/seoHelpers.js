/**
 * SEO Helper Functions — Update meta tags dynamically
 */

export function setSEOMeta(config = {}) {
  const {
    title = "Alt+Shift+X Market — AI Components for Construction",
    description = "Discover verified AI-powered components for construction intelligence, risk analysis, project management, and site reporting. Trusted by enterprises.",
    canonical = window.location.href,
    ogImage = "https://media.base44.com/images/public/6a19363c90f06323c4cfff73/031f54965_altxlogo2.jpg",
    ogType = "website",
    twitterCard = "summary_large_image",
    keywords = "AI components, construction, risk management, project management, site reporting, verified components, enterprise software",
    author = "Alt+Shift+X",
    robots = "index, follow",
  } = config;

  // Title
  document.title = title;

  // Meta tags
  updateOrCreateMeta("name", "description", description);
  updateOrCreateMeta("name", "keywords", keywords);
  updateOrCreateMeta("name", "author", author);
  updateOrCreateMeta("name", "robots", robots);
  updateOrCreateMeta("name", "viewport", "width=device-width, initial-scale=1.0");

  // Open Graph
  updateOrCreateMeta("property", "og:title", title);
  updateOrCreateMeta("property", "og:description", description);
  updateOrCreateMeta("property", "og:type", ogType);
  updateOrCreateMeta("property", "og:image", ogImage);
  updateOrCreateMeta("property", "og:url", canonical);
  updateOrCreateMeta("property", "og:site_name", "Alt+Shift+X Market");

  // Twitter Card
  updateOrCreateMeta("name", "twitter:card", twitterCard);
  updateOrCreateMeta("name", "twitter:title", title);
  updateOrCreateMeta("name", "twitter:description", description);
  updateOrCreateMeta("name", "twitter:image", ogImage);

  // Canonical Link
  updateOrCreateLink("canonical", canonical);

  // Structured Data (JSON-LD) for Organization
  if (!document.querySelector('script[type="application/ld+json"]')) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Alt+Shift+X",
      "url": "https://altshiftx.com",
      "logo": ogImage,
      "description": description,
      "sameAs": [
        "https://twitter.com/altshiftx",
        "https://linkedin.com/company/altshiftx"
      ]
    });
    document.head.appendChild(script);
  }
}

export function setPageSEO(page = {}) {
  const {
    title = "Alt+Shift+X Market",
    description = "Verified AI components for construction intelligence.",
    path = "/",
  } = page;

  setSEOMeta({
    title: `${title} | Alt+Shift+X Market`,
    description,
    canonical: `${window.location.origin}${path}`,
    robots: "index, follow",
  });
}

function updateOrCreateMeta(attrType, attrName, content) {
  let meta = document.querySelector(`meta[${attrType}="${attrName}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attrType, attrName);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function updateOrCreateLink(rel, href) {
  let link = document.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.href = href;
}

/**
 * Breadcrumb Schema — for better navigation crawling
 */
export function setBreadcrumbSchema(items = []) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.label,
      "item": item.url
    }))
  };

  let script = document.querySelector('script[data-breadcrumb="true"]');
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-breadcrumb", "true");
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema);
}

/**
 * Rich Snippet for Product Listings
 */
export function setProductSchema(product = {}) {
  const {
    name = "Component",
    description = "",
    image = "",
    price = 0,
    priceCurrency = "USD",
    rating = 0,
    ratingCount = 0,
    url = "",
  } = product;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "image": image,
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": priceCurrency,
    }
  };

  if (rating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": rating,
      "reviewCount": ratingCount
    };
  }

  let script = document.querySelector(`script[data-product="${name}"]`);
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-product", name);
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema);
}