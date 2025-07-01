import React, { useRef, useState, useEffect } from 'react';
import MaskedView from '@react-native-masked-view/masked-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Modalize } from 'react-native-modalize';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  SafeAreaView, View, Text,
  TouchableOpacity, Image, TextInput,
  Keyboard, Animated, Platform, Dimensions
} from 'react-native';

const emojiOptions = ['😊', '😢', '❤️', '😎'];

const MemoryLog = () => {
  const router = useRouter();
  const modalRef = useRef(null);
  const insets = useSafeAreaInsets();
  const [buttonScale] = useState(new Animated.Value(1));
  const [savedSnippets, setSavedSnippets] = useState([]);

  const iosModalStyles = {
    marginBottom: Platform.OS === 'ios' ? -insets.bottom : 0,
    paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0,
  };

  const openModal = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    modalRef.current?.open();
  };

  const navigateToSnippet = snippet =>
    router.push({
      pathname: "/snippet",
      params: {
        id: snippet.id,
        image: encodeURIComponent(snippet.image),
        caption: encodeURIComponent(snippet.caption),
        emoji: encodeURIComponent(snippet.emoji),
      },
    });

  const [newSnippet, setNewSnippet] = useState({ image: null, caption: '', emoji: '😊' });
  const [keyboardOffset] = useState(new Animated.Value(0));
  const [modalSnapPoint, setModalSnapPoint] = useState(0);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(keyboardOffset, {
          toValue: -e.endCoordinates.height,
          duration: Platform.OS === 'ios' ? e.duration : 100,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (e) => {
        Animated.timing(keyboardOffset, {
          toValue: 0, useNativeDriver: true,
          duration: Platform.OS === 'ios' ? e.duration : 100,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [keyboardOffset]);

  const handleSelectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      presentationStyle: 'fullScreen',
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const fileName = `image_${Date.now()}.jpeg`;
      const newPath = FileSystem.documentDirectory + fileName;

      try {
        await FileSystem.copyAsync({
          from: result.assets[0].uri, to: newPath
        });
        setNewSnippet(prev => ({ ...prev, image: newPath }));
      } catch (error) {
        setNewSnippet(prev => ({ ...prev, image: result.assets[0].uri }));
      }
    }
  };

  const handleSaveSnippet = () => {
    if (newSnippet.image && newSnippet.caption) {
      setSavedSnippets(prev => [...prev, { ...newSnippet, id: Date.now() }]);
      modalRef.current?.close();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <Animated.View
        style={{
          flex: 1, transform: [{ translateY: keyboardOffset }]
        }}>
        <View className="px-4 py-8">
          <View className={`flex-row justify-between items-center ${Platform.OS === 'ios' ? '-mt-4' : 'mt-6'}`}>{/* LOL */}
            <MaskedView maskElement={<Text className="text-4xl font-bold text-black" style={{ lineHeight: 48 }}>MemoryLog</Text>}>
              <LinearGradient colors={['#3b82f6', '#8b5cf6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="px-1">
                <Text className="opacity-0 text-4xl font-bold text-black" style={{ lineHeight: 48 }}>MemoryLog</Text>
              </LinearGradient>
            </MaskedView>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity onPress={openModal} activeOpacity={1} className="flex-row items-center justify-center px-6 py-3 rounded-lg bg-blue-600">
                <Feather name="plus-circle" size={20} color="#f1f5f9" />{/* random inline heheboi */}
                {Dimensions.get('window').width >= 420 && <Text className="ml-2 text-lg text-gray-100">New Snippet</Text>}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        <View className="flex-1 px-4 pt-4">
          <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
            {savedSnippets.map((snippet) => (
              <TouchableOpacity
                className="p-1"
                key={snippet.id}
                activeOpacity={0.8}
                style={{ width: '33.333%' }}
                onPress={() => navigateToSnippet(snippet)}>
                <View className="aspect-square overflow-hidden rounded-lg">
                  <Image
                    className="w-full h-full"
                    source={{ uri: snippet.image }}
                    resizeMode="cover" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Modalize
          ref={modalRef}
          modalHeight={modalSnapPoint}
          adjustToContentHeight={false}
          disableScrollIfPossible={false}
          handleStyle={{ backgroundColor: '#6b7280' }}
          modalStyle={{ backgroundColor: '#1f2937', borderTopWidth: 1,
            borderTopLeftRadius: 26, borderTopRightRadius: 26, ...iosModalStyles }}
          overlayStyle={{ top: -insets.top, bottom: -insets.bottom }}
          onClosed={() => {
            setNewSnippet({ image: null, caption: '', emoji: '😊' });
          }}>

          <View
            onLayout={(event) => {
              const bottomPadding = 40;{/* temp */}
              const { height } = event.nativeEvent.layout;
              setModalSnapPoint(height + bottomPadding);
            }}>

            <View className="px-6 pt-6 pb-2">
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
                placeholderTextColor="#9ca3af" multiline
                placeholder="What's the story behind this moment?"
                className="w-full p-3 rounded-lg bg-gray-700 text-gray-100"
                style={{ height: 150, textAlignVertical: 'top' }} />

              <View className="flex-row justify-between items-center">
                <View className="flex-row gap-2">
                  {emojiOptions.map(emoji => (
                    <TouchableOpacity
                      key={emoji} onPress={() => setNewSnippet(prev => ({ ...prev, emoji }))}
                      className={`p-2 rounded ${newSnippet.emoji === emoji ? 'bg-blue-600' : 'bg-transparent'} items-center justify-center`}>
                      <Text className="text-xl">{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={handleSaveSnippet}
                  disabled={!newSnippet.image || !newSnippet.caption}
                  className="px-4 py-2 rounded-lg bg-blue-600 disabled:opacity-50 flex-row items-center justify-center">
                  <Text className="text-gray-100 font-medium"> {Dimensions.get('window').width >= 420 ? 'Save Snippet' : 'Save'} </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modalize>
      </Animated.View>
    </SafeAreaView>
  );
};

export default MemoryLog;