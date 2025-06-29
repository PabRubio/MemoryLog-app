import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import {
  View, Text, Image,
  TouchableOpacity, StyleSheet,
  Animated, Dimensions
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

const FloatingEmoji = ({ emoji, delay, onComplete }) => {
  const randomX = useRef(Math.random() * 80 - 40).current;
  const animatedValue = useRef(new Animated.Value(0)).current;
  const randomDrift = useRef(Math.random() * 40 - 20).current;
  const randomDuration = useRef(3000 + Math.random() * 2000).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(animatedValue, {
          duration: randomDuration,
          useNativeDriver: true,
          toValue: 1,
        }),
      ])
    ]).start(() => {
      onComplete();
    });
  }, []);

  const translateY = animatedValue.interpolate({
    outputRange: [0, -screenHeight * 0.25],
    inputRange: [0, 1],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 0.1, 1],
    outputRange: [0.3, 1, 1.2],
  });

  const translateX = animatedValue.interpolate({
    outputRange: [0, randomX * 0.5, randomX * 0.8, randomX + randomDrift],
    inputRange: [0, 0.3, 0.6, 1],
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

const SnippetDetail = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [backButtonScale] = useState(new Animated.Value(1));
  const emojiIdRef = useRef(0);

  const snippet = {
    id: params.id,
    image: params.image ? decodeURIComponent(params.image) : '',
    caption: params.caption ? decodeURIComponent(params.caption) : '',
    emoji: params.emoji ? decodeURIComponent(params.emoji) : ''
  };

  useEffect(() => {
    const createEmoji = () => {
      const id = emojiIdRef.current++;
      setFloatingEmojis(prev => [...prev, {
        emoji: snippet.emoji || '😊',
        id, delay: 0,
      }]);
    };

    createEmoji();
    const interval = setInterval(createEmoji, 600);

    return () => clearInterval(interval);
  }, [snippet.emoji]);

  const removeEmoji = id =>
    setFloatingEmojis(prev => prev.filter(emoji => emoji.id !== id));

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

  const formatDate = timestamp => {
    const date = new Date(parseInt(timestamp));
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <View style={styles.fullscreenContainer}>

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
        <View style={[styles.topBar, { marginTop: insets.top }]}>
          <Animated.View style={{ transform: [{ scale: backButtonScale }] }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={handleBackPress}
              style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              {formatDate(snippet.id)}
            </Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <View style={[styles.bottomContent, { marginBottom: insets.bottom }]}>
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

export default SnippetDetail;