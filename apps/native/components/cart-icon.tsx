import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import CartIconAsset from "@/assets/icons/shop/cart.png";

const CartIcon = React.memo(() => {
  const {
    data: cartItems,
    isLoading,
    error,
  } = useQuery(
    orpc.general.cart.getCart.queryOptions({
      queryKey: ["cart"],
      retry: 1,
    })
  );

  const totalItems =
    cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  const handlePress = () => {
    router.push("/(protected)/(tabs)/shop/cart");
  };

  if (isLoading) {
    return (
      <View className="relative">
        <View className="w-7 h-7 items-center justify-center">
          <ActivityIndicator size="small" color="#9CA3AF" />
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} className="relative">
      <Image
        source={CartIconAsset}
        className="w-7 h-7"
        resizeMode="contain"
        style={{ tintColor: "black" }}
      />
      {totalItems > 0 && (
        <View className="absolute -top-2 -right-2 bg-[#19B360] rounded-full min-w-5 h-5 items-center justify-center px-1">
          <Text className="text-white text-xs font-bold">
            {totalItems > 99 ? "99+" : totalItems}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

CartIcon.displayName = "CartIcon";

export default CartIcon;
