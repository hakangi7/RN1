import React from 'react';
import { Pressable, Text, StyleSheet, PressableProps, View } from 'react-native';
import colors from './colors';

// Define props for the Btn component, extending PressableProps
interface BtnProps extends PressableProps {
  title: string;
  style?: object;
  textStyle?: object;
  backgroundColor?: string;
  pressedBackgroundColor?: string;
  shape?: 'circular' | 'square' | 'triangle'; // Add shape prop
  width?: number; // Allow dynamic width
  height?: number; // Allow dynamic height
}

const Btn: React.FC<BtnProps> = ({
  title,
  onPress,
  style,
  textStyle,
  backgroundColor = colors.vividOrange,
  pressedBackgroundColor = '#91C788',
  shape = 'square', // Default shape to square
  width = 60, // Default width
  height = 60, // Default height
  ...props
}) => {
  const triangleStyle = shape === 'triangle' && {
    borderLeftWidth: width / 2, // Half the width for the triangle base
    borderRightWidth: width / 2,
    borderBottomWidth: height, // Height of the triangle
    borderBottomColor: backgroundColor,
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        shape === 'triangle' ? styles.triangleButton : styles.baseButton,
        shape === 'circular' && { ...styles.circularButton, width, height, borderRadius: width / 2 },
        shape === 'square' && { ...styles.squareButton, width, height },
        shape !== 'triangle' && { backgroundColor: pressed ? pressedBackgroundColor : backgroundColor },
        triangleStyle,
        style,
      ]}
      {...props}
    >
      {shape === 'triangle' ? (
        <View style={styles.triangleTextContainer}>
          <Text style={[styles.triangleButtonText, textStyle]}>{title}</Text>
        </View>
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  squareButton: {
    width: 60,
    height: 60,
  },
  triangleButton: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
  },
  triangleTextContainer: {
    position: 'absolute',
    top: 20, // Adjust position for better alignment
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  triangleButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default Btn;
