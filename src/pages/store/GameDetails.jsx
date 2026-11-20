import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Gamepad2,
  ShoppingCart,
  ArrowLeft,
  LoaderCircle,
  Heart,
} from "lucide-react";

import gameService from "../../services/gameService.js";
import wishlistService from "../../services/wishlistService.js";
import cartService from "../../services/cartService.js";

import StoreNavbar from "./StoreNavbar.jsx";
import StoreFooter from "./StoreFooter.jsx";

function GameDetails() {
  const { slug } = useParams();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [cartLoading, setCartLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    const fetchGameDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await gameService.getGameBySlug(slug);

        const fetchedGame = response?.data?.game || null;

        setGame(fetchedGame);

        if (fetchedGame?._id) {
          checkWishlistStatus(fetchedGame._id);
        }
      } catch (error) {
        console.error("Failed to fetch game details:", error);
        setError(
          error.response?.data?.message || "Failed to load game details.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchGameDetails();
    }
  }, [slug]);

  const checkWishlistStatus = async (gameId) => {
    try {
      const response = await wishlistService.getWishlist();

      const wishlistGames = response.data?.wishlist || [];

      setIsWishlisted(wishlistGames.some((item) => item._id === gameId));
    } catch (error) {
      console.error("Failed to check wishlist status:", error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!game?._id) return;

    try {
      setWishlistLoading(true);
      setWishlistMessage("");

      if (isWishlisted) {
        await wishlistService.removeFromWishlist(game._id);
        setIsWishlisted(false);
        setWishlistMessage("Removed from your wishlist.");
      } else {
        await wishlistService.addToWishlist(game._id);
        setIsWishlisted(true);
        setWishlistMessage("Added to your wishlist!");
      }
    } catch (error) {
      setWishlistMessage(
        error.response?.data?.message || "Unable to update your wishlist.",
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!game?._id) return;

    try {
      setCartLoading(true);
      setCartMessage("");

      await cartService.addToCart(game._id);

      setCartMessage("Game added to your cart!");
    } catch (error) {
      setCartMessage(
        error.response?.data?.message || "Unable to add game to your cart.",
      );
    } finally {
      setCartLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="game-details-page">
        <StoreNavbar />
        <div className="game-details-message">
          <LoaderCircle size={35} className="game-details-loader" />
          <p>Loading game details...</p>
        </div>
      </main>
    );
  }

  if (error || !game) {
    return (
      <main className="game-details-page">
        <StoreNavbar />
        <div className="game-details-message">
          <Gamepad2 size={40} />
          <h2>{error ? "Something went wrong" : "Game Not Found"}</h2>
          <p>{error || "The game you're looking for doesn't exist."}</p>
          <Link to="/">
            {" "}
            <ArrowLeft size={17} /> Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="game-details-page">
        <StoreNavbar />
        <section className="game-details-hero">
          <div className="game-details-back">
            <Link to="/">
              <ArrowLeft size={17} />
              Back to Store
            </Link>
          </div>

          <div className="game-details-hero-content">
            <div className="game-details-cover">
              <img src={game.coverImage} alt={game.title} />
            </div>

            <div className="game-details-info">
              <span className="game-details-eyebrow">GAME DETAILS</span>

              <h1>{game.title}</h1>

              <p>{game.shortDescription}</p>
              <div className="game-details-tags">
                {game.categories?.map((category) => (
                  <span key={category._id}>{category.name}</span>
                ))}

                {game.genres?.map((genre) => (
                  <span key={genre}>{genre}</span>
                ))}
              </div>
              <div className="game-details-pricing">
                <strong>
                  ₹
                  {(Number(game.discountPrice ?? 0) > 0 &&
                  Number(game.discountPrice) < Number(game.price ?? 0)
                    ? Number(game.discountPrice)
                    : Number(game.price ?? 0)
                  ).toLocaleString("en-IN")}
                </strong>

                {Number(game.discountPrice ?? 0) > 0 &&
                  Number(game.discountPrice) < Number(game.price ?? 0) && (
                    <>
                      <span className="game-details-original-price">
                        ₹{Number(game.price).toLocaleString("en-IN")}
                      </span>
                      <span className="game-details-discount">
                        {Math.round(
                          ((Number(game.price) - Number(game.discountPrice)) /
                            Number(game.price)) *
                            100,
                        )}
                        % OFF
                      </span>
                    </>
                  )}
              </div>
              <div className="game-details-actions">
                <button
                  className={`game-wishlist-btn ${isWishlisted ? "active" : ""}`}
                  type="button"
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                >
                  {wishlistLoading ? (
                    <LoaderCircle size={19} className="game-details-loader" />
                  ) : (
                    <Heart
                      size={19}
                      fill={isWishlisted ? "currentColor" : "none"}
                    />
                  )}

                  {wishlistLoading
                    ? "Please wait..."
                    : isWishlisted
                      ? "Remove from Wishlist"
                      : "Add to Wishlist"}
                </button>
                <button
                  className="game-add-to-cart-btn"
                  type="button"
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                >
                  {cartLoading ? (
                    <LoaderCircle size={19} className="game-details-loader" />
                  ) : (
                    <ShoppingCart size={19} />
                  )}

                  {cartLoading ? "Adding..." : "Add to Cart"}
                </button>

                <button className="game-buy-now-btn" type="button">
                  Buy Now
                </button>
              </div>
              {wishlistMessage && (
                <p className="wishlist-message">{wishlistMessage}</p>
              )}
              {cartMessage && <p className="cart-message">{cartMessage}</p>}
            </div>
          </div>
        </section>
        {game.screenshots?.length > 0 && (
          <section className="game-details-screenshots">
            <div className="game-details-section-header">
              <span>GAMEPLAY</span>
              <h2>Screenshots</h2>
            </div>

            <div className="game-screenshots-grid">
              {game.screenshots.map((screenshot, index) => (
                <div className="game-screenshot-card" key={index}>
                  <img
                    src={screenshot}
                    alt={`${game.title} screenshot ${index + 1}`}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
        {game.description && (
          <section className="game-details-description">
            <div className="game-details-section-header">
              <span>ABOUT THE GAME</span>
              <h2>Game Overview</h2>
            </div>

            <p>{game.description}</p>
          </section>
        )}
        {game.systemRequirements && (
          <section className="game-details-requirements">
            <div className="game-details-section-header">
              <span>PC SPECIFICATIONS</span>
              <h2>System Requirements</h2>
            </div>

            <div className="game-requirements-grid">
              <div className="game-requirement-card">
                <h3>Minimum Requirements</h3>

                <div>
                  <span>Operating System</span>
                  <p>
                    {game.systemRequirements.minimum?.os || "Not specified"}
                  </p>
                </div>

                <div>
                  <span>Processor</span>
                  <p>
                    {game.systemRequirements.minimum?.processor ||
                      "Not specified"}
                  </p>
                </div>

                <div>
                  <span>Memory</span>
                  <p>
                    {game.systemRequirements.minimum?.memory || "Not specified"}
                  </p>
                </div>

                <div>
                  <span>Graphics</span>
                  <p>
                    {game.systemRequirements.minimum?.graphics ||
                      "Not specified"}
                  </p>
                </div>

                <div>
                  <span>Storage</span>
                  <p>
                    {game.systemRequirements.minimum?.storage ||
                      "Not specified"}
                  </p>
                </div>
              </div>

              <div className="game-requirement-card">
                <h3>Recommended Requirements</h3>

                <div>
                  <span>Operating System</span>
                  <p>
                    {game.systemRequirements.recommended?.os || "Not specified"}
                  </p>
                </div>

                <div>
                  <span>Processor</span>
                  <p>
                    {game.systemRequirements.recommended?.processor ||
                      "Not specified"}
                  </p>
                </div>

                <div>
                  <span>Memory</span>
                  <p>
                    {game.systemRequirements.recommended?.memory ||
                      "Not specified"}
                  </p>
                </div>

                <div>
                  <span>Graphics</span>
                  <p>
                    {game.systemRequirements.recommended?.graphics ||
                      "Not specified"}
                  </p>
                </div>

                <div>
                  <span>Storage</span>
                  <p>
                    {game.systemRequirements.recommended?.storage ||
                      "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <StoreFooter />
    </>
  );
}

export default GameDetails;
