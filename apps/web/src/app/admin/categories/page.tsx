"use client";

import React, { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

const Categories = () => {
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = useQuery(
    orpc.admin.store.category.getStoreCategories.queryOptions()
  );

  const createStoreCategoryMutation = useMutation(
    orpc.admin.store.category.createStoreCategory.mutationOptions({
      onSettled: () => {
        console.log("Store category created");
        setBase64Image(null);
        setCategoryName("");
        categories.refetch();
        setIsUploading(false);
      },
      onError: (error: any) => {
        console.error(error);
        alert(`Error: ${error.message || "Failed to create category"}`);
        setIsUploading(false);
      },
    })
  );

  const deleteStoreCategoryMutation = useMutation(
    orpc.admin.store.category.deleteStoreCategory.mutationOptions({
      onSettled: () => {
        console.log("Store category deleted");
        categories.refetch();
      },
      onError: (error: any) => {
        console.error(error);
        alert(`Error: ${error.message || "Failed to delete category"}`);
      },
    })
  );

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await convertFileToBase64(file);
      setBase64Image(base64);
    } catch (error) {
      console.error("Failed to convert image:", error);
      alert("Failed to process image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteStoreCategoryMutation.mutate({ id });
    }
  };

  const handleCreateCategory = () => {
    if (!base64Image || !categoryName.trim()) {
      alert("Please fill all fields and upload an image");
      return;
    }

    setIsUploading(true);
    createStoreCategoryMutation.mutate({
      name: categoryName.trim(),
      icon: base64Image,
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (categories.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">
            Loading categories...
          </div>
          <div className="flex justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-600 rounded-full mx-1 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (categories.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-lg text-red-600 mb-4">
            Failed to load categories
          </div>
          <div className="text-sm text-gray-600 mb-6">
            {categories.error.message ||
              "Please check your connection and try again"}
          </div>
          <button
            onClick={() => categories.refetch()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Store Categories
          </h1>
          <p className="text-gray-600">Manage and organize store categories</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Existing Categories ({categories.data?.length || 0})
            </h2>
            <button
              onClick={() => categories.refetch()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>

          {categories.data && categories.data.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {categories.data.map((category) => (
                <div
                  key={category.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow"
                >
                  <img
                    src={category.icon}
                    alt={category.name}
                    className="w-12 h-12 object-contain mb-3 rounded-md bg-white border border-gray-200"
                  />
                  <h3 className="text-sm font-medium text-gray-900 mb-2 truncate w-full">
                    {category.name}
                  </h3>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="bg-red-500 text-white text-xs px-3 py-1 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                    disabled={deleteStoreCategoryMutation.isPending}
                  >
                    {deleteStoreCategoryMutation.isPending
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <p className="text-gray-500 mb-2">No categories found</p>
              <p className="text-sm text-gray-400">
                Create your first category below
              </p>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Create New Category
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name
              </label>
              <input
                type="text"
                placeholder="Enter category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                disabled={isUploading || createStoreCategoryMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Icon
              </label>

              {base64Image && (
                <div className="mb-4">
                  <img
                    src={base64Image}
                    alt="Preview"
                    className="w-20 h-20 object-contain rounded-lg border border-gray-200 bg-white"
                  />
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={
                    isUploading || createStoreCategoryMutation.isPending
                  }
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      {base64Image ? "Change Icon" : "Upload Icon"}
                    </>
                  )}
                </button>

                <button
                  onClick={handleCreateCategory}
                  disabled={
                    !base64Image ||
                    !categoryName.trim() ||
                    isUploading ||
                    createStoreCategoryMutation.isPending
                  }
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {createStoreCategoryMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Create Category
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {base64Image && categoryName.trim() && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm text-green-800">
                  Ready to create category "{categoryName.trim()}"
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
