import Head from 'next/head'
import styles from './layout.module.css'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'

const config = {
  name: '技術部',
  description: 'ソフトウェアのpodcast',
  siteTitle: '技術部',
  ogImage: 'https://avatars2.githubusercontent.com/u/71766187?s=200&v=4',
};

export const Layout = ({ children, home = false }: { children: JSX.Element, home: boolean }) => {
  return <div className={styles.container}>
    <Head>
      <link rel="icon" href="/favicon.ico" />
      <meta
        name="description"
        content={config.description}
      />
      <meta
        property="og:image"
        content={config.ogImage}
      />
      <meta name="og:title" content={config.siteTitle} />
      <meta name="twitter:card" content="summary_large_image" />
    </Head>
    <header className={styles.header}>
      {home ? (
        <>
          <h1 className={utilStyles.heading2Xl}>{config.name}</h1>
        </>
      ) : (
          <>
            <h1 className={utilStyles.heading2Xl}>
              <Link href="/" >
                <a className={utilStyles.colorInherit}>{config.name}</a></Link>
            </h1>
          </>
        )}
    </header>
    <main>{children}</main>
  </div>
}
