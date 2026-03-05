import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

import ProductCard from "@/components/product-card";
import Loader from "@/components/loader";
import Error from "@/components/error";

import { useDebounce } from "@/hooks/use-debounce";

import ArrowLeftIcon from "@/assets/icons/home/arrow-left.png";
import FilterIcon from "@/assets/icons/shop/filter.png";

import { ICONS } from "@/constants";
const { arrowDown } = ICONS;

interface SearchFilters {
  searchIn: "all" | "products" | "stores";
  sortBy: "relevance" | "price_asc" | "price_desc" | "rating" | "newest";
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
}

const SearchScreen = () => {
  const { initialQuery } = useLocalSearchParams<{ initialQuery?: string }>();
  const [searchQuery, setSearchQuery] = useState(initialQuery || "");
  const [showFilters, setShowFilters] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "products" | "stores">(
    "all"
  );

  const [filters, setFilters] = useState({
    gender: "",
    category: "",
    priceRange: [0, 10000000] as [number, number],
    searchBy: "Most popular",
    brands: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
  });

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const debouncedQuery = useDebounce(searchQuery, 500);

  const {
    data: searchData,
    isPending: isSearchPending,
    error: searchError,
    refetch: refetchSearch,
  } = useQuery(
    orpc.general.products.search.queryOptions({
      queryKey: ["search", debouncedQuery, activeTab, filters],
      input: {
        query: debouncedQuery,
        limit: 20,
        page: 1,
        searchIn: activeTab,
        sortBy:
          filters.searchBy === "Most popular"
            ? "relevance"
            : filters.searchBy === "Price: High - Low"
              ? "price_desc"
              : filters.searchBy === "Price: Low - High"
                ? "price_asc"
                : filters.searchBy === "New items"
                  ? "newest"
                  : "rating",
        categoryId: filters.category || undefined,
        minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
        maxPrice:
          filters.priceRange[1] < 10000000 ? filters.priceRange[1] : undefined,
        inStockOnly: true,
      },
      enabled: debouncedQuery.length >= 2,
      staleTime: 1000 * 60 * 2,
    })
  );

  const { data: categoriesData } = useQuery(
    orpc.general.categories.getAllCategories.queryOptions()
  );

  const searchByOptions = [
    "Most popular",
    "New items",
    "Price: High - Low",
    "Price: Low - High",
    "Rating",
  ];

  const shadowStyle = Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: { elevation: 4 },
  });

  const handleClearAll = () => {
    setFilters({
      gender: "",
      category: "",
      priceRange: [0, 10000000],
      searchBy: "Most popular",
      brands: [],
      sizes: [],
      colors: [],
    });
  };

  const renderSearchResults = () => {
    if (!searchData) return null;

    const { stores = [], products = [] } = searchData;

    let displayStores = stores;
    let displayProducts = products;

    if (activeTab === "stores") {
      displayProducts = [];
    } else if (activeTab === "products") {
      displayStores = [];
    }

    const renderStoreItem = ({ item }: { item: any }) => (
      <TouchableOpacity className="bg-white rounded-lg p-4 mb-3 mx-4 border border-gray-100">
        <View className="flex-row items-center">
          {item.logo ? (
            <Image
              source={{ uri: item.logo }}
              className="w-12 h-12 rounded-full mr-3"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-gray-200 mr-3 items-center justify-center">
              <Text className="text-gray-500 font-bold text-lg">
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {item.name}
            </Text>
            <Text className="text-sm text-gray-600" numberOfLines={2}>
              {item.description}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              {item.categoryName} • {item.city || item.state || item.country}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );

    const renderProductItem = ({ item }: { item: any }) => (
      <ProductCard product={item} className="w-[48%] mb-4 mx-2" />
    );

    return (
      <View className="flex-1">
        {/* Tab selector */}
        <View className="flex-row bg-gray-100 mx-4 rounded-lg p-1 mb-4">
          {[
            { key: "all", label: "All" },
            { key: "products", label: "Products" },
            { key: "stores", label: "Stores" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 rounded-md ${
                activeTab === tab.key ? "bg-white" : ""
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  activeTab === tab.key ? "text-gray-900" : "text-gray-600"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results count */}
        {(displayStores.length > 0 || displayProducts.length > 0) && (
          <View className="px-4 mb-3">
            <Text className="text-gray-600">
              {displayStores.length + displayProducts.length} results found
            </Text>
          </View>
        )}

        {/* Stores results */}
        {displayStores.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold px-4 mb-3">Stores</Text>
            <FlatList
              data={displayStores}
              renderItem={renderStoreItem}
              keyExtractor={(item) => `store-${item.id}`}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Products results */}
        {displayProducts.length > 0 && (
          <View>
            <Text className="text-lg font-semibold px-4 mb-3">Products</Text>
            <View className="px-2">
              <FlatList
                data={displayProducts}
                renderItem={renderProductItem}
                keyExtractor={(item) => `product-${item.id}`}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            </View>
          </View>
        )}

        {/* No results */}
        {displayStores.length === 0 &&
          displayProducts.length === 0 &&
          debouncedQuery.length >= 2 && (
            <View className="flex-1 items-center justify-center py-12">
              <Text className="text-gray-500 text-center text-lg mb-2">
                No results found
              </Text>
              <Text className="text-gray-400 text-center">
                Try adjusting your search or filters
              </Text>
            </View>
          )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-2 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-9 w-9 rounded-full bg-gray-100 justify-center items-center mr-3"
          >
            <Image
              source={ArrowLeftIcon}
              className="w-5 h-5"
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View className="flex-1 flex-row items-center justify-between rounded-lg bg-gray-50 px-3 mr-3">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for products, stores..."
              className="flex-1 py-3 text-base"
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                className="p-1"
              >
                <Text className="text-gray-400 text-lg">×</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            className="h-11 w-11 rounded-lg bg-black justify-center items-center"
          >
            <Image
              source={FilterIcon}
              className="w-5 h-5"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Results */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isSearchPending && debouncedQuery.length >= 2 ? (
            <View className="flex-1 items-center justify-center py-12">
              <Loader />
              <Text className="text-gray-500 mt-4">Searching...</Text>
            </View>
          ) : searchError ? (
            <Error error="Failed to search" refetch={refetchSearch} />
          ) : (
            renderSearchResults()
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="px-4 pt-2 bg-white border-b border-gray-100">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Image
                  source={ArrowLeftIcon}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-900">Filters</Text>
              <TouchableOpacity onPress={handleClearAll}>
                <Text className="text-green-500 font-medium text-base">
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="flex-1 px-4 pt-4"
          >
            {/* Category Dropdown */}
            <View className="mb-4">
              <Text className="text-base font-medium text-gray-900 mb-2">
                Category
              </Text>
              <TouchableOpacity
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="border border-gray-300 rounded-2xl px-4 py-4 flex-row justify-between items-center"
              >
                <Text
                  className={`text-base ${
                    filters.category ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {filters.category
                    ? categoriesData?.find((cat) => cat.id === filters.category)
                        ?.name || "Selected Category"
                    : "Select Category"}
                </Text>
                <Image
                  source={arrowDown}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
              </TouchableOpacity>
              {showCategoryDropdown && (
                <View
                  className="border border-gray-200 rounded-2xl mt-1 bg-white"
                  style={shadowStyle}
                >
                  {categoriesData?.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => {
                        setFilters((prev) => ({
                          ...prev,
                          category: category.id,
                        }));
                        setShowCategoryDropdown(false);
                      }}
                      className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <Text className="text-gray-900 text-base">
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Price Range */}
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-600 mb-4">
                Price Range
              </Text>

              {/* Min Price Input */}
              <View className="mb-3">
                <Text className="text-sm text-gray-500 mb-2">
                  Minimum Price
                </Text>
                <View className="flex-row items-center border border-gray-300 rounded-xl px-3">
                  <Text className="text-gray-500 mr-2">₦</Text>
                  <TextInput
                    value={filters.priceRange[0].toLocaleString()}
                    onChangeText={(text) => {
                      const value = parseInt(text.replace(/[^0-9]/g, "")) || 0;
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: [
                          Math.min(value, prev.priceRange[1] - 1000),
                          prev.priceRange[1],
                        ] as [number, number],
                      }));
                    }}
                    className="flex-1 py-3 text-base"
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              </View>

              {/* Max Price Input */}
              <View className="mb-3">
                <Text className="text-sm text-gray-500 mb-2">
                  Maximum Price
                </Text>
                <View className="flex-row items-center border border-gray-300 rounded-xl px-3">
                  <Text className="text-gray-500 mr-2">₦</Text>
                  <TextInput
                    value={filters.priceRange[1].toLocaleString()}
                    onChangeText={(text) => {
                      const value =
                        parseInt(text.replace(/[^0-9]/g, "")) || 10000000;
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: [
                          prev.priceRange[0],
                          Math.max(value, prev.priceRange[0] + 1000),
                        ] as [number, number],
                      }));
                    }}
                    className="flex-1 py-3 text-base"
                    keyboardType="numeric"
                    placeholder="10000000"
                  />
                </View>
              </View>

              {/* Visual Range Display */}
              <View className="px-2">
                <View className="h-2 bg-gray-200 rounded-full">
                  <View
                    className="h-2 bg-green-500 rounded-full"
                    style={{
                      width: `${(filters.priceRange[1] / 10000000) * 100}%`,
                    }}
                  />
                </View>
                <View className="flex-row justify-between mt-4">
                  <Text className="text-gray-600 text-sm">
                    ₦{formatNumber(filters.priceRange[0])}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    ₦{formatNumber(filters.priceRange[1])}
                  </Text>
                </View>
              </View>

              {/* Quick Select Buttons */}
              <View className="flex-row flex-wrap mt-4">
                {[
                  { label: `Under ₦${formatNumber(5000)}`, min: 0, max: 5000 },
                  {
                    label: `₦${formatNumber(5000)} - ₦${formatNumber(10000)}`,
                    min: 5000,
                    max: 10000,
                  },
                  {
                    label: `₦${formatNumber(10000)} - ₦${formatNumber(25000)}`,
                    min: 10000,
                    max: 25000,
                  },
                  {
                    label: `₦${formatNumber(25000)} - ₦${formatNumber(50000)}`,
                    min: 25000,
                    max: 50000,
                  },
                  {
                    label: `₦${formatNumber(50000)}+`,
                    min: 50000,
                    max: 10000000,
                  },
                ].map((range) => (
                  <TouchableOpacity
                    key={range.label}
                    onPress={() =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: [range.min, range.max] as [number, number],
                      }))
                    }
                    className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${
                      filters.priceRange[0] === range.min &&
                      filters.priceRange[1] === range.max
                        ? "bg-green-500 border-green-500"
                        : "bg-gray-50 border-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        filters.priceRange[0] === range.min &&
                        filters.priceRange[1] === range.max
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort By */}
            <View className="mb-4">
              <Text className="text-lg font-semibold text-gray-600 mb-4">
                Sort By
              </Text>
              {searchByOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() =>
                    setFilters((prev) => ({ ...prev, searchBy: option }))
                  }
                  className="flex-row justify-between items-center py-3"
                >
                  <Text
                    className={`text-base ${
                      filters.searchBy === option
                        ? "text-gray-900 font-semibold"
                        : "text-gray-600"
                    }`}
                  >
                    {option}
                  </Text>
                  {filters.searchBy === option && (
                    <Text className="text-green-500 text-xl">✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Apply Filter Button */}
          <View className="p-4 bg-white">
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              className="bg-green-500 rounded-2xl py-4"
            >
              <Text className="text-white text-center font-bold text-lg">
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default SearchScreen;
