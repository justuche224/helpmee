import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from "react-native";
import { ICONS } from "@/constants";
import * as ImagePicker from "expo-image-picker";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface ProductDetailsStepProps {
  description: string;
  setDescription: (value: string) => void;
  categoryId: string;
  setCategoryId: (value: string) => void;
  businessRegistration: string | null;
  setBusinessRegistration: (value: string | null) => void;
  categories: Category[];
  onNext: () => void;
  onBack: () => void;
}

const ProductDetailsStep: React.FC<ProductDetailsStepProps> = ({
  description,
  setDescription,
  categoryId,
  setCategoryId,
  businessRegistration,
  setBusinessRegistration,
  categories,
  onNext,
  onBack,
}) => {
  const pickImageAndConvert = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64 = `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`;
      setBusinessRegistration(base64);
    }
  };

  const isValid = description.trim() && categoryId;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="mt-6">
        <Text className="text-xl text-black font-semibold">Store Details</Text>
        <Text className="text-gray-500 mt-2 text-sm">
          Upload Business Document.
        </Text>
      </View>

      <View className="mt-6 gap-y-6">
        <View>
          <Text className="text-gray-700 font-semibold mb-2">
            Business registration, or proof of identity, or tax information{" "}
            <Text className="text-gray-400">(Optional)</Text>
          </Text>
          <TouchableOpacity
            onPress={pickImageAndConvert}
            className="border border-dashed border-gray-300 rounded-2xl bg-gray-50 py-10 items-center justify-center"
          >
            {businessRegistration ? (
              <Image
                source={{ uri: businessRegistration }}
                className="w-96 h-96 aspect-square object-cover"
              />
            ) : (
              <Image source={ICONS.upload} className="w-8 h-8 opacity-60" />
            )}
            <Text className="mt-3 text-gray-700 font-semibold">
              Drag & drop here or{" "}
              <Text className="text-emerald-600">Browse</Text>
            </Text>
            <Text className="mt-2 text-gray-400 text-xs">
              Please ensure that every detail of the document is clearly
              visible.
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text className="text-gray-700 font-semibold mb-2 mt-6">
        Write a detailed description of your store and products/services
        <Text className="text-red-600"> *</Text>
      </Text>
      <View className="mt-4 w-full min-h-[140px] px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description here"
          placeholderTextColor="#8E9BAE"
          className="text-black font-medium"
          multiline
          textAlignVertical="top"
        />
      </View>

      <Text className="text-gray-700 font-semibold mb-2 mt-6">
        Select shop category
        <Text className="text-red-600"> *</Text>
      </Text>
      {categories.length > 0 && (
        <View className="mt-4">
          <View className="flex-row flex-wrap">
            {categories.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setCategoryId(category.id)}
                className="items-center mb-6"
                style={{ width: "25%" }}
              >
                <View
                  className={`p-4 rounded-full mb-3 w-16 h-16 items-center justify-center ${
                    categoryId === category.id
                      ? "bg-emerald-100"
                      : "bg-gray-100"
                  }`}
                >
                  {category.icon ? (
                    <Image
                      source={{ uri: category.icon }}
                      className="w-6 h-6"
                      resizeMode="contain"
                    />
                  ) : (
                    <View className="w-6 h-6 bg-gray-300 rounded" />
                  )}
                </View>
                <Text
                  className={`text-xs text-center px-1 ${
                    categoryId === category.id
                      ? "text-emerald-700 font-semibold"
                      : "text-gray-700"
                  }`}
                  numberOfLines={2}
                >
                  {category.name}
                </Text>
                {categoryId === category.id && (
                  <View className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View className="flex-row gap-4 my-16">
        <TouchableOpacity
          onPress={onBack}
          className="flex-1 h-14 border border-gray-300 rounded-2xl items-center justify-center"
          activeOpacity={0.9}
        >
          <Text className="text-gray-700 font-semibold text-base">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onNext}
          disabled={!isValid}
          className={`flex-1 h-14 rounded-2xl items-center justify-center ${
            isValid ? "bg-emerald-500" : "bg-gray-300"
          }`}
          activeOpacity={0.9}
        >
          <Text className="text-white font-semibold text-base">Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProductDetailsStep;
