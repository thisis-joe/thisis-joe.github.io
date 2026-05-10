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

function isPublishablePost(file: any): boolean {
  const slug = String(file.slug ?? "")

  if (!slug) return false
  if (slug === "index") return false
  if (slug.endsWith("/index")) return false
  if (file.frontmatter?.draft === true) return false

  return true
}

function toRecentEvents(file: any): RecentEvent[] {
  const slug = String(file.slug ?? "")
  const title = titleFromFile(file)
  const dates = file.dates ?? {}

  const created = normalizeDate(dates.created ?? file.frontmatter?.date)
  const modified = normalizeDate(dates.modified ?? dates.created ?? file.frontmatter?.date)

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

  if (modified) {
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
    .filter(isPublishablePost)
    .flatMap(toRecentEvents)
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))

  if (events.length === 0) {
    return null
  }

  const firstEvents = events.slice(0, 7)
  const restEvents = events.slice(7)

  return (
    <section class="recent-feed">
      <h2>최근 글</h2>

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
