"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

type Store = {
  id: string;
  name: string;
  slug: string;
  description: string;
  businessRegistration: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  ownerName: string;
  phoneNumber: string;
  country: string;
  state: string;
  zipCode: string;
address: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  user: string | null;
  tier: string | null;
  category: string | null;
  template: string | null;
};

const StatusBadge = ({
  status,
  type,
}: {
  status: string;
  type: "status" | "verification";
}) => {
  const getStatusConfig = (status: string, type: "status" | "verification") => {
    switch (status) {
      case "APPROVED":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          label: "Approved",
        };
      case "PENDING":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          label: "Pending",
        };
      case "REJECTED":
        return { bg: "bg-red-100", text: "text-red-800", label: "Rejected" };
      case "SUSPENDED":
        return {
          bg: "bg-orange-100",
          text: "text-orange-800",
          label: "Suspended",
        };
      default:
        return { bg: "bg-gray-100", text: "text-gray-800", label: status };
    }
  };

  const config = getStatusConfig(status, type);

  return (
    <div
      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </div>
  );
};

const StoreCard = ({ store }: { store: Store }) => {
  const formatDate = (dateValue: string | Date) => {
    const date =
      typeof dateValue === "string" ? new Date(dateValue) : dateValue;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const location = `${store.state}, ${store.country}`.replace(/^,|,$/g, "");

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
            {store.name}
          </h3>
          <p className="text-sm text-gray-500 truncate">@{store.slug}</p>
        </div>
        <div className="flex gap-2 ml-4">
          <StatusBadge status={store.status} type="status" />
          <StatusBadge status={store.verificationStatus} type="verification" />
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {store.description}
      </p>

      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">Owner:</span>
          <span className="text-sm font-medium text-gray-900 truncate">
            {store.ownerName}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">Tier:</span>
          <span className="text-sm font-medium text-blue-600">
            {store.tier || "N/A"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-gray-500">Category</p>
          <p className="text-sm font-medium text-gray-900 truncate">
            {store.category || "Uncategorized"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Location</p>
          <p className="text-sm font-medium text-gray-900 truncate">
            {location}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          Created {formatDate(store.createdAt)}
        </span>
        <span className="text-xs text-gray-500">
          Template: {store.template || "None"}
        </span>
      </div>
    </div>
  );
};

const StoreStats = ({ stores }: { stores: Store[] }) => {
  const stats = useMemo(() => {
    return {
      total: stores.length,
      approved: stores.filter((s) => s.status === "APPROVED").length,
      pending: stores.filter((s) => s.status === "PENDING").length,
      rejected: stores.filter((s) => s.status === "REJECTED").length,
      suspended: stores.filter((s) => s.status === "SUSPENDED").length,
    };
  }, [stores]);

  return (
    <div className="grid grid-cols-4 gap-4 bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        <div className="text-xs text-gray-500">Total</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
          {stats.approved}
        </div>
        <div className="text-xs text-gray-500">Approved</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-600">
          {stats.pending}
        </div>
        <div className="text-xs text-gray-500">Pending</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
        <div className="text-xs text-gray-500">Rejected</div>
      </div>
    </div>
  );
};

const Admin = () => {
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: stores,
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...orpc.admin.store.getAllStores.queryOptions(),
    refetchOnWindowFocus: false,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading && !refreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">Loading stores...</div>
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-lg text-red-600 mb-4">Failed to load stores</div>
          <div className="text-sm text-gray-600 mb-6">
            {error.message || "Please check your connection and try again"}
          </div>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const storeList = (stores || []) as Store[];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Store Management
          </h1>
          <p className="text-gray-600">
            Manage and monitor all registered stores
          </p>
        </div>

        <StoreStats stores={storeList} />

        <div className="mb-4 flex justify-end">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {refreshing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Refreshing...
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>

        <div className="space-y-0">
          {storeList.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600 mb-2">No stores found</div>
              <div className="text-sm text-gray-500">
                There are currently no stores registered in the system
              </div>
            </div>
          ) : (
            storeList.map((store) => <StoreCard key={store.id} store={store} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
