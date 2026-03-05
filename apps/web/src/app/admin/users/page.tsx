"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

type UserRole = "USER" | "ADMIN" | "MODERATOR";
type TabType = "all" | "statistics";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  username: string;
  displayUsername: string | null;
  role: UserRole;
  kycVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserStatistics {
  total: number;
  byRole: Array<{
    role: UserRole;
    count: number;
  }>;
  byVerification: {
    emailVerified: number;
    kycVerified: number;
    notVerified: number;
  };
  recentUsers: number;
  activeUsers: number;
}

interface FilterOptions {
  role?: UserRole;
  kycVerified?: boolean;
  emailVerified?: boolean;
  search?: string;
}

const isValidUserRecord = (item: any): item is UserRecord => {
  return (
    item &&
    typeof item === "object" &&
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.email === "string" &&
    typeof item.username === "string" &&
    typeof item.role === "string" &&
    typeof item.emailVerified === "boolean" &&
    typeof item.kycVerified === "boolean" &&
    item.createdAt instanceof Date &&
    item.updatedAt instanceof Date
  );
};

const Users = () => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchQuery, setSearchQuery] = useState("");

  const users = useQuery(
    orpc.admin.users.getAllUsers.queryOptions({
      input: {
        limit: 50,
        offset: 0,
        ...filters,
        search: searchQuery || undefined,
      },
    })
  );

  const userStatistics = useQuery(
    orpc.admin.users.getUserStatistics.queryOptions()
  );

  const updateUserRoleMutation = useMutation(
    orpc.admin.users.updateUserRole.mutationOptions({
      onSuccess: () => {
        alert("User role updated successfully");
        users.refetch();
        userStatistics.refetch();
        setShowDetailModal(false);
      },
      onError: (error: any) => {
        alert(`Error: ${error.message || "Failed to update user role"}`);
      },
    })
  );

  const updateUserVerificationMutation = useMutation(
    orpc.admin.users.updateUserVerification.mutationOptions({
      onSuccess: () => {
        alert("User verification updated successfully");
        users.refetch();
        userStatistics.refetch();
      },
      onError: (error: any) => {
        alert(
          `Error: ${error.message || "Failed to update user verification"}`
        );
      },
    })
  );

  const handleRoleUpdate = (userId: string, newRole: UserRole) => {
    if (
      window.confirm(
        `Are you sure you want to change this user's role to ${newRole}?`
      )
    ) {
      updateUserRoleMutation.mutate({
        id: userId,
        role: newRole,
        adminId: "admin-id", // TODO: Get from session
      });
    }
  };

  const handleVerificationUpdate = (
    userId: string,
    type: "kyc" | "email",
    verified: boolean
  ) => {
    const action = verified ? "verify" : "unverify";
    const target = type === "kyc" ? "KYC" : "Email";

    if (
      window.confirm(
        `Are you sure you want to ${action} this user's ${target.toLowerCase()}?`
      )
    ) {
      updateUserVerificationMutation.mutate({
        id: userId,
        ...(type === "kyc"
          ? { kycVerified: verified }
          : { emailVerified: verified }),
        adminId: "admin-id", // TODO: Get from session
      });
    }
  };

  const viewUserDetails = (user: UserRecord) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const applyFilters = () => {
    setFilters({
      ...filters,
      search: searchQuery || undefined,
    });
    setShowFilters(false);
    users.refetch();
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
    setShowFilters(false);
    users.refetch();
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "text-red-600 bg-red-100";
      case "MODERATOR":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-green-600 bg-green-100";
    }
  };

  const renderUserItem = (user: UserRecord) => {
    if (!user) return null;

    return (
      <div
        key={user.id}
        onClick={() => viewUserDetails(user)}
        className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
            <p className="text-sm text-gray-600">@{user.username}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <div
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}
          >
            {user.role}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              {user.emailVerified ? (
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              )}
              <span className="text-xs text-gray-500">Email</span>
            </div>
            <div className="flex items-center gap-1">
              {user.kycVerified ? (
                <svg
                  className="w-4 h-4 text-green-600"
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
              ) : (
                <svg
                  className="w-4 h-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              )}
              <span className="text-xs text-gray-500">KYC</span>
            </div>
          </div>
          <span className="text-xs text-gray-500">
            Joined: {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    );
  };

  const renderStatistics = () => {
    if (userStatistics.isLoading) {
      return (
        <div className="text-center py-8">
          <div className="text-lg text-gray-600 mb-4">
            Loading statistics...
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
      );
    }

    const stats = userStatistics.data as UserStatistics | undefined;

    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-800 mb-2">
            {stats?.total || 0}
          </div>
          <div className="text-gray-600">Total Users</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xl font-bold text-green-600 mb-2">
              {stats?.byRole.find((r) => r.role === "USER")?.count || 0}
            </div>
            <div className="text-gray-600">Regular Users</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xl font-bold text-blue-600 mb-2">
              {stats?.byRole.find((r) => r.role === "MODERATOR")?.count || 0}
            </div>
            <div className="text-gray-600">Moderators</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xl font-bold text-red-600 mb-2">
              {stats?.byRole.find((r) => r.role === "ADMIN")?.count || 0}
            </div>
            <div className="text-gray-600">Admins</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xl font-bold text-green-600 mb-2">
              {stats?.byVerification.emailVerified || 0}
            </div>
            <div className="text-gray-600">Email Verified</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xl font-bold text-blue-600 mb-2">
              {stats?.byVerification.kycVerified || 0}
            </div>
            <div className="text-gray-600">KYC Verified</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xl font-bold text-orange-600 mb-2">
              {stats?.recentUsers || 0}
            </div>
            <div className="text-gray-600">Recent Users</div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "all":
        if (users.isLoading) {
          return (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600 mb-4">Loading users...</div>
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
          );
        }
        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                All Users ({users.data?.users?.length || 0})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => users.refetch()}
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
                <button
                  onClick={() => setShowFilters(true)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
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
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filters
                </button>
              </div>
            </div>

            {users.data?.users?.length === 0 ? (
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">No users found</p>
                <p className="text-sm text-gray-400">
                  Try adjusting your filters or check back later
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {users.data?.users
                  ?.filter(isValidUserRecord)
                  .map(renderUserItem)}
              </div>
            )}
          </div>
        );

      case "statistics":
        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                User Statistics
              </h2>
              <button
                onClick={() => userStatistics.refetch()}
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
            {renderStatistics()}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User Management
          </h1>
          <p className="text-gray-600">
            Manage and monitor all registered users
          </p>
        </div>

        <div className="bg-white border-b border-gray-200 mb-6">
          <div className="flex">
            {[
              { key: "all", label: "All Users", icon: "users" },
              { key: "statistics", label: "Statistics", icon: "chart" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`flex-1 py-4 px-2 flex flex-col items-center transition-colors ${
                  activeTab === tab.key
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="w-5 h-5 mb-1">
                  {tab.icon === "users" && (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  )}
                  {tab.icon === "chart" && (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm min-h-[600px]">
          {renderTabContent()}
        </div>

        {/* Filters Modal */}
        {showFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-lg font-semibold mb-2">
                      Search
                    </label>
                    <input
                      type="text"
                      placeholder="Search by name, email, or username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-semibold mb-2">
                      Role
                    </label>
                    <div className="flex gap-2">
                      {["USER", "ADMIN", "MODERATOR"].map((role) => (
                        <button
                          key={role}
                          onClick={() =>
                            setFilters({
                              ...filters,
                              role:
                                role === filters.role
                                  ? undefined
                                  : (role as UserRole),
                            })
                          }
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            filters.role === role
                              ? "bg-blue-500 border-blue-500 text-white"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold mb-2">
                      Verification Status
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() =>
                          setFilters({
                            ...filters,
                            emailVerified:
                              filters.emailVerified === true ? undefined : true,
                          })
                        }
                        className={`w-full p-3 rounded-lg border transition-colors ${
                          filters.emailVerified === true
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Email Verified Only
                      </button>
                      <button
                        onClick={() =>
                          setFilters({
                            ...filters,
                            kycVerified:
                              filters.kycVerified === true ? undefined : true,
                          })
                        }
                        className={`w-full p-3 rounded-lg border transition-colors ${
                          filters.kycVerified === true
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        KYC Verified Only
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={clearFilters}
                    className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={applyFilters}
                    className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        {showDetailModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">
                  User Details
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-4">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Profile Information
                  </h3>
                  {selectedUser.image && (
                    <img
                      src={selectedUser.image}
                      alt={selectedUser.name}
                      className="w-20 h-20 rounded-full mb-4 object-cover"
                    />
                  )}
                  <p className="mb-1">Name: {selectedUser.name}</p>
                  <p className="mb-1">Username: @{selectedUser.username}</p>
                  <p className="mb-1">Email: {selectedUser.email}</p>
                  <p className="mb-1">
                    Display Username: {selectedUser.displayUsername || "N/A"}
                  </p>
                  <p className="mb-1">
                    Joined:{" "}
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Status & Verification
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span>Role:</span>
                    <div
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}
                    >
                      {selectedUser.role}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedUser.emailVerified ? (
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                    <span>
                      Email:{" "}
                      {selectedUser.emailVerified ? "Verified" : "Not Verified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedUser.kycVerified ? (
                      <svg
                        className="w-4 h-4 text-green-600"
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
                    ) : (
                      <svg
                        className="w-4 h-4 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    )}
                    <span>
                      KYC:{" "}
                      {selectedUser.kycVerified ? "Verified" : "Not Verified"}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Management Actions
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium mb-2">
                        Change Role
                      </label>
                      <div className="flex gap-2">
                        {(["USER", "MODERATOR", "ADMIN"] as UserRole[]).map(
                          (role) => (
                            <button
                              key={role}
                              onClick={() =>
                                handleRoleUpdate(selectedUser.id, role)
                              }
                              disabled={selectedUser.role === role}
                              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                selectedUser.role === role
                                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                  : "bg-blue-500 text-white hover:bg-blue-600"
                              }`}
                            >
                              {role}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium mb-2">
                        Verification Actions
                      </label>
                      <div className="space-y-2">
                        <button
                          onClick={() =>
                            handleVerificationUpdate(
                              selectedUser.id,
                              "email",
                              !selectedUser.emailVerified
                            )
                          }
                          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
                        >
                          {selectedUser.emailVerified ? "Unverify" : "Verify"}{" "}
                          Email
                        </button>
                        <button
                          onClick={() =>
                            handleVerificationUpdate(
                              selectedUser.id,
                              "kyc",
                              !selectedUser.kycVerified
                            )
                          }
                          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                        >
                          {selectedUser.kycVerified ? "Unverify" : "Verify"} KYC
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
