import { useEffect } from "react";
import Router from 'next/router'
import { AppProps } from 'next/app'
import * as gtag from '../lib/gtag'
import '../styles/globals.css'
import 'highlight.js/styles/googlecode.css';

const App = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    if (!gtag.existsGaId) {
      return
    }

    const handleRouteChange = (path: string) => {
      gtag.pageview(path)
    }

    Router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      Router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])

  return <Component {...pageProps} />
}

export default App;
