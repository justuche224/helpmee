import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { router } from "expo-router";
import Loader from "@/components/loader";
import Error from "@/components/error";
import { Container } from "@/components/container";
import { ICONS } from "@/constants";

const Banners = () => {
  const [refreshing, setRefreshing] = React.useState(false);

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
    data: banners,
    isPending: isBannersPending,
    error: bannersError,
    refetch: refetchBanners,
  } = useQuery(
    orpc.store.banners.getStoreBanners.queryOptions({
      input: { storeId: store?.id || "" },
      queryKey: ["store-banners", store?.id],
      enabled: !!store?.id,
    })
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchStore(), refetchBanners()]);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchStore, refetchBanners]);

  if (isStorePending || isBannersPending) {
    return <Loader />;
  }

  if (storeError) {
    return <Error error={storeError.message} refetch={refetchStore} />;
  }

  if (!store) {
    return <Error error="Store not found" refetch={refetchStore} />;
  }

  const handleAddBanner = () => {
    router.push(
      "/(protected)/(tabs)/profile/manage-shop/banners/create-banner"
    );
  };

  const renderBanner = ({
    item,
  }: {
    item: { id: string; banner: string; storeId: string };
  }) => (
    <View className="mb-4 bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
      <Image
        source={{ uri: item.banner }}
        className="w-full h-48"
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="text-sm text-gray-500">Banner ID: {item.id}</Text>
      </View>
    </View>
  );

  return (
    <Container>
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={ICONS.arrowLeft}
            className="w-auto h-5 text-black"
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text className="text-black text-xl font-bold">Store Banners</Text>
        <TouchableOpacity
          onPress={handleAddBanner}
          className="bg-primary rounded-lg px-4 py-2"
        >
          <Text className="text-white font-semibold text-sm">Add Banner</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-6 py-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#19B360"]}
            tintColor="#19B360"
          />
        }
      >
        {bannersError && (
          <Error error={bannersError.message} refetch={refetchBanners} />
        )}

        {!banners || banners.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Image
              source={ICONS.plus}
              className="w-16 h-16 mb-4 opacity-50"
              resizeMode="contain"
            />
            <Text className="text-gray-500 text-lg font-medium mb-2">
              No banners yet
            </Text>
            <Text className="text-gray-400 text-center mb-6">
              Create your first banner to showcase your store
            </Text>
            <TouchableOpacity
              onPress={handleAddBanner}
              className="bg-primary rounded-lg px-6 py-3"
            >
              <Text className="text-white font-semibold">Create Banner</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text className="text-lg font-semibold text-primary mb-4">
              Your Banners ({banners.length})
            </Text>
            <FlatList
              data={banners}
              renderItem={renderBanner}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </Container>
  );
};

export default Banners;
