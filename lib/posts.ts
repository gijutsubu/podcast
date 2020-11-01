import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import remark from 'remark'

import highlight from 'remark-highlight.js'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts')
const isDev = process.env.NODE_ENV === 'development'

export type matterData = {
  title: string
  date: string
  draft: boolean
  presenters: string[]
  audiences: string[]
}

export type params = {
  slug: string
}

export const getAllPostIDs = () => {
  const fileNames = fs.readdirSync(postsDirectory)
  return allPostsData(fileNames).map(data => {
    return { params: { slug: data.slug } }
  })
}

export const getSortedPostsData = () => {
  const fileNames = fs.readdirSync(postsDirectory)

  return allPostsData(fileNames).sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

export const getPostData = async (slug: string) => {
  const fullPath = path.join(postsDirectory, `${slug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  const matterResult = matter(fileContents)

  const processedContent = await remark()
    .use(html)
    .use(highlight)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  return {
    slug,
    contentHtml,
    ...matterResult.data
  }
}


const allPostsData = (fileNames: string[]) => fileNames.map(getPostMetaData).filter(data => (isDev || !data.draft))

const getPostMetaData = (fileName: string) => {
  const slug = fileName.replace(/\.md$/, '')

  const fullPath = path.join(postsDirectory, fileName)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  const matterResult = matter(fileContents)

  const data = matterResult.data as matterData

  return {
    slug,
    ...(data)
  }
}
