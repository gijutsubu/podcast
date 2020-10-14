import Head from 'next/head'
import { Layout } from '../../components/layout'
import { Player, getSoundDataPath } from '../../components/player'
import { getAllPostIDs, getPostData, params, matterData } from '../../lib/posts'
import { Date } from '../../components/date'
import { People } from '../../components/people'
import utilStyles from '../../styles/utils.module.css'
import styles from './slug.module.css'


const Post = ({ postData, soundDataPath }: { postData: (matterData & { slug: string, contentHtml: string }), soundDataPath: string }) => {
  return (
    <Layout home={false} >
      <>
        <Head>
          <title>{process.env.SITE_TITLE} | {postData.title}</title>
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:site" content={process.env.TWITTER_ID} />
          <meta name="twitter:title" content={process.env.SITE_TITLE} />
          <meta name="twitter:description" content={twitterCardTitle(postData.title, postData.presenters, postData.audiences)} />
        </Head>
        <article className={styles.article}>
          <h1 className={utilStyles.headingXl}>{postData.title}</h1>
          <Date raw={postData.date} />
          <div className={styles.flex}>
            <div className={styles.people}>
              <People label={'発表者'} people={postData.presenters} />
            </div>
            <div className={styles.people}>
              <People label={'聴講者'} people={postData.audiences} />
            </div>
          </div>
          {soundDataPath != '' &&
            <div className={styles.player}>
              <Player url={soundDataPath} />
            </div>
          }
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

export const getStaticProps = async ({ params }: { params: params }) => {
  const postData = await getPostData(params.slug)
  const soundDataPath = await getSoundDataPath(params.slug)
  return {
    props: {
      postData,
      soundDataPath,
    }
  }
}


const twitterCardTitle = (title: string, presenters: string[], audiences: string[]) => {
  return title + (
    presenters.length !== 0 || audiences.length !== 0 ? ' |' : ''
  ) + (
      presenters.length !== 0 ? ' 発表者: ' + presenters : ''
    ) + (
      audiences.length !== 0 ? ' 聴講者: ' + audiences : ''
    );
}
