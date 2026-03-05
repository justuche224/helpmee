import { View, Text, Pressable, ActivityIndicator, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import Toast from "react-native-toast-message";

/**
 * Cart Button Component
 *
 * Features:
 * - Add to cart functionality with inventory validation
 * - Quantity increment/decrement controls when item is in cart
 * - Automatic item removal when quantity reaches 0
 * - Optimistic UI updates for better UX
 * - Inventory validation to prevent over-ordering
 * - Loading states for all operations
 * - Error handling with user-friendly toast notifications
 * - Multiple size variants (small, medium, large)
 * - Out of stock state handling
 * - Automatic query invalidation for data consistency
 * - Dark/light theme support
 *
 * Usage:
 * ```tsx
 * <CartButton
 *   productId="product-123"
 *   storeId="store-456"
 *   size="medium"
 * />
 * ```
 *
 * States:
 * 1. Loading: Shows spinner while fetching cart/product data
 * 2. Out of Stock: Shows disabled state when item unavailable
 * 3. Add to Cart: Primary button when item not in cart
 * 4. Quantity Controls: Increment/decrement when item is in cart
 *
 * @param productId - Unique identifier for the product
 * @param storeId - Unique identifier for the store
 * @param size - Size variant: "small" | "medium" | "large"
 */
const CartButton = ({
  productId,
  storeId,
  size = "medium",
}: {
  productId: string;
  storeId: string;
  size?: "small" | "medium" | "large";
}) => {
  const queryClient = useQueryClient();
  const [optimisticQuantity, setOptimisticQuantity] = useState<number | null>(
    null
  );

  const {
    data: cartItem,
    isLoading: isLoadingCartItem,
    error: cartItemError,
  } = useQuery(
    orpc.general.cart.getCartItemByProductId.queryOptions({
      queryKey: ["cart-item", productId, storeId],
      input: { productId, storeId },
      retry: 1,
    })
  );

  if (cartItemError) {
    console.warn("Failed to load cart item:", cartItemError);
  }

  const { data: product, isLoading: isLoadingProduct } = useQuery(
    orpc.general.products.getProductById.queryOptions({
      queryKey: ["products", "by-id", productId],
      input: { id: productId },
      enabled: !!productId,
      retry: 1,
      staleTime: 1000 * 60 * 5,
    })
  );

  const addToCartMutation = useMutation(
    orpc.general.cart.addToCart.mutationOptions({
      onMutate: async () => {
        setOptimisticQuantity(1);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["cart-item", productId, storeId],
        });
        queryClient.invalidateQueries({
          queryKey: ["cart"],
        });
        queryClient.invalidateQueries({
          queryKey: ["products"],
        });
        Toast.show({
          type: "success",
          text1: "Item added to cart",
        });
      },
      onError: (error: any) => {
        setOptimisticQuantity(null);
        console.error("Add to cart error:", error);
        Toast.show({
          type: "error",
          text1: "Failed to add item to cart",
          text2: error?.message || "Please try again",
        });
      },
      onSettled: () => {
        setOptimisticQuantity(null);
      },
    })
  );

  const incrementMutation = useMutation(
    orpc.general.cart.incrementCartItemQuantity.mutationOptions({
      onMutate: async ({ quantity }: { quantity: number }) => {
        const currentQuantity = cartItem?.quantity || 0;
        setOptimisticQuantity(currentQuantity + quantity);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["cart-item", productId, storeId],
        });
        queryClient.invalidateQueries({
          queryKey: ["cart"],
        });
        queryClient.invalidateQueries({
          queryKey: ["products"],
        });
      },
      onError: (error: any) => {
        setOptimisticQuantity(null);
        console.error("Increment error:", error);
        Toast.show({
          type: "error",
          text1: "Failed to update quantity",
          text2: error?.message || "Please try again",
        });
      },
      onSettled: () => {
        setOptimisticQuantity(null);
      },
    })
  );

  const decrementMutation = useMutation(
    orpc.general.cart.decrementCartItemQuantity.mutationOptions({
      onMutate: async ({ quantity }: { quantity: number }) => {
        const currentQuantity = cartItem?.quantity || 0;
        setOptimisticQuantity(currentQuantity - quantity);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["cart-item", productId, storeId],
        });
        queryClient.invalidateQueries({
          queryKey: ["cart"],
        });
        queryClient.invalidateQueries({
          queryKey: ["products"],
        });
      },
      onError: (error: any) => {
        setOptimisticQuantity(null);
        console.error("Decrement error:", error);
        Toast.show({
          type: "error",
          text1: "Failed to update quantity",
          text2: error?.message || "Please try again",
        });
      },
      onSettled: () => {
        setOptimisticQuantity(null);
      },
    })
  );

  const removeFromCartMutation = useMutation(
    orpc.general.cart.removeFromCart.mutationOptions({
      onMutate: () => {
        setOptimisticQuantity(0);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["cart-item", productId, storeId],
        });
        queryClient.invalidateQueries({
          queryKey: ["cart"],
        });
        queryClient.invalidateQueries({
          queryKey: ["products"],
        });
        Toast.show({
          type: "success",
          text1: "Item removed from cart",
        });
      },
      onError: (error: any) => {
        setOptimisticQuantity(null);
        console.error("Remove from cart error:", error);
        Toast.show({
          type: "error",
          text1: "Failed to remove item",
          text2: error?.message || "Please try again",
        });
      },
      onSettled: () => {
        setOptimisticQuantity(null);
      },
    })
  );

  // Reset optimistic quantity when cart item changes
  useEffect(() => {
    if (cartItem && !optimisticQuantity) {
      setOptimisticQuantity(null);
    }
  }, [cartItem, optimisticQuantity]);

  // Determine current quantity (with optimistic updates)
  const currentQuantity =
    optimisticQuantity !== null ? optimisticQuantity : cartItem?.quantity || 0;
  const isInCart = currentQuantity > 0;

  const availableStock = product?.quantity || 0;
  const canIncrement =
    currentQuantity < availableStock && product?.inStock !== false;
  const isOutOfStock = !product?.inStock || availableStock <= 0;

  const isLoading = isLoadingCartItem || isLoadingProduct;
  const isUpdating =
    addToCartMutation.isPending ||
    incrementMutation.isPending ||
    decrementMutation.isPending ||
    removeFromCartMutation.isPending;

  const sizeConfig = {
    small: {
      button: "h-8 px-3",
      text: "text-sm",
      icon: 16,
    },
    medium: {
      button: "h-10 px-4",
      text: "text-base",
      icon: 20,
    },
    large: {
      button: "h-12 px-6",
      text: "text-lg",
      icon: 24,
    },
  };

  const config = sizeConfig[size];

  const handleAddToCart = () => {
    if (isOutOfStock) {
      Toast.show({
        type: "error",
        text1: "Out of stock",
        text2: "This item is currently unavailable",
      });
      return;
    }

    if (availableStock < 1) {
      Toast.show({
        type: "error",
        text1: "Insufficient stock",
        text2: `Only ${availableStock} items available`,
      });
      return;
    }

    addToCartMutation.mutate({
      productId,
      storeId,
      quantity: 1,
    });
  };

  const handleIncrement = () => {
    if (!cartItem?.id) return;

    if (!canIncrement) {
      Toast.show({
        type: "error",
        text1: "Maximum quantity reached",
        text2: `Only ${availableStock} items available`,
      });
      return;
    }

    incrementMutation.mutate({
      cartItemId: cartItem.id,
      quantity: 1,
    });
  };

  const handleDecrement = () => {
    if (!cartItem?.id) return;

    if (currentQuantity <= 1) {
      // Remove item if quantity would be 0
      removeFromCartMutation.mutate({
        cartItemId: cartItem.id,
      });
    } else {
      decrementMutation.mutate({
        cartItemId: cartItem.id,
        quantity: 1,
      });
    }
  };

  if (isLoading) {
    return (
      <View
        className={`${config.button} rounded-lg bg-muted flex items-center justify-center`}
      >
        <ActivityIndicator size="small" color="#9CA3AF" />
      </View>
    );
  }

  if (isOutOfStock) {
    return (
      <View
        className={`${config.button} rounded-lg bg-muted flex items-center justify-center`}
      >
        <Text className={`${config.text} text-muted-foreground font-medium`}>
          Out of Stock
        </Text>
      </View>
    );
  }

  if (!isInCart) {
    return (
      <Pressable
        onPress={handleAddToCart}
        disabled={isUpdating}
        className={`${config.button} rounded-lg bg-primary flex-row items-center justify-center ${
          isUpdating ? "opacity-70" : "active:bg-primary/90"
        }`}
      >
        {isUpdating ? (
          <ActivityIndicator size="small" color="white" className="mr-2" />
        ) : (
          <Image
            source={require("../assets/icons/shop/cart.png")}
            style={{
              width: config.icon * 0.8,
              height: config.icon * 0.8,
              tintColor: "white",
            }}
            className="mr-2"
            resizeMode="contain"
          />
        )}
        <Text
          className={`${config.text} text-primary-foreground font-semibold`}
        >
          {isUpdating ? "Adding..." : "Add to Cart"}
        </Text>
      </Pressable>
    );
  }

  return (
    <View className="flex-row justify-between items-center bg-primary rounded-lg overflow-hidden">
      <Pressable
        onPress={handleDecrement}
        disabled={isUpdating}
        className={`w-10 h-10 items-center justify-center ${
          isUpdating ? "opacity-70" : "active:bg-primary/90"
        }`}
      >
        {decrementMutation.isPending ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Image
            source={require("../assets/icons/shop/minus.png")}
            style={{ width: 16, height: 16, tintColor: "white" }}
            resizeMode="contain"
          />
        )}
      </Pressable>

      <View className="px-3 py-2 min-w-12 items-center">
        <Text className="text-base font-semibold text-primary-foreground">
          {currentQuantity}
        </Text>
      </View>

      <Pressable
        onPress={handleIncrement}
        disabled={isUpdating || !canIncrement}
        className={`w-10 h-10 items-center justify-center ${
          isUpdating || !canIncrement ? "opacity-50" : "active:bg-primary/90"
        }`}
      >
        {incrementMutation.isPending ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Image
            source={require("../assets/icons/shop/plus.png")}
            style={{ width: 16, height: 16, tintColor: "white" }}
            resizeMode="contain"
          />
        )}
      </Pressable>
    </View>
  );
};

export default CartButton;
