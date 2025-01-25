import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";
import { withSwal } from "react-sweetalert2";

function Categories({ swal }) {
    const [editedCategory, setEditedCategory] = useState(null);
    const [name, setName] = useState("");
    const [categories, setCategories] = useState([]);
    const [parentCategory, setParentCategory] = useState("");

    useEffect(() => {
        fetchCategories();
    }, []);

    function fetchCategories() {
        axios.get("/api/categories").then((result) => {
            setCategories(result.data);
        });
    }

    async function saveCategory(ev) {
        ev.preventDefault();
        if (!name.trim()) {
            alert("Category name cannot be empty");
            return;
        }
        try {
            const data = { name, parentCategory };
            if (editedCategory) {
                data._id = editedCategory._id;
                await axios.put(`/api/categories`, data);
                setEditedCategory(null);
            } else {
                await axios.post("/api/categories", data);
            }
            setName("");
            setParentCategory("");
            fetchCategories();
        } catch (error) {
            console.error("Failed to save category:", error);
        }
    }

    function editCategory(category) {
        setEditedCategory(category);
        setName(category.name);
        setParentCategory(category.parent?._id || "");
    }

    async function deleteCategory(category) {
        swal.fire({
            title: "Are you sure",
            text: `Do you want to delete this category ${category.name}?`,
            showCancelButton: true,
            cancelButtonText: "Cancel",
            confirmButtonText: "Yes, Delete!",
            confirmButtonColor: "#d55",
            reverseButtons: true,
        })
            .then(async (result) => {
                if (result.isConfirmed) {
                    const { _id } = category;
                    await axios.delete(`/api/categories?_id=` + _id);
                    fetchCategories();
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    return (
        <Layout>
            <h1>Categories</h1>
            <label>
                {editedCategory
                    ? `Edit category ${editedCategory.name}`
                    : "Create new category"}
            </label>
            <form onSubmit={saveCategory} className="flex gap-1">
                <input
                    className="mb-0"
                    type="text"
                    placeholder={"Category name"}
                    onChange={(ev) => setName(ev.target.value)}
                    value={name}
                />
                <select
                    className="mb-0"
                    name="parent"
                    value={parentCategory}
                    onChange={(ev) => setParentCategory(ev.target.value)}
                >
                    <option value="">No parent category</option>
                    {categories.length > 0 &&
                        categories.map((category) => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                </select>
                <button type="submit" className="btn-primary py-1">
                    Save
                </button>
            </form>
            <table className="basic mt-4">
                <thead>
                    <tr>
                        <td>Category name</td>
                        <td>Parent category</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                    {categories.length > 0 &&
                        categories.map((category) => (
                            <tr key={category._id}>
                                <td>{category.name}</td>
                                <td>{category?.parent?.name}</td>
                                <td>
                                    <button
                                        onClick={() => editCategory(category)}
                                        className="btn-primary mr-1"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteCategory(category)}
                                        className="btn-primary"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </Layout>
    );
}

export default withSwal(({ swal }, ref) => <Categories swal={swal} />);
