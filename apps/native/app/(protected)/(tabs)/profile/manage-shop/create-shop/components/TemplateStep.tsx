import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";

interface Template {
  id: string;
  name: string;
  coverImage: string | null;
  description: string | null;
  tierId: string;
  tierName: string | null;
}

interface TemplateStepProps {
  templateId: string;
  setTemplateId: (value: string) => void;
  templates: Template[];
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const TemplateStep: React.FC<TemplateStepProps> = ({
  templateId,
  setTemplateId,
  templates,
  onBack,
  onSubmit,
  isLoading,
}) => {
  const silverTemplates = templates.filter(
    (template) => template.tierName?.toLowerCase() === "silver"
  );

  const TemplateCard = ({ template }: { template: Template }) => {
    const isSelected = templateId === template.id;
    const tierLabel = template.tierName || "Unknown";

    return (
      <TouchableOpacity
        onPress={() => setTemplateId(template.id)}
        activeOpacity={0.9}
        className={`flex-1 rounded-2xl border ${
          isSelected ? "border-emerald-500" : "border-gray-200"
        } bg-white overflow-hidden`}
      >
        <View
          className={`h-40 w-full ${
            isSelected ? "border-[3px] border-emerald-400" : ""
          } rounded-2xl m-2 overflow-hidden bg-gray-100`}
        >
          {template.coverImage ? (
            <Image
              source={{ uri: template.coverImage }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-gray-400 text-sm">No Preview</Text>
            </View>
          )}
        </View>
        <View className="px-4 pb-4">
          <View className="mb-2">
            <Text
              className={`px-2 py-0.5 rounded-md text-xs ${
                tierLabel.toLowerCase() === "silver"
                  ? "bg-gray-100 text-gray-700"
                  : tierLabel.toLowerCase() === "gold"
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {tierLabel}
            </Text>
          </View>
          <Text className="text-black font-semibold">{template.name}</Text>
          <Text className="text-gray-500 text-sm mt-1">
            {template.description || "A template for your store."}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const isValid = templateId;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="mt-6">
        <Text className="text-xl text-black font-bold">Store Templates</Text>
        <Text className="text-gray-500 mt-2">
          Choose the template that suits your taste here. You can only select
          SILVER tier templates to get started.
        </Text>
      </View>

      {silverTemplates.length > 0 ? (
        <View className="mt-6 flex-row flex-wrap justify-between">
          {silverTemplates.map((template, index) => (
            <View
              key={template.id}
              className={`${index % 2 === 0 ? "w-[48%]" : "w-[48%]"} mb-4`}
            >
              <TemplateCard template={template} />
            </View>
          ))}
        </View>
      ) : (
        <View className="mt-6 p-6 bg-gray-50 rounded-2xl">
          <Text className="text-gray-600 text-center">
            No SILVER tier templates available. Please contact support.
          </Text>
        </View>
      )}

      <View className="flex-row gap-4 my-16">
        <TouchableOpacity
          onPress={onBack}
          disabled={isLoading}
          className="flex-1 h-14 border border-gray-300 rounded-2xl items-center justify-center"
          activeOpacity={0.9}
        >
          <Text className="text-gray-700 font-semibold text-base">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSubmit}
          disabled={!isValid || isLoading}
          className={`flex-1 h-14 rounded-2xl items-center justify-center ${
            isValid && !isLoading ? "bg-emerald-500" : "bg-gray-300"
          }`}
          activeOpacity={0.9}
        >
          <Text className="text-white font-semibold text-base">
            {isLoading ? "Creating..." : "Create Store"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default TemplateStep;
