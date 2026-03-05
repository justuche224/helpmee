import { SafeAreaView } from "react-native-safe-area-context";
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "@/constants";
import CartIcon from "@/components/cart-icon";
import ProductCard from "@/components/product-card";

// assets
import HeartIcon from "@/assets/icons/shop/heart.png";
import ArrowRightIcon from "@/assets/icons/shop/arrow-right.png";
import AddBanner1 from "@/assets/images/shop/add-banner-1.png";
import Loader from "@/components/loader";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import Error from "@/components/error";
import SearchBar from "@/components/search-bar";
import { Container } from "@/components/container";

const index = () => {
  const [hasCompletedShopOnboarding, setHasCompletedShopOnboarding] = useState<
    boolean | null
  >(null);
  const [refreshing, setRefreshing] = useState(false);
  const hasRedirected = useRef(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const stored = await SecureStore.getItemAsync(
          STORAGE_KEYS.SHOP_ONBOARDING_COMPLETED
        );
        setHasCompletedShopOnboarding(stored === "true");
      } catch (error) {
        console.warn("Failed to load shop onboarding status:", error);
        setHasCompletedShopOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (hasCompletedShopOnboarding === false && !hasRedirected.current) {
      hasRedirected.current = true;
      const timer = setTimeout(() => {
        router.push("/(protected)/shop-onboarding?fromShop=true");
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [hasCompletedShopOnboarding]);

  const {
    data: productsData,
    isPending: isProductsPending,
    refetch: refetchProducts,
    error: productsError,
  } = useQuery(
    orpc.general.products.getProducts.queryOptions({
      queryKey: ["products", "recommended"],
      input: {
        limit: 20,
        page: 1,
        offset: 0,
        getRecommended: true,
        sortBy: "newest",
        inStockOnly: true,
      },
      staleTime: 1000 * 60 * 5,
      retry: 3,
    })
  );

  const {
    data: categoriesData,
    isPending: isCategoriesPending,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery(orpc.general.categories.getPreferedCategories.queryOptions());

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchProducts(), refetchCategories()]);
    } finally {
      setRefreshing(false);
    }
  };

  if (hasCompletedShopOnboarding === null) {
    return <Loader />;
  }

  if (!hasCompletedShopOnboarding) {
    return <Loader />;
  }

  if (isProductsPending || isCategoriesPending) {
    return <Loader />;
  }

  if (productsError && categoriesError) {
    return (
      <Error
        error="Failed to load shop data"
        refetch={() => {
          refetchProducts();
          refetchCategories();
        }}
      />
    );
  }

  const products = productsData?.products || [];

  const renderHeader = () => (
    <>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2 mt-2">
        <Text className="text-3xl font-bold">Store</Text>
        <View className="flex-row items-center gap-x-4">
          <TouchableOpacity
            onPress={() => router.push("/(protected)/(tabs)/shop/saved")}
          >
            <Image
              source={HeartIcon}
              className="w-7 h-7"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <CartIcon />
        </View>
      </View>

      {/* Search Bar */}
      <SearchBar showFilter={false} />

      {/* Black Friday Banner */}
      <View className="px-4 my-4">
        <Image
          source={AddBanner1}
          className="w-full h-40 rounded-lg"
          resizeMode="cover"
        />
      </View>

      {/* Categories */}
      <View className="px-4 my-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold">Browse By Categories</Text>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => router.push("/(protected)/(tabs)/shop/categories")}
          >
            <Text className="text-[#19B360]">View All</Text>
            <Image
              source={ArrowRightIcon}
              className="w-4 h-4 ml-1"
              resizeMode="contain"
              style={{ tintColor: "#19B360" }}
            />
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-around">
          {categoriesData && categoriesData.length > 0 ? (
            categoriesData.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() =>
                  router.push(
                    `/(protected)/(tabs)/shop/categories/${category.id}`
                  )
                }
                className="items-center"
              >
                <View className="bg-gray-100 p-2 rounded-full">
                  <Image
                    source={{ uri: category.icon }}
                    className="w-6 h-6"
                    resizeMode="contain"
                  />
                </View>
                <Text className="mt-2 text-sm">
                  {category.name.length > 10
                    ? category.name.slice(0, 10) + "..."
                    : category.name}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View className="flex-1 items-center justify-center py-4">
              <Text className="text-gray-500 text-center">
                {categoriesError
                  ? "Failed to load categories"
                  : "No categories available"}
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );

  const renderFooter = () => (
    <>
      <View></View>
    </>
  );

  const getProductSections = () => {
    const sections = [];

    // Recommendations section
    if (products.length > 0) {
      sections.push({
        title: "Recommendations",
        data: products.slice(0, 4),
        type: "products",
      });
    }

    // More products section
    if (products.length > 4) {
      sections.push({
        title: "More Products",
        data: products.slice(4),
        type: "products",
      });
    }

    return sections;
  };

  const productSections = getProductSections();

  return (
    <Container>
      {productSections.length > 0 ? (
        <FlatList
          data={productSections}
          keyExtractor={(item, index) => `${item.title}-${index}`}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          renderItem={({ item }) => (
            <View className="px-4 my-4">
              <Text className="text-lg font-semibold mb-2">{item.title}</Text>
              <View className="flex-row flex-wrap justify-between">
                {item.data.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    className="w-[48%] mb-4"
                  />
                ))}
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#19B360"]}
              tintColor="#19B360"
            />
          }
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#19B360"]}
              tintColor="#19B360"
            />
          }
        >
          {renderHeader()}
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500 text-center">
              No products available at the moment
            </Text>
          </View>
          {renderFooter()}
        </ScrollView>
      )}
    </Container>
  );
};

export default index;
