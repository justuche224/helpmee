import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import { orpc } from "@/utils/orpc";
import { Container } from "@/components/container";
import Loader from "@/components/loader";
import { ICONS } from "@/constants";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Error from "@/components/error";
import Logo from "@/assets/icon.png";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/lib/use-color-scheme";
import plusIcon from "@/assets/icons/shop/plus.png";
import placeHoderProductImage from "@/assets/images/shop/placeholder-product-image.png";
import formatPrice from "@/utils/price-formatter";

const checkMark = ICONS.checkMark;
const heartFilledIcon = ICONS.HeartFilledIcon;
const heartIcon = ICONS.HeartIcon;
const starIcon = ICONS.StarIcon;
const { width: screenWidth } = Dimensions.get("window");

export default function MyShop() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = React.useState(0);
  const { isDarkColorScheme } = useColorScheme();
  const {
    data: store,
    isPending: isStorePending,
    error: storeError,
    refetch: refetchStore,
  } = useQuery(
    orpc.store.getUsersStore.queryOptions({
      queryKey: ["user-store"],
    })
  );

  const {
    data: productsData,
    isPending: isProductsPending,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery(
    orpc.products.getProducts.queryOptions({
      queryKey: ["products"],
      retry: false,
      input: {
        limit: 10,
        page: 1,
        offset: 0,
      },
    })
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchStore(), refetchProducts()]);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchStore, refetchProducts]);

  if (isStorePending || isProductsPending) {
    return <Loader />;
  }

  if (storeError) {
    console.log("storeError (my-shop)", storeError);
    const noStoreError = storeError.message === "You don't have a store";
    if (noStoreError) {
      return (
        <Container>
          <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
          <View className="flex-1 items-center justify-center bg-white px-6">
            <Image
              source={Logo}
              className="w-20 h-20 mb-8"
              resizeMode="contain"
            />

            <View className="items-center mb-8">
              <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
                Oops!
              </Text>
              <Text className="text-gray-600 text-center mb-4 leading-6">
                {storeError.message}
              </Text>
            </View>

            <View className="w-full gap-y-4">
              <TouchableOpacity
                onPress={() => router.push("/profile/manage-shop/create-shop")}
                className="bg-[#19B360] py-4 px-8 rounded-lg w-full"
                activeOpacity={0.8}
              >
                <Text className="text-white text-center font-semibold text-lg">
                  Create Store
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.replace("/(protected)/(tabs)/shop")}
                className="border border-gray-300 py-4 px-8 rounded-lg w-full"
                activeOpacity={0.8}
              >
                <Text className="text-gray-700 text-center font-semibold text-lg">
                  Browse Stores
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Container>
      );
    }
    return <Error error={storeError.message} refetch={refetchStore} />;
  }

  if (!store) {
    console.log("store (my-shop)", store);
    return <Error error="Store not found" refetch={refetchStore} />;
  }

  if (productsError) {
    console.log("productsError (my-shop)", productsError);
    return <Error error={productsError.message} refetch={refetchProducts} />;
  }

  const renderBannerCarousel = () => {
    if (!store?.banners || store.banners.length === 0) {
      return (
        <View className="h-48 w-full rounded-lg overflow-hidden">
          <LinearGradient
            colors={["#667eea", "#764ba2", "#f093fb", "#f5576c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-1 items-center justify-center"
          >
            <TouchableOpacity
              onPress={() =>
                router.push("/(protected)/(tabs)/profile/manage-shop/banners")
              }
              className="items-center"
            >
              <Image
                source={plusIcon}
                className="w-12 h-12 mb-3 opacity-80"
                resizeMode="contain"
              />
              <Text className="text-white font-semibold text-lg mb-1">
                Add Your First Banner
              </Text>
              <Text className="text-white/80 text-center text-sm px-4">
                Showcase your store with beautiful banners
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      );
    }

    if (store.banners.length === 1) {
      return (
        <TouchableOpacity
          onPress={() =>
            router.push("/(protected)/(tabs)/profile/manage-shop/banners")
          }
          className="h-48 w-full rounded-lg overflow-hidden"
        >
          <Image
            source={{ uri: store.banners[0].banner }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }

    // Multiple banners - show carousel
    return (
      <View className="h-48 w-full rounded-lg overflow-hidden relative">
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const slideSize = event.nativeEvent.layoutMeasurement.width;
            const index = event.nativeEvent.contentOffset.x / slideSize;
            setCurrentBannerIndex(Math.round(index));
          }}
          className="flex-1"
        >
          {store.banners.map((banner, index) => (
            <TouchableOpacity
              key={banner.id}
              onPress={() =>
                router.push("/(protected)/(tabs)/profile/manage-shop/banners")
              }
              className="w-full h-48"
              style={{ width: screenWidth - 48 }}
            >
              <Image
                source={{ uri: banner.banner }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Carousel indicators */}
        <View className="absolute bottom-3 left-0 right-0 flex-row justify-center">
          {store.banners.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === currentBannerIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </View>
      </View>
    );
  };

  if (store.template === "Star Gate") {
    return (
      <Container>
        <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <Image
                source={ICONS.arrowLeft}
                className="w-auto h-5 text-black"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <View className="relative mr-2">
                {store?.logo ? (
                  <View className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      source={{ uri: store.logo }}
                      className="w-full h-full"
                      resizeMode="contain"
                    />
                  </View>
                ) : (
                  <View className="w-12 h-12 p-3 rounded-full overflow-hidden bg-green-500">
                    <Image
                      source={plusIcon}
                      className="w-full h-full"
                      resizeMode="contain"
                    />
                  </View>
                )}
                <TouchableOpacity
                  onPress={() =>
                    router.push(
                      "/(protected)/(tabs)/profile/manage-shop/update-logo"
                    )
                  }
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full items-center justify-center border-2 border-white"
                >
                  <Image
                    source={ICONS.upload}
                    className="w-3 h-3"
                    resizeMode="contain"
                    style={{ tintColor: "white" }}
                  />
                </TouchableOpacity>
              </View>
              <View className="justify-center">
                <Text className="text-lg font-medium">
                  {store?.name}
                  {store.verificationStatus === "APPROVED" && (
                    <Text className="text-sm text-green-500 ml-2 flex-row items-center gap-x-1">
                      Verified{" "}
                      <Image
                        source={checkMark}
                        className="w-4 h-4"
                        resizeMode="contain"
                      />
                    </Text>
                  )}
                </Text>
                <Text className="text-sm text-gray-500">{store?.category}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity className="bg-black/20 rounded-lg p-2 relative">
            <Image
              source={ICONS.notificationBell}
              className="w-6 h-6"
              resizeMode="contain"
            />
            <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </TouchableOpacity>
        </View>
        <ScrollView
          className="flex-1 gap-y-4 px-6 mb-16"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#19B360"]}
              tintColor="#19B360"
            />
          }
        >
          <View className="w-full">
            <View className="mt-2 flex-row justify-between">
              <Text className="text-lg font-semibold">Banners</Text>
              <TouchableOpacity
                onPress={() =>
                  router.push("/(protected)/(tabs)/profile/manage-shop/banners")
                }
              >
                <Text className="text-green-500 text-center text-base font-bold">
                  Manage
                </Text>
              </TouchableOpacity>
            </View>
            <View className="mt-2">{renderBannerCarousel()}</View>
          </View>
          <View className="h-5 w-5"></View>
          <View className="gap-y-1">
            <Text className="text-2xl tracking-tight font-bold">
              Welcome to {store.name}
            </Text>
            <View>
              <Text style={{ color: "#8E9BAE" }}>{store.address}</Text>
              <Text style={{ color: "#8E9BAE" }}>{store.phoneNumber}</Text>
              <View className="flex-row items-start justify-between">
                <Text
                  style={{ color: "#8E9BAE" }}
                  className="text-sm flex-1 mr-2"
                >
                  {store.description || "No description added yet"}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    router.push(
                      "/(protected)/(tabs)/profile/manage-shop/update-public-description"
                    )
                  }
                  className="p-1"
                >
                  <Image
                    source={ICONS.edit}
                    className="w-4 h-4"
                    resizeMode="contain"
                    style={{ tintColor: "#8E9BAE" }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View className="my-2 flex-row justify-between">
            <Text
              style={{ color: "#8E9BAE" }}
              className="text-lg font-semibold"
            >
              Products
            </Text>
            <TouchableOpacity
              onPress={() =>
                router.push(
                  "/(protected)/(tabs)/profile/manage-shop/upload-items"
                )
              }
            >
              <Text className="text-green-500 text-center text-base font-bold">
                Add Product
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap justify-between">
            {productsData?.map((product, index) => (
              <TouchableOpacity
                key={product.id}
                className="w-[48%] mb-4 bg-[#FAFAFA] rounded-lg border border-gray-100"
                onPress={() =>
                  router.push(`/(protected)/(tabs)/shop/items/${product.id}`)
                }
              >
                <Image
                  source={
                    product.primaryImage
                      ? { uri: product.primaryImage }
                      : placeHoderProductImage
                  }
                  className="w-full h-40 rounded-lg"
                  resizeMode="contain"
                />
                <TouchableOpacity
                  className="absolute top-4 right-4 bg-white p-1.5 rounded-full"
                  onPress={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Image
                    source={heartIcon}
                    className="w-5 h-5"
                    resizeMode="contain"
                    style={{ tintColor: "black" }}
                  />
                </TouchableOpacity>
                <View className="flex-1 bg-white p-2">
                  <Text className="font-semibold mt-2 text-sm">
                    {product.name}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Image
                      source={starIcon}
                      className="w-4 h-4"
                      resizeMode="contain"
                      style={{ tintColor: "#FBBF24" }}
                    />
                    <Text className="text-sm ml-1">
                      {product.averageRating ? product.averageRating : 0}
                    </Text>
                    <Text className="text-sm text-gray-500 ml-1">
                      | {product.quantity} {product.unit} left
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-500 mt-1">
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </Text>
                  <Text className="text-lg font-bold mt-1">
                    {formatPrice(Number(product.price))}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Container>
    );
  }

  if (store.template === "Lex Mojo") {
    return (
      <Container>
        <ScrollView
          className="flex-1 gap-y-4 mb-16"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#19B360"]}
              tintColor="#19B360"
            />
          }
        >
          <View className="relative">
            {/* <Image
              source={placeHolderImage}
              className="h-64 w-full"
              resizeMode="cover"
            /> */}
            <LinearGradient
              className="h-64 w-full"
              colors={["#4bd150", "#ace35f", "#2ee827"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <TouchableOpacity
              className="absolute top-12 left-4 bg-black p-2 rounded-lg"
              onPress={() => router.back()}
            >
              <Image
                source={ICONS.arrowLeft}
                className="w-6 h-6"
                resizeMode="contain"
                style={{ tintColor: "white" }}
              />
            </TouchableOpacity>
            <TouchableOpacity className="absolute top-12 bg-black p-2 rounded-lg right-4 ">
              <Image
                source={ICONS.cart}
                className="w-6 h-6"
                resizeMode="contain"
                style={{ tintColor: "white" }}
              />
              <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">3</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Banner Section */}
          <View className="px-6 -mt-4 mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white text-lg font-semibold">
                Store Banners
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push("/(protected)/(tabs)/profile/manage-shop/banners")
                }
              >
                <Text className="text-white text-base font-medium">Manage</Text>
              </TouchableOpacity>
            </View>
            {renderBannerCarousel()}
          </View>

          <View className="bg-white rounded-t-3xl -mt-8 flex-1 px-6">
            <View className="items-center -mt-8 mb-6">
              <View className="relative">
                <View className="w-20 h-20 rounded-full overflow-hidden border-4 border-white">
                  {store?.logo ? (
                    <Image
                      source={{ uri: store.logo }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full bg-gray-300 items-center justify-center">
                      <Image
                        source={plusIcon}
                        className="w-10 h-10"
                        resizeMode="contain"
                      />
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() =>
                    router.push(
                      "/(protected)/(tabs)/profile/manage-shop/update-logo"
                    )
                  }
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full items-center justify-center border-2 border-white"
                >
                  <Image
                    source={ICONS.upload}
                    className="w-4 h-4"
                    resizeMode="contain"
                    style={{ tintColor: "white" }}
                  />
                </TouchableOpacity>
              </View>
              <Text className="text-2xl font-bold mt-4">{store?.name}</Text>
              <View className="flex-row items-center mt-2">
                {store.verificationStatus === "APPROVED" && (
                  <>
                    <Text className="text-sm text-gray-500 mr-1">
                      Verified Vendor
                    </Text>
                    <Image
                      source={checkMark}
                      className="w-4 h-4"
                      resizeMode="contain"
                      style={{ tintColor: "#F59E0B" }}
                    />
                  </>
                )}
              </View>
              <Text className="text-sm text-gray-500 mt-1">
                {store?.category}
              </Text>

              <View className="space-y-3 mb-6 items-center">
                <View className="flex-row items-center">
                  <Image
                    source={ICONS.mapPin}
                    className="w-4 h-4 mr-2"
                    resizeMode="contain"
                    // style={{ tintColor: "#8E9BAE" }}
                  />
                  <Text className="text-sm text-gray-500">
                    {store?.address}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Image
                    source={ICONS.phone}
                    className="w-4 h-4 mr-2"
                    resizeMode="contain"
                    style={{ tintColor: "#8E9BAE" }}
                  />
                  <Text className="text-sm text-gray-500">
                    {store?.phoneNumber}
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <Text className="text-sm text-gray-500 leading-5 flex-1 mr-2">
                    {store?.description || "No description added yet"}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      router.push(
                        "/(protected)/(tabs)/profile/manage-shop/update-public-description"
                      )
                    }
                    className="p-1"
                  >
                    <Image
                      source={ICONS.edit}
                      className="w-4 h-4"
                      resizeMode="contain"
                      style={{ tintColor: "#8E9BAE" }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          <View className="px-6">
            <View className="my-2 flex-row justify-between">
              <Text
                style={{ color: "#8E9BAE" }}
                className="text-lg font-semibold"
              >
                Products
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    "/(protected)/(tabs)/profile/manage-shop/upload-items"
                  )
                }
              >
                <Text className="text-green-500 text-center text-base font-bold">
                  Add Product
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap justify-between">
              {productsData?.map((product, index) => (
                <TouchableOpacity
                  key={product.id}
                  className="w-[48%] mb-4 bg-[#FAFAFA] rounded-lg border border-gray-100"
                  onPress={() =>
                    router.push(`/(protected)/(tabs)/shop/items/${product.id}`)
                  }
                >
                  <Image
                    source={
                      product.primaryImage
                        ? { uri: product.primaryImage }
                        : placeHoderProductImage
                    }
                    className="w-full h-40 rounded-lg"
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    className="absolute top-4 right-4 bg-white p-1.5 rounded-full"
                    onPress={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Image
                      source={heartIcon}
                      className="w-5 h-5"
                      resizeMode="contain"
                      style={{ tintColor: "black" }}
                    />
                  </TouchableOpacity>
                  <View className="flex-1 bg-white p-2">
                    <Text className="font-semibold mt-2 text-sm">
                      {product.name}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Image
                        source={starIcon}
                        className="w-4 h-4"
                        resizeMode="contain"
                        style={{ tintColor: "#FBBF24" }}
                      />
                      <Text className="text-sm ml-1">
                        {product.averageRating ? product.averageRating : 0}
                      </Text>
                      <Text className="text-sm text-gray-500 ml-1">
                        | {product.quantity} {product.unit} left
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500 mt-1">
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </Text>
                    <Text className="text-lg font-bold mt-1">
                      {formatPrice(Number(product.price))}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </Container>
    );
  }

  if (store.template === "Mee Star") {
    return (
      <Container>
        <View>
          <Text>Coming soon</Text>
        </View>
      </Container>
    );
  }

  return <View></View>;
}
