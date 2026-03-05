import { useLocalSearchParams } from "expo-router";
import {
  Text,
  View,
  Image,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import CartButton from "@/components/cart-button";
import SavedButton from "@/components/saved-button";
import CartIcon from "@/components/cart-icon";

import { ICONS } from "@/constants";
const { arrowLeft } = ICONS;
const { width: screenWidth } = Dimensions.get("window");

import HeartIcon from "@/assets/icons/shop/heart.png";
import CheckMarkIcon from "@/assets/icons/shop/check-mark.png";
import CheckMarkGreenIcon from "@/assets/icons/shop/check-mark-green.png";
import StarIcon from "@/assets/icons/shop/star.png";
import StarEmptyIcon from "@/assets/icons/shop/star-empty.png";
import FilePinIcon from "@/assets/icons/shop/file-pin.png";
import SmileyFaceIcon from "@/assets/icons/shop/smiley-face.png";
import PlaceholderProductImage from "@/assets/images/shop/placeholder-product-image.png";
import ReviewsImage from "@/assets/images/shop/reviews-image.png";
import MinusIcon from "@/assets/icons/shop/minus.png";
import PlusIcon from "@/assets/icons/shop/plus.png";
import VendorLogo from "@/assets/images/shop/vendor-logo.png";
import Reviewer1 from "@/assets/images/shop/reviewer-1.png";
import Reviewer2 from "@/assets/images/shop/reviewer-1.png";
import Reviewer3 from "@/assets/images/shop/reviewer-1.png";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import Loader from "@/components/loader";
import Error from "@/components/error";
import formatPrice from "@/utils/price-formatter";
import InllineLoader from "@/components/inlline-loader";
import InlineError from "@/components/inline-error";

export default function Items() {
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    data: productData,
    isPending: isProductPending,
    error: productError,
    refetch: refetchProduct,
  } = useQuery(
    orpc.general.products.getProductById.queryOptions({
      queryKey: ["products", "by-id", id],
      input: {
        id: id as string,
      },
    })
  );

  const {
    data: reviewsData,
    isPending: isReviewsPending,
    error: reviewsError,
    refetch: refetchReviews,
  } = useQuery(
    orpc.general.products.reviews.getReviews.queryOptions({
      queryKey: ["products", "reviews", id],
      input: {
        productId: id as string,
      },
    })
  );

  const availableImages =
    productData && productData.images && productData.images.length > 0
      ? productData.images
      : productData?.primaryImage
        ? [productData?.primaryImage]
        : [];

  if (isProductPending) {
    return <Loader />;
  }

  if (productError) {
    return <Error error="Failed to load product" refetch={refetchProduct} />;
  }

  if (!productData) {
    return <Error error="Product not found" refetch={refetchProduct} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white pb-16">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-2">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-9 w-9 rounded-full bg-white justify-center items-center"
            >
              <Image
                source={arrowLeft}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <View className="flex-1 mx-3 flex-row items-center">
              <Image
                source={
                  productData.storeLogo
                    ? { uri: productData.storeLogo }
                    : VendorLogo
                }
                className="w-8 h-8 rounded-full"
                resizeMode="contain"
              />
              <View className="ml-2">
                <View className="flex-row items-center">
                  <Text className="font-bold">{productData.storeName}</Text>
                  {productData.storeVerificationStatus === "APPROVED" && (
                    <Image
                      source={CheckMarkIcon}
                      className="w-4 h-4 ml-1"
                      resizeMode="contain"
                    />
                  )}
                </View>
                <Text className="text-xs text-gray-500">
                  {productData.storeCategory}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity
                className="mr-3"
                onPress={() => router.push("/(protected)/(tabs)/shop/saved")}
              >
                <Image
                  source={HeartIcon}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <CartIcon />
            </View>
          </View>
        </View>

        <View className="mt-3 px-4">
          <View className="bg-[#F3F5F7] rounded-xl overflow-hidden">
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const slideSize = event.nativeEvent.layoutMeasurement.width;
                const index = event.nativeEvent.contentOffset.x / slideSize;
                setCurrentImageIndex(Math.round(index));
              }}
              className="h-[340px]"
            >
              {availableImages.length > 0 ? (
                availableImages.map((imageUri, index) => (
                  <View
                    key={index}
                    className="relative h-[340px]"
                    style={{ width: screenWidth - 32 }}
                  >
                    <Image
                      source={{ uri: imageUri }}
                      className="w-full h-full"
                      resizeMode="contain"
                      onError={(error) => {
                        console.warn(
                          "Failed to load image:",
                          error.nativeEvent.error
                        );
                      }}
                    />
                    <View className="absolute top-3 right-3">
                      <SavedButton
                        productId={productData.id}
                        storeId={productData.storeId}
                        size="small"
                      />
                    </View>
                  </View>
                ))
              ) : (
                <View
                  className="h-[340px] relative"
                  style={{ width: screenWidth - 32 }}
                >
                  <Image
                    source={PlaceholderProductImage}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                  <View className="absolute top-3 right-3">
                    <SavedButton
                      productId={productData.id}
                      storeId={productData.storeId}
                      size="small"
                    />
                  </View>
                </View>
              )}
            </ScrollView>
            <View className="py-3 items-center">
              <View className="flex-row items-center">
                {availableImages.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setCurrentImageIndex(index)}
                    className="mx-1"
                  >
                    <View
                      className={`w-4 h-1 rounded-full ${
                        index === currentImageIndex
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View className="p-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-semibold">{productData.name}</Text>
            <View className="flex-row items-center gap-x-2">
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Image
                  source={MinusIcon}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text className="text-lg font-bold">{quantity}</Text>
              <TouchableOpacity
                className="bg-black p-1"
                onPress={() => setQuantity(quantity + 1)}
              >
                <Image
                  source={PlusIcon}
                  className="w-4 h-4"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-row justify-between items-center mt-1">
            <Text className="text-lg font-bold text-gray-700">
              {formatPrice(parseFloat(productData.price))}
            </Text>
            <Text className="text-sm text-gray-500">
              {productData.quantity} {productData.unit} left
            </Text>
          </View>

          <View className="flex-row justify-between items-center mt-4 border-t border-b border-gray-200 py-4">
            <View className="flex-row items-center gap-x-2">
              <Image
                source={
                  productData.storeLogo
                    ? { uri: productData.storeLogo }
                    : VendorLogo
                }
                className="w-10 h-10 rounded-full"
                resizeMode="contain"
              />
              <View>
                <View className="flex-row items-center">
                  <Text className="font-bold">{productData.storeName}</Text>
                  {productData.storeVerificationStatus === "APPROVED" && (
                    <Image
                      source={CheckMarkIcon}
                      className="w-4 h-4 ml-1"
                      resizeMode="contain"
                    />
                  )}
                </View>
                <Text className="text-sm text-gray-500">
                  {productData.storeCategory}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setIsSubscribed(!isSubscribed)}>
              <View
                style={{
                  paddingHorizontal: 24,
                  paddingVertical: 8,
                  backgroundColor: isSubscribed ? "#D1FAE5" : "#19B360",
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    color: isSubscribed ? "#047857" : "#FFFFFF",
                  }}
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className="mt-6">
            <Text className="font-bold text-base text-slate-400">
              Product Description
            </Text>
            <Text className="text-gray-600 text-sm mt-2">
              {productData.description || "No description available"}
            </Text>
          </View>

          <View className="mt-6">
            {productData.weight && (
              <View className="flex-row justify-between items-center py-2 border-b border-gray-200 pb-6">
                <Text className="text-slate-400">Weight</Text>
                <Text className="font-bold">{productData.weight}</Text>
              </View>
            )}
            {productData.dimensions && (
              <View className="flex-row justify-between items-center py-2 border-b border-gray-200 pb-6">
                <Text className="text-slate-400">Dimensions</Text>
                <Text className="font-bold">{productData.dimensions}</Text>
              </View>
            )}
            <View className="flex-row justify-between items-center py-2 border-b border-gray-200 pb-6">
              <Text className="text-slate-400">Unit</Text>
              <Text className="font-bold">{productData.unit}</Text>
            </View>
            {productData.badge && (
              <View className="flex-row justify-between items-center py-2 border-b border-gray-200 pb-6">
                <Text className="text-slate-400">Badge</Text>
                <Text className="font-bold">{productData.badge}</Text>
              </View>
            )}
            <View className="flex-row justify-between items-center py-2 border-b border-gray-200 pb-6">
              <Text className="text-slate-400">Stock Status</Text>
              <Text
                className={`font-bold ${productData.inStock ? "text-green-600" : "text-red-600"}`}
              >
                {productData.inStock ? "In Stock" : "Out of Stock"}
              </Text>
            </View>
          </View>

          <View className="mt-6 mb-4">
            <Text className="font-bold text-xl">Reviews</Text>
            <ImageBackground
              source={ReviewsImage}
              className="mt-2 p-4 rounded-lg overflow-hidden"
            >
              <View className="flex-row items-center">
                <Text className="text-5xl font-bold text-white">
                  {productData.averageRating
                    ? productData.averageRating.toFixed(1)
                    : "0.0"}
                </Text>
                <View className="ml-4">
                  <Text className="text-white">
                    {productData.reviewCount || 0} review
                    {(productData.reviewCount || 0) !== 1 ? "s" : ""}
                  </Text>
                  <View className="flex-row">
                    {[...Array(5)].map((_, i) => {
                      const rating = productData.averageRating || 0;
                      const isFilled = i < Math.floor(rating);
                      const isPartial =
                        i === Math.floor(rating) && rating % 1 !== 0;

                      return (
                        <Image
                          key={`star-${i}`}
                          source={
                            isFilled || isPartial ? StarIcon : StarEmptyIcon
                          }
                          className="w-5 h-5"
                          resizeMode="contain"
                        />
                      );
                    })}
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>

          {isReviewsPending ? (
            <InllineLoader />
          ) : reviewsError ? (
            <InlineError
              error="Failed to load reviews"
              refetch={refetchReviews}
            />
          ) : reviewsData && reviewsData.length > 0 ? (
            reviewsData.map((review) => (
              <View className="mt-4">
                <Review
                  image={Reviewer1}
                  name="Samuel Jide"
                  rating={4.5}
                  date="Today, 20th July, 12:14"
                  comment="My last order was in good condition and arrived on time. He is trusted and reliable."
                  verified
                />
                <Review
                  image={Reviewer2}
                  name="Nika Patrick"
                  rating={4.0}
                  date="Yesterday, 19th July, 11:28"
                  comment="Always trying to reach out to me to ensure my package reached me."
                  verified
                />
              </View>
            ))
          ) : (
            <Text className="text-gray-500 text-center">No reviews found</Text>
          )}

          <View className="flex-row mt-4 items-center bg-gray-100 rounded-full p-2">
            <Image
              source={Reviewer3}
              className="w-8 h-8 rounded-full"
              resizeMode="contain"
            />
            <Text className="flex-1 mx-2 text-gray-500">Write a review...</Text>
            <Image
              source={FilePinIcon}
              className="w-6 h-6"
              resizeMode="contain"
            />
            <Image
              source={SmileyFaceIcon}
              className="w-6 h-6 ml-2"
              resizeMode="contain"
            />
          </View>
        </View>
      </ScrollView>
      <View className="p-4 border-t border-gray-200">
        <CartButton
          productId={productData.id}
          storeId={productData.storeId}
          size="large"
        />
      </View>
    </SafeAreaView>
  );
}

const Review = ({
  image,
  name,
  rating,
  date,
  comment,
  verified,
}: {
  image: any;
  name: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}) => (
  <View className="flex-row mt-4">
    <Image source={image} className="w-10 h-10 rounded-full" />
    <View className="ml-3 flex-1">
      <View className="flex-row justify-between">
        <View className="flex-row items-center">
          <Text className="font-bold">{name}</Text>
          {verified && (
            <Image source={CheckMarkGreenIcon} className="w-4 h-4 ml-1" />
          )}
        </View>
        <Text className="text-xs text-gray-500">{date}</Text>
      </View>
      <Text className="text-gray-600 mt-1">{comment}</Text>
      <View className="flex-row items-center mt-1">
        <View className="flex-row">
          {[...Array(Math.floor(rating))].map((_, i) => (
            <Image key={`star-${i}`} source={StarIcon} className="w-4 h-4" />
          ))}
          {rating % 1 !== 0 && <Image source={StarIcon} className="w-4 h-4" />}
          {[...Array(5 - Math.ceil(rating))].map((_, i) => (
            <Image
              key={`empty-star-${i}`}
              source={StarEmptyIcon}
              className="w-4 h-4"
            />
          ))}
        </View>
        <Text className="text-xs text-gray-500 ml-2">{rating}</Text>
      </View>
    </View>
  </View>
);
