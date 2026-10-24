import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ColorValue,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '@patient-touch/design-tokens';
import { useDemo } from './demo';

export const c = colors;
export type IconName = React.ComponentProps<typeof Ionicons>['name'];
export function Icon({
  name,
  size = 22,
  color = c.navy,
}: {
  name: IconName;
  size?: number;
  color?: ColorValue;
}) {
  return <Ionicons name={name} size={size} color={color} accessible={false} />;
}
export function Screen({
  children,
  title,
  subtitle,
  detail = false,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  detail?: boolean;
}) {
  const { role } = useDemo();
  return (
    <SafeAreaView style={s.safe} edges={detail ? ['bottom'] : ['top']}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.page}>
        {!detail && (
          <View style={s.brandRow}>
            <View style={s.brand}>
              <View style={s.logo}>
                <Icon name="leaf-outline" color={c.white} size={21} />
              </View>
              <Text style={s.brandText}>Patient Touch</Text>
            </View>
            <View style={s.demoPill}>
              <Text style={s.demoPillText}>DEMO</Text>
            </View>
          </View>
        )}
        <View style={s.heading}>
          <Text style={s.eyebrow}>
            {detail
              ? 'PATIENT TOUCH'
              : role === 'therapist'
                ? 'YOUR PRACTICE, CONNECTED'
                : 'A LITTLE PROGRESS, EVERY DAY'}
          </Text>
          <Text accessibilityRole="header" style={s.title}>
            {title}
          </Text>
          {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
        </View>
        {children}
        <View style={s.demoNotice}>
          <Icon name="flask-outline" size={16} color={c.muted} />
          <Text style={s.footnote}>Synthetic demo · changes last until the app reloads.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
export function Card({
  children,
  tint = false,
  style,
}: {
  children: React.ReactNode;
  tint?: boolean;
  style?: ViewStyle;
}) {
  return <View style={[s.card, tint && s.cardTint, style]}>{children}</View>;
}
export function Section({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={s.section}>
      <Text accessibilityRole="header" style={s.sectionTitle}>
        {title}
      </Text>
      {action && (
        <Pressable accessibilityRole="button" onPress={onPress} hitSlop={10}>
          <Text style={s.link}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}
export function Button({
  title,
  onPress,
  secondary = false,
  icon,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  icon?: IconName;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondaryButton,
        disabled && s.disabled,
        pressed && { opacity: 0.76 },
      ]}
    >
      {icon && <Icon name={icon} size={19} color={secondary ? c.teal : c.white} />}
      <Text style={[s.buttonText, secondary && { color: c.teal }]}>{title}</Text>
    </Pressable>
  );
}
export function Badge({ text, neutral = false }: { text: string; neutral?: boolean }) {
  return (
    <View style={[s.badge, neutral && { backgroundColor: c.background }]}>
      <Text style={[s.badgeText, neutral && { color: c.secondary }]}>{text}</Text>
    </View>
  );
}
export function Avatar({ initials, large = false }: { initials: string; large?: boolean }) {
  return (
    <View style={[s.avatar, large && { width: 64, height: 64, borderRadius: 23 }]}>
      <Text style={[s.avatarText, large && { fontSize: 22 }]}>{initials}</Text>
    </View>
  );
}
export function Row({
  title,
  subtitle,
  icon,
  onPress,
  trailing,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  onPress?: () => void;
  trailing?: React.ReactNode;
}) {
  const content = (
    <>
      <View style={s.rowMain}>
        {icon && (
          <View style={s.iconTile}>
            <Icon name={icon} size={21} color={c.teal} />
          </View>
        )}
        <View style={s.flex}>
          <Text style={s.rowTitle}>{title}</Text>
          {subtitle && <Text style={s.rowSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {trailing ?? (onPress && <Icon name="chevron-forward" size={18} color={c.muted} />)}
    </>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.row, pressed && { opacity: 0.6 }]}
    >
      {content}
    </Pressable>
  ) : (
    <View style={s.row}>{content}</View>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={c.muted}
        {...props}
        style={[s.input, props.multiline && s.multiline, props.style]}
      />
    </View>
  );
}
export function Search({
  value,
  onChangeText,
  placeholder = 'Search',
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={s.search}>
      <Icon name="search-outline" size={20} color={c.muted} />
      <TextInput
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        value={value}
        onChangeText={onChangeText}
        style={s.searchInput}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />
    </View>
  );
}
export function Chips<T extends string>({
  values,
  selected,
  onSelect,
}: {
  values: T[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <View style={s.chips}>
      {values.map((value) => (
        <Pressable
          key={value}
          accessibilityRole="button"
          accessibilityState={{ selected: value === selected }}
          onPress={() => onSelect(value)}
          style={[s.chip, selected === value && s.chipSelected]}
        >
          <Text style={[s.chipText, selected === value && { color: c.white }]}>{value}</Text>
        </Pressable>
      ))}
    </View>
  );
}
export function Notice({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View style={s.notice}>
      {title && <Text style={s.noticeTitle}>{title}</Text>}
      <Text style={s.noticeText}>{children}</Text>
    </View>
  );
}
export function Empty({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Card>
      <View style={s.empty}>
        <Icon name="leaf-outline" color={c.green} size={30} />
        <Text style={s.rowTitle}>{title}</Text>
        <Text style={[s.body, { textAlign: 'center' }]}>{subtitle}</Text>
      </View>
    </Card>
  );
}
export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  page: {
    padding: spacing.lg,
    paddingBottom: 28,
    gap: 14,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  flex: { flex: 1 },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logo: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: c.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: { fontSize: 18, fontWeight: '700', color: c.navy, letterSpacing: -0.5 },
  demoPill: { backgroundColor: c.mint, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  demoPillText: { fontSize: 11, fontWeight: '800', letterSpacing: 1, color: c.navy },
  heading: { gap: 8, marginBottom: 8 },
  eyebrow: { fontSize: 11, fontWeight: '700', color: c.navy, letterSpacing: 1.4 },
  title: { fontSize: 31, lineHeight: 38, letterSpacing: -1.2, fontWeight: '700', color: c.navy },
  subtitle: { fontSize: 15, lineHeight: 23, color: c.secondary },
  card: {
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.border,
    padding: 20,
    borderRadius: radii.lg,
    gap: 14,
  },
  cardTint: { backgroundColor: c.mint, borderColor: c.mint },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: c.navy, letterSpacing: -0.4 },
  link: { fontSize: 13, fontWeight: '600', color: c.navy },
  button: {
    backgroundColor: c.teal,
    minHeight: 48,
    paddingHorizontal: 17,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  secondaryButton: { backgroundColor: c.white, borderWidth: 1, borderColor: c.border },
  buttonText: { fontSize: 14, fontWeight: '700', color: c.white },
  disabled: { opacity: 0.45 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: c.mint,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },
  badgeText: { fontSize: 12, color: c.navy, fontWeight: '700', textTransform: 'capitalize' },
  avatar: {
    width: 43,
    height: 43,
    backgroundColor: '#E6EEEC',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  avatarText: { color: c.teal, fontSize: 15, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
    minHeight: 55,
  },
  rowMain: { flexDirection: 'row', alignItems: 'center', gap: 13, flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', lineHeight: 22, color: c.navy },
  rowSubtitle: { fontSize: 13, lineHeight: 21, color: c.secondary, marginTop: 2 },
  iconTile: {
    width: 41,
    height: 41,
    backgroundColor: c.mint,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: c.navy },
  input: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    backgroundColor: c.white,
    color: c.navy,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    minHeight: 48,
  },
  multiline: { height: 170, textAlignVertical: 'top', lineHeight: 24 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: c.white,
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 14,
    minHeight: 49,
  },
  searchInput: { flex: 1, paddingVertical: 13, color: c.navy, fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.border,
  },
  chipSelected: { backgroundColor: c.navy, borderColor: c.navy },
  chipText: { fontSize: 13, color: c.secondary, fontWeight: '600' },
  notice: { backgroundColor: c.mint, borderRadius: 13, padding: 16, gap: 6 },
  noticeTitle: { color: c.navy, fontSize: 14, fontWeight: '700' },
  noticeText: { color: c.secondary, fontSize: 13, lineHeight: 21 },
  body: { color: c.secondary, fontSize: 14, lineHeight: 23 },
  demoNotice: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginTop: 14,
  },
  footnote: { fontSize: 12, lineHeight: 18, color: c.secondary, flexShrink: 1 },
  empty: { alignItems: 'center', padding: 14, gap: 10 },
  divider: { height: 1, backgroundColor: c.border },
  horizontal: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  bigNumber: { fontSize: 29, fontWeight: '700', color: c.navy, letterSpacing: -1 },
  progressTrack: { height: 6, backgroundColor: '#E5ECEF', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: c.green, borderRadius: 4 },
});
