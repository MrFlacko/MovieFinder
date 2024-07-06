import React, { useState } from 'react';
import ShowRandomMovie from './ShowRandomMovie';

export default function Header() {
    const [showModal, setShowModal] = useState(false);

    const handleShowModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <header className="bg-gray-800 py-4">
            <div className="container mx-auto flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold">Movie Trailer Finder</h1>
                    <p className="mt-2 text-lg">Discover and watch trailers for the latest movies</p>
                </div>
                <button onClick={handleShowModal} className="btn-random-movie">
                    Show Random Movie
                </button>
            </div>
            {showModal && <ShowRandomMovie show={showModal} onClose={handleCloseModal} />}
        </header>
    );
}
