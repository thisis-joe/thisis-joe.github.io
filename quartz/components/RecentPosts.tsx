import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

type PostItem = {
  title: string
  slug: string
  created?: Date
  modified?: Date
}

function isHomePage(slug: unknown): boolean {
  const value = String(slug ?? "")
  return value === "" || value === "index" || value === "/"
}

function normalizeDate(value: unknown): Date | undefined {
  if (!value) return undefined

  if (value instanceof Date) return value

  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? undefined : date
}

function formatDate(date?: Date): string {
  if (!date) return "날짜 없음"

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

function titleFromFile(file: any): string {
  return (
    file.frontmatter?.title ??
    file.title ??
    String(file.slug ?? "")
      .split("/")
      .pop()
      ?.replace(/\.md$/, "") ??
    "Untitled"
  )
}

function isPublishablePost(file: any): boolean {
  const slug = String(file.slug ?? "")

  if (!slug) return false
  if (slug === "index") return false
  if (slug.endsWith("/index")) return false
  if (file.frontmatter?.draft === true) return false

  return true
}

function toPostItem(file: any): PostItem {
  const slug = String(file.slug ?? "")
  const dates = file.dates ?? {}

  return {
    title: titleFromFile(file),
    slug,
    created: normalizeDate(dates.created ?? file.frontmatter?.date),
    modified: normalizeDate(dates.modified ?? dates.created ?? file.frontmatter?.date),
  }
}

function renderPostList(posts: PostItem[], mode: "created" | "modified") {
  const firstPosts = posts.slice(0, 4)
  const restPosts = posts.slice(4)

  const dateOf = (post: PostItem) => (mode === "created" ? post.created : post.modified)

  return (
    <div className="recent-post-section">
      <ul className="recent-post-list">
        {firstPosts.map((post) => (
          <li>
            <a href={`/${post.slug}`}>{post.title}</a>
            <span>{formatDate(dateOf(post))}</span>
          </li>
        ))}
      </ul>

      {restPosts.length > 0 && (
        <details className="recent-post-more">
          <summary>더보기</summary>
          <ul className="recent-post-list">
            {restPosts.map((post) => (
              <li>
                <a href={`/${post.slug}`}>{post.title}</a>
                <span>{formatDate(dateOf(post))}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}

const RecentPosts: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  if (!isHomePage(fileData.slug)) {
    return null
  }

  const posts = allFiles
    .filter(isPublishablePost)
    .map(toPostItem)

  const recentlyCreated = [...posts].sort(
    (a, b) => (b.created?.getTime() ?? 0) - (a.created?.getTime() ?? 0),
  )

  const recentlyModified = [...posts].sort(
    (a, b) => (b.modified?.getTime() ?? 0) - (a.modified?.getTime() ?? 0),
  )

  if (posts.length === 0) {
    return null
  }

  return (
    <section className="recent-posts">
      <h2>최근 글</h2>

      <div className="recent-post-tabs">
        <div>
          <h3>[최근 생성]</h3>
          {renderPostList(recentlyCreated, "created")}
        </div>

        <div>
          <h3>[최근 수정]</h3>
          {renderPostList(recentlyModified, "modified")}
        </div>
      </div>
    </section>
  )
}

export default (() => RecentPosts) satisfies QuartzComponentConstructor
