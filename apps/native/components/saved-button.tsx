import { View, Text, Pressable, ActivityIndicator, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import Toast from "react-native-toast-message";

/**
 * Saved Button Component
 *
 * Features:
 * - Add to saved functionality with duplicate validation
 * - Remove from saved functionality
 * - Optimistic UI updates for better UX
 * - Loading states for all operations
 * - Error handling with user-friendly toast notifications
 * - Multiple size variants (small, medium, large)
 * - Automatic query invalidation for data consistency
 * - Dark/light theme support
 *
 * Usage:
 * ```tsx
 * <SavedButton
 *   productId="product-123"
 *   storeId="store-456"
 *   size="medium"
 * />
 * ```
 *
 * States:
 * 1. Loading: Shows spinner while fetching saved data
 * 2. Add to Saved: Shows heart outline when item not saved
 * 3. Remove from Saved: Shows filled heart when item is saved
 *
 * @param productId - Unique identifier for the product
 * @param storeId - Unique identifier for the store
 * @param size - Size variant: "small" | "medium" | "large"
 */
const SavedButton = ({
  productId,
  storeId,
  size = "medium",
}: {
  productId: string;
  storeId: string;
  size?: "small" | "medium" | "large";
}) => {
  const queryClient = useQueryClient();
  const [optimisticSaved, setOptimisticSaved] = useState<boolean | null>(null);

  const {
    data: savedItem,
    isLoading: isLoadingSavedItem,
    error: savedItemError,
  } = useQuery(
    orpc.general.products.saved.getSavedItemByProductId.queryOptions({
      queryKey: ["saved-item", productId, storeId],
      input: { productId, storeId },
      retry: 1,
    })
  );

  if (savedItemError) {
    console.warn("Failed to load saved item:", savedItemError);
  }

  const addToSavedMutation = useMutation(
    orpc.general.products.saved.addToSaved.mutationOptions({
      onMutate: async () => {
        setOptimisticSaved(true);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["saved-item", productId, storeId],
        });
        queryClient.invalidateQueries({
          queryKey: ["saved"],
        });
        queryClient.invalidateQueries({
          queryKey: ["products"],
        });
        Toast.show({
          type: "success",
          text1: "Item added to saved",
        });
      },
      onError: (error: any) => {
        setOptimisticSaved(null);
        console.error("Add to saved error:", error);
        Toast.show({
          type: "error",
          text1: "Failed to save item",
          text2: error?.message || "Please try again",
        });
      },
      onSettled: () => {
        setOptimisticSaved(null);
      },
    })
  );

  const removeFromSavedMutation = useMutation(
    orpc.general.products.saved.removeFromSaved.mutationOptions({
      onMutate: async () => {
        setOptimisticSaved(false);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["saved-item", productId, storeId],
        });
        queryClient.invalidateQueries({
          queryKey: ["saved"],
        });
        queryClient.invalidateQueries({
          queryKey: ["products"],
        });
        Toast.show({
          type: "success",
          text1: "Item removed from saved",
        });
      },
      onError: (error: any) => {
        setOptimisticSaved(null);
        console.error("Remove from saved error:", error);
        Toast.show({
          type: "error",
          text1: "Failed to remove item",
          text2: error?.message || "Please try again",
        });
      },
      onSettled: () => {
        setOptimisticSaved(null);
      },
    })
  );

  // Reset optimistic state when saved item changes
  useEffect(() => {
    if (savedItem !== undefined && optimisticSaved === null) {
      setOptimisticSaved(null);
    }
  }, [savedItem, optimisticSaved]);

  // Determine if item is saved (with optimistic updates)
  const isSaved = optimisticSaved !== null ? optimisticSaved : !!savedItem;

  const isLoading = isLoadingSavedItem;
  const isUpdating =
    addToSavedMutation.isPending || removeFromSavedMutation.isPending;

  const sizeConfig = {
    small: {
      button: "w-8 h-8",
      icon: 16,
    },
    medium: {
      button: "w-10 h-10",
      icon: 20,
    },
    large: {
      button: "w-12 h-12",
      icon: 24,
    },
  };

  const config = sizeConfig[size];

  const handleToggleSaved = () => {
    if (!savedItem?.id && !isSaved) {
      addToSavedMutation.mutate({
        productId,
        storeId,
      });
    } else if (savedItem?.id) {
      removeFromSavedMutation.mutate({
        savedItemId: savedItem.id,
      });
    }
  };

  if (isLoading) {
    return (
      <View
        className={`${config.button} rounded-full bg-muted flex items-center justify-center`}
      >
        <ActivityIndicator size="small" color="#9CA3AF" />
      </View>
    );
  }

  return (
    <Pressable
      onPress={handleToggleSaved}
      disabled={isUpdating}
      className={`${config.button} rounded-full flex items-center justify-center ${
        isUpdating
          ? "opacity-70"
          : isSaved
            ? "bg-red-50"
            : "bg-gray-50 active:bg-gray-100"
      }`}
    >
      {isUpdating ? (
        <ActivityIndicator
          size="small"
          color={isSaved ? "#EF4444" : "#6B7280"}
        />
      ) : (
        <Image
          source={
            isSaved
              ? require("../assets/icons/shop/heart-filled.png")
              : require("../assets/icons/shop/heart.png")
          }
          style={{
            width: config.icon,
            height: config.icon,
            tintColor: isSaved ? "#EF4444" : "#6B7280",
          }}
          resizeMode="contain"
        />
      )}
    </Pressable>
  );
};

export default SavedButton;
