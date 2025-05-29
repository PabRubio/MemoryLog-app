import React, { useRef, useState } from 'react';
import MaskedView from '@react-native-masked-view/masked-view';
import { SafeAreaView, View, Text, TouchableOpacity, Image, TextInput, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Modalize } from 'react-native-modalize';
import { Feather } from '@expo/vector-icons';

const emojiOptions = ['😊', '❤️', '😢', '😎'];

const MemoryLog = () => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375;

  const modalRef = useRef(null);
  const openModal = () => modalRef.current?.open();

  const [newSnippet, setNewSnippet] = useState({ image: null, caption: '', emoji: '😊' });

  const handleSelectImage = () => { };
  const handleSaveSnippet = () => { };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="px-4 py-8">
        <View className="flex-row justify-between items-center">
          <MaskedView maskElement={<Text className="text-4xl font-bold text-black" style={{ lineHeight: 48 }}>MemoryLog</Text>}>
            <LinearGradient colors={['#3b82f6', '#8b5cf6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="px-1">
              <Text className="opacity-0 text-4xl font-bold text-black" style={{ lineHeight: 48 }}>MemoryLog</Text>
            </LinearGradient>
          </MaskedView>

          <TouchableOpacity onPress={openModal} className="flex-row items-center justify-center px-6 py-3 rounded-lg bg-blue-600">
            <Feather name="plus-circle" size={20} color="#f1f5f9" />
            <Text className="hidden min-[420px]:inline ml-2 text-lg text-gray-100">New Snippet</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modalize
        ref={modalRef}
        snapPoint={420}
        modalStyle={{ backgroundColor: '#1f2937', borderTopColor: '#374151', borderTopWidth: 1 }}
        handleStyle={{ backgroundColor: '#6b7280' }}
        adjustToContentHeight={false}>
        <View className="px-6 pt-6 pb-4">
          <Text className="text-lg font-semibold text-gray-100">Create New Snippet</Text>
        </View>

        <View className="px-6 py-4 gap-y-4">
          <TouchableOpacity
            onPress={handleSelectImage}
            className="border-2 border-dashed border-gray-600 rounded-lg p-10 items-center justify-center h-72">
            {newSnippet.image ? (
              <Image source={{ uri: newSnippet.image }} className="w-full h-full rounded-lg" resizeMode="contain" />
            ) : (
              <>
                <Feather name="camera" size={36} color="#9ca3af" style={{ marginBottom: 12 }} />
                <Text className="text-base text-gray-400">Tap to upload photo</Text>
              </>
            )}
          </TouchableOpacity>

          <TextInput
            value={newSnippet.caption}
            onChangeText={text => {
              if (text.length <= 50) setNewSnippet(prev => ({ ...prev, caption: text }));
            }}
            placeholder="What's the story behind this moment?"
            placeholderTextColor="#9ca3af"
            multiline
            className="w-full p-3 rounded-lg bg-gray-700 text-gray-100"
            style={{ minHeight: 150, maxHeight: 250, textAlignVertical: 'top' }}
          />

          <View className="flex-row justify-between items-center">
            <View className="flex-row gap-2">
              {emojiOptions.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => setNewSnippet(prev => ({ ...prev, emoji }))}
                  className={`p-2 rounded ${newSnippet.emoji === emoji ? 'bg-blue-600' : 'bg-transparent'} items-center justify-center`}>
                  <Text className="text-xl">{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleSaveSnippet}
              disabled={!newSnippet.image || !newSnippet.caption}
              className="px-4 py-2 rounded-lg bg-blue-600 disabled:opacity-50">
              <Text className="text-gray-100 font-medium">{isSmallScreen ? 'Save' : 'Save Snippet'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modalize>
    </SafeAreaView>
  );
};

export default MemoryLog;