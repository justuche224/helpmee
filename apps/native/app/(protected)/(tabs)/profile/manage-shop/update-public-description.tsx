import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import Loader from "@/components/loader";
import Error from "@/components/error";
import { Container } from "@/components/container";
import { ICONS } from "@/constants";

const UpdatePublicDescription = () => {
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const updateDescriptionMutation = useMutation(
    orpc.store.publicDescription.updatePublicDescription.mutationOptions({
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Description updated successfully",
        });
        router.back();
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Failed to update description",
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

  // Pre-fill the description input with existing description
  useEffect(() => {
    if (store.description && !isInitialized) {
      setDescription(store.description);
      setIsInitialized(true);
    }
  }, [store.description, isInitialized]);

  const handleSubmit = () => {
    if (!description.trim()) {
      Toast.show({
        type: "error",
        text1: "Please enter a description",
      });
      return;
    }

    if (description.length > 500) {
      Toast.show({
        type: "error",
        text1: "Description must be less than 500 characters",
      });
      return;
    }

    setLoading(true);
    updateDescriptionMutation.mutate({
      publicDescription: description.trim(),
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
          <Text className="text-black text-xl font-bold">
            Update Description
          </Text>
          <View className="w-8" />
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          <View className="mb-6">
            <Text className="font-semibold text-lg text-primary mb-3">
              Store Description
            </Text>

            {/* Current Description Display */}
            {store.description && !isInitialized && (
              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-2">
                  Loading current description...
                </Text>
                <View className="bg-gray-50 rounded-lg p-4">
                  <Text className="text-gray-700">{store.description}</Text>
                </View>
              </View>
            )}

            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-2">
                Store Description ({description.length}/500 characters):
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Enter your store description..."
                placeholderTextColor="#8E9BAE"
                multiline
                numberOfLines={6}
                maxLength={500}
                className="text-[#8E9BAE] font-psemibold text-base border border-[#E2E8F0] rounded-[10px] py-[17px] px-[21px] w-full min-h-[120px]"
                style={{ textAlignVertical: "top" }}
              />
            </View>
          </View>

          <View className="bg-blue-50 rounded-lg p-4 mb-6">
            <Text className="text-blue-800 font-medium mb-2">
              Description Guidelines:
            </Text>
            <Text className="text-blue-700 text-sm leading-5">
              • Tell customers about your store's unique features{"\n"}• Mention
              your specialties, products, or services{"\n"}• Keep it engaging
              and informative{"\n"}• Maximum 500 characters for optimal display
              {"\n"}• Be honest and authentic about your business{"\n"}• Make it
              compelling to attract more customers
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={
              !description.trim() || loading || description.length > 500
            }
            className={`bg-primary rounded-lg py-4 px-6 w-full mb-6 ${
              !description.trim() || loading || description.length > 500
                ? "opacity-50"
                : ""
            }`}
          >
            <Text className="text-white font-semibold text-base text-center">
              {loading ? "Updating Description..." : "Update Description"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Container>

      {loading && (
        <View className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <View className="bg-white rounded-lg p-6 flex items-center justify-center">
            <ActivityIndicator size="large" color="#19B360" />
            <Text className="text-gray-700 font-semibold text-base mt-4">
              Updating description...
            </Text>
          </View>
        </View>
      )}
    </>
  );
};

export default UpdatePublicDescription;
