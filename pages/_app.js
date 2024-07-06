// pages/_app.js
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/header.css';
import '../styles/buttons.css';
import '../styles/movie-card.css';
import '../styles/expanded-card.css';
import '../styles/show-random-movie.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
