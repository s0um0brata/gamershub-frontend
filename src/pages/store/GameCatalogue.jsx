import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, Gamepad2 } from "lucide-react";
import gameService from "../../services/gameService.js";
import categoryService from "../../services/categoryService.js";

function GameCatalogue() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getActiveCategories();

        setCategories(response?.data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sort, selectedCategory]);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);

      try {
        const response = await gameService.getAllGames({
          search,
          sort,
          category: selectedCategory,
          limit: 12,
          page: currentPage,
        });

        setGames(response?.data?.games || []);
        setPagination(response?.data?.pagination || null);
      } catch (error) {
        console.error("Failed to fetch games:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchGames, 400);

    return () => clearTimeout(timeout);
  }, [search, sort, selectedCategory, currentPage]);

  return (
    <section className="game-catalogue-section">
      <div className="game-catalogue-header">
        <div>
          <span className="game-catalogue-eyebrow">EXPLORE THE COLLECTION</span>
          <h2>Discover Your Next Game</h2>
          <p>Find your next adventure from our growing game collection.</p>
        </div>
      </div>
      <div className="game-category-filters">
        <button
          className={selectedCategory === "" ? "active" : ""}
          onClick={() => setSelectedCategory("")}
        >
          All Games
        </button>

        {categories.map((category) => (
          <button
            key={category._id}
            className={selectedCategory === category.slug ? "active" : ""}
            onClick={() => setSelectedCategory(category.slug)}
          >
            {category.name}
          </button>
        ))}
      </div>
      <div className="game-catalogue-toolbar">
        <div className="game-catalogue-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search games by title..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="game-catalogue-sort">
          <SlidersHorizontal size={18} />
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="title_asc">Name: A to Z</option>
            <option value="title_desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="game-catalogue-message">Loading games...</div>
      ) : games.length === 0 ? (
        <div className="game-catalogue-message">
          <Gamepad2 size={35} />
          <p>No games found. Try another search.</p>
        </div>
      ) : (
        <div className="game-catalogue-grid">
          {games.map((game) => (
            <Link
              to={`/game/${game.slug}`}
              className="catalogue-game-card"
              key={game._id}
            >
              <div className="catalogue-game-image-wrapper">
                <img src={game.coverImage} alt={game.title} loading="lazy" />
              </div>

              <div className="catalogue-game-info">
                <h3>{game.title}</h3>

                <div className="catalogue-game-genres">
                  {game.genres?.slice(0, 2).map((genre) => (
                    <span key={genre}>{genre}</span>
                  ))}
                </div>

                <div className="catalogue-game-price">
                  <strong>
                    ₹
                    {(Number(game.discountPrice ?? 0) > 0 &&
                    Number(game.discountPrice) < Number(game.price ?? 0)
                      ? Number(game.discountPrice)
                      : Number(game.price ?? 0)
                    ).toLocaleString("en-IN")}
                  </strong>

                  {game.discountPrice < game.price && (
                    <span>₹{game.price.toLocaleString("en-IN")}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {pagination && pagination.totalPages > 1 && (
        <div className="game-pagination">
          <button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={!pagination.hasPreviousPage}
          >
            Previous
          </button>

          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!pagination.hasNextPage}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}

export default GameCatalogue;
