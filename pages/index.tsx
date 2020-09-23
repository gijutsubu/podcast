import utilStyles from '../styles/utils.module.css'
import { Layout } from '../components/layout'
import { MatterData } from '../lib/posts'
import { getSortedPostsData } from '../lib/posts'
import Link from 'next/link'
import { Date } from '../components/date'

export const getStaticProps = async () => {
  const allPostsData = getSortedPostsData()
  return {
    props: {
      allPostsData
    }
  }
}

const Home = ({ allPostsData }: { allPostsData: (MatterData & { slug: string })[] }) => {
  return (
    <Layout home>
      <>
        <section className={utilStyles.headingMd}>
        </section>
        <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
          <ul className={utilStyles.list}>
            {allPostsData.map(({ slug, date, title }) => (
              <li className={utilStyles.listItem} key={slug}>
                <Link href={`/posts/${slug}`}>
                  <a>{title}</a>
                </Link>
                <br />
                <small className={utilStyles.lightText}>
                  <Date raw={date} />
                </small>
              </li>
            ))}
          </ul>
        </section>
      </>
    </Layout >
  )
}

export default Home

