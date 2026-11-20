import { useEffect, useState } from "react";
import { Tags } from "lucide-react";
import adminService from "../../services/adminService";
import "../../styles/adminCategories.css";

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminService.getAdminCategories();

      setCategories(response.data.categories || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  // Generate slug automatically from category name
  const handleNameChange = (event) => {
    const name = event.target.value;

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setFormData((previous) => ({
      ...previous,
      name,
      slug,
    }));
  };

  // Handle other form inputs
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Create category
  const handleCreateCategory = async (event) => {
    event.preventDefault();

    try {
      setError("");

      await adminService.createCategory(formData);

      setFormData({
        name: "",
        slug: "",
        description: "",
        isActive: true,
      });

      setShowForm(false);

      await fetchCategories();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create category.");
    }
  };

  // Open category for editing
  const handleEditCategory = (category) => {
    setEditingCategoryId(category._id);

    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      isActive: category.isActive,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Update existing category
  const handleUpdateCategory = async (event) => {
    event.preventDefault();

    try {
      setError("");

      await adminService.updateCategory(editingCategoryId, formData);

      setFormData({
        name: "",
        slug: "",
        description: "",
        isActive: true,
      });

      setEditingCategoryId(null);
      setShowForm(false);

      await fetchCategories();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update category.");
    }
  };

  // Toggle category active status
  const handleToggleCategoryStatus = async (category) => {
    try {
      setError("");

      await adminService.updateCategory(category._id, {
        isActive: !category.isActive,
      });

      await fetchCategories();
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update category status.",
      );
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="admin-categories-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1>Categories</h1>
          <p>Manage your game store categories.</p>
        </div>

        <div className="admin-category-header-actions">
          <div className="admin-category-count">
            <Tags size={18} />
            <span>{categories.length} Categories</span>
          </div>

          <button
            className="admin-create-category-btn"
            onClick={() => setShowForm((previous) => !previous)}
          >
            + Create Category
          </button>
        </div>
      </div>

      {/* Create Category Form */}
      {showForm && (
        <form
          className="admin-category-form"
          onSubmit={
            editingCategoryId ? handleUpdateCategory : handleCreateCategory
          }
        >
          <h2>
            {" "}
            {editingCategoryId ? "Edit Category" : "Create New Category"}
          </h2>

          <div className="admin-category-form-grid">
            <div className="admin-category-field">
              <label>Category Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Adventure"
                value={formData.name}
                onChange={handleNameChange}
                required
              />
            </div>

            <div className="admin-category-field">
              <label>Category Slug</label>
              <input
                type="text"
                name="slug"
                placeholder="e.g. adventure"
                value={formData.slug}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="admin-category-field full-width">
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Enter category description..."
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="admin-category-field">
              <label className="admin-category-checkbox">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                Active Category
              </label>
            </div>
          </div>

          <div className="admin-category-form-actions">
            <button
              type="button"
              className="admin-category-cancel-btn"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>

            <button type="submit" className="admin-create-category-btn">
              {editingCategoryId ? "Update Category" : "Create Category"}
            </button>
          </div>
        </form>
      )}

      {/* Error Message */}
      {error && <p className="admin-error-message">{error}</p>}

      {/* Categories List */}
      {loading ? (
        <p>Loading categories...</p>
      ) : categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <div className="admin-categories-list">
          {categories.map((category) => (
            <div key={category._id} className="admin-category-item">
              <div className="admin-category-card-content">
                <div>
                  <h3>{category.name}</h3>
                  <p>{category.slug}</p>

                  <span
                    className={
                      category.isActive
                        ? "category-status-active"
                        : "category-status-inactive"
                    }
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="admin-category-actions">
                  <button
                    type="button"
                    className="admin-category-edit-btn"
                    onClick={() => handleEditCategory(category)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className={
                      category.isActive
                        ? "admin-category-deactivate-btn"
                        : "admin-category-activate-btn"
                    }
                    onClick={() => handleToggleCategoryStatus(category)}
                  >
                    {category.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminCategories;
