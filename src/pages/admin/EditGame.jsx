import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImagePlus } from "lucide-react";

import adminService from "../../services/adminService.js";
import "../../styles/addGame.css";

function EditGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [existingCover, setExistingCover] = useState("");
  const [existingScreenshots, setExistingScreenshots] = useState([]);
  const [coverPreview, setCoverPreview] = useState(null);
  const [screenshotPreviews, setScreenshotPreviews] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    price: "",
    discountPrice: "",
    developer: "",
    publisher: "",
    releaseDate: "",
    status: "draft",
    platforms: "",
    genres: "",
    categories: [],
    isFeatured: false,
    minimum: {
      os: "",
      processor: "",
      memory: "",
      graphics: "",
      storage: "",
    },
    recommended: {
      os: "",
      processor: "",
      memory: "",
      graphics: "",
      storage: "",
    },
  });

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true);
        setError("");

        const [gameResponse, categoryResponse] = await Promise.all([
          adminService.getAdminGameById(gameId),
          adminService.getAdminCategories(),
        ]);

        const game = gameResponse.data.game;

        setCategories(categoryResponse.data.categories || []);

        setExistingCover(game.coverImage || "");
        setExistingScreenshots(game.screenshots || []);

        setFormData({
          title: game.title || "",
          slug: game.slug || "",
          shortDescription: game.shortDescription || "",
          description: game.description || "",
          price: game.price ?? "",
          discountPrice: game.discountPrice ?? "",
          developer: game.developer || "",
          publisher: game.publisher || "",
          releaseDate: game.releaseDate
            ? new Date(game.releaseDate).toISOString().slice(0, 10)
            : "",
          status: game.status || "draft",
          platforms: Array.isArray(game.platforms)
            ? game.platforms.join(", ")
            : "",
          genres: Array.isArray(game.genres) ? game.genres.join(", ") : "",
          categories: (game.categories || []).map((category) =>
            typeof category === "object" ? category._id : category,
          ),
          isFeatured: Boolean(game.isFeatured),
          minimum: {
            os: game.systemRequirements?.minimum?.os || "",
            processor: game.systemRequirements?.minimum?.processor || "",
            memory: game.systemRequirements?.minimum?.memory || "",
            graphics: game.systemRequirements?.minimum?.graphics || "",
            storage: game.systemRequirements?.minimum?.storage || "",
          },
          recommended: {
            os: game.systemRequirements?.recommended?.os || "",
            processor: game.systemRequirements?.recommended?.processor || "",
            memory: game.systemRequirements?.recommended?.memory || "",
            graphics: game.systemRequirements?.recommended?.graphics || "",
            storage: game.systemRequirements?.recommended?.storage || "",
          },
        });
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load game information.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [gameId]);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      screenshotPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [coverPreview, screenshotPreviews]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRequirementChange = (type, event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [type]: {
        ...previous[type],
        [name]: value,
      },
    }));
  };

  const handleCategoriesChange = (categoryId) => {
    setFormData((previous) => ({
      ...previous,
      categories: previous.categories.includes(categoryId)
        ? previous.categories.filter((id) => id !== categoryId)
        : [...previous.categories, categoryId],
    }));
  };

  const validateImageFile = (file) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        `${file.name}: Only JPEG, PNG, WEBP and AVIF images are allowed.`,
      );
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(`${file.name}: Image size must not exceed 5 MB.`);
      return false;
    }

    return true;
  };

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!validateImageFile(file)) {
      event.target.value = "";
      return;
    }

    setCoverPreview(URL.createObjectURL(file));
  };

  const handleScreenshotsChange = (event) => {
    const files = Array.from(event.target.files || []);

    setError("");

    if (files.length > 5) {
      setError("You can upload a maximum of 5 new screenshots at a time.");
      event.target.value = "";
      return;
    }

    const invalidFile = files.find((file) => !validateImageFile(file));

    if (invalidFile) {
      event.target.value = "";
      return;
    }

    const previews = files.map((file) => URL.createObjectURL(file));
    setScreenshotPreviews(previews);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      formData.discountPrice !== "" &&
      Number(formData.discountPrice) >= Number(formData.price)
    ) {
      setError("Discount price must be lower than regular price.");
      return;
    }

    const coverFile = document.getElementById("editCoverImage")?.files?.[0];
    const screenshotFiles = Array.from(
      document.getElementById("editScreenshots")?.files || [],
    );

    const payload = new FormData();

    payload.append("title", formData.title.trim());
    payload.append("slug", formData.slug.trim());
    payload.append("description", formData.description.trim());
    payload.append("shortDescription", formData.shortDescription.trim());
    payload.append("price", formData.price);

    if (formData.discountPrice !== "") {
      payload.append("discountPrice", formData.discountPrice);
    }

    payload.append("developer", formData.developer.trim());
    payload.append("publisher", formData.publisher.trim());
    payload.append("status", formData.status);
    payload.append("releaseDate", formData.releaseDate);

    payload.append(
      "platforms",
      JSON.stringify(
        formData.platforms
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    );

    payload.append(
      "genres",
      JSON.stringify(
        formData.genres
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    );

    payload.append("categories", JSON.stringify(formData.categories));
    payload.append("isFeatured", String(formData.isFeatured));

    payload.append(
      "systemRequirements",
      JSON.stringify({
        minimum: formData.minimum,
        recommended: formData.recommended,
      }),
    );

    if (coverFile) {
      payload.append("coverImage", coverFile);
    }

    screenshotFiles.forEach((file) => {
      payload.append("screenshots", file);
    });

    try {
      setIsSubmitting(true);

      const response = await adminService.updateGame(gameId, payload);

      setSuccess(response.message || "Game updated successfully!");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setTimeout(() => {
        navigate("/admin/games");
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update game. Please try again.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="add-game-page">
        <div className="games-message">Loading game information...</div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="add-game-page">
        <div className="form-message error-message">{error}</div>
        <Link to="/admin/games" className="admin-back-link">
          <ArrowLeft size={18} />
          Back to Manage Games
        </Link>
      </div>
    );
  }

  return (
    <div className="add-game-page">
      <Link to="/admin/games" className="admin-back-link">
        <ArrowLeft size={18} />
        Back to Manage Games
      </Link>

      <div className="admin-page-header">
        <div>
          <h1>Edit Game</h1>
          <p>Update the information and images for this game.</p>
        </div>
      </div>

      {error && <div className="form-message error-message">{error}</div>}
      {success && <div className="form-message success-message">{success}</div>}

      <form className="add-game-form" onSubmit={handleSubmit}>
        <section className="add-game-section">
          <div className="add-game-section-header">
            <h2>Basic Information</h2>
            <p>Update the game's essential details.</p>
          </div>

          <div className="add-game-grid">
            <div className="add-game-field">
              <label htmlFor="edit-title">Game Title *</label>
              <input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="add-game-field">
              <label htmlFor="edit-slug">Game Slug *</label>
              <input
                id="edit-slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="add-game-field full-width">
              <label htmlFor="edit-shortDescription">Short Description</label>
              <input
                id="edit-shortDescription"
                name="shortDescription"
                maxLength={300}
                value={formData.shortDescription}
                onChange={handleInputChange}
              />
            </div>

            <div className="add-game-field full-width">
              <label htmlFor="edit-description">Description *</label>
              <textarea
                id="edit-description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </section>

        <section className="add-game-section">
          <div className="add-game-section-header">
            <h2>Pricing</h2>
            <p>Update the regular and discounted prices.</p>
          </div>

          <div className="add-game-grid">
            <div className="add-game-field">
              <label htmlFor="edit-price">Regular Price (₹) *</label>
              <input
                id="edit-price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="add-game-field">
              <label htmlFor="edit-discountPrice">Discount Price (₹)</label>
              <input
                id="edit-discountPrice"
                name="discountPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.discountPrice}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </section>

        <section className="add-game-section">
          <div className="add-game-section-header">
            <h2>Game Details</h2>
            <p>Update developer, publisher and classification details.</p>
          </div>

          <div className="add-game-grid">
            <div className="add-game-field">
              <label htmlFor="edit-developer">Developer</label>
              <input
                id="edit-developer"
                name="developer"
                value={formData.developer}
                onChange={handleInputChange}
              />
            </div>

            <div className="add-game-field">
              <label htmlFor="edit-publisher">Publisher</label>
              <input
                id="edit-publisher"
                name="publisher"
                value={formData.publisher}
                onChange={handleInputChange}
              />
            </div>

            <div className="add-game-field">
              <label htmlFor="edit-releaseDate">Release Date</label>
              <input
                id="edit-releaseDate"
                name="releaseDate"
                type="date"
                value={formData.releaseDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="add-game-field">
              <label htmlFor="edit-status">Game Status</label>
              <select
                id="edit-status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="add-game-field full-width">
              <label htmlFor="edit-platforms">Platforms</label>
              <input
                id="edit-platforms"
                name="platforms"
                value={formData.platforms}
                onChange={handleInputChange}
              />
              <small>Separate multiple platforms with commas.</small>
            </div>

            <div className="add-game-field full-width">
              <label htmlFor="edit-genres">Genres</label>
              <input
                id="edit-genres"
                name="genres"
                value={formData.genres}
                onChange={handleInputChange}
              />
              <small>Separate multiple genres with commas.</small>
            </div>

            <div className="add-game-field full-width">
              <label>Categories</label>

              <div className="category-selection-grid">
                {categories.map((category) => {
                  const selected = formData.categories.includes(category._id);

                  return (
                    <button
                      type="button"
                      key={category._id}
                      className={`category-selection-option ${
                        selected ? "selected" : ""
                      }`}
                      onClick={() => handleCategoriesChange(category._id)}
                    >
                      <span className="category-selection-check">
                        {selected ? "✓" : ""}
                      </span>
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="add-game-field full-width">
              <label className="add-game-checkbox">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                />
                Mark this game as Featured
              </label>
            </div>
          </div>
        </section>

        <section className="add-game-section">
          <div className="add-game-section-header">
            <h2>Game Images</h2>
            <p>Replace the cover image or add more screenshots.</p>
          </div>

          <div className="add-game-grid">
            <div className="add-game-field full-width">
              <label>Current Cover Image</label>

              <img
                src={coverPreview || existingCover}
                alt="Current game cover"
                className="cover-image-preview"
              />

              <label htmlFor="editCoverImage">Replace Cover Image</label>
              <input
                type="file"
                id="editCoverImage"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleCoverChange}
              />
              <small>
                Optional. Leave empty to keep the existing cover image. Maximum
                size: 5 MB.
              </small>
            </div>

            <div className="add-game-field full-width">
              <label>Existing Screenshots</label>

              {existingScreenshots.length > 0 ? (
                <div className="screenshot-preview-grid">
                  {existingScreenshots.map((screenshot, index) => (
                    <img
                      key={`${screenshot}-${index}`}
                      src={screenshot}
                      alt={`Existing screenshot ${index + 1}`}
                      className="screenshot-image-preview"
                    />
                  ))}
                </div>
              ) : (
                <small>No screenshots have been uploaded.</small>
              )}

              <label htmlFor="editScreenshots">Add New Screenshots</label>
              <input
                type="file"
                id="editScreenshots"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                onChange={handleScreenshotsChange}
              />
              <small>Optional. Maximum 5 new screenshots per update.</small>

              {screenshotPreviews.length > 0 && (
                <div className="image-preview-container">
                  <p>New Screenshot Previews</p>
                  <div className="screenshot-preview-grid">
                    {screenshotPreviews.map((preview, index) => (
                      <img
                        key={`${preview}-${index}`}
                        src={preview}
                        alt={`New screenshot ${index + 1}`}
                        className="screenshot-image-preview"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="add-game-section">
          <div className="add-game-section-header">
            <h2>System Requirements</h2>
            <p>Update minimum and recommended PC specifications.</p>
          </div>

          <div className="requirements-grid">
            {["minimum", "recommended"].map((type) => (
              <div className="requirements-card" key={type}>
                <h3>
                  {type === "minimum"
                    ? "Minimum Requirements"
                    : "Recommended Requirements"}
                </h3>

                {[
                  ["os", "Operating System"],
                  ["processor", "Processor"],
                  ["memory", "Memory"],
                  ["graphics", "Graphics"],
                  ["storage", "Storage"],
                ].map(([name, label]) => (
                  <div className="add-game-field" key={name}>
                    <label htmlFor={`${type}-${name}`}>{label}</label>
                    <input
                      id={`${type}-${name}`}
                      name={name}
                      value={formData[type][name]}
                      onChange={(event) => handleRequirementChange(type, event)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <div className="add-game-actions">
          <Link to="/admin/games" className="btn btn-secondary">
            Cancel
          </Link>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditGame;
