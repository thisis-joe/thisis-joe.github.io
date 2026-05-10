import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

type RecentEvent = {
  type: "created" | "modified"
  label: "[최근 생성]" | "[최근 수정]"
  title: string
  slug: string
  date?: Date
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

function isFolderLikePage(file: any, allFiles: any[]): boolean {
  const slug = String(file.slug ?? "")

  if (!slug) return false
  if (slug === "index") return true
  if (slug.endsWith("/index")) return true

  return allFiles.some((other) => {
    const otherSlug = String(other.slug ?? "")
    return otherSlug !== slug && otherSlug.startsWith(slug + "/")
  })
}

function isPublishablePost(file: any, allFiles: any[]): boolean {
  const slug = String(file.slug ?? "")
  const title = titleFromFile(file)

  if (!slug) return false
  if (file.frontmatter?.draft === true) return false
  if (isFolderLikePage(file, allFiles)) return false

  // .gitignore 같은 숨김 파일 제외
  if (slug.split("/").some((part) => part.startsWith("."))) return false
  if (title.startsWith(".")) return false

  return true
}

function isMeaningfullyModified(created?: Date, modified?: Date): boolean {
  if (!created || !modified) return false

  // created와 modified가 거의 같은 시각이면 같은 이벤트로 봄.
  // 이 경우 [최근 생성]만 보여줌.
  const diff = modified.getTime() - created.getTime()
  return diff > 60 * 1000
}

function toRecentEvents(file: any): RecentEvent[] {
  const slug = String(file.slug ?? "")
  const title = titleFromFile(file)
  const dates = file.dates ?? {}

  const created = normalizeDate(dates.created ?? file.frontmatter?.created ?? file.frontmatter?.date)
  const modified = normalizeDate(
    file.frontmatter?.updated ?? dates.modified ?? dates.created ?? file.frontmatter?.date,
  )

  const events: RecentEvent[] = []

  if (created) {
    events.push({
      type: "created",
      label: "[최근 생성]",
      title,
      slug,
      date: created,
    })
  }

  // 실제 수정 시간이 생성 시간보다 의미 있게 늦을 때만 [최근 수정] 표시
  if (isMeaningfullyModified(created, modified)) {
    events.push({
      type: "modified",
      label: "[최근 수정]",
      title,
      slug,
      date: modified,
    })
  }

  return events
}

function RecentRows({ events }: { events: RecentEvent[] }) {
  return (
    <div class="recent-feed-list">
      {events.map((event, index) => (
        <div class="recent-feed-row" key={`${event.type}-${event.slug}-${index}`}>
          <span class={`recent-feed-label ${event.type}`}>{event.label}</span>
          <a class="recent-feed-title" href={`/${event.slug}`}>
            {event.title}
          </a>
          <time class="recent-feed-date">{formatDate(event.date)}</time>
        </div>
      ))}
    </div>
  )
}

const RecentPosts: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  if (!isHomePage(fileData.slug)) {
    return null
  }

  const events = allFiles
    .filter((file) => isPublishablePost(file, allFiles))
    .flatMap(toRecentEvents)
    .sort((a, b) => {
      const timeDiff = (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0)
      if (timeDiff !== 0) return timeDiff

      // 시간이 같으면 생성 이벤트를 수정 이벤트보다 위에 둠
      if (a.type === "created" && b.type === "modified") return -1
      if (a.type === "modified" && b.type === "created") return 1

      return a.title.localeCompare(b.title, "ko")
    })

  if (events.length === 0) {
    return null
  }

  const firstEvents = events.slice(0, 7)
  const restEvents = events.slice(7)

  return (
    <section class="recent-feed">
      <h2 class="recent-feed-heading">최근 글</h2>
      <div class="recent-feed-heading-line" />

      <RecentRows events={firstEvents} />

      {restEvents.length > 0 && (
        <details class="recent-feed-more">
          <summary>더보기</summary>
          <RecentRows events={restEvents} />
        </details>
      )}
    </section>
  )
}

export default (() => RecentPosts) satisfies QuartzComponentConstructor
