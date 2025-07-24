import React, { useRef, useState, useEffect } from 'react';
import MaskedView from '@react-native-masked-view/masked-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Modalize } from 'react-native-modalize';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';

import {
  SafeAreaView, View, Text, Image,
  TouchableOpacity, TextInput, Keyboard,
  Animated, Platform, Dimensions, ScrollView
} from 'react-native';

const emojiOptions = ['😊', '😢', '❤️'];

const moreEmojis = [
  '😂', '🤣', '😍', '🥰', '😎', '🤩', '🥺', '😭',
  '🤔', '🙄', '😴', '🥳', '😤', '😡', '😱', '🤯',
  '🥸', '💀', '💯', '🔥', '👍', '💪', '🎉', '🧁',
  '👀', '💩', '🌈', '🎮', '🍕', '🎵', '✨', '💫',
  '🌟', '💻', '🚀', '🐔'];

const TouchableSticky = ({
  children, onPress, stickyOpacity = 0.3, ...props }) => {

  const timeoutRef = useRef(null); // code go brrr
  const [isPressed, setIsPressed] = useState(false);
  
  const handlePress = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTimeout(() => (onPress?.(), setIsPressed(false)), 300);
  };

  const normalizeStyles = (style) => {
    if (!style) return [];
    return Array.isArray(style) ? style : [style];
  };

  const styles = normalizeStyles(props.style);
  const mergedStyle = Object.assign({}, ...styles);
  const { opacity = 1, ...cleanStyles } = mergedStyle;

  return (
    <TouchableOpacity
      {...props}
      activeOpacity={1}
      onPress={handlePress}
      onPressIn={() => (setIsPressed(true),
        timeoutRef.current = setTimeout(() =>
        setIsPressed(false), 2000))} // pog
      style={[cleanStyles, {
        opacity: isPressed ? stickyOpacity : opacity }]}>
      {children}
    </TouchableOpacity>
  );
};

