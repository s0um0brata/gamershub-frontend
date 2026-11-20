import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, RefreshCw, Pencil, Trash2 } from "lucide-react";

import adminService from "../../services/adminService.js";
import "../../styles/adminGames.css";

function AdminGames() {
  const [games, setGames] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalGames: 0,
    limit: 10,
  });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminService.getAdminGames({
        page: pagination.currentPage,
        limit: pagination.limit,
        status: status || undefined,
        search: search || undefined,
      });

      setGames(response.data?.games || []);
      setPagination((previous) => ({
        ...previous,
        ...response.data?.pagination,
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load games. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [pagination.currentPage, status, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((previous) => ({
      ...previous,
      currentPage: 1,
    }));
    setSearch(searchInput.trim());
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPagination((previous) => ({
      ...previous,
      currentPage: 1,
    }));
  };

  const handlePermanentDelete = async (game) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${game.title}"?\n\nThis will remove the game from the database and delete its Cloudinary images. This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setError("");

      await adminService.permanentlyDeleteGame(game._id);

      await fetchGames();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to permanently delete this game. Please try again.",
      );
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <div className="games-page">
      <div className="games-page-header">
        <div>
          <h1>Manage Games</h1>
          <p>View and manage your store's game catalogue.</p>
        </div>

        <span className="games-total">{pagination.totalGames} Games</span>
      </div>

      <div className="games-toolbar">
        <form className="games-search" onSubmit={handleSearch}>
          <Search size={18} />

          <input
            type="text"
            placeholder="Search games by title..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          <button type="submit">Search</button>
        </form>

        <select
          className="games-status-filter"
          value={status}
          onChange={handleStatusChange}
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        <button
          className="games-refresh"
          type="button"
          onClick={fetchGames}
          disabled={loading}
          title="Refresh games"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {error && <div className="games-error">{error}</div>}

      <div className="games-table-container">
        {loading ? (
          <div className="games-message">Loading games...</div>
        ) : games.length === 0 ? (
          <div className="games-message">No games found.</div>
        ) : (
          <div className="games-table-scroll">
            <table className="games-table">
              <thead>
                <tr>
                  <th>Game</th>
                  <th>Price</th>
                  <th>Categories</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Added On</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {games.map((game) => (
                  <tr key={game._id}>
                    <td>
                      <div className="game-info">
                        <img src={game.coverImage} alt={game.title} />

                        <div>
                          <strong>{game.title}</strong>
                          <span>{game.developer || "Unknown developer"}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="game-price">
                        {game.discountPrice != null ? (
                          <>
                            <strong>{formatPrice(game.discountPrice)}</strong>
                            <span>{formatPrice(game.price)}</span>
                          </>
                        ) : (
                          <strong>{formatPrice(game.price)}</strong>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="game-categories">
                        {game.categories?.length
                          ? game.categories.map((category) => (
                              <span
                                className="game-category-badge"
                                key={category._id}
                              >
                                {category.name}
                              </span>
                            ))
                          : "—"}
                      </div>
                    </td>

                    <td>
                      <span className={`game-status ${game.status}`}>
                        {game.status}
                      </span>
                    </td>

                    <td>{game.isFeatured ? "Yes" : "No"}</td>

                    <td>
                      {new Date(game.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <div className="game-actions">
                        <Link
                          to={`/admin/games/edit/${game._id}`}
                          className="game-edit-btn"
                          title="Edit game"
                        >
                          <Pencil size={16} />
                          Edit
                        </Link>

                        <button
                          type="button"
                          className="game-delete-btn"
                          title="Permanently delete game"
                          onClick={() => handlePermanentDelete(game)}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="games-pagination">
        <span>
          Page {pagination.currentPage} of {Math.max(1, pagination.totalPages)}
        </span>

        <div>
          <button
            type="button"
            disabled={loading || pagination.currentPage <= 1}
            onClick={() =>
              setPagination((previous) => ({
                ...previous,
                currentPage: previous.currentPage - 1,
              }))
            }
          >
            Previous
          </button>

          <button
            type="button"
            disabled={
              loading || pagination.currentPage >= pagination.totalPages
            }
            onClick={() =>
              setPagination((previous) => ({
                ...previous,
                currentPage: previous.currentPage + 1,
              }))
            }
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminGames;
