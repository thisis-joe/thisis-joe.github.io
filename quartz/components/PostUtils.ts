import { QuartzPluginData } from "../plugins/vfile"

export type BlogPost = QuartzPluginData & { slug: string }

export function isHomePage(slug: unknown): boolean {
  const value = String(slug ?? "")
  return value === "" || value === "index" || value === "/"
}

export function coerceStringArray(value: unknown): string[] {
  if (value === undefined || value === null) return []

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

export function titleFromFile(file: QuartzPluginData): string {
  return (
    file.frontmatter?.title ??
    String(file.slug ?? "")
      .split("/")
      .pop()
      ?.replace(/\.md$/, "") ??
    "Untitled"
  )
}

export function getDescription(file: QuartzPluginData): string | undefined {
  const description = file.frontmatter?.description ?? file.frontmatter?.socialDescription
  return description ? String(description) : undefined
}

export function getTags(file: QuartzPluginData): string[] {
  return coerceStringArray(file.frontmatter?.tags)
}

export function getSeries(file: QuartzPluginData): string | undefined {
  const series = file.frontmatter?.series
  return series ? String(series) : undefined
}

export function normalizeDate(value: unknown): Date | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value

  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function getPrimaryDate(file: QuartzPluginData): Date | undefined {
  return normalizeDate(
    file.frontmatter?.updated ??
      file.frontmatter?.modified ??
      file.dates?.modified ??
      file.dates?.created ??
      file.frontmatter?.created ??
      file.frontmatter?.date,
  )
}

export function isFolderLikePage(file: QuartzPluginData, allFiles: QuartzPluginData[]): boolean {
  const slug = String(file.slug ?? "")

  if (!slug) return false
  if (slug === "index") return true
  if (slug.endsWith("/index")) return true

  return allFiles.some((other) => {
    const otherSlug = String(other.slug ?? "")
    return otherSlug !== slug && otherSlug.startsWith(slug + "/")
  })
}

export function isPublishablePost(
  file: QuartzPluginData,
  allFiles: QuartzPluginData[],
): file is BlogPost {
  const slug = String(file.slug ?? "")
  const title = titleFromFile(file)

  if (!slug) return false
  if (file.frontmatter?.draft === true || file.frontmatter?.draft === "true") return false
  if (isFolderLikePage(file, allFiles)) return false
  if (slug.startsWith("tags/")) return false
  if (slug.split("/").some((part) => part.startsWith("."))) return false
  if (title.startsWith(".")) return false

  return true
}

export function isRecommendedPost(file: QuartzPluginData): boolean {
  const value = file.frontmatter?.recommended ?? file.frontmatter?.featured
  return value === true || value === "true" || value === "yes" || value === "1" || value === 1
}

export function comparePostsByDate(a: QuartzPluginData, b: QuartzPluginData): number {
  const dateDiff = (getPrimaryDate(b)?.getTime() ?? 0) - (getPrimaryDate(a)?.getTime() ?? 0)
  if (dateDiff !== 0) return dateDiff

  return titleFromFile(a).localeCompare(titleFromFile(b), "ko")
}

export function normalizeSlug(value: unknown): string {
  return String(value ?? "")
    .replace(/\.md$/, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
}

export function findPostBySlug(allFiles: QuartzPluginData[], slug: unknown): BlogPost | undefined {
  const target = normalizeSlug(slug)
  if (!target) return undefined

  return allFiles.find((file): file is BlogPost => {
    if (!isPublishablePost(file, allFiles)) return false

    const current = normalizeSlug(file.slug)
    return current === target || current.endsWith(`/${target}`)
  })
}

function parentPath(slug: string): string {
  return slug.split("/").slice(0, -1).join("/")
}

function topLevelPath(slug: string): string {
  return slug.split("/")[0] ?? ""
}

export function relatedScore(current: BlogPost, candidate: BlogPost): number {
  if (current.slug === candidate.slug) return 0

  const currentSeries = getSeries(current)
  const candidateSeries = getSeries(candidate)
  const currentTags = new Set(getTags(current))
  const tagOverlap = getTags(candidate).filter((tag) => currentTags.has(tag)).length
  const seriesScore = currentSeries && candidateSeries && currentSeries === candidateSeries ? 4 : 0
  const sameParentScore = parentPath(current.slug) === parentPath(candidate.slug) ? 3 : 0
  const sameTopLevelScore = topLevelPath(current.slug) === topLevelPath(candidate.slug) ? 1 : 0

  return seriesScore + tagOverlap + sameParentScore + sameTopLevelScore
}
