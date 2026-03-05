import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import Loader from "@/components/loader";
import Error from "@/components/error";
import { Container } from "@/components/container";
import { ICONS } from "@/constants";
import * as ImagePicker from "expo-image-picker";

const CreateBanner = () => {
  const [banner, setBanner] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const createBannerMutation = useMutation(
    orpc.store.banners.createBanner.mutationOptions({
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Banner created successfully",
        });
        // Invalidate and refetch banners query
        queryClient.invalidateQueries({
          queryKey: ["store-banners"],
        });
        router.back();
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Failed to create banner",
          text2: error.message,
        });
      },
      onSettled: () => {
        setLoading(false);
      },
    })
  );

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

  if (isStorePending) {
    return <Loader />;
  }

  if (storeError) {
    return <Error error={storeError.message} refetch={refetchStore} />;
  }

  if (!store) {
    return <Error error="Store not found" refetch={refetchStore} />;
  }

  const pickImageAndConvert = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        base64: true,
        selectionLimit: 1,
        allowsMultipleSelection: false,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset.base64) return;

      const mime = asset.mimeType || asset.type || "image/jpeg";
      const dataUri = `data:${mime};base64,${asset.base64}`;
      setBanner(dataUri);
    } catch (err) {
      console.warn("Image pick error:", err);
      Toast.show({
        type: "error",
        text1: "Failed to pick image",
      });
    }
  };

  const removeImage = () => {
    setBanner("");
  };

  const handleSubmit = () => {
    if (!banner) {
      Toast.show({
        type: "error",
        text1: "Please select a banner image",
      });
      return;
    }

    setLoading(true);
    createBannerMutation.mutate({
      banner,
      storeId: store.id,
    });
  };

  return (
    <>
      <Container>
        <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={ICONS.arrowLeft}
              className="w-auto h-5 text-black"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className="text-black text-xl font-bold">Create Banner</Text>
          <View className="w-8" />
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          <View className="mb-6">
            <Text className="font-semibold text-lg text-primary mb-3">
              Banner Image
            </Text>
            {banner ? (
              <View className="relative mb-4">
                <Image
                  source={{ uri: banner }}
                  className="w-full h-48 rounded-lg"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full w-8 h-8 items-center justify-center"
                >
                  <Text className="text-white text-lg font-bold">×</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={pickImageAndConvert}
                  className="absolute bottom-2 right-2 bg-black/70 rounded-lg px-3 py-2"
                >
                  <Text className="text-white text-sm font-medium">Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={pickImageAndConvert}
                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center bg-gray-50 mb-4"
              >
                <Image
                  source={ICONS.plus}
                  className="w-8 h-8 text-gray-400 mb-2"
                  resizeMode="contain"
                />
                <Text className="text-gray-500 text-base font-medium mb-1">
                  Select Banner Image
                </Text>
                <Text className="text-gray-400 text-sm text-center px-4">
                  Choose a high-quality image for your store banner
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="bg-blue-50 rounded-lg p-4 mb-6">
            <Text className="text-blue-800 font-medium mb-2">
              Banner Guidelines:
            </Text>
            <Text className="text-blue-700 text-sm leading-5">
              • Use high-resolution images (at least 1200x400px){"\n"}• Keep
              file size under 5MB{"\n"}• Use images that represent your store
              well{"\n"}• Avoid text-heavy images for better mobile display
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!banner || loading}
            className={`bg-primary rounded-lg py-4 px-6 w-full mb-6 ${
              !banner || loading ? "opacity-50" : ""
            }`}
          >
            <Text className="text-white font-semibold text-base text-center">
              {loading ? "Creating Banner..." : "Create Banner"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Container>

      {loading && (
        <View className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <View className="bg-white rounded-lg p-6 flex items-center justify-center">
            <ActivityIndicator size="large" color="#19B360" />
            <Text className="text-gray-700 font-semibold text-base mt-4">
              Creating banner...
            </Text>
          </View>
        </View>
      )}
    </>
  );
};

export default CreateBanner;
