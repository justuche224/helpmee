import React, { useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  Modal,
  TouchableOpacity,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { Container } from "@/components/container";
import { useGradualAnimation } from "@/hooks/use-gradual-animation";
import { ICONS } from "@/constants";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import Toast from "react-native-toast-message";
import Loader from "@/components/loader";
import Error from "@/components/error";
import formatPrice from "@/utils/price-formatter";

const unitOptions = [
  "kg",
  "g",
  "l",
  "ml",
  "pcs",
  "box",
  "bag",
  "bundle",
  "set",
  "pair",
  "dozen",
  "other",
];

const UploadItems = () => {
  const { height } = useGradualAnimation();
  const keyboardPadding = useAnimatedStyle(() => {
    return {
      height: height.value + 40,
    };
  }, []);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    unit: "",
    inStock: true,
    weight: "",
    dimensions: "",
    badge: "",
    images: [] as string[],
  });

  const [showUnitsOptions, setShowUnitsOptions] = useState(false);
  const [loading, setLoading] = useState(false);

  const createProductMutation = useMutation(
    orpc.products.createProduct.mutationOptions({
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Item added successfully",
        });
        setForm({
          name: "",
          description: "",
          price: "",
          quantity: "",
          unit: "",
          inStock: true,
          weight: "",
          dimensions: "",
          badge: "",
          images: [],
        });
      },
      onError: (error) => {
        console.log(error);
        Toast.show({
          type: "error",
          text1: "Failed to add item",
          text2: error.message,
        });
      },
      onSettled: () => {
        setLoading(false);
      },
    })
  );

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const pickImageAndConvert = async () => {
    const remainingSlots = 5 - form.images.length;
    if (remainingSlots <= 0) {
      alert("You can only upload up to 5 images");
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        base64: true,
        selectionLimit: remainingSlots,
        allowsMultipleSelection: true,
      });

      if (result.canceled) return;

      const assets = result.assets || [];

      // build data URIs for all assets that include base64
      const newBase64Images = assets
        .map((a) => {
          if (!a.base64) return null;
          const mime = (a as any).mimeType || a.type || "image/png";
          return `data:${mime};base64,${a.base64}`;
        })
        .filter(Boolean) as string[];

      if (newBase64Images.length === 0) return;

      // append to existing images
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...newBase64Images],
      }));
    } catch (err) {
      console.warn("Image pick error:", err);
    }
  };

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

  const handleSubmit = () => {
    if (
      !form.name ||
      !form.description ||
      !form.price ||
      !form.quantity ||
      !form.unit ||
      form.images.length === 0 ||
      form.images.length > 5
    ) {
      Toast.show({
        type: "error",
        text1: "Please fill in all required fields",
      });
      return;
    }
    setLoading(true);
    createProductMutation.mutate({
      name: form.name,
      description: form.description,
      price: parseInt(form.price),
      quantity: parseInt(form.quantity),
      unit: form.unit as
        | "kg"
        | "g"
        | "l"
        | "ml"
        | "pcs"
        | "box"
        | "bag"
        | "bundle"
        | "set"
        | "pair"
        | "dozen"
        | "other",
      inStock: form.inStock,
      weight: form.weight,
      dimensions: form.dimensions,
      badge: form.badge,
      images: form.images,
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
          <Text className="text-black text-xl font-bold">New Item</Text>
          <TouchableOpacity className="bg-black/20 rounded-lg p-2 relative">
            <Image
              source={ICONS.notificationBell}
              className="w-6 h-6"
              resizeMode="contain"
            />
            <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </TouchableOpacity>
        </View>
        <ScrollView className="flex-1 px-6 mb-10">
          <View className="mb-4">
            <Text className="font-semibold text-lg text-primary mb-3">
              Product Images ({form.images.length}/5)
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {form.images.map((imageUri, index) => (
                <View key={index} className="relative">
                  <Image
                    source={{ uri: imageUri }}
                    className="w-20 h-20 rounded-lg"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                  >
                    <Text className="text-white text-xs font-bold">×</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {form.images.length < 5 && (
                <TouchableOpacity
                  onPress={pickImageAndConvert}
                  className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center bg-gray-50"
                >
                  <Image
                    source={ICONS.plus}
                    className="w-6 h-6 text-gray-400"
                    resizeMode="contain"
                  />
                  <Text className="text-xs text-gray-500 mt-1">
                    Add ({5 - form.images.length})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View className="flex flex-col gap-[16px] mt-5">
            <View>
              <Text className="font-semibold text-lg text-primary">
                Item Name
              </Text>
              <TextInput
                value={form.name}
                onChangeText={(e) => setForm({ ...form, name: e })}
                placeholder="Name"
                placeholderTextColor="#8E9BAE"
                accessibilityLabel="Item Name"
                accessibilityHint="Enter the name of the item"
                autoCapitalize="words"
                className="text-[#8E9BAE] font-psemibold text-base border border-[#E2E8F0] rounded-[10px] py-[17px] px-[21px] w-full "
                editable={true}
              />
            </View>
            <View>
              <Text className="font-semibold text-lg text-primary">
                Item Description
              </Text>
              <TextInput
                value={form.description}
                onChangeText={(e) => setForm({ ...form, description: e })}
                placeholder="Description"
                placeholderTextColor="#8E9BAE"
                accessibilityLabel="Item Description"
                accessibilityHint="Enter the description of the item"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                className="text-[#8E9BAE] font-psemibold text-base border border-[#E2E8F0] rounded-[10px] py-[17px] px-[21px] w-full "
                editable={true}
              />
            </View>
            <View>
              <Text className="font-semibold text-lg text-primary">
                Item Price
              </Text>
              <TextInput
                value={form.price}
                onChangeText={(e) =>
                  setForm({ ...form, price: e.replace(/[^0-9]/g, "") })
                }
                placeholder="E.g. 100"
                keyboardType="numeric"
                placeholderTextColor="#8E9BAE"
                accessibilityLabel="Item Price"
                accessibilityHint="Enter the price of the item"
                className="text-[#8E9BAE] font-psemibold text-base border border-[#E2E8F0] rounded-[10px] py-[17px] px-[21px] w-full "
                editable={true}
              />
              <Text className="text-sm text-primary-foreground mt-2 pl-2">
                {form.price ? formatPrice(parseInt(form.price)) : "0.00"}
              </Text>
            </View>
            <View>
              <Text className="font-semibold text-lg text-primary">
                Available Quantity
              </Text>
              <TextInput
                value={form.quantity}
                onChangeText={(e) =>
                  setForm({ ...form, quantity: e.replace(/[^0-9]/g, "") })
                }
                placeholder="E.g. 7"
                keyboardType="numeric"
                placeholderTextColor="#8E9BAE"
                accessibilityLabel="Available Quantity"
                accessibilityHint="Enter the available quantity of the item"
                className="text-[#8E9BAE] font-psemibold text-base border border-[#E2E8F0] rounded-[10px] py-[17px] px-[21px] w-full "
                editable={true}
              />
            </View>
            <TouchableOpacity
              onPress={() => setShowUnitsOptions(true)}
              activeOpacity={0.7}
              className="w-full h-14 px-4 bg-gray-50 rounded-2xl border border-gray-200 flex-row items-center justify-between"
            >
              <Text
                className={`font-medium ${
                  form.unit ? "text-black" : "text-[#8E9BAE]"
                }`}
              >
                {form.unit || "Select unit of measurement"}
              </Text>
              <Image
                source={ICONS.arrowDown}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <View>
              <Text className="font-semibold text-lg text-primary">
                Item Weight{" "}
                <Text className="text-sm text-primary-foreground">
                  (optional)
                </Text>
              </Text>
              <TextInput
                value={form.weight}
                onChangeText={(e) => setForm({ ...form, weight: e })}
                placeholder="Weight"
                placeholderTextColor="#8E9BAE"
                accessibilityLabel="Item Weight"
                accessibilityHint="Enter the weight of the item"
                className="text-[#8E9BAE] font-psemibold text-base border border-[#E2E8F0] rounded-[10px] py-[17px] px-[21px] w-full "
                editable={true}
              />
            </View>
            <View>
              <Text className="font-semibold text-lg text-primary">
                Item Dimensions{" "}
                <Text className="text-sm text-primary-foreground">
                  (optional)
                </Text>
              </Text>
              <TextInput
                value={form.dimensions}
                onChangeText={(e) => setForm({ ...form, dimensions: e })}
                placeholder="Dimensions"
                placeholderTextColor="#8E9BAE"
                accessibilityLabel="Item Dimensions"
                accessibilityHint="Enter the dimensions of the item"
                className="text-[#8E9BAE] font-psemibold text-base border border-[#E2E8F0] rounded-[10px] py-[17px] px-[21px] w-full "
                editable={true}
              />
            </View>
            <View>
              <Text className="font-semibold text-lg text-primary">
                Badge{" "}
                <Text className="text-sm text-primary-foreground">
                  (optional)
                </Text>
              </Text>
              <TextInput
                value={form.badge}
                onChangeText={(e) => setForm({ ...form, badge: e })}
                placeholder="E.g. New arrival"
                placeholderTextColor="#8E9BAE"
                accessibilityLabel="Item Badge"
                accessibilityHint="Enter the badge of the item"
                className="text-[#8E9BAE] font-psemibold text-base border border-[#E2E8F0] rounded-[10px] py-[17px] px-[21px] w-full "
                editable={true}
              />
            </View>
          </View>
          <TouchableOpacity
            // disabled={isLoading || !form.email || !form.password}
            onPress={handleSubmit}
            className="bg-primary rounded-[10px] py-[16px] px-[75px] w-full mt-[16px]"
          >
            <Text className="text-white font-semibold text-base text-center">
              Add Item
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <Animated.View style={keyboardPadding} />
      </Container>
      <Modal
        transparent={true}
        visible={showUnitsOptions}
        animationType="fade"
        onRequestClose={() => setShowUnitsOptions(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPressOut={() => setShowUnitsOptions(false)}
        >
          <View className="bg-white rounded-lg w-4/5 max-h-3/4">
            <Text className="p-4 border-b border-gray-200 text-gray-400">
              --select Unit--
            </Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="max-h-80"
            >
              {unitOptions.map((stateOption) => (
                <TouchableOpacity
                  key={stateOption}
                  className="p-4 border-b border-gray-200"
                  onPress={() => {
                    setForm({ ...form, unit: stateOption });
                    setShowUnitsOptions(false);
                  }}
                >
                  <Text>{stateOption}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
      {loading && (
        <View className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <View className="bg-white rounded-[10px] p-6 flex items-center justify-center">
            <ActivityIndicator size="large" color="#19B360" />
            <Text className="text-[#161616] font-semibold text-base mt-4">
              Adding item...
            </Text>
          </View>
        </View>
      )}
    </>
  );
};

export default UploadItems;
