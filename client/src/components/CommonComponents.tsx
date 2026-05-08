import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SoftCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function SoftCard({ children, style }: SoftCardProps) {
  return (
    <View style={[styles.shadowDark, style]}>
      <View style={styles.shadowLight}>
        {children}
      </View>
    </View>
  );
}

interface PrimaryButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export function PrimaryButton({ children, onPress, style, disabled }: PrimaryButtonProps) {
  return (
    <LinearGradient
      colors={disabled ? ['#B2BEC3', '#B2BEC3'] : ['#6C63FF', '#896BFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.button, style]}
    >
      <View onTouchEnd={disabled ? undefined : onPress}>
        {children}
      </View>
    </LinearGradient>
  );
}

interface IconContainerProps {
  children: React.ReactNode;
  color?: string;
  size?: number;
}

export function IconContainer({ children, color = '#6C63FF', size = 48 }: IconContainerProps) {
  return (
    <View style={[styles.iconContainer, { width: size, height: size, borderRadius: size / 2, backgroundColor: `${color}20` }]}>
      {children}
    </View>
  );
}

interface TagProps {
  children: React.ReactNode;
  color?: string;
}

export function Tag({ children, color = '#6C63FF' }: TagProps) {
  return (
    <View style={[styles.tag, { backgroundColor: `${color}1A` }]}>
      {typeof children === 'string' ? (
        <View>
          {/* Using Text from parent */}
        </View>
      ) : children}
    </View>
  );
}

interface InputFieldProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
  style?: ViewStyle;
}

export function InputField({ placeholder, value, onChangeText, secureTextEntry, keyboardType = 'default', style }: InputFieldProps) {
  return (
    <View style={[styles.inputContainer, style]}>
      <View style={styles.inputInner}>
        <View>
          {/* Input will be added by parent */}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowDark: {
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    borderRadius: 24,
    marginBottom: 16,
    ...Platform.select({
      android: {
        elevation: 6,
        backgroundColor: '#F0F0F3',
        borderRadius: 24,
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.5)',
      },
    }),
  },
  shadowLight: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    backgroundColor: '#F0F0F3',
    borderRadius: 24,
    padding: 20,
    ...Platform.select({
      android: {
        shadowOpacity: 0,
        elevation: 0,
      },
    }),
  },
  button: {
    borderRadius: 9999,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tag: {
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  inputContainer: {
    backgroundColor: '#E8E8EB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  inputInner: {
    flex: 1,
  },
});
