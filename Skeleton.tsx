import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle } from 'react-native';
import { colors, borderRadius } from '@/constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius: radius = borderRadius.sm,
  style,
}: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surfaceVariant, colors.outline],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}

// Common skeleton layouts
export function SkeletonCard() {
  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Skeleton height={24} width="60%" />
      <Skeleton height={16} width="100%" />
      <Skeleton height={16} width="80%" />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <Skeleton height={32} width={80} borderRadius={borderRadius.md} />
        <Skeleton height={32} width={80} borderRadius={borderRadius.md} />
      </View>
    </View>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Skeleton width={48} height={48} borderRadius={borderRadius.full} />
          <View style={{ flex: 1, gap: 6 }}>
            <Skeleton height={16} width="70%" />
            <Skeleton height={14} width="50%" />
          </View>
        </View>
      ))}
    </View>
  );
}