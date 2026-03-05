"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { redirect } from "next/navigation";

type KycStatus = "PENDING" | "APPROVED" | "REJECTED";
type TabType = "pending" | "all" | "statistics";
type IdentificationType =
  | "passport"
  | "national_id"
  | "driver_license"
  | "other";

interface KycRecord {
  id: string;
  userId: string;
  status: KycStatus;
  name: string;
  phoneNumber: string;
  email: string;
  identificationType: IdentificationType;
  identificationNumber: string;
  identificationFrontImage: string;
  identificationBackImage: string;
  identificationSelfie: string;
  identificationStatus: string;
  identificationRejectionReason: string | null;
  identificationRejectionDate: Date | null;
  identificationRejectionBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  kycVerified: boolean;
}

interface KycWithUserDetails {
  kyc: KycRecord;
  user: UserRecord | null;
}

interface KycStatistics {
  total: number;
  byStatus: Array<{
    status: KycStatus;
    count: number;
  }>;
  pending: number;
  approved: number;
  rejected: number;
}

const isValidKycRecord = (item: any): item is KycRecord => {
  return (
    item &&
    typeof item === "object" &&
    typeof item.id === "string" &&
    typeof item.userId === "string" &&
    typeof item.status === "string" &&
    typeof item.name === "string" &&
    typeof item.phoneNumber === "string" &&
    typeof item.email === "string" &&
    typeof item.identificationType === "string" &&
    typeof item.identificationNumber === "string" &&
    typeof item.identificationFrontImage === "string" &&
    typeof item.identificationBackImage === "string" &&
    typeof item.identificationSelfie === "string" &&
    typeof item.identificationStatus === "string" &&
    item.createdAt instanceof Date &&
    item.updatedAt instanceof Date
  );
};

