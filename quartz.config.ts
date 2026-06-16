import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

const umamiWebsiteId = process.env.UMAMI_WEBSITE_ID
const umamiHost = process.env.UMAMI_HOST

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "동블",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: umamiWebsiteId
      ? {
          provider: "umami",
          websiteId: umamiWebsiteId,
          ...(umamiHost ? { host: umamiHost } : {}),
        }
      : null,
    locale: "ko-KR",
    baseUrl: "thisis-joe.github.io",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Noto Sans KR",
        body: "Noto Sans KR",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#ffffff",
          lightgray: "#e5e7eb",
          gray: "#9ca3af",
          darkgray: "#4b5563",
          dark: "#111827",
          secondary: "#2563eb",
          tertiary: "#0f766e",
          highlight: "rgba(37, 99, 235, 0.09)",
          textHighlight: "#fef3c788",
        },
        darkMode: {
          light: "#111827",
          lightgray: "#374151",
          gray: "#6b7280",
          darkgray: "#d1d5db",
          dark: "#f9fafb",
          secondary: "#93c5fd",
          tertiary: "#5eead4",
          highlight: "rgba(147, 197, 253, 0.14)",
          textHighlight: "#92400e88",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      // Plugin.CustomOgImages(),
    ],
  },
}

export default config
