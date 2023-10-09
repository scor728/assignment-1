import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../Hooks/useAuthContext";
import { useFavourites } from "../../Hooks/useFavourites.js";
import { useRating } from "../../Hooks/useRating";
import { apiKey } from "../../../env.js";
import axios from "axios";
import MovieCard from "../MovieCard";
import { Grid } from "@mui/material";
import DeleteButton from "../DeleteFavoriteButton";

// Define the Movie interface with relevant properties
interface Movie {
  id: number;
  // Add more properties as needed
}

const FavouritesList: React.FC = () => {
  // Access user data from the authentication context
  const { user } = useAuthContext();

  // State variables to manage loading, errors, and movie data
  const [isPending, setIsPending] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [moviesData, setMoviesData] = useState<Movie[]>([]);

  useEffect(() => {
    // Function to fetch user's favorite movies
    const fetchFavourites = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_API_URL}/${user.username}/favorites`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        // Fetch details for each favorite movie using promises
        const movieDetailsPromises = response.data.map((movieId: number) =>
          fetch(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`
          ).then((response) => response.json())
        );

        // Wait for all movie details promises to resolve
        const movieDetails = await Promise.all(movieDetailsPromises);
        setMoviesData(movieDetails);
        setIsPending(false);
      } catch (err: any) {
        setIsPending(false);
        setError(err.message);
      }
    };

    fetchFavourites(); // Invoke the fetchFavourites function when the component mounts
  }, []);

  // Function to handle movie deletion from favorites
  const handleMovieDeleted = (deletedMovieId: number) => {
    setMoviesData(moviesData.filter((movie) => movie.id !== deletedMovieId));
  };

  return (
    <div className="favourites-page">
      <Grid container spacing={1} sx={{ marginRight: "-8px!important" }}>
        {error && <div>{error}</div>}
        {isPending && <div>Loading...</div>}
        {!isPending && moviesData.length === 0 && (
          <div>Nothing added to favorites yet!</div>
        )}
        {moviesData &&
          moviesData.map((movie, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <MovieCard movie={movie} />
              <DeleteButton
                movieId={movie.id}
                onMovieDeleted={handleMovieDeleted}
              />
            </Grid>
          ))}
      </Grid>
    </div>
  );
};

export default FavouritesList;