import {
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
  TextInput,
  Switch,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import Toast from "react-native-toast-message";
import { useGradualAnimation } from "@/hooks/use-gradual-animation";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { ICONS } from "@/constants";
const { arrowLeft } = ICONS;

import CartIcon from "@/components/cart-icon";
import HeartIcon from "@/assets/icons/shop/heart.png";
import PlaceholderProductImage from "@/assets/images/shop/placeholder-product-image.png";
import MinusIcon from "@/assets/icons/shop/minus.png";
import PlusIcon from "@/assets/icons/shop/plus.png";
import CancleIcon from "@/assets/icons/shop/cancle.png";
import MapPinIcon from "@/assets/icons/shop/map-pin.png";
import DHLIcon from "@/assets/icons/shop/dhl.png";
import CardIcon from "@/assets/icons/shop/card.png";
import EditIcon from "@/assets/icons/shop/edit.png";
import formatPrice from "@/utils/price-formatter";
import { useState, useEffect } from "react";
import arrowDownIcon from "@/assets/icons/arrow-down.png";

const shadowStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  android: {
    elevation: 4,
  },
});

export default function Checkout() {
  const queryClient = useQueryClient();
  const [showShippingAddressModal, setShowShippingAddressModal] =
    useState(false);
  const [selectedShippingAddress, setSelectedShippingAddress] =
    useState<any>(null);
  const [showSelectShippingAddressModal, setShowSelectShippingAddressModal] =
    useState(false);
  const {
    data: cartItems,
    isLoading: isCartLoading,
    error: cartError,
    refetch: refetchCart,
  } = useQuery(
    orpc.general.cart.getCart.queryOptions({
      queryKey: ["cart"],
      retry: 1,
    })
  );

  const { data: shippingAddresses } = useQuery(
    orpc.user.shippingAddress.getShippingAddress.queryOptions({
      queryKey: ["shipping-address"],
      retry: 1,
    })
  );

  // Auto-select default address when addresses are loaded
  useEffect(() => {
    if (
      shippingAddresses &&
      shippingAddresses.length > 0 &&
      !selectedShippingAddress
    ) {
      const defaultAddress = shippingAddresses.find(
        (addr: any) => addr.isDefault
      );
      if (defaultAddress) {
        setSelectedShippingAddress(defaultAddress);
      } else {
        // If no default, select the first address
        setSelectedShippingAddress(shippingAddresses[0]);
      }
    }
  }, [shippingAddresses]);

  const incrementMutation = useMutation(
    orpc.general.cart.incrementCartItemQuantity.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        Toast.show({
          type: "success",
          text1: "Quantity updated",
        });
      },
      onError: (error: any) => {
        console.error("Increment error:", error);
        Toast.show({
          type: "error",
          text1: "Failed to update quantity",
          text2: error?.message || "Please try again",
        });
      },
    })
  );

  const decrementMutation = useMutation(
    orpc.general.cart.decrementCartItemQuantity.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        Toast.show({
          type: "success",
          text1: "Quantity updated",
        });
      },
      onError: (error: any) => {
        console.error("Decrement error:", error);
        Toast.show({
          type: "error",
          text1: "Failed to update quantity",
          text2: error?.message || "Please try again",
        });
      },
    })
  );

  const removeMutation = useMutation(
    orpc.general.cart.removeFromCart.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        Toast.show({
          type: "success",
          text1: "Item removed from cart",
        });
      },
      onError: (error: any) => {
        console.error("Remove error:", error);
        Toast.show({
          type: "error",
          text1: "Failed to remove item",
          text2: error?.message || "Please try again",
        });
      },
    })
  );

  const mutationsPending =
    incrementMutation.isPending ||
    decrementMutation.isPending ||
    removeMutation.isPending;

  const handleIncrement = (cartItemId: string) => {
    incrementMutation.mutate({
      cartItemId,
      quantity: 1,
    });
  };

  const handleDecrement = (cartItemId: string) => {
    decrementMutation.mutate({
      cartItemId,
      quantity: 1,
    });
  };

  const handleRemove = (cartItemId: string) => {
    removeMutation.mutate({
      cartItemId,
    });
  };

  const subtotal =
    cartItems?.reduce(
      (sum: number, item: any) =>
        sum + parseFloat(item.product.price ?? "0") * item.quantity,
      0
    ) || 0;
  const deliveryFee = 1000;
  const total = subtotal + deliveryFee;

  if (isCartLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#19B360" />
          <Text className="mt-4 text-gray-600">Loading checkout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (cartError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load checkout
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Something went wrong while loading your cart items.
          </Text>
          <TouchableOpacity
            onPress={() => refetchCart()}
            className="bg-[#19B360] px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-9 w-9 rounded-full bg-white justify-center items-center"
            >
              <Image
                source={arrowLeft}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900 ml-2">
              Checkout
            </Text>
          </View>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-xl font-semibold text-gray-900 mb-2">
            Your cart is empty
          </Text>
          <Text className="text-gray-600 text-center mb-8">
            Add some products to your cart before checkout.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(protected)/(tabs)/shop")}
            className="bg-[#19B360] px-8 py-4 rounded-lg"
          >
            <Text className="text-white font-semibold text-lg">
              Continue Shopping
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView className="flex-1 bg-white pb-16">
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.back()}
                className="h-9 w-9 rounded-full bg-white justify-center items-center"
              >
                <Image
                  source={arrowLeft}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-gray-900 ml-2">
                Checkout
              </Text>
            </View>
            <View className="flex-row items-center gap-x-2">
              <TouchableOpacity
                className="mr-3"
                onPress={() => router.push("/(protected)/(tabs)/shop/saved")}
              >
                <Image
                  source={HeartIcon}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <CartIcon />
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-6 pt-6">
            {cartItems.map((item: any) => (
              <View
                key={item.id}
                className="flex-row mb-4 rounded-2xl p-4 bg-white"
                style={shadowStyle}
              >
                <View className="w-20 h-20 p-2 bg-gray-50 rounded-xl">
                  <Image
                    source={
                      item.product.image
                        ? { uri: item.product.image }
                        : PlaceholderProductImage
                    }
                    className="w-full h-full rounded-xl"
                    resizeMode="contain"
                  />
                </View>
                <View className="flex-1 ml-4">
                  <Text
                    numberOfLines={2}
                    className="text-base font-semibold text-gray-900 mb-1"
                  >
                    {item.product.name}
                  </Text>
                  <Text className="text-lg font-bold text-gray-900 mb-3">
                    {formatPrice(parseFloat(item.product.price ?? "0"))}
                  </Text>
                  <View className="flex-row items-center">
                    <TouchableOpacity
                      onPress={() => handleDecrement(item.id)}
                      disabled={decrementMutation.isPending}
                      className="w-8 h-8 bg-gray-100 rounded-full justify-center items-center"
                    >
                      {decrementMutation.isPending ? (
                        <ActivityIndicator size="small" color="#9CA3AF" />
                      ) : (
                        <Image
                          source={MinusIcon}
                          className="w-4 h-4"
                          resizeMode="contain"
                        />
                      )}
                    </TouchableOpacity>
                    <Text className="mx-4 text-base font-semibold">
                      {item.quantity.toString().padStart(2, "0")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleIncrement(item.id)}
                      disabled={incrementMutation.isPending}
                      className="w-8 h-8 bg-green-500 rounded-full justify-center items-center"
                    >
                      {incrementMutation.isPending ? (
                        <ActivityIndicator size="small" color="#9CA3AF" />
                      ) : (
                        <Image
                          source={PlusIcon}
                          className="w-4 h-4"
                          resizeMode="contain"
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemove(item.id)}
                  disabled={removeMutation.isPending}
                  className="ml-2 w-8 h-8 rounded-full justify-center items-center"
                >
                  {removeMutation.isPending ? (
                    <ActivityIndicator size="small" color="#9CA3AF" />
                  ) : (
                    <Image
                      source={CancleIcon}
                      className="w-full h-full"
                      resizeMode="contain"
                    />
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View className="px-6 mt-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-semibold text-gray-600">
                Shipping Address
              </Text>
              <TouchableOpacity
                onPress={() => setShowSelectShippingAddressModal(true)}
              >
                <Image
                  source={EditIcon}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            <View className="bg-white rounded-2xl p-4 mb-6" style={shadowStyle}>
              {selectedShippingAddress ? (
                <>
                  <Text className="text-lg font-bold text-gray-900 mb-2">
                    {selectedShippingAddress.fullName}
                  </Text>
                  <View className="flex-row items-start">
                    <View className="w-6 h-6 bg-green-100 rounded-full justify-center items-center mr-3 mt-1">
                      <Image
                        source={MapPinIcon}
                        className="w-4 h-4"
                        resizeMode="contain"
                      />
                    </View>
                    <Text className="text-gray-600 flex-1 leading-6">
                      {selectedShippingAddress.address},{"\n"}
                      {selectedShippingAddress.city},{" "}
                      {selectedShippingAddress.state}
                      {"\n"}
                      {selectedShippingAddress.country} -{" "}
                      {selectedShippingAddress.zipCode}
                    </Text>
                  </View>
                  <Text className="text-gray-600 text-sm mt-2 ml-9">
                    {selectedShippingAddress.phone}
                  </Text>
                </>
              ) : (
                <View className="items-center py-8">
                  <View className="w-16 h-16 bg-gray-100 rounded-full justify-center items-center mb-4">
                    <Image
                      source={MapPinIcon}
                      className="w-8 h-8"
                      resizeMode="contain"
                      tintColor="#9CA3AF"
                    />
                  </View>
                  <Text className="text-lg font-semibold text-gray-900 mb-2">
                    No address selected
                  </Text>
                  <Text className="text-gray-600 text-center mb-4">
                    Please select or add a shipping address to continue
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowSelectShippingAddressModal(true)}
                    className="bg-[#19B360] px-6 py-3 rounded-lg"
                  >
                    <Text className="text-white font-semibold">
                      Select Address
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-semibold text-gray-600">
                Payment
              </Text>
              <TouchableOpacity>
                <Image
                  source={EditIcon}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            <View className="bg-white rounded-2xl p-4 mb-6" style={shadowStyle}>
              <View className="flex-row items-center">
                <View className="w-16 h-12 rounded mr-3 justify-center items-center">
                  <Image
                    source={CardIcon}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                </View>
                <Text className="text-gray-900 font-medium">
                  **** **** **** 2421
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-semibold text-gray-600">
                Delivery method
              </Text>
              <TouchableOpacity>
                <Image
                  source={EditIcon}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            <View className="bg-white rounded-2xl p-4 mb-8" style={shadowStyle}>
              <View className="flex-row items-center">
                <Image
                  source={DHLIcon}
                  className="w-12 h-8 mr-3"
                  resizeMode="contain"
                />
                <Text className="text-gray-900 font-medium">
                  Fast (2-3days)
                </Text>
              </View>
            </View>

            <View className="bg-white rounded-2xl p-6 mb-6" style={shadowStyle}>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-600 text-base">Order:</Text>
                <Text className="text-gray-900 font-semibold text-base">
                  ₦{subtotal.toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-600 text-base">Delivery:</Text>
                <Text className="text-gray-900 font-semibold text-base">
                  ₦{deliveryFee.toLocaleString()}
                </Text>
              </View>
              <View className="border-t border-gray-200 pt-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-900 font-bold text-lg">
                    Total:
                  </Text>
                  <Text className="text-gray-900 font-bold text-xl">
                    ₦{total.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="p-6 bg-white">
          <TouchableOpacity
            onPress={() => router.push("/shop/order-successful")}
            disabled={mutationsPending || !selectedShippingAddress}
            className={`rounded-2xl py-4 ${
              selectedShippingAddress ? "bg-[#19B360]" : "bg-gray-400"
            }`}
            style={shadowStyle}
          >
            {mutationsPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                {selectedShippingAddress
                  ? `Proceed to Order (${cartItems.length} ${cartItems.length === 1 ? "item" : "items"})`
                  : "Select Shipping Address"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      {showShippingAddressModal && (
        <ShippingAddressModal
          onClose={() => setShowShippingAddressModal(false)}
          onSuccess={() => {
            setShowShippingAddressModal(false);
            setShowSelectShippingAddressModal(true);
          }}
        />
      )}
      {showSelectShippingAddressModal && (
        <SelectShippingAddressModal
          selectedAddress={selectedShippingAddress}
          onSelectAddress={setSelectedShippingAddress}
          onClose={() => setShowSelectShippingAddressModal(false)}
          onAddNew={() => {
            setShowSelectShippingAddressModal(false);
            setShowShippingAddressModal(true);
          }}
        />
      )}
    </>
  );
}

const SelectShippingAddressModal = ({
  selectedAddress,
  onSelectAddress,
  onClose,
  onAddNew,
}: {
  selectedAddress: any;
  onSelectAddress: (address: any) => void;
  onClose: () => void;
  onAddNew: () => void;
}) => {
  const queryClient = useQueryClient();
  const [localSelectedAddress, setLocalSelectedAddress] =
    useState<any>(selectedAddress);

  const {
    data: addresses,
    isLoading: isAddressesLoading,
    error: addressesError,
    refetch: refetchAddresses,
  } = useQuery(
    orpc.user.shippingAddress.getShippingAddress.queryOptions({
      queryKey: ["shipping-address"],
      retry: 1,
    })
  );

  const markAsDefaultMutation = useMutation(
    orpc.user.shippingAddress.markAsDefaultShippingAddress.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["shipping-address"] });
        Toast.show({
          type: "success",
          text1: "Default address updated",
        });
      },
      onError: (error: any) => {
        console.error("Mark as default error:", error);
        Toast.show({
          type: "error",
          text1: "Failed to update default address",
          text2: error?.message || "Please try again",
        });
      },
    })
  );

  const handleSelectAddress = (address: any) => {
    setLocalSelectedAddress(address);
  };

  const handleConfirmSelection = () => {
    onSelectAddress(localSelectedAddress);
    onClose();
    Toast.show({
      type: "success",
      text1: "Shipping address selected",
    });
  };

  const handleAddNewAddress = () => {
    onAddNew();
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={onClose}
              className="h-9 w-9 rounded-full bg-white justify-center items-center"
            >
              <Image
                source={CancleIcon}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900">
              Select Address
            </Text>
            <View className="w-9" />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {isAddressesLoading ? (
            <View className="flex-1 items-center justify-center py-8">
              <ActivityIndicator size="large" color="#19B360" />
              <Text className="mt-4 text-gray-600">Loading addresses...</Text>
            </View>
          ) : addressesError ? (
            <View className="flex-1 items-center justify-center px-6 py-8">
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                Failed to load addresses
              </Text>
              <Text className="text-gray-600 text-center mb-6">
                Something went wrong while loading your addresses.
              </Text>
              <TouchableOpacity
                onPress={() => refetchAddresses()}
                className="bg-[#19B360] px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold">Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : !addresses || addresses.length === 0 ? (
            <View className="flex-1 items-center justify-center px-6 py-8">
              <Text className="text-xl font-semibold text-gray-900 mb-2">
                No addresses found
              </Text>
              <Text className="text-gray-600 text-center mb-8">
                Add a shipping address to continue with your order.
              </Text>
              <TouchableOpacity
                onPress={handleAddNewAddress}
                className="bg-[#19B360] px-8 py-4 rounded-lg"
              >
                <Text className="text-white font-semibold text-lg">
                  Add New Address
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="px-6 pt-6">
              {addresses.map((address: any) => (
                <TouchableOpacity
                  key={address.id}
                  onPress={() => handleSelectAddress(address)}
                  className={`rounded-2xl p-4 mb-4 bg-white border-2 ${
                    localSelectedAddress?.id === address.id
                      ? "border-[#19B360] bg-green-50"
                      : "border-gray-200"
                  }`}
                  style={shadowStyle}
                >
                  <View className="flex-row items-start justify-between mb-2">
                    <Text className="text-lg font-bold text-gray-900 flex-1">
                      {address.fullName}
                    </Text>
                    <View className="flex-row items-center">
                      {address.isDefault && (
                        <View className="bg-[#19B360] px-2 py-1 rounded-full mr-2">
                          <Text className="text-white text-xs font-semibold">
                            Default
                          </Text>
                        </View>
                      )}
                      {localSelectedAddress?.id === address.id && (
                        <View className="w-6 h-6 bg-[#19B360] rounded-full justify-center items-center">
                          <View className="w-3 h-3 bg-white rounded-full" />
                        </View>
                      )}
                    </View>
                  </View>
                  <View className="flex-row items-start mb-2">
                    <View className="w-5 h-5 bg-green-100 rounded-full justify-center items-center mr-3 mt-1">
                      <Image
                        source={MapPinIcon}
                        className="w-3 h-3"
                        resizeMode="contain"
                      />
                    </View>
                    <Text className="text-gray-600 flex-1 leading-5">
                      {address.address}, {address.city}, {address.state}
                      {"\n"}
                      {address.country} - {address.zipCode}
                    </Text>
                  </View>
                  <Text className="text-gray-600 text-sm ml-8">
                    {address.phone}
                  </Text>
                  {!address.isDefault && (
                    <TouchableOpacity
                      onPress={() =>
                        markAsDefaultMutation.mutate({ id: address.id })
                      }
                      disabled={markAsDefaultMutation.isPending}
                      className="mt-3 ml-8"
                    >
                      <Text className="text-[#19B360] font-semibold text-sm">
                        {markAsDefaultMutation.isPending
                          ? "Setting..."
                          : "Set as default"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={handleAddNewAddress}
                className="rounded-2xl p-4 mb-4 bg-gray-50 border-2 border-dashed border-gray-300 justify-center items-center"
              >
                <View className="w-12 h-12 bg-gray-200 rounded-full justify-center items-center mb-2">
                  <Text className="text-gray-600 text-2xl font-bold">+</Text>
                </View>
                <Text className="text-gray-600 font-semibold">
                  Add New Address
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {addresses && addresses.length > 0 && (
          <View className="p-6 bg-white border-t border-gray-200">
            <TouchableOpacity
              onPress={handleConfirmSelection}
              disabled={
                !localSelectedAddress || markAsDefaultMutation.isPending
              }
              className={`rounded-2xl py-4 ${
                localSelectedAddress ? "bg-[#19B360]" : "bg-gray-300"
              }`}
              style={shadowStyle}
            >
              <Text className="text-white text-center font-bold text-lg">
                {localSelectedAddress
                  ? "Confirm Selection"
                  : "Select an Address"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const ShippingAddressModal = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const queryClient = useQueryClient();
  const [isDefaultAddress, setIsDefaultAddress] = useState(true);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const { height } = useGradualAnimation();
  const keyboardPadding = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  }, []);
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    email: "",
    zipCode: "",
    phone: "",
    country: "",
    city: "",
    state: "",
  });

  const createAddressMutation = useMutation(
    orpc.user.shippingAddress.createShippingAddress.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["shipping-address"] });
        onSuccess();
        Toast.show({
          type: "success",
          text1: "Address added successfully",
        });
        // Reset form
        setForm({
          fullName: "",
          address: "",
          email: "",
          zipCode: "",
          phone: "",
          country: "",
          city: "",
          state: "",
        });
        setIsDefaultAddress(true);
      },
      onError: (error: any) => {
        console.error("Create address error:", error);
        Toast.show({
          type: "error",
          text1: "Failed to add address",
          text2: error?.message || "Please try again",
        });
      },
    })
  );

  const handleSaveAddress = () => {
    // Validate required fields
    if (
      !form.fullName ||
      !form.address ||
      !form.email ||
      !form.zipCode ||
      !form.phone ||
      !form.country ||
      !form.city ||
      !form.state
    ) {
      Toast.show({
        type: "error",
        text1: "Please fill all required fields",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Toast.show({
        type: "error",
        text1: "Please enter a valid email address",
      });
      return;
    }

    createAddressMutation.mutate({
      ...form,
      isDefault: isDefaultAddress,
    });
  };
  // TODO: move country and state to the server
  const countries = ["Nigeria"];
  const states = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
    "FCT",
  ];
  const cities = [
    "Lagos",
    "Abuja",
    "Port Harcourt",
    "Kano",
    "Ibadan",
    "Benin City",
    "Kaduna",
    "Enugu",
    "Ogbomosho",
    "Ilorin",
    "Oyo",
    "Jos",
    "Ile-Ife",
    "Ife",
    "Ado-Ekiti",
    "Akure",
    "Ondo",
    "Osogbo",
    "Iwo",
    "Ikirun",
    "Ilesha",
    "Effon-Alaiye",
    "Ila Orangun",
    "Gbongan",
    "Ikire",
    "Modakeke",
    "Ipetumodu",
    "Ejigbo",
    "Ijebu-Ode",
    "Sagamu",
    "Ijebu-Igbo",
    "Ogun",
    "Abeokuta",
    "Ilaro",
    "Ota",
    "Adelaide",
    "Mowe",
    "Ofada",
    "Sango Ota",
    "Ijoko",
    "Shagamu",
    "Atan",
    "Iperu",
    "Idiroko",
    "Epe",
    "Ikorodu",
    "Lagos Island",
    "Victoria Island",
    "Ikoyi",
    "Obalende",
    "Surulere",
    "Yaba",
    "Mushin",
    "Oshodi",
    "Isolo",
    "Ajegunle",
    "Apapa",
    "Orile",
    "Festac",
    "Satellite Town",
    "Badagry",
    "Ojo",
    "Iba",
    "Ipaja",
    "Ogba",
    "Agege",
    "Alimosho",
    "Okokomaiko",
    "Akowonjo",
  ];
  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white pb-16">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="px-6 py-4 bg-white border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={onClose}
                className="h-9 w-9 rounded-full bg-white justify-center items-center"
              >
                <Image
                  source={CancleIcon}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-gray-900">
                Add Address
              </Text>
              <View className="w-9" />
            </View>
          </View>
          <View className="px-4 pt-6">
            <View className="mb-4">
              <TextInput
                value={form.fullName}
                onChangeText={(text) => setForm({ ...form, fullName: text })}
                placeholder="Full Name"
                placeholderTextColor="#A0A0A0"
                className="border border-gray-300 rounded-2xl px-4 py-4 text-base text-gray-900"
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                accessibilityLabel="Full Name"
                accessibilityHint="Enter your full name"
              />
            </View>

            <View className="mb-4">
              <TextInput
                value={form.address}
                onChangeText={(text) => setForm({ ...form, address: text })}
                placeholder="Address"
                placeholderTextColor="#A0A0A0"
                className="border border-gray-300 rounded-2xl px-4 py-4 text-base text-gray-900"
                autoComplete="address-line1"
                textContentType="addressCityAndState"
                accessibilityLabel="Address"
                accessibilityHint="Enter your address"
              />
            </View>

            <View className="mb-4">
              <TextInput
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
                placeholder="Email Address"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
                className="border border-gray-300 rounded-2xl px-4 py-4 text-base text-gray-900"
                autoComplete="email"
                textContentType="emailAddress"
                accessibilityLabel="Email Address"
                accessibilityHint="Enter your email address"
              />
            </View>

            <View className="mb-4">
              <TextInput
                value={form.zipCode}
                onChangeText={(text) => setForm({ ...form, zipCode: text })}
                placeholder="Zipcode (Postal Code)"
                placeholderTextColor="#A0A0A0"
                keyboardType="numeric"
                className="border border-gray-300 rounded-2xl px-4 py-4 text-base text-gray-900"
                autoComplete="postal-code"
                textContentType="postalCode"
                accessibilityLabel="Zipcode (Postal Code)"
                accessibilityHint="Enter your zipcode (postal code)"
              />
            </View>

            <View className="mb-4">
              <TextInput
                value={form.phone}
                onChangeText={(text) => setForm({ ...form, phone: text })}
                placeholder="Phone Number"
                placeholderTextColor="#A0A0A0"
                keyboardType="phone-pad"
                className="border border-gray-300 rounded-2xl px-4 py-4 text-base text-gray-900"
                autoComplete="tel"
                textContentType="telephoneNumber"
                accessibilityLabel="Phone Number"
                accessibilityHint="Enter your phone number"
              />
            </View>

            <TouchableOpacity
              onPress={() => setShowCountryDropdown(true)}
              activeOpacity={0.7}
              className="w-full h-14 px-4 bg-gray-50 rounded-2xl border border-gray-200 flex-row items-center justify-between mb-4"
            >
              <Text
                className={`font-medium ${
                  form.country ? "text-black" : "text-[#8E9BAE]"
                }`}
              >
                {form.country || "Select Country"}
              </Text>
              <Image
                source={arrowDownIcon}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowCityDropdown(true)}
              activeOpacity={0.7}
              className="w-full h-14 px-4 bg-gray-50 rounded-2xl border border-gray-200 flex-row items-center justify-between mb-4"
            >
              <Text
                className={`font-medium ${
                  form.city ? "text-black" : "text-[#8E9BAE]"
                }`}
              >
                {form.city || "Select City"}
              </Text>
              <Image
                source={arrowDownIcon}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowStateDropdown(true)}
              activeOpacity={0.7}
              className="w-full h-14 px-4 bg-gray-50 rounded-2xl border border-gray-200 flex-row items-center justify-between mb-4"
            >
              <Text
                className={`font-medium ${
                  form.state ? "text-black" : "text-[#8E9BAE]"
                }`}
              >
                {form.state || "Select State"}
              </Text>
              <Image
                source={arrowDownIcon}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </TouchableOpacity>

            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-lg font-semibold text-gray-900">
                Save as default address
              </Text>
              <Switch
                value={isDefaultAddress}
                onValueChange={setIsDefaultAddress}
                trackColor={{ false: "#E5E5E5", true: "#19B360" }}
                thumbColor={isDefaultAddress ? "#FFFFFF" : "#FFFFFF"}
              />
            </View>
          </View>
        </ScrollView>

        {/* Country Dropdown Modal */}
        <Modal
          transparent={true}
          visible={showCountryDropdown}
          animationType="fade"
          onRequestClose={() => setShowCountryDropdown(false)}
        >
          <TouchableOpacity
            className="flex-1 bg-black/50 justify-center items-center"
            activeOpacity={1}
            onPressOut={() => setShowCountryDropdown(false)}
          >
            <View className="bg-white rounded-lg w-4/5 max-h-3/4">
              <Text className="p-4 border-b border-gray-200 text-gray-400">
                --select country--
              </Text>
              <FlatList
                data={countries}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                className="max-h-80"
                renderItem={({ item: country }) => (
                  <TouchableOpacity
                    className="p-4 border-b border-gray-200"
                    onPress={() => {
                      setForm({ ...form, country });
                      setShowCountryDropdown(false);
                    }}
                  >
                    <Text className="text-black">{country}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* State Dropdown Modal */}
        <Modal
          transparent={true}
          visible={showStateDropdown}
          animationType="fade"
          onRequestClose={() => setShowStateDropdown(false)}
        >
          <TouchableOpacity
            className="flex-1 bg-black/50 justify-center items-center"
            activeOpacity={1}
            onPressOut={() => setShowStateDropdown(false)}
          >
            <View className="bg-white rounded-lg w-4/5 max-h-3/4">
              <Text className="p-4 border-b border-gray-200 text-gray-400">
                --select state--
              </Text>
              <FlatList
                data={states}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                className="max-h-80"
                renderItem={({ item: state }) => (
                  <TouchableOpacity
                    className="p-4 border-b border-gray-200"
                    onPress={() => {
                      setForm({ ...form, state });
                      setShowStateDropdown(false);
                    }}
                  >
                    <Text className="text-black">{state}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* City Dropdown Modal */}
        <Modal
          transparent={true}
          visible={showCityDropdown}
          animationType="fade"
          onRequestClose={() => setShowCityDropdown(false)}
        >
          <TouchableOpacity
            className="flex-1 bg-black/50 justify-center items-center"
            activeOpacity={1}
            onPressOut={() => setShowCityDropdown(false)}
          >
            <View className="bg-white rounded-lg w-4/5 max-h-3/4">
              <Text className="p-4 border-b border-gray-200 text-gray-400">
                --select city--
              </Text>
              <FlatList
                data={cities}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                className="max-h-80"
                renderItem={({ item: city }) => (
                  <TouchableOpacity
                    className="p-4 border-b border-gray-200"
                    onPress={() => {
                      setForm({ ...form, city });
                      setShowCityDropdown(false);
                    }}
                  >
                    <Text className="text-black">{city}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        <View className="p-4 bg-white">
          <TouchableOpacity
            onPress={handleSaveAddress}
            disabled={createAddressMutation.isPending}
            className={`rounded-2xl py-4 ${
              createAddressMutation.isPending ? "bg-gray-400" : "bg-[#19B360]"
            }`}
            style={shadowStyle}
          >
            {createAddressMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-bold text-lg">
                Save Address
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Animated.View style={keyboardPadding} />
      </SafeAreaView>
    </Modal>
  );
};
