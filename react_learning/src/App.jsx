import React, { useEffect } from 'react'
import Search from './components/Search'
import { useState } from 'react'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite'
const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMBD_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const App = () => {
  const [search, setSearch] = useState('')


  const [errorMegssage, setErrorMegssage] = useState('');
  const [trendingMovies, setTrendingMovies] = useState([]);

  const [movies, setMovies] = useState([]);

  const [loading, setLoading] = useState(false);

  const [debouncedSearchTerm, setdebouncedSearchTerm] = useState('')

  useDebounce(() => {
    setdebouncedSearchTerm(search);
  }, 500, [search]);

  const fetchMovies = async (query = '') => {
    setLoading(true);
    setErrorMegssage('');

    try {
      const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS)

      if (!response.ok) {
        throw new Error('Failed to fetch movies')
      }

      const data = await response.json()
      console.log('API Response:', data); // Debug log

      if (data.response == 'False') {
        setErrorMegssage(data.Error || 'No movies found. Please try again.');
        setMovies([]);
        return;
      }
      setMovies(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }



    } catch (error) {
      console.error(`Error fetching movies: ${error}`)
      setErrorMegssage('Failed to fetch movies. Please try again later.')
    } finally {
      setLoading(false);
    }
  }
  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm])

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className='pattern' />
      <div className='wrapper'>
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Find <span className='text-gradient'>Movies</span>  you'll Enjoy Without the Hassle</h1>

          <Search search={search} setSearch={setSearch} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className='all-movies'>
          <h2>All Movies</h2>

          {loading ? (
            <Spinner />
          ) : errorMegssage ? (
            <p className='text-red-500'>{errorMegssage}</p>
          ) : (
            <ul>
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default App