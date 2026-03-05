import { View, Text, TouchableOpacity, Image, TextInput } from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import FilterIcon from "@/assets/icons/shop/filter.png";
import SearchIcon from "@/assets/icons/shop/search.png";

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
  showFilter?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search for products, stores...",
  autoFocus = false,
  onSearch,
  showFilter = true,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim().length > 0) {
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        router.push({
          pathname: "/(protected)/(tabs)/shop/search",
          params: { initialQuery: searchQuery.trim() },
        });
      }
    } else {
      router.push("/(protected)/(tabs)/shop/search");
    }
  };

  const handleSubmit = () => {
    handleSearch();
  };

  const handleFilter = () => {
    router.push("/(protected)/(tabs)/shop/filter");
  };

  return (
    <View className="flex-row items-center gap-x-4 px-4 my-4">
      <View className="flex-1 flex-row items-center justify-between rounded-lg bg-[#F0F0F0] px-3">
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={placeholder}
          className="flex-1 py-3"
          autoFocus={autoFocus}
          returnKeyType="search"
          onSubmitEditing={handleSubmit}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          className="rounded-lg bg-[#19B360] p-2"
          onPress={handleSearch}
        >
          <Image
            source={SearchIcon}
            className="h-5 w-5"
            style={{ tintColor: "white" }}
          />
        </TouchableOpacity>
      </View>
      {showFilter && (
        <TouchableOpacity
          className="rounded-lg bg-black p-3"
          onPress={handleFilter}
        >
          <Image
            source={FilterIcon}
            className="h-6 w-6"
            style={{ tintColor: "white" }}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
