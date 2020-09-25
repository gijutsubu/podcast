import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import remark from 'remark'

import highlight from 'remark-highlight.js'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts')

export type matterData = {
  title: string
  date: string
  presenters: string[]
  audiences: string[]
}

export const getSortedPostsData = () => {
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames.map(fileName => {
    const slug = fileName.replace(/\.md$/, '')

    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    const matterResult = matter(fileContents)

    return {
      slug,
      ...(matterResult.data as matterData)
    }
  })

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

export type params = {
  slug: string
}

export const getAllPostIDs = () => {
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames.map(fileName => { return { params: { slug: fileName.replace(/\.md$/, '') } } })
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