const KYC = () => {
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [selectedKyc, setSelectedKyc] = useState<KycWithUserDetails | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  // TODO: Add role-based access control

  const pendingKyc = useQuery(
    orpc.admin.kyc.getPendingKyc.queryOptions({
      enabled: activeTab === "pending",
    })
  );

  const allKyc = useQuery(
    orpc.admin.kyc.getAllKyc.queryOptions({
      enabled: activeTab === "all",
    })
  );

  const kycStatistics = useQuery(
    orpc.admin.kyc.getKycStatistics.queryOptions({
      enabled: activeTab === "statistics",
    })
  );

  const approveMutation = useMutation(
    orpc.admin.kyc.approveKyc.mutationOptions({
      onSuccess: () => {
        console.log("KYC application approved successfully");
        pendingKyc.refetch();
        allKyc.refetch();
        kycStatistics.refetch();
        setShowDetailModal(false);
      },
      onError: (error: any) => {
        console.error(error.message || "Failed to approve KYC application");
      },
    })
  );

  const rejectMutation = useMutation(
    orpc.admin.kyc.rejectKyc.mutationOptions({
      onSuccess: () => {
        console.log("KYC application rejected");
        setShowRejectModal(false);
        setRejectionReason("");
        pendingKyc.refetch();
        allKyc.refetch();
        kycStatistics.refetch();
        setShowDetailModal(false);
      },
      onError: (error: any) => {
        console.error(error.message || "Failed to reject KYC application");
      },
    })
  );

  const getKycDetailsMutation = useMutation(
    orpc.admin.kyc.getKycWithUserDetails.mutationOptions({
      onSuccess: (data) => {
        setSelectedKyc(data);
        setShowDetailModal(true);
      },
      onError: (error: any) => {
        console.error("Failed to load KYC details");
      },
    })
  );

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">Loading...</div>
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

  if (!session) {
    redirect("/auth/sign-in");
    return <div>Unauthorized</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-lg text-red-600 mb-4">Error</div>
          <div className="text-sm text-gray-600 mb-6">
            {error.message || "Something went wrong"}
          </div>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleApprove = (kycId: string) => {
    if (
      window.confirm("Are you sure you want to approve this KYC application?")
    ) {
      approveMutation.mutate({
        id: kycId,
        adminId: session.user.id,
      });
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      console.error("Please provide a rejection reason");
      return;
    }

    if (!selectedKyc || !selectedKyc.kyc) {
      console.error("No KYC application selected");
      return;
    }

    rejectMutation.mutate({
      id: selectedKyc.kyc.id,
      rejectionReason,
      adminId: session.user.id,
    });
  };

  const openRejectModal = (kyc: KycRecord) => {
    setSelectedKyc({ kyc, user: null });
    setShowRejectModal(true);
  };

  const viewKycDetails = (kycId: string) => {
    getKycDetailsMutation.mutate({ id: kycId });
  };

  const getStatusColor = (status: KycStatus) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600 bg-green-100";
      case "REJECTED":
        return "text-red-600 bg-red-100";
      default:
        return "text-yellow-600 bg-yellow-100";
    }
  };

  const renderKycItem = (kyc: KycRecord) => {
    if (!kyc) return null;

    return (
      <div
        key={kyc.id}
        onClick={() => viewKycDetails(kyc.id)}
        className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-800">
              {kyc.name || "Unknown"}
            </h3>
            <p className="text-sm text-gray-600">{kyc.email || "No email"}</p>
            <p className="text-sm text-gray-500">
              {kyc.identificationType} - {kyc.identificationNumber}
            </p>
          </div>
          <div
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(kyc.status)}`}
          >
            {kyc.status}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Submitted: {new Date(kyc.createdAt).toLocaleDateString()}
          </span>
          <div className="flex gap-2">
            {kyc.status === "PENDING" && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(kyc.id);
                  }}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                  disabled={approveMutation.isPending}
                >
                  Approve
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openRejectModal(kyc);
                  }}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStatistics = () => {
    if (kycStatistics.isLoading) {
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

    const stats = kycStatistics.data as KycStatistics | undefined;

    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-800 mb-2">
            {stats?.total || 0}
          </div>
          <div className="text-gray-600">Total KYC Applications</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xl font-bold text-yellow-600 mb-2">
              {stats?.pending || 0}
            </div>
            <div className="text-gray-600">Pending</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xl font-bold text-green-600 mb-2">
              {stats?.approved || 0}
            </div>
            <div className="text-gray-600">Approved</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xl font-bold text-red-600 mb-2">
              {stats?.rejected || 0}
            </div>
            <div className="text-gray-600">Rejected</div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "pending":
        if (pendingKyc.isLoading) {
          return (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600 mb-4">
                Loading pending applications...
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
        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Pending KYC Applications ({pendingKyc.data?.length || 0})
              </h2>
              <button
                onClick={() => pendingKyc.refetch()}
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
            {pendingKyc.data?.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
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
                </div>
                <p className="text-gray-500">No pending applications</p>
              </div>
            ) : (
              <div className="space-y-0">
                {pendingKyc.data?.filter(isValidKycRecord).map(renderKycItem)}
              </div>
            )}
          </div>
        );

      case "all":
        if (allKyc.isLoading) {
          return (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600 mb-4">
                Loading all applications...
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
        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                All KYC Applications ({allKyc.data?.length || 0})
              </h2>
              <button
                onClick={() => allKyc.refetch()}
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
            <div className="space-y-0">
              {allKyc.data?.filter(isValidKycRecord).map(renderKycItem)}
            </div>
          </div>
        );

      case "statistics":
        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                KYC Statistics
              </h2>
              <button
                onClick={() => kycStatistics.refetch()}
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
            KYC Management
          </h1>
          <p className="text-gray-600">Manage and review KYC applications</p>
        </div>

        <div className="bg-white border-b border-gray-200 mb-6">
          <div className="flex">
            {[
              { key: "pending", label: "Pending", icon: "schedule" },
              { key: "all", label: "All", icon: "list" },
              { key: "statistics", label: "Statistics", icon: "bar-chart" },
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
                  {tab.icon === "schedule" && (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  {tab.icon === "list" && (
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                  )}
                  {tab.icon === "bar-chart" && (
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

        {/* KYC Detail Modal */}
        {showDetailModal && selectedKyc && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">KYC Details</h2>
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
                    User Information
                  </h3>
                  <p className="mb-1">Name: {selectedKyc.user?.name}</p>
                  <p className="mb-1">Email: {selectedKyc.user?.email}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    KYC Information
                  </h3>
                  <p className="mb-1">Name: {selectedKyc.kyc.name}</p>
                  <p className="mb-1">Email: {selectedKyc.kyc.email}</p>
                  <p className="mb-1">Phone: {selectedKyc.kyc.phoneNumber}</p>
                  <p className="mb-1">
                    ID Type: {selectedKyc.kyc.identificationType}
                  </p>
                  <p className="mb-1">
                    ID Number: {selectedKyc.kyc.identificationNumber}
                  </p>
                  <p className="mb-1">Status: {selectedKyc.kyc.status}</p>
                  <p className="mb-1">
                    Submitted:{" "}
                    {new Date(selectedKyc.kyc.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Identification Documents */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Identification Documents
                  </h3>
                  <div className="space-y-4">
                    {selectedKyc.kyc.identificationFrontImage && (
                      <div>
                        <p className="text-sm font-medium mb-2">Front Image</p>
                        <img
                          src={selectedKyc.kyc.identificationFrontImage}
                          alt="Front ID"
                          className="w-full h-48 object-contain rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    {selectedKyc.kyc.identificationBackImage && (
                      <div>
                        <p className="text-sm font-medium mb-2">Back Image</p>
                        <img
                          src={selectedKyc.kyc.identificationBackImage}
                          alt="Back ID"
                          className="w-full h-48 object-contain rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    {selectedKyc.kyc.identificationSelfie && (
                      <div>
                        <p className="text-sm font-medium mb-2">Selfie</p>
                        <img
                          src={selectedKyc.kyc.identificationSelfie}
                          alt="Selfie"
                          className="w-full h-48 object-contain rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {selectedKyc.kyc.status === "PENDING" && (
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => handleApprove(selectedKyc.kyc.id)}
                      className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors"
                      disabled={approveMutation.isPending}
                    >
                      {approveMutation.isPending ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => openRejectModal(selectedKyc.kyc)}
                      className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">
                Reject KYC Application
              </h2>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejection:
              </p>
              <textarea
                placeholder="Rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
                  disabled={rejectMutation.isPending}
                >
                  {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYC;
