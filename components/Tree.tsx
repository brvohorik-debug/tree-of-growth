import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { TreeState } from '@/types';
import { useStore } from '@/store/useStore';

const { width, height } = Dimensions.get('window');

interface TreeProps {
  treeState: TreeState;
}

export default function Tree({ treeState }: TreeProps) {
  const { currentStage, leaves, level } = treeState;
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const leavesOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate tree growth based on stage
    const stageScales: Record<TreeState['currentStage'], number> = {
      seed: 0.3,
      sprout: 0.5,
      'small-tree': 0.7,
      'big-tree': 0.9,
      'blooming-tree': 1.0,
    };

    scale.value = withSpring(stageScales[currentStage], {
      damping: 15,
      stiffness: 100,
    });

    opacity.value = withTiming(1, { duration: 500 });
    leavesOpacity.value = withTiming(1, { duration: 800, delay: 300 });
  }, [currentStage]);

  const treeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const leavesStyle = useAnimatedStyle(() => ({
    opacity: leavesOpacity.value,
  }));

  const renderTree = () => {
    const treeHeight = height * 0.5;
    const trunkWidth = 20;
    const trunkHeight = treeHeight * 0.6;

    return (
      <View style={styles.treeContainer}>
        {/* Trunk */}
        <View
          style={[
            styles.trunk,
            {
              width: trunkWidth,
              height: trunkHeight,
              backgroundColor: '#8B4513',
            },
          ]}
        />

        {/* Branches and Leaves based on stage */}
        {currentStage !== 'seed' && (
          <View style={styles.branchesContainer}>
            {/* Left branch */}
            <View
              style={[
                styles.branch,
                {
                  width: trunkWidth * 1.5,
                  height: trunkHeight * 0.4,
                  backgroundColor: '#654321',
                  transform: [{ rotate: '-30deg' }],
                  left: -trunkWidth * 0.5,
                  top: trunkHeight * 0.3,
                },
              ]}
            />

            {/* Right branch */}
            <View
              style={[
                styles.branch,
                {
                  width: trunkWidth * 1.5,
                  height: trunkHeight * 0.4,
                  backgroundColor: '#654321',
                  transform: [{ rotate: '30deg' }],
                  right: -trunkWidth * 0.5,
                  top: trunkHeight * 0.3,
                },
              ]}
            />

            {/* Leaves */}
            {currentStage !== 'sprout' && (
              <Animated.View style={[styles.leavesContainer, leavesStyle]}>
                {Array.from({ length: Math.min(leaves, 20) }).map((_, i) => {
                  const angle = (i * 360) / Math.min(leaves, 20);
                  const radius = trunkHeight * 0.5;
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;

                  return (
                    <View
                      key={i}
                      style={[
                        styles.leaf,
                        {
                          left: x + trunkWidth / 2 - 8,
                          top: y + trunkHeight * 0.2 - 8,
                          backgroundColor:
                            currentStage === 'blooming-tree'
                              ? '#FFD700'
                              : '#4a7c2a',
                        },
                      ]}
                    />
                  );
                })}
              </Animated.View>
            )}

            {/* Blooming flowers */}
            {currentStage === 'blooming-tree' && (
              <Animated.View style={[styles.flowersContainer, leavesStyle]}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const angle = (i * 360) / 5;
                  const radius = trunkHeight * 0.6;
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;

                  return (
                    <View
                      key={i}
                      style={[
                        styles.flower,
                        {
                          left: x + trunkWidth / 2 - 12,
                          top: y + trunkHeight * 0.1 - 12,
                        },
                      ]}
                    >
                      <View style={styles.flowerCenter} />
                      <View style={[styles.petal, styles.petal1]} />
                      <View style={[styles.petal, styles.petal2]} />
                      <View style={[styles.petal, styles.petal3]} />
                      <View style={[styles.petal, styles.petal4]} />
                    </View>
                  );
                })}
              </Animated.View>
            )}
          </View>
        )}

        {/* Seed (initial stage) */}
        {currentStage === 'seed' && (
          <View
            style={[
              styles.seed,
              {
                width: 30,
                height: 30,
                backgroundColor: '#8B4513',
                borderRadius: 15,
                top: trunkHeight - 15,
              },
            ]}
          />
        )}
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, treeStyle]}>
      {renderTree()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  treeContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  trunk: {
    borderRadius: 10,
  },
  branchesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  branch: {
    position: 'absolute',
    borderRadius: 5,
  },
  leavesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  leaf: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4a7c2a',
  },
  flowersContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  flower: {
    position: 'absolute',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowerCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
    zIndex: 1,
  },
  petal: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF69B4',
  },
  petal1: {
    top: 0,
    left: 7,
  },
  petal2: {
    bottom: 0,
    left: 7,
  },
  petal3: {
    left: 0,
    top: 7,
  },
  petal4: {
    right: 0,
    top: 7,
  },
  seed: {
    position: 'absolute',
  },
});
