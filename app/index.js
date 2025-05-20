import { SafeAreaView, View, Text } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

const MemoryLog = () => (
  <SafeAreaView className="flex-1 bg-gray-900">
    <View className="px-4 py-8">
      <MaskedView maskElement={<Text className="text-4xl font-bold text-black" style={{ lineHeight: 48 }}>MemoryLog</Text>}>
        <LinearGradient colors={['#3b82f6', '#8b5cf6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="px-1">
          <Text className="opacity-0 text-4xl font-bold text-black" style={{ lineHeight: 48 }}>MemoryLog</Text>
        </LinearGradient>
      </MaskedView>
    </View>
  </SafeAreaView>
);

export default MemoryLog;