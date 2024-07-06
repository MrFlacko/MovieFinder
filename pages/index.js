import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(32);
  const [sortOption, setSortOption] = useState('rating');
  const [yearFilter, setYearFilter] = useState('all');
  const [category, setCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      const res = await fetch(`/api/movies?page=${currentPage - 1}&limit=${itemsPerPage}&sort=${sortOption}&year=${yearFilter}&category=${category}`);
      const data = await res.json();
      setMovies(prevMovies => [...prevMovies, ...data]);
      setLoading(false);
    };

    fetchMovies();
  }, [currentPage, itemsPerPage, sortOption, yearFilter, category]);

  const loadMoreMovies = () => setCurrentPage(prevPage => prevPage + 1);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
    setMovies([]);
  };

  return (
    <>
      <Header />
      <Layout
        movies={movies}
        loading={loading}
        sortOption={sortOption}
        setSortOption={setSortOption}
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        category={category}
        setCategory={setCategory}
        showModal={showModal}
        setShowModal={setShowModal}
        loadMoreMovies={loadMoreMovies}
        handleItemsPerPageChange={handleItemsPerPageChange}
        itemsPerPage={itemsPerPage}
      />
      <Footer />
    </>
  );
}
