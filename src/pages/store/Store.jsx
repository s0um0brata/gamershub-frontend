import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

import gameService from "../../services/gameService.js";
import adminService from "../../services/adminService.js";

import StoreNavbar from "./StoreNavbar.jsx";
import StoreFooter from "./StoreFooter.jsx";

function Store() {
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalGames: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [filters, setFilters] = useState({
    category: "",
    platform: "",
    genre: "",
    minPrice: "",
    maxPrice: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);

  // Search games currently loaded
  const filteredGames = useMemo(() => {
    if (!searchQuery.trim()) return games;

    const query = searchQuery.toLowerCase();

    return games.filter(
      (game) =>
        game.title.toLowerCase().includes(query) ||
        game.description?.toLowerCase().includes(query),
    );
  }, [games, searchQuery]);

  // Sort games currently loaded
  const sortedGames = useMemo(() => {
    const sorted = [...filteredGames];

    switch (sortBy) {
      case "price-low":
        return sorted.sort(
          (a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price),
        );

      case "price-high":
        return sorted.sort(
          (a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price),
        );

      case "name":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));

      default:
        return sorted;
    }
  }, [filteredGames, sortBy]);

  // Fetch games
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page: pagination.currentPage,
          limit: 12,
          sort: sortBy,
        };

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (filters.category) {
          params.category = filters.category;
        }

        if (filters.platform.trim()) {
          params.platform = filters.platform.trim();
        }

        if (filters.genre.trim()) {
          params.genre = filters.genre.trim();
        }

        if (filters.minPrice !== "") {
          params.minPrice = filters.minPrice;
        }

        if (filters.maxPrice !== "") {
          params.maxPrice = filters.maxPrice;
        }

        const response = await gameService.getAllGames(params);

        setGames(response.data?.games || []);
        setPagination(response.data?.pagination);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load games. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [pagination.currentPage, searchQuery, filters, sortBy]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await adminService.getPublicCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error("Unable to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 600px)").matches;

    if (showFilters && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showFilters]);

  return (
    <>
      <StoreNavbar />

      <main className="store-page">
        <section className="store-page-container">
          {/* Store Header */}
          <div className="store-page-header">
            <div className="store-page-heading">
              <span className="store-page-eyebrow">
                YOUR GAMING DESTINATION
              </span>

              <h1>
                Discover Your Next <span>Game</span>
              </h1>

              <p>
                Explore our collection of PC games, discover exciting
                adventures, and find your next favourite game.
              </p>
            </div>

            {/* Search and Filter Toolbar */}
            <div className="store-page-toolbar">
              <div className="store-page-search">
                <Search size={20} />

                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button
                className="store-filter-button"
                onClick={() => setShowFilters((prev) => !prev)}
              >
                <SlidersHorizontal size={18} />
                Filters
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          <aside
            className={`store-filter-panel ${showFilters ? "active" : ""}`}
          >
            <div className="store-filter-heading">
              <h3>Filters</h3>

              <button onClick={() => setShowFilters(false)}>Close</button>
            </div>

            <div className="store-filter-group">
              <label htmlFor="store-category">Category</label>

              <select
                id="store-category"
                value={filters.category}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    category: e.target.value,
                  })
                }
              >
                <option value="">All Categories</option>

                {categories.map((category) => (
                  <option key={category._id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="store-filter-group">
              <label htmlFor="store-platform">Platform</label>

              <input
                id="store-platform"
                type="text"
                placeholder="e.g. PC"
                value={filters.platform}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    platform: e.target.value,
                  })
                }
              />
            </div>

            <div className="store-filter-group">
              <label htmlFor="store-genre">Genre</label>

              <input
                id="store-genre"
                type="text"
                placeholder="e.g. Action"
                value={filters.genre}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    genre: e.target.value,
                  })
                }
              />
            </div>

            <div className="store-filter-group">
              <label htmlFor="store-min-price">Minimum Price (₹)</label>

              <input
                id="store-min-price"
                type="number"
                min="0"
                placeholder="Minimum price"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    minPrice: e.target.value,
                  })
                }
              />
            </div>

            <div className="store-filter-group">
              <label htmlFor="store-max-price">Maximum Price (₹)</label>

              <input
                id="store-max-price"
                type="number"
                min="0"
                placeholder="Maximum price"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    maxPrice: e.target.value,
                  })
                }
              />
            </div>
          </aside>

          {/* Results Toolbar */}
          <div className="store-page-results">
            <span>Explore Games</span>

            <div className="store-page-results-right">
              <span>{pagination.totalGames} games available</span>

              <select
                className="store-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="title_asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Games */}
          {loading ? (
            <div className="game-details-message">
              <p>Loading games...</p>
            </div>
          ) : error ? (
            <div className="game-details-message">
              <p>{error}</p>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="game-details-message">
              <p>No games found.</p>
            </div>
          ) : (
            <>
              <div className="store-games-grid">
                {sortedGames.map((game) => {
                  const hasDiscount =
                    game.discountPrice != null &&
                    game.discountPrice < game.price;

                  const finalPrice = hasDiscount
                    ? game.discountPrice
                    : game.price;

                  const discountPercentage = hasDiscount
                    ? Math.round(
                        ((game.price - game.discountPrice) / game.price) * 100,
                      )
                    : 0;

                  return (
                    <div
                      className="store-game-card"
                      key={game._id}
                      onClick={() => navigate(`/game/${game.slug}`)}
                    >
                      <div className="store-game-image-wrapper">
                        <img
                          src={game.coverImage}
                          alt={game.title}
                          className="store-game-image"
                          loading="lazy"
                        />

                        {hasDiscount && (
                          <span className="store-game-discount">
                            -{discountPercentage}%
                          </span>
                        )}
                      </div>

                      <div className="store-game-card-content">
                        <h3>{game.title}</h3>

                        <div className="store-game-price">
                          {hasDiscount && (
                            <span className="store-game-original-price">
                              ₹{game.price.toLocaleString("en-IN")}
                            </span>
                          )}

                          <strong>
                            ₹{finalPrice?.toLocaleString("en-IN") ?? "N/A"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="store-pagination">
                  <button
                    className="store-pagination-button"
                    disabled={!pagination.hasPreviousPage}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        currentPage: prev.currentPage - 1,
                      }))
                    }
                  >
                    Previous
                  </button>

                  <div className="store-pagination-numbers">
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, index) => index + 1,
                    ).map((page) => (
                      <button
                        key={page}
                        className={`store-pagination-number ${
                          pagination.currentPage === page ? "active" : ""
                        }`}
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            currentPage: page,
                          }))
                        }
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    className="store-pagination-button"
                    disabled={!pagination.hasNextPage}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        currentPage: prev.currentPage + 1,
                      }))
                    }
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <StoreFooter />
    </>
  );
}

export default Store;
