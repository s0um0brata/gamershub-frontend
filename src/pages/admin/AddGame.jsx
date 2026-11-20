import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../../styles/addGame.css";

import adminService from "../../services/adminService.js";

function AddGame() {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState("");
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
    platforms: "PC",
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleCategoriesChange = (categoryId) => {
    setFormData((previous) => {
      const isSelected = previous.categories.includes(categoryId);

      return {
        ...previous,
        categories: isSelected
          ? previous.categories.filter((id) => id !== categoryId)
          : [...previous.categories, categoryId],
      };
    });
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitError("");
    setSubmitSuccess("");
    setIsSubmitting(true);

    if (
      formData.discountPrice !== "" &&
      Number(formData.discountPrice) >= Number(formData.price)
    ) {
      setSubmitError("Discount price must be lower than regular price.");
      setIsSubmitting(false);
      return;
    }

    if (
      !formData.title.trim() ||
      !formData.slug.trim() ||
      !formData.description.trim() ||
      formData.price === ""
    ) {
      setSubmitError("Please fill in all required game information.");
      setIsSubmitting(false);
      return;
    }

    const coverFile = document.getElementById("coverImage")?.files?.[0];

    if (!coverFile) {
      setSubmitError("Please select a cover image.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Form submission logic will be added next.
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
      if (formData.releaseDate) {
        payload.append("releaseDate", formData.releaseDate);
      }

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
      const coverInput = document.getElementById("coverImage");
      const coverFile = coverInput?.files?.[0];

      if (!coverFile) {
        throw new Error("Please select a cover image.");
      }

      payload.append("coverImage", coverFile);
      const screenshotInput = document.getElementById("screenshots");
      const screenshotFiles = Array.from(screenshotInput?.files || []);

      screenshotFiles.forEach((file) => {
        payload.append("screenshots", file);
      });
      const response = await adminService.createGame(payload);

      setSubmitSuccess(response.message || "Game created successfully!");
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      event.target.reset();

      setFormData({
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
        platforms: "PC",
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

      setCoverPreview((previousUrl) => {
        if (previousUrl) URL.revokeObjectURL(previousUrl);
        return null;
      });

      setScreenshotPreviews((previousUrls) => {
        previousUrls.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
    } catch (error) {
      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create game. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setCategoryError("");

        const response = await adminService.getAdminCategories();

        setCategories(response.data.categories || []);
      } catch (error) {
        setCategoryError(
          error.response?.data?.message || "Failed to load categories.",
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const validateImageFile = (file) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(`${file.name}: Only JPEG, PNG, WEBP and AVIF images are allowed.`);
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name}: Image size must not exceed 5 MB.`);
      return false;
    }

    return true;
  };

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setCoverPreview(null);
      return;
    }

    if (!validateImageFile(file)) {
      event.target.value = "";
      setCoverPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setCoverPreview((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }

      return previewUrl;
    });
  };

  const handleScreenshotsChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length > 5) {
      alert("You can upload a maximum of 5 screenshots.");
      event.target.value = "";
      setScreenshotPreviews([]);
      return;
    }

    const invalidFile = files.find((file) => !validateImageFile(file));

    if (invalidFile) {
      event.target.value = "";
      setScreenshotPreviews([]);
      return;
    }

    const previewUrls = files.map((file) => URL.createObjectURL(file));

    setScreenshotPreviews((previousUrls) => {
      previousUrls.forEach((url) => URL.revokeObjectURL(url));
      return previewUrls;
    });
  };

  return (
    <div className="add-game-page">
      <Link to="/admin/games" className="admin-back-link">
        <ArrowLeft size={18} />
        Back to Manage Games
      </Link>

      <div className="admin-page-header">
        <div>
          <h1>Add New Game</h1>
          <p>Add a new game to your PC Game Store catalog.</p>
        </div>
      </div>
      {submitError && (
        <div className="form-message error-message">{submitError}</div>
      )}

      {submitSuccess && (
        <div className="form-message success-message">{submitSuccess}</div>
      )}
      <form className="add-game-form" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <section className="add-game-section">
          <div className="add-game-section-header">
            <h2>Basic Information</h2>
            <p>Enter the game's essential details.</p>
          </div>

          <div className="add-game-grid">
            <div className="add-game-field">
              <label htmlFor="title">Game Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="e.g. Elden Ring"
                value={formData.title}
                onChange={(event) => {
                  const title = event.target.value;

                  setFormData((previous) => ({
                    ...previous,
                    title,
                    slug: generateSlug(title),
                  }));
                }}
                required
              />
            </div>

            <div className="add-game-field">
              <label htmlFor="slug">Game Slug *</label>
              <input
                type="text"
                id="slug"
                name="slug"
                placeholder="e.g. elden-ring"
                required
                value={formData.slug}
                onChange={handleInputChange}
              />
            </div>

            <div className="add-game-field full-width">
              <label htmlFor="shortDescription">Short Description</label>
              <input
                type="text"
                id="shortDescription"
                name="shortDescription"
                maxLength={300}
                placeholder="A brief introduction to the game"
                value={formData.shortDescription}
                onChange={handleInputChange}
              />
            </div>

            <div className="add-game-field full-width">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Write a detailed description of the game..."
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="add-game-section">
          <div className="add-game-section-header">
            <h2>Pricing</h2>
            <p>Set the game's regular and discounted prices.</p>
          </div>

          <div className="add-game-grid">
            <div className="add-game-field">
              <label htmlFor="price">Regular Price (₹) *</label>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                step="0.01"
                placeholder="1999"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="add-game-field">
              <label htmlFor="discountPrice">Discount Price (₹)</label>
              <input
                type="number"
                id="discountPrice"
                name="discountPrice"
                min="0"
                step="0.01"
                placeholder="1499"
                value={formData.discountPrice}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </section>

        {/* Game Details */}
        <section className="add-game-section">
          <div className="add-game-section-header">
            <h2>Game Details</h2>
            <p>Provide developer, publisher and game classification details.</p>
          </div>

          <div className="add-game-grid">
            <div className="add-game-field">
              <label htmlFor="developer">Developer</label>
              <input
                type="text"
                id="developer"
                name="developer"
                placeholder="e.g. FromSoftware"
                value={formData.developer}
                onChange={handleInputChange}
              />
            </div>

            <div className="add-game-field">
              <label htmlFor="publisher">Publisher</label>
              <input
                type="text"
                id="publisher"
                name="publisher"
                placeholder="e.g. Bandai Namco"
                value={formData.publisher}
                onChange={handleInputChange}
              />
            </div>

            <div className="add-game-field">
              <label htmlFor="releaseDate">Release Date</label>
              <input
                type="date"
                id="releaseDate"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="add-game-field">
              <label htmlFor="status">Game Status</label>
              <select
                id="status"
                name="status"
                defaultValue="draft"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="add-game-field full-width">
              <label htmlFor="platforms">Platforms</label>
              <input
                type="text"
                id="platforms"
                name="platforms"
                placeholder="e.g. PC, PlayStation 5, Xbox Series X"
                value={formData.platforms}
                onChange={handleInputChange}
              />
              <small>Separate multiple platforms with commas.</small>
            </div>

            <div className="add-game-field full-width">
              <label htmlFor="genres">Genres</label>
              <input
                type="text"
                id="genres"
                name="genres"
                placeholder="e.g. Action, RPG, Adventure"
                value={formData.genres}
                onChange={handleInputChange}
              />
              <small>Separate multiple genres with commas.</small>
            </div>

            <div className="add-game-field full-width">
              <label>Categories</label>

              <div className="category-selection-grid">
                {categories.map((category) => {
                  const isSelected = formData.categories.includes(category._id);

                  return (
                    <button
                      type="button"
                      key={category._id}
                      className={`category-selection-option ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => handleCategoriesChange(category._id)}
                    >
                      <span className="category-selection-check">
                        {isSelected ? "✓" : ""}
                      </span>

                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>

              <small>Select one or more categories for this game.</small>
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

        {/* Game Images */}
        <section className="add-game-section">
          <div className="add-game-section-header">
            <h2>Game Images</h2>
            <p>Upload the cover image and in-game screenshots.</p>
          </div>

          <div className="add-game-grid">
            <div className="add-game-field full-width">
              <label htmlFor="coverImage">Cover Image *</label>
              <input
                type="file"
                id="coverImage"
                name="coverImage"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleCoverChange}
                required
              />
              <small>
                Required. JPEG, PNG, WEBP or AVIF. Maximum size: 5 MB.
              </small>
              {coverPreview && (
                <div className="image-preview-container">
                  <p>Cover Image Preview</p>
                  <img
                    src={coverPreview}
                    alt="Game cover preview"
                    className="cover-image-preview"
                  />
                </div>
              )}
            </div>

            <div className="add-game-field full-width">
              <label htmlFor="screenshots">Game Screenshots</label>
              <input
                type="file"
                id="screenshots"
                name="screenshots"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleScreenshotsChange}
                multiple
              />
              <small>Optional. Maximum 5 images, 5 MB each.</small>
              {screenshotPreviews.length > 0 && (
                <div className="image-preview-container">
                  <p>Screenshot Previews</p>

                  <div className="screenshot-preview-grid">
                    {screenshotPreviews.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt={`Game screenshot ${index + 1}`}
                        className="screenshot-image-preview"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* System Requirements */}
        <section className="add-game-section">
          <div className="add-game-section-header">
            <h2>System Requirements</h2>
            <p>Specify the minimum and recommended PC specifications.</p>
          </div>

          <div className="requirements-grid">
            {/* Minimum Requirements */}
            <div className="requirements-card">
              <h3>Minimum Requirements</h3>

              <div className="add-game-field">
                <label htmlFor="minimum-os">Operating System</label>
                <input
                  type="text"
                  id="os"
                  name="os"
                  placeholder="Windows 10"
                  value={formData.minimum.os}
                  onChange={(event) =>
                    handleRequirementChange("minimum", event)
                  }
                />
              </div>

              <div className="add-game-field">
                <label htmlFor="minimum-processor">Processor</label>
                <input
                  type="text"
                  id="processor"
                  name="processor"
                  placeholder="Intel Core i5-8400"
                  value={formData.minimum.processor}
                  onChange={(event) =>
                    handleRequirementChange("minimum", event)
                  }
                />
              </div>

              <div className="add-game-field">
                <label htmlFor="minimum-memory">Memory</label>
                <input
                  type="text"
                  id="memory"
                  name="memory"
                  placeholder="12 GB RAM"
                  value={formData.minimum.memory}
                  onChange={(event) =>
                    handleRequirementChange("minimum", event)
                  }
                />
              </div>

              <div className="add-game-field">
                <label htmlFor="minimum-graphics">Graphics</label>
                <input
                  type="text"
                  id="graphics"
                  name="graphics"
                  placeholder="NVIDIA GTX 1060"
                  value={formData.minimum.graphics}
                  onChange={(event) =>
                    handleRequirementChange("minimum", event)
                  }
                />
              </div>

              <div className="add-game-field">
                <label htmlFor="minimum-storage">Storage</label>
                <input
                  type="text"
                  id="storage"
                  name="storage"
                  placeholder="60 GB available space"
                  value={formData.minimum.storage}
                  onChange={(event) =>
                    handleRequirementChange("minimum", event)
                  }
                />
              </div>
            </div>

            {/* Recommended Requirements */}
            <div className="requirements-card">
              <h3>Recommended Requirements</h3>

              <div className="add-game-field">
                <label htmlFor="recommended-os">Operating System</label>
                <input
                  type="text"
                  id="os"
                  name="os"
                  placeholder="Windows 11"
                  value={formData.recommended.os}
                  onChange={(event) =>
                    handleRequirementChange("recommended", event)
                  }
                />
              </div>

              <div className="add-game-field">
                <label htmlFor="recommended-processor">Processor</label>
                <input
                  type="text"
                  id="processor"
                  name="processor"
                  placeholder="Intel Core i7-8700K"
                  value={formData.recommended.processor}
                  onChange={(event) =>
                    handleRequirementChange("recommended", event)
                  }
                />
              </div>

              <div className="add-game-field">
                <label htmlFor="recommended-memory">Memory</label>
                <input
                  type="text"
                  id="memory"
                  name="memory"
                  placeholder="16 GB RAM"
                  value={formData.recommended.memory}
                  onChange={(event) =>
                    handleRequirementChange("recommended", event)
                  }
                />
              </div>

              <div className="add-game-field">
                <label htmlFor="recommended-graphics">Graphics</label>
                <input
                  type="text"
                  id="graphics"
                  name="graphics"
                  placeholder="NVIDIA GTX 1070"
                  value={formData.recommended.graphics}
                  onChange={(event) =>
                    handleRequirementChange("recommended", event)
                  }
                />
              </div>

              <div className="add-game-field">
                <label htmlFor="recommended-storage">Storage</label>
                <input
                  type="text"
                  id="storage"
                  name="storage"
                  placeholder="60 GB available space"
                  value={formData.recommended.storage}
                  onChange={(event) =>
                    handleRequirementChange("recommended", event)
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* Form Actions */}
        <div className="add-game-actions">
          <Link to="/admin/games" className="btn btn-secondary">
            Cancel
          </Link>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Game..." : "Create Game"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddGame;
