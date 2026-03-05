import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { router } from "expo-router";
import CartButton from "@/components/cart-button";
import SavedButton from "@/components/saved-button";
import formatPrice from "@/utils/price-formatter";

// Assets
import StarIcon from "@/assets/icons/shop/star.png";
import PlaceholderProductImage from "@/assets/images/shop/placeholder-product-image.png";

interface Product {
  id: string;
  name: string;
  price: string;
  primaryImage?: string | null;
  averageRating: number;
  ratingCount: number;
  quantity: number;
  unit: string;
  inStock: boolean;
  storeId: string;
  badge?: string | null;
}

interface ProductCardProps {
  product: Product;
  onProductPress?: () => void;
  showCartButton?: boolean;
  showSavedButton?: boolean;
  className?: string;
}

const ProductCard = React.memo(
  ({
    product,
    onProductPress,
    showCartButton = true,
    showSavedButton = true,
    className = "",
  }: ProductCardProps) => {
    const handleProductPress = () => {
      if (onProductPress) {
        onProductPress();
      } else {
        router.push(`/(protected)/(tabs)/shop/items/${product.id}`);
      }
    };

    return (
      <View className={`mb-4 ${className}`}>
        <TouchableOpacity
          className="w-full bg-[#FAFAFA] rounded-lg border border-gray-100"
          onPress={handleProductPress}
        >
          <Image
            source={
              product.primaryImage
                ? { uri: product.primaryImage }
                : PlaceholderProductImage
            }
            className="w-full h-40 rounded-lg aspect-square mx-auto"
            resizeMode="contain"
          />
          {showSavedButton && (
            <View className="absolute top-4 right-4">
              <SavedButton
                productId={product.id}
                storeId={product.storeId}
                size="small"
              />
            </View>
          )}
          {product.badge && (
            <View className="absolute top-2 left-2 bg-[#19B360] px-2 py-1 rounded">
              <Text className="text-white text-xs font-bold">
                {product.badge}
              </Text>
            </View>
          )}
          <Text className="font-semibold mt-2 text-sm" numberOfLines={1}>
            {product.name}
          </Text>
          <View className="flex-row items-center mt-1">
            <Image
              source={StarIcon}
              className="w-4 h-4"
              resizeMode="contain"
              style={{ tintColor: "#FBBF24" }}
            />
            <Text className="text-sm ml-1">{product.averageRating}</Text>
            <Text className="text-sm text-gray-500 ml-1">
              | {product.ratingCount} reviews
            </Text>
          </View>
          <Text className="text-xs text-gray-500 mt-1">
            {product.quantity} {product.unit}{" "}
            {product.inStock ? "in stock" : "out of stock"}
          </Text>
          <Text className="text-lg font-bold mt-1">
            {formatPrice(parseFloat(product.price ?? "0"))}
          </Text>
        </TouchableOpacity>

        {showCartButton && (
          <View className="mt-2">
            <CartButton
              productId={product.id}
              storeId={product.storeId}
              size="medium"
            />
          </View>
        )}
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.name === nextProps.product.name &&
      prevProps.product.price === nextProps.product.price &&
      prevProps.product.primaryImage === nextProps.product.primaryImage &&
      prevProps.product.averageRating === nextProps.product.averageRating &&
      prevProps.product.ratingCount === nextProps.product.ratingCount &&
      prevProps.product.quantity === nextProps.product.quantity &&
      prevProps.product.inStock === nextProps.product.inStock &&
      prevProps.product.badge === nextProps.product.badge &&
      prevProps.showCartButton === nextProps.showCartButton &&
      prevProps.showSavedButton === nextProps.showSavedButton &&
      prevProps.className === nextProps.className
    );
  }
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
