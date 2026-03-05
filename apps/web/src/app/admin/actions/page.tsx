"use client";

import React, { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

const Admin = () => {
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for tier creation
  const [tierName, setTierName] = useState("");
  const [tierIdentifier, setTierIdentifier] = useState("");
  const [tierDescription, setTierDescription] = useState("");

  // Form states for perk creation
  const [selectedTierId, setSelectedTierId] = useState("");
  const [perkName, setPerkName] = useState("");

  // Form states for template creation
  const [templateName, setTemplateName] = useState("");
  const [selectedTemplateTierId, setSelectedTemplateTierId] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  const tiers = useQuery(orpc.admin.store.tier.getTierWithPerks.queryOptions());

  const templates = useQuery(
    orpc.admin.store.template.getStoreTemplates.queryOptions()
  );

  const createStoreTemplateMutation = useMutation(
    orpc.admin.store.template.createStoreTemplate.mutationOptions({
      onSettled: () => {
        console.log("Store template created");
        setBase64Image(null);
        templates.refetch();
        setIsUploading(false);
      },
      onError: (error: any) => {
        console.error(error);
        alert(`Error: ${error.message || "Failed to create template"}`);
        setIsUploading(false);
      },
    })
  );

  const createStoreTierMutation = useMutation(
    orpc.admin.store.tier.createStoreTier.mutationOptions({
      onSettled: () => {
        console.log("Store tier created");
        tiers.refetch();
      },
      onError: (error: any) => {
        console.error(error);
        alert(`Error: ${error.message || "Failed to create tier"}`);
      },
    })
  );

  const createTierPerkMutation = useMutation(
    orpc.admin.store.tier.createTierPerk.mutationOptions({
      onSettled: () => {
        console.log("Tier perk created");
        tiers.refetch();
      },
      onError: (error: any) => {
        console.error(error);
        alert(`Error: ${error.message || "Failed to create perk"}`);
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCreateTemplate = () => {
    if (!base64Image) {
      alert("Please upload an image first");
      return;
    }

    if (!templateName.trim()) {
      alert("Please enter a template name");
      return;
    }

    if (!selectedTemplateTierId) {
      alert("Please select a tier for the template");
      return;
    }

    if (!templateDescription.trim()) {
      alert("Please enter a template description");
      return;
    }

    setIsUploading(true);
    createStoreTemplateMutation.mutate({
      name: templateName.trim(),
      tierId: selectedTemplateTierId,
      coverImage: base64Image,
      description: templateDescription.trim(),
    });
  };

  const handleCreateTier = () => {
    if (!tierName.trim() || !tierIdentifier || !tierDescription.trim()) {
      alert("Please fill all tier fields");
      return;
    }

    createStoreTierMutation.mutate({
      name: tierName.trim(),
      identifier: tierIdentifier as any,
      description: tierDescription.trim(),
    });

    // Clear form
    setTierName("");
    setTierIdentifier("");
    setTierDescription("");
  };

  const handleCreatePerk = () => {
    if (!selectedTierId || !perkName.trim()) {
      alert("Please select a tier and enter a perk name");
      return;
    }

    createTierPerkMutation.mutate({
      tierId: selectedTierId,
      perk: perkName.trim(),
    });

    // Clear form
    setPerkName("");
  };

  if (tiers.isLoading || templates.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">
            Loading store actions...
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

  if (tiers.error || templates.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-lg text-red-600 mb-4">
            Failed to load store actions
          </div>
          <div className="text-sm text-gray-600 mb-6">
            {tiers.error?.message ||
              templates.error?.message ||
              "Please check your connection and try again"}
          </div>
          <button
            onClick={() => {
              tiers.refetch();
              templates.refetch();
            }}
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
            Store Actions
          </h1>
          <p className="text-gray-600">Manage store templates and tiers</p>
        </div>

        <div className="space-y-8">
          {/* Store Templates Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Store Templates
              </h2>
              <button
                onClick={() => templates.refetch()}
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

            {templates.data && templates.data.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {templates.data.map((template) => (
                  <div
                    key={template.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow"
                  >
                    <img
                      src={template.coverImage}
                      alt={template.name}
                      className="w-20 h-20 object-cover rounded-md mb-3 bg-white border border-gray-200"
                    />
                    <h3 className="text-sm font-medium text-gray-900 truncate w-full">
                      {template.name}
                    </h3>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 mb-6">
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">No templates found</p>
                <p className="text-sm text-gray-400">
                  Create your first template below
                </p>
              </div>
            )}

            {/* Create Template Form */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Create New Template
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter template name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    disabled={
                      isUploading || createStoreTemplateMutation.isPending
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Tier
                  </label>
                  <select
                    value={selectedTemplateTierId}
                    onChange={(e) => setSelectedTemplateTierId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    disabled={
                      isUploading || createStoreTemplateMutation.isPending
                    }
                  >
                    <option value="">Select a tier</option>
                    {tiers.data?.map((tier) => (
                      <option key={tier.id} value={tier.id}>
                        {tier.name} ({tier.identifier})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter template description"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black"
                    disabled={
                      isUploading || createStoreTemplateMutation.isPending
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image
                  </label>

                  {base64Image && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Preview:
                      </p>
                      <img
                        src={base64Image}
                        alt="Template preview"
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200 bg-white"
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

                  <button
                    type="button"
                    onClick={handleUploadClick}
                    disabled={
                      isUploading || createStoreTemplateMutation.isPending
                    }
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
                        {base64Image ? "Change Image" : "Upload Image"}
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={handleCreateTemplate}
                  disabled={
                    !base64Image ||
                    !templateName.trim() ||
                    !selectedTemplateTierId ||
                    !templateDescription.trim() ||
                    isUploading ||
                    createStoreTemplateMutation.isPending
                  }
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {createStoreTemplateMutation.isPending ? (
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
                      Create Template
                    </>
                  )}
                </button>
              </div>

              {base64Image &&
                templateName.trim() &&
                selectedTemplateTierId &&
                templateDescription.trim() && (
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
                        Ready to create template "{templateName.trim()}"
                      </span>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Store Tiers & Perks Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Store Tiers & Perks
              </h2>
              <button
                onClick={() => tiers.refetch()}
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

            {tiers.data && tiers.data.length > 0 ? (
              <div className="space-y-4">
                {tiers.data.map((tier) => (
                  <div
                    key={tier.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {tier.name}
                      </h3>
                      <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        {tier.identifier}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {tier.description}
                    </p>
                    {tier.perks && tier.perks.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Perks:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {tier.perks.map((perk, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                              {perk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">No tiers found</p>
                <p className="text-sm text-gray-400">
                  Tiers will appear here once created
                </p>
              </div>
            )}
          </div>

          {/* Create Tier Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Create New Tier
              </h2>
              <button
                onClick={() => tiers.refetch()}
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tier Name
                </label>
                <input
                  type="text"
                  placeholder="Enter tier name"
                  value={tierName}
                  onChange={(e) => setTierName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  disabled={createStoreTierMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tier Identifier
                </label>
                <select
                  value={tierIdentifier}
                  onChange={(e) => setTierIdentifier(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  disabled={createStoreTierMutation.isPending}
                >
                  <option value="">Select identifier</option>
                  <option value="SILVER">SILVER</option>
                  <option value="GOLD">GOLD</option>
                  <option value="PLATINUM">PLATINUM</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter tier description"
                  value={tierDescription}
                  onChange={(e) => setTierDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black"
                  disabled={createStoreTierMutation.isPending}
                />
              </div>

              <button
                onClick={handleCreateTier}
                disabled={
                  !tierName.trim() ||
                  !tierIdentifier ||
                  !tierDescription.trim() ||
                  createStoreTierMutation.isPending
                }
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {createStoreTierMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Tier...
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
                    Create Tier
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Add Tier Perks Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Add Tier Perks
              </h2>
              <button
                onClick={() => tiers.refetch()}
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Tier
                </label>
                <select
                  value={selectedTierId}
                  onChange={(e) => setSelectedTierId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  disabled={createTierPerkMutation.isPending}
                >
                  <option value="">Select a tier</option>
                  {tiers.data?.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} ({tier.identifier})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Perk Name
                </label>
                <input
                  type="text"
                  placeholder="Enter perk name (e.g., 'Unlimited products')"
                  value={perkName}
                  onChange={(e) => setPerkName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  disabled={createTierPerkMutation.isPending}
                />
              </div>

              <button
                onClick={handleCreatePerk}
                disabled={
                  !selectedTierId ||
                  !perkName.trim() ||
                  createTierPerkMutation.isPending
                }
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {createTierPerkMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding Perk...
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Add Perk
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
