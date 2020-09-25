import Head from 'next/head'
import styles from './layout.module.css'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'

const config = {
  description: process.env.description,
  siteTitle: process.env.siteTitle,
  ogImage: process.env.ogImage,
};

export const Layout = ({ children, home = false }: { children: JSX.Element, home: boolean }) => {
  return <div className={styles.container}>
    <Head>
      <title>{config.siteTitle} | {config.description}</title>
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
          <h1 className={utilStyles.heading2Xl}>{config.siteTitle}</h1>
        </>
      ) : (
          <>
            <h1 className={utilStyles.heading2Xl}>
              <Link href="/" >
                <a className={utilStyles.colorInherit}>{config.siteTitle}</a></Link>
            </h1>
          </>
        )}
    </header>
    <main className={utilStyles.main}>{children}</main>
    <footer className={styles.footer}>
      &copy; {config.siteTitle}
    </footer>
  </div >
}
