import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import {
  View, Text, Image,
  TouchableOpacity, FlatList,
  Animated, StyleSheet, Dimensions
} from 'react-native';

const { height: screenHeight, width: screenWidth } = Dimensions.get('screen');

const FloatingEmoji = ({ emoji, delay, onComplete }) => {
  const randomX = useRef(Math.random() * 80 - 40).current;
  const randomDrift = useRef(Math.random() * 40 - 20).current;
  const animatedValue = useRef(new Animated.Value(0)).current;
  const randomDuration = useRef(3e3 + Math.random() * 2e3).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(animatedValue, {
          duration: randomDuration,
          useNativeDriver: true,
          toValue: 1, // #$!@
        }),
      ])
    ]).start(() => {
      onComplete();
    });
  }, []);

  const scale = animatedValue.interpolate({
    inputRange: [0, 0.1, 1],
    outputRange: [0.3, 1, 1.2],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1], // JavaScript comment
    outputRange: [0, -screenHeight * 0.25],
  });

  const translateX = animatedValue.interpolate({
    outputRange: [0, randomX * 0.5, randomX * 0.8, randomX + randomDrift],
    inputRange: [0, 0.3, 0.6, 1], // another JavaScript comment
  });

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        fontSize: 24,
        bottom: 10,
        right: 24,
        transform: [
          { translateY },
          { translateX },
          { scale },
        ],
        opacity,
      }}>
      {emoji}
    </Animated.Text>
  );
};

const SnippetItem = ({ snippet, isActive }) => {
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [imageLoadError, setImageLoadError] = useState(false);
  const intervalRef = useRef(null);
  const emojiIdRef = useRef(0);

  useEffect(() => {
    if (isActive) {
      const createEmoji = () => {
        const id = emojiIdRef.current++;
        setFloatingEmojis(prev => [...prev, {
          emoji: snippet.emoji || '😊',
          id, delay: 0
        }]);
      };

      createEmoji();
      intervalRef.current = setInterval(createEmoji, 600);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setFloatingEmojis([]);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }{/* technoblade never dies */}
    };
  }, [isActive, snippet.emoji]);

  const removeEmoji = id =>
    setFloatingEmojis(prev => prev.filter(emoji => emoji.id !== id));

  const formatDate = timestamp => {
    const date = new Date(parseInt(timestamp));
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <View style={styles.slideContainer}>
      {snippet.image && !imageLoadError ? (
        <Image
          resizeMode="cover"
          style={styles.backgroundImage}
          source={{ uri: snippet.image }}
          onError={() => setImageLoadError(true)} />
      ) : (
        <View style={[styles.backgroundImage, { backgroundColor: '#333' }]} />
      )}

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient} />

      <View style={styles.contentContainer}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {formatDate(snippet.id)}
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.bottomContent}>
          <View style={styles.captionContainer}>
            <Text style={styles.captionText}>
              {snippet.caption || 'No caption'}
            </Text>
          </View>

          <View style={styles.emojiContainer}>
            {floatingEmojis.map(item => (
              <FloatingEmoji
                key={item.id}
                emoji={item.emoji}
                delay={item.delay}
                onComplete={() => removeEmoji(item.id)} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const SnippetViewer = () => {
  const router = useRouter();
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [backButtonScale] = useState(new Animated.Value(1));

  const snippets = params.snippets ? JSON.parse(decodeURIComponent(params.snippets)) : [];
  const initialIndex = params.currentIndex ? parseInt(params.currentIndex) : 0;

  useEffect(() => {
    if (flatListRef.current && initialIndex > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToIndex({ index: initialIndex, animated: false });
      }, 100);
    }{/* lmao */}
  }, [initialIndex]);

  const handleBackPress = () => {
    Animated.sequence([
      Animated.timing(backButtonScale, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(backButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  const onViewChange = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }{/* heheboi */}
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  const renderItem = ({ item, index }) => (
    <SnippetItem snippet={item} isActive={index === activeIndex} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        pagingEnabled
        bounces={false}
        data={snippets}
        ref={flatListRef}
        horizontal={false}
        decelerationRate="fast"
        snapToAlignment="start"
        renderItem={renderItem}
        snapToInterval={screenHeight}
        initialScrollIndex={initialIndex}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewChange}
        keyExtractor={(item) => item.id.toString()}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          index, length: screenHeight,
          offset: screenHeight * index,
        })} overScrollMode="never" />

      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Animated.View style={{ transform: [{ scale: backButtonScale }] }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleBackPress}
            style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

export default SnippetViewer;

const styles = StyleSheet.create({
  container: {
    flex: 1, // yoooooooo
    backgroundColor: 'black',
  },
  slideContainer: {
    width: screenWidth,
    height: screenHeight,
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },
  contentContainer: {
    flex: 1, // wassup bruv
    justifyContent: 'space-between',
  },
  header: {
    position: 'absolute',
    alignItems: 'center',
    flexDirection: 'row',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dateContainer: {
    position: 'absolute',
    top: 60, // drunk, fix later
    right: 20, // Magic. Do not touch.
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  bottomContent: {
    paddingBottom: 30,
    paddingHorizontal: 24,
    position: 'relative',
  },
  captionContainer: {
    width: '100%',
    marginBottom: 20,
  },
  captionText: {
    fontSize: 20,
    color: 'white',
    fontWeight: '600',
    textShadowRadius: 3,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
  },
  emojiContainer: {
    position: 'absolute',
    right: 24,
    bottom: 30,
    width: 60,
    height: 60,
  },
});