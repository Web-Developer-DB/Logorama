/**
 * @file Seo.jsx
 * @description Zentrale Komponente für Meta-Tags, Open-Graph-Informationen und JSON-LD.
 */

import { Helmet } from "react-helmet-async";

const DEFAULT_TITLE = "Logorama – Offline Lernjournal & PWA";
const DEFAULT_DESCRIPTION =
  "Logorama ist eine deutschsprachige Lernjournal-App als PWA. Erfasse Ideen offline, sichere sie per JSON-Export und verwalte deine Einträge auf jedem Gerät.";
const DEFAULT_KEYWORDS =
  "Logbuch, Lernjournal, Notizen App, Offline PWA, JSON Export, Produktivität, digitale Notizen";
const FALLBACK_SITE_URL = "https://logorama.app/";

const resolveSiteUrl = () => {
  const envUrl =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL
      ? import.meta.env.VITE_SITE_URL
      : null;
  try {
    return new URL(envUrl ?? FALLBACK_SITE_URL).origin + "/";
  } catch {
    return FALLBACK_SITE_URL;
  }
};

const SITE_URL = resolveSiteUrl();

const toAbsoluteUrl = (path = "/") => {
  const sanitizedPath = `${path}`.startsWith("/")
    ? path
    : `/${path}`;
  try {
    return new URL(sanitizedPath, SITE_URL).toString();
  } catch {
    return SITE_URL;
  }
};

/**
 * @typedef {Object} SeoProps
 * @property {string} [title]
 * @property {string} [description]
 * @property {string} [path]
 * @property {string} [image]
 * @property {string} [ogType]
 * @property {string} [keywords]
 * @property {boolean} [noindex]
 * @property {Object|((context: { canonicalUrl: string }) => Object)} [structuredData]
 */

/**
 * Liefert gebündelt alle relevanten SEO-Tags für eine Route.
 * Die Komponente nutzt Helmet, um die Tags zur Laufzeit in den Head einzufügen.
 *
 * @param {SeoProps} props SEO-Metadaten für die Seite.
 * @returns {JSX.Element} Helmet-Wrapper mit Meta-Angaben.
 */
const Seo = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = "icons/icon-512.png",
  ogType = "website",
  keywords = DEFAULT_KEYWORDS,
  noindex = false,
  structuredData
}) => {
  const canonicalUrl = toAbsoluteUrl(path);
  const resolvedImage = image?.startsWith("http")
    ? image
    : toAbsoluteUrl(image);
  const jsonLd =
    typeof structuredData === "function"
      ? structuredData({ canonicalUrl })
      : structuredData;

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <link rel="canonical" href={canonicalUrl} />
      <meta name="description" content={description} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <meta name="author" content="Dimitri B" />
      <meta name="robots" content={noindex ? "noindex,nofollow" : "index,follow"} />
      {noindex ? <meta name="googlebot" content="noindex,nofollow" /> : null}

      <meta property="og:locale" content="de_DE" />
      <meta property="og:site_name" content="Logorama" />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={resolvedImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />

      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  );
};

export { toAbsoluteUrl };
export default Seo;
