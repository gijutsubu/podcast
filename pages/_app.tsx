import '../styles/globals.css'
import 'highlight.js/styles/googlecode.css';

import { AppProps } from 'next/app'

const App = ({ Component, pageProps }: AppProps) => <Component {...pageProps} />;

export default App;
