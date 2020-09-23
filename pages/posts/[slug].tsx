import Head from 'next/head'
import { Layout } from '../../components/layout'
import { getAllPostIDs, getPostData, Params, MatterData } from '../../lib/posts'
import utilStyles from '../../styles/utils.module.css'
import { Date } from '../../components/date'

const Post = ({ postData }: { postData: (MatterData & { slug: string, contentHtml: string }) }) => {
  return (
    <Layout>
      <>
        <Head>
          <title>{postData.title}</title>
        </Head>
        <article>
          <h1 className={utilStyles.headingXl}>{postData.title}</h1>
          <div className={utilStyles.lightText}>
            <Date raw={postData.date} />
          </div>
          <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
        </article>
      </>
    </Layout >
  )
}

export default Post;

export const getStaticPaths = async () => {
  const paths = getAllPostIDs()
  return {
    paths,
    fallback: false
  }
}

export const getStaticProps = async ({ params }: { params: Params }) => {
  const postData = await getPostData(params.slug)
  return {
    props: {
      postData
    }
  }
}