const MemoryLog = () => {
  const router = useRouter();
  const modalRef = useRef(null);
  const insets = useSafeAreaInsets();

  const [buttonScale] = useState(new Animated.Value(1));
  const [logoutScale] = useState(new Animated.Value(1));

  const [paletteScale] = useState(new Animated.Value(1));
  const [savedSnippets, setSavedSnippets] = useState([]);

  const iosModalStyles = {
    marginBottom: Platform.OS === 'ios' ? -insets.bottom : 0,
    paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0,
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const animatePress = (scaleValue, callback) => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        duration: 100,
        toValue: 1.0,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  const openModal = () => {
    animatePress(buttonScale);
    modalRef.current?.open();
  };

  const navigateToSnippet = (snippet, position) =>
    router.push({
      pathname: "/viewer",
      params: {
        currentIndex: position,
        snippets: encodeURIComponent(
          JSON.stringify(savedSnippets)),
      },
    });

  const [modalSnapPoint, setModalSnapPoint] = useState(0);
  const [keyboardOffset] = useState(new Animated.Value(0));

  const [newSnippet, setNewSnippet] = useState({ image: null, caption: '', emoji: '😊' });

  const [mainContentHeight, setMainContentHeight] = useState(0);
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);

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
          // wot r u lookin' at?
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
      setSavedSnippets(prev => [{ ...newSnippet, id: Date.now() }, ...prev]);
      modalRef.current?.close();{/* wtf */}
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <Animated.View
        style={{
          flex: 1, transform: [{ translateY: keyboardOffset }]
        }}>
        <View className="px-4 py-8" style={{ paddingBottom: 53 }}>
          <View className={`flex-row justify-between items-center ${Platform.OS === 'ios' ? '-mt-4' : 'mt-6'}`}>{/* LOL */}
            <MaskedView maskElement={<Text className="text-4xl font-bold text-black" style={{ lineHeight: 48 }}>MemoryLog</Text>}>
              <LinearGradient colors={['#3b82f6', '#8b5cf6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="px-1">
                <Text className="opacity-0 text-4xl font-bold text-black" style={{ lineHeight: 48 }}>MemoryLog</Text>
              </LinearGradient>
            </MaskedView>

            {isLoggedIn ? (
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity onPress={openModal} activeOpacity={1} className="flex-row items-center justify-center px-6 py-3 rounded-lg bg-blue-600">
                  <Feather name="plus-circle" size={20} color="#f1f5f9" />{/* random inline heheboi */}
                  {Dimensions.get('window').width >= 420 && <Text className="ml-2 text-lg text-gray-100">New Snippet</Text>}
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity onPress={() => (0)} activeOpacity={1} className="flex-row items-center justify-center px-6 py-3 rounded-lg bg-gray-700">
                  <Feather name="plus-circle" size={20} color="#6b7280" />{/* random inline heheboi */}
                  {Dimensions.get('window').width >= 420 && <Text className="ml-2 text-lg text-gray-500">New Snippet</Text>}
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </View>

        <ScrollView className="flex-1 px-4 pt-0" showsVerticalScrollIndicator={false}>
          <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
            {(isLoggedIn ? savedSnippets : []).map((snippet, position) => (
              <TouchableSticky
                className="p-1"
                key={snippet.id}
                stickyOpacity={0.5}
                style={{ width: '33.333%' }}
                onPress={() => navigateToSnippet(snippet, position)}>
                <View className="aspect-square overflow-hidden rounded-xl">
                  <Image
                    className="w-full h-full"
                    source={{ uri: snippet.image }}
                    resizeMode="cover" />
                </View>
              </TouchableSticky>
            ))}
          </View>
        </ScrollView>

        <Animated.View
          className="absolute right-6"
          style={{ bottom: insets.bottom + 3, width: 112, transform: [{ scale: logoutScale }] }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => animatePress(logoutScale, () => setIsLoggedIn(!isLoggedIn))} // noice👌
            className="py-3 rounded-full bg-gray-800/70 backdrop-blur-md items-center justify-center">
            <Text className="text-gray-100 font-medium">{isLoggedIn ? 'LogOut' : 'SignIn'} </Text>
          </TouchableOpacity>
        </Animated.View>

        <Modalize
          ref={modalRef}
          modalHeight={modalSnapPoint}
          adjustToContentHeight={false}
          disableScrollIfPossible={false}
          handleStyle={{ backgroundColor: '#6b7280' }}
          modalStyle={{ backgroundColor: '#1f2937', borderTopWidth: 0,
            borderTopLeftRadius: 26, borderTopRightRadius: 26, ...iosModalStyles }}
          overlayStyle={{
            top: Platform.OS === 'ios' ? -insets.top : 0,
            bottom: Platform.OS === 'ios' ? -insets.bottom : 0
          }}
          onClosed={() => {
            setShowEmojiPanel(false);{/* yeeeeeeeeeeeeeeeeeeeeeet */}
            setNewSnippet({ image: null, caption: '', emoji: '😊' });
          }}>

          {!showEmojiPanel ? (
            <View
              onLayout={(event) => {
                const bottomPadding = 40;
                const { height } = event.nativeEvent.layout;
                setModalSnapPoint(height + bottomPadding);
                setMainContentHeight(height);
              }}>

              <View className="px-6 pt-6 pb-6">
                <Text className="text-lg font-semibold text-gray-100">Create New Snippet</Text>
              </View>

              <View className="px-6 py-4 gap-y-4">
                <TouchableSticky // wut is dis?
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
                </TouchableSticky>

                <TextInput
                  value={newSnippet.caption}
                  onChangeText={text => {
                    if (text.length <= 50) setNewSnippet(prev => ({ ...prev, caption: text }));
                  }}
                  onBlur={() => {
                    setNewSnippet(prev => ({ ...prev, caption: prev.caption.replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim() }));
                  }}
                  placeholderTextColor="#9ca3af" multiline
                  placeholder="What's the story behind this moment?"
                  className="w-full p-3 rounded-lg bg-gray-700 text-gray-100"
                  style={{ height: 150, textAlignVertical: 'top' }} />

                <View className="flex-row justify-between items-center">
                  <View className="flex-row gap-2">
                    {emojiOptions.map(emoji => (
                      <TouchableOpacity // poggers
                        key={emoji} activeOpacity={1} onPress={() => setNewSnippet(prev => ({ ...prev, emoji }))}
                        className={`p-2 rounded ${newSnippet.emoji === emoji ? 'bg-blue-600' : 'bg-transparent'} items-center justify-center`}>
                        <Text className="text-xl">{emoji}</Text>{/* second inline heheboi */}
                      </TouchableOpacity>
                    ))}
                    <Animated.View style={{ transform: [{ scale: paletteScale }] }}>
                      <TouchableOpacity
                        onPress={() => {
                          animatePress(paletteScale, () => setShowEmojiPanel(true));
                        }}
                        activeOpacity={1} className="p-2 rounded bg-transparent items-center justify-center">
                        <MaterialIcons name="palette" size={28} color={moreEmojis.includes(newSnippet.emoji) && !emojiOptions.includes(newSnippet.emoji) ? '#3b82f6' : '#9ca3af'} />
                      </TouchableOpacity>
                    </Animated.View>
                  </View>

                  <TouchableSticky // this again?
                    onPress={handleSaveSnippet} style={{ opacity: newSnippet.image && newSnippet.caption ? 1 : 0.3 }}
                    className={`px-4 py-2 rounded-lg bg-blue-600 flex-row items-center justify-center`} disabled={!newSnippet.image || !newSnippet.caption}>
                    <Text className="text-gray-100 font-medium"> {Dimensions.get('window').width >= 420 ? 'Save Snippet' : 'Save'} </Text>
                  </TouchableSticky>
                </View>
              </View>
            </View>
          ) : (
            <View
              style={{ height: mainContentHeight }}>

              <View className="px-6 pt-6 pb-2 flex-row justify-between items-center">
                <Text className="text-lg font-semibold text-gray-100">Emoji Picker</Text>
                <Animated.View style={{ transform: [{ scale: paletteScale }] }}>
                  <TouchableOpacity
                    onPress={() => {
                      animatePress(paletteScale, () => setShowEmojiPanel(false));
                    }}
                    activeOpacity={1}>
                    <MaterialIcons name="palette" size={24} color="#9ca3af" />
                  </TouchableOpacity>
                </Animated.View>
              </View>

              <View className="px-6 py-4 flex-1">
                <View className="flex-row flex-wrap justify-between">
                  {moreEmojis.map(emoji => (
                    <TouchableOpacity // tap tap
                      key={emoji} activeOpacity={1} onPress={() => setNewSnippet(prev => ({ ...prev, emoji }))}
                      className={`p-2 rounded mb-3 ${newSnippet.emoji === emoji ? 'bg-blue-600' : 'bg-transparent'} items-center justify-center`}
                      style={{ width: '15%', aspectRatio: 1 }}>{/* another inline heheboi */}
                      <Text className="text-xl">{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
        </Modalize>
      </Animated.View>
    </SafeAreaView>
  );
};

export default MemoryLog;