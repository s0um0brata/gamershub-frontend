import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gamepad2 } from "lucide-react";
import gameService from "../../services/gameService.js";

function FeaturedGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedGames = async () => {
      try {
        const response = await gameService.getFeaturedGames({
          limit: 8,
        });

        setGames(response?.data?.games || []);
      } catch (error) {
        console.error("Failed to fetch featured games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedGames();
  }, []);

  return (
    <section className="featured-games-section">
      <div className="featured-games-header">
        <div>
          <span className="featured-games-eyebrow">HANDPICKED FOR YOU</span>
          <h2>Featured Games</h2>
          <p>Discover some of the best games in our collection.</p>
        </div>

        <Link to="/store" className="featured-view-all">
          View All <ArrowRight size={17} />
        </Link>
      </div>

      {loading ? (
        <div className="featured-games-message">Loading featured games...</div>
      ) : games.length === 0 ? (
        <div className="featured-games-message">
          <Gamepad2 size={30} />
          <p>No featured games available right now.</p>
        </div>
      ) : (
        <div className="featured-games-grid">
          {games.map((game) => (
            <Link
              to={`/game/${game.slug}`}
              className="featured-game-card"
              key={game._id}
            >
              <div className="featured-game-image-wrapper">
                <img
                  src={game.coverImage}
                  alt={game.title}
                  className="featured-game-image"
                  loading="lazy"
                />

                <span className="featured-game-badge">FEATURED</span>
              </div>

              <div className="featured-game-info">
                <h3>{game.title}</h3>

                <div className="featured-game-genres">
                  {game.genres?.slice(0, 2).map((genre) => (
                    <span key={genre}>{genre}</span>
                  ))}
                </div>

                <div className="featured-game-price">
                  {game.discountPrice < game.price && (
                    <span className="featured-game-old-price">
                      ₹{game.price.toLocaleString("en-IN")}
                    </span>
                  )}

                  <strong>
                    ₹
                    {(Number(game.discountPrice ?? 0) > 0 &&
                    Number(game.discountPrice) < Number(game.price ?? 0)
                      ? Number(game.discountPrice)
                      : Number(game.price ?? 0)
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default FeaturedGames;
