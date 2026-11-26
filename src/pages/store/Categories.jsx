import { useEffect, useState } from "react";
import { Tags, LoaderCircle, X } from "lucide-react";

import adminService from "../../services/adminService.js";
import gameService from "../../services/gameService.js";
import StoreNavbar from "./StoreNavbar.jsx";
import StoreFooter from "./StoreFooter.jsx";
import { useNavigate } from "react-router-dom";

function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryGames, setCategoryGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [gamesError, setGamesError] = useState("");

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setCategoryGames([]);
    setGamesError("");

    try {
      setGamesLoading(true);

      const response = await gameService.getAllGames({
        category: category.slug,
        limit: 50,
      });

      setCategoryGames(response.data?.games || []);
    } catch (error) {
      setGamesError(
        error.response?.data?.message ||
          "Unable to load games for this category.",
      );
    } finally {
      setGamesLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await adminService.getPublicCategories();

        setCategories(response.data || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load categories. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      <StoreNavbar />

      <main className="store-categories-page">
        <section className="store-categories-container">
          <div className="store-categories-heading">
            <span>EXPLORE YOUR NEXT ADVENTURE</span>
            <h1>Game Categories</h1>
            <p>
              Discover games across different genres and find your next
              favourite experience.
            </p>
          </div>

          {loading ? (
            <div className="game-details-message">
              <LoaderCircle size={32} className="game-details-loader" />
              <p>Loading categories...</p>
            </div>
          ) : error ? (
            <div className="game-details-message">
              <p>{error}</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="game-details-message">
              <Tags size={35} />
              <p>No active categories available.</p>
            </div>
          ) : (
            <div className="store-categories-grid">
              {categories.map((category) => (
                <div
                  className="store-category-card"
                  key={category._id}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="store-category-card-content">
                    <span className="store-category-icon">
                      <Tags size={22} />
                    </span>

                    <h2>{category.name}</h2>

                    <p>
                      {category.description ||
                        `Explore our ${category.name} games collection.`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        {selectedCategory && (
          <div
            className="category-modal-overlay"
            onClick={() => setSelectedCategory(null)}
          >
            <div
              className="category-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="category-modal-header">
                <div>
                  <span>EXPLORE COLLECTION</span>
                  <h2>{selectedCategory.name}</h2>
                  <p>
                    {selectedCategory.description ||
                      `Explore our ${selectedCategory.name} games collection.`}
                  </p>
                </div>

                <button
                  className="category-modal-close"
                  onClick={() => setSelectedCategory(null)}
                  aria-label="Close modal"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="category-modal-body">
                {gamesLoading ? (
                  <div className="game-details-message">
                    <LoaderCircle size={32} className="game-details-loader" />
                    <p>Loading games...</p>
                  </div>
                ) : gamesError ? (
                  <div className="game-details-message">
                    <p>{gamesError}</p>
                  </div>
                ) : categoryGames.length === 0 ? (
                  <div className="game-details-message">
                    <Tags size={32} />
                    <p>No games available in this category yet.</p>
                  </div>
                ) : (
                  <div className="category-modal-games">
                    {categoryGames.map((game) => (
                      <div
                        className="category-modal-game"
                        key={game._id}
                        onClick={() => navigate(`/game/${game.slug}`)}
                      >
                        <img src={game.coverImage} alt={game.title} />

                        <div className="category-modal-game-info">
                          <h3>{game.title}</h3>
                          <p>
                            ₹
                            {(game.discountPrice != null &&
                            game.discountPrice < game.price
                              ? game.discountPrice
                              : game.price
                            )?.toLocaleString("en-IN") ?? "N/A"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <StoreFooter />
    </>
  );
}

export default Categories;
