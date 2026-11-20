import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import gameService from "../../services/gameService.js";

function StoreHero() {
  const [featuredGame, setFeaturedGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedGame = async () => {
      try {
        const response = await gameService.getFeaturedGames({
          limit: 1,
        });

        const games = response?.data?.games || [];
        setFeaturedGame(games[0] || null);
      } catch (error) {
        console.error("Failed to fetch featured game:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedGame();
  }, []);

  if (loading) {
    return (
      <section className="store-hero store-hero-loading">
        Loading featured game...
      </section>
    );
  }

  if (!featuredGame) {
    return null;
  }

  return (
    <section className="store-hero">
      <div
        className="store-hero-background"
        style={{
          backgroundImage: `url(${featuredGame.coverImage})`,
        }}
      />

      <div className="store-hero-overlay" />

      <div className="store-hero-content">
        <span className="store-hero-label">
          <span className="store-hero-label-dot" />
          FEATURED GAME
        </span>

        <h1>{featuredGame.title}</h1>

        <p>
          {featuredGame.shortDescription ||
            featuredGame.description?.slice(0, 180)}
        </p>

        <div className="store-hero-meta">
          {featuredGame.categories?.slice(0, 3).map((category) => (
            <span key={category._id}>{category.name}</span>
          ))}
        </div>

        <div className="store-hero-actions">
          <Link
            to={`/game/${featuredGame.slug}`}
            className="store-hero-primary-button"
          >
            <Play size={17} fill="currentColor" />
            Explore Game
          </Link>

          <Link to="/store" className="store-hero-secondary-button">
            Browse Store
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default StoreHero;
