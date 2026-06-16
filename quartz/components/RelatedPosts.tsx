import { FullSlug, resolveRelative } from "../util/path"
import {
  BlogPost,
  coerceStringArray,
  comparePostsByDate,
  findPostBySlug,
  getDescription,
  getTags,
  isHomePage,
  isPublishablePost,
  relatedScore,
  titleFromFile,
} from "./PostUtils"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const relatedLimit = 4

function uniquePosts(posts: BlogPost[]): BlogPost[] {
  const seen = new Set<string>()
  return posts.filter((post) => {
    if (seen.has(post.slug)) return false
    seen.add(post.slug)
    return true
  })
}

function manualRelatedPosts(fileData: BlogPost, allFiles: QuartzComponentProps["allFiles"]) {
  return uniquePosts(
    coerceStringArray(fileData.frontmatter?.related)
      .map((slug) => findPostBySlug(allFiles, slug))
      .filter((post): post is BlogPost => post !== undefined && post.slug !== fileData.slug),
  )
}

function automaticRelatedPosts(fileData: BlogPost, allFiles: QuartzComponentProps["allFiles"]) {
  return allFiles
    .filter((file) => isPublishablePost(file, allFiles))
    .map((post) => ({
      post,
      score: relatedScore(fileData, post),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return comparePostsByDate(a.post, b.post)
    })
    .map(({ post }) => post)
}

const RelatedPosts: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  if (isHomePage(fileData.slug)) return null
  if (!isPublishablePost(fileData, allFiles)) return null

  const currentSlug = fileData.slug as FullSlug
  const manuallyPicked = manualRelatedPosts(fileData, allFiles)
  const related =
    manuallyPicked.length > 0 ? manuallyPicked : automaticRelatedPosts(fileData, allFiles)
  const posts = uniquePosts(related).slice(0, relatedLimit)

  if (posts.length === 0) return null

  return (
    <section class="related-posts">
      <h2>관련 문서</h2>
      <ul class="related-list">
        {posts.map((post) => {
          const description = getDescription(post)
          const tags = getTags(post).slice(0, 2)

          return (
            <li class="related-item">
              <a
                class="related-title internal"
                href={resolveRelative(currentSlug, post.slug as FullSlug)}
              >
                {titleFromFile(post)}
              </a>
              {description && <p>{description}</p>}
              {tags.length > 0 && <span>{tags.map((tag) => `#${tag}`).join(" ")}</span>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default (() => RelatedPosts) satisfies QuartzComponentConstructor
