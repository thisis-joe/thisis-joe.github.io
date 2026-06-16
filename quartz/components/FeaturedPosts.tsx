import { FullSlug, resolveRelative } from "../util/path"
import { Date as QuartzDate, formatDate } from "./Date"
import {
  BlogPost,
  comparePostsByDate,
  getDescription,
  getPrimaryDate,
  getTags,
  isHomePage,
  isPublishablePost,
  isRecommendedPost,
  titleFromFile,
} from "./PostUtils"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const featuredLimit = 6

function FeaturedPostCard({
  currentSlug,
  locale,
  post,
}: {
  currentSlug: FullSlug
  locale: QuartzComponentProps["cfg"]["locale"]
  post: BlogPost
}) {
  const date = getPrimaryDate(post)
  const description = getDescription(post)
  const tags = getTags(post).slice(0, 3)

  return (
    <li class="feature-card">
      <a
        class="feature-card-title internal"
        href={resolveRelative(currentSlug, post.slug as FullSlug)}
      >
        {titleFromFile(post)}
      </a>
      {description && <p class="feature-card-desc">{description}</p>}
      <div class="feature-card-meta">
        {date && <QuartzDate date={date} locale={locale} />}
        {tags.length > 0 && (
          <span class="feature-card-tags">{tags.map((tag) => `#${tag}`).join(" ")}</span>
        )}
      </div>
    </li>
  )
}

const FeaturedPosts: QuartzComponent = ({ fileData, allFiles, cfg }: QuartzComponentProps) => {
  if (!isHomePage(fileData.slug)) return null

  const currentSlug = (fileData.slug ?? "index") as FullSlug
  const posts = allFiles
    .filter((file) => isPublishablePost(file, allFiles))
    .filter(isRecommendedPost)
    .sort(comparePostsByDate)
    .slice(0, featuredLimit)

  if (posts.length === 0) return null

  const latestDate = posts
    .map(getPrimaryDate)
    .filter((date): date is globalThis.Date => Boolean(date))[0]

  return (
    <section class="featured-posts">
      <div class="section-heading-row">
        <h2>추천 문서</h2>
        {latestDate && <span>{formatDate(latestDate, cfg.locale)}</span>}
      </div>
      <ul class="feature-grid">
        {posts.map((post) => (
          <FeaturedPostCard currentSlug={currentSlug} locale={cfg.locale} post={post} />
        ))}
      </ul>
    </section>
  )
}

export default (() => FeaturedPosts) satisfies QuartzComponentConstructor
