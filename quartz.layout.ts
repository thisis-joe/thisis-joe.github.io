import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

const giscusRepo = process.env.GISCUS_REPO as `${string}/${string}` | undefined
const giscusRepoId = process.env.GISCUS_REPO_ID
const giscusCategory = process.env.GISCUS_CATEGORY
const giscusCategoryId = process.env.GISCUS_CATEGORY_ID

const comments =
  giscusRepo && giscusRepoId && giscusCategory && giscusCategoryId
    ? [
        Component.ConditionalRender({
          component: Component.Comments({
            provider: "giscus",
            options: {
              repo: giscusRepo,
              repoId: giscusRepoId,
              category: giscusCategory,
              categoryId: giscusCategoryId,
              mapping: "pathname",
              strict: true,
              reactionsEnabled: true,
              inputPosition: "bottom",
              lang: "ko",
            },
          }),
          condition: ({ fileData }) => {
            const slug = String(fileData.slug ?? "")
            return slug !== "" && slug !== "index" && !slug.startsWith("tags/")
          },
        }),
      ]
    : []

const knowledgeGraph = Component.DesktopOnly(
  Component.Graph({
    localGraph: {
      drag: true,
      zoom: true,
      depth: 2,
      scale: 1.15,
      repelForce: 0.7,
      centerForce: 0.24,
      linkDistance: 42,
      fontSize: 0.66,
      opacityScale: 1,
      showTags: false,
      focusOnHover: true,
      enableRadial: false,
    },
    globalGraph: {
      drag: true,
      zoom: true,
      depth: -1,
      scale: 0.88,
      repelForce: 0.78,
      centerForce: 0.18,
      linkDistance: 48,
      fontSize: 0.72,
      opacityScale: 1,
      showTags: true,
      removeTags: [],
      focusOnHover: true,
      enableRadial: false,
    },
  }),
)

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.RecentPosts(),
    Component.FeaturedPosts(),
    Component.RelatedPosts(),
    ...comments,
  ],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/thisis-joe/thisis-joe.github.io",
      RSS: "https://thisis-joe.github.io/index.xml",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer(),
    knowledgeGraph,
  ],
  right: [Component.DesktopOnly(Component.TableOfContents()), Component.Backlinks()],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(),
    knowledgeGraph,
  ],
  right: [],
}
