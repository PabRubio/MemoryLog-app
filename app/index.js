import MaskedView from '@react-native-masked-view/masked-view';
import { SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const MemoryLog = () => (
  <SafeAreaView className="flex-1 bg-gray-900">
    <View className="px-4 py-8">
      <View className="flex-row justify-between items-center">
        <MaskedView maskElement={<Text className="text-4xl font-bold text-black" style={{ lineHeight: 48 }}>MemoryLog</Text>}>
          <LinearGradient colors={['#3b82f6', '#8b5cf6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="px-1">
            <Text className="opacity-0 text-4xl font-bold text-black" style={{ lineHeight: 48 }}>MemoryLog</Text>
          </LinearGradient>
        </MaskedView>

        <TouchableOpacity className="flex-row items-center justify-center px-6 py-3 rounded-lg bg-blue-600">
          <Feather name="plus-circle" size={20} color="#f1f5f9" />
          <Text className="hidden min-[420px]:inline ml-2 text-lg text-gray-100">New Snippet</Text>
        </TouchableOpacity>
      </View>
    </View>
  </SafeAreaView>
);

export default MemoryLog;