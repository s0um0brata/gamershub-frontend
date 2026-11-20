import { useEffect, useState } from "react";
import {
  Gamepad2,
  Tags,
  CheckCircle2,
  FileEdit,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

import adminService from "../../services/adminService.js";
import "../../styles/adminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalGames: 0,
    publishedGames: 0,
    draftGames: 0,
    totalCategories: 0,
  });

  const [recentGames, setRecentGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        gamesResponse,
        publishedResponse,
        draftResponse,
        categoriesResponse,
      ] = await Promise.all([
        adminService.getAdminGames({ page: 1, limit: 5 }),
        adminService.getAdminGames({
          page: 1,
          limit: 1,
          status: "published",
        }),
        adminService.getAdminGames({
          page: 1,
          limit: 1,
          status: "draft",
        }),
        adminService.getAdminCategories(),
      ]);

      setStats({
        totalGames: gamesResponse.data?.pagination?.totalGames || 0,
        publishedGames: publishedResponse.data?.pagination?.totalGames || 0,
        draftGames: draftResponse.data?.pagination?.totalGames || 0,
        totalCategories: categoriesResponse.data?.totalCategories || 0,
      });

      setRecentGames(gamesResponse.data?.games || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load dashboard information.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "Total Games",
      value: stats.totalGames,
      icon: Gamepad2,
      className: "purple",
    },
    {
      title: "Published Games",
      value: stats.publishedGames,
      icon: CheckCircle2,
      className: "green",
    },
    {
      title: "Draft Games",
      value: stats.draftGames,
      icon: FileEdit,
      className: "orange",
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      icon: Tags,
      className: "blue",
    },
  ];

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price || 0);

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <span className="dashboard-eyebrow">
            <Sparkles size={15} />
            ADMIN CONTROL CENTER
          </span>

          <h1>
            Welcome to your
            <span> Gaming Universe.</span>
          </h1>

          <p>
            Manage your catalogue, organize games and keep your gaming store
            running smoothly.
          </p>

          <div className="dashboard-hero-status">
            <span className="dashboard-live-dot"></span>
            Your store management center is ready
          </div>
        </div>

        <div className="dashboard-hero-art">
          <div className="dashboard-orbit orbit-one"></div>
          <div className="dashboard-orbit orbit-two"></div>
          <div className="dashboard-game-icon">
            <Gamepad2 size={76} strokeWidth={1.3} />
          </div>
          <Sparkles className="dashboard-sparkle sparkle-one" size={24} />
          <Sparkles className="dashboard-sparkle sparkle-two" size={17} />
        </div>
      </section>

      <div className="dashboard-section-heading">
        <div>
          <h2>Store Overview</h2>
          <p>Your catalogue at a glance</p>
        </div>

        <button
          className="dashboard-refresh"
          onClick={fetchDashboardData}
          disabled={loading}
          type="button"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      <section className="dashboard-stats-grid">
        {statCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              className={`dashboard-stat-card ${card.className}`}
              key={card.title}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="dashboard-stat-top">
                <span>{card.title}</span>
                <div className="dashboard-stat-icon">
                  <Icon size={21} />
                </div>
              </div>

              <strong className="dashboard-stat-number">
                {loading ? "—" : card.value.toLocaleString("en-IN")}
              </strong>

              <span className="dashboard-stat-caption">
                Current catalogue count
              </span>
            </div>
          );
        })}
      </section>

      <section className="dashboard-recent-section">
        <div className="dashboard-section-heading">
          <div>
            <h2>Recently Added Games</h2>
            <p>Your latest catalogue additions</p>
          </div>
        </div>

        <div className="dashboard-recent-card">
          {loading ? (
            <div className="dashboard-empty">Loading recent games...</div>
          ) : recentGames.length === 0 ? (
            <div className="dashboard-empty">No games have been added yet.</div>
          ) : (
            recentGames.map((game) => (
              <div className="dashboard-recent-game" key={game._id}>
                <div className="dashboard-recent-game-info">
                  <img src={game.coverImage} alt={game.title} />

                  <div>
                    <strong>{game.title}</strong>
                    <span>{game.developer || "Unknown developer"}</span>
                  </div>
                </div>

                <div className="dashboard-recent-game-meta">
                  <strong>{formatPrice(game.price)}</strong>

                  <span className={`dashboard-game-status ${game.status}`}>
                    {game.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
