/**
 * components/ui.tsx — the reusable UI kit, ported from ui.jsx + styles.css.
 *
 * Web → RN adaptations worth knowing:
 *  - <Txt> centralizes typography. RN doesn't inherit font-family from a View,
 *    and the Google Font packages expose one family per weight, so every label
 *    must name an exact family. <Txt weight="bold"> picks the right one for the
 *    active theme.
 *  - SelectField and ConfirmDialog are real bottom-sheet Modals (no native
 *    <select> on RN).
 *  - Focus rings / box-shadows become border-color changes + elevation.
 */
import React, {
  useId,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Circle, G, Path, Svg } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import type { FontWeightName } from '../theme/tokens';
import { avatarColor, initials } from '../data/seed';
import { maskDateBR } from '../data/date';
import { maskPhoneBR } from '../data/phone';
import type { GroupIconName, AttendanceMark, YouthStatus } from '../data/seed';
import type { RouteName } from '../navigation/types';
import {
  IconAlert,
  IconBabyFace,
  IconBack,
  IconBook,
  IconCheck,
  IconChevD,
  IconGroup3,
  IconPlus,
  IconSearch,
  IconUsers,
  IconX,
  type IconComponent,
  type IconProps,
} from './Icons';

// Tint an icon element to a default color unless the call site set one.
function tint(icon: ReactElement<IconProps> | undefined, color: string) {
  return icon ? React.cloneElement(icon, { color: icon.props.color ?? color }) : null;
}

export interface Option {
  value: string;
  label: string;
}

/* ---------------------------------------------------------------- Typography */
export interface TxtProps extends TextProps {
  weight?: FontWeightName;
  size?: number;
  color?: string;
  children?: ReactNode;
}
export function Txt({ weight = 'regular', size, color, style, children, ...rest }: TxtProps) {
  const t = useTheme();
  return (
    <Text
      {...rest}
      style={[{ fontFamily: t.font[weight], color: color ?? t.ink, fontSize: size }, style]}>
      {children}
    </Text>
  );
}

/* ------------------------------------------------------------------- Layout */
export function Screen({
  children,
  style,
  statusBarColor,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  statusBarColor?: string;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ flex: 1, backgroundColor: t.bg }, style]}>
      <View style={{ height: insets.top, backgroundColor: statusBarColor ?? t.surface }} />
      {children}
    </View>
  );
}

export function ScreenScroll({
  children,
  contentStyle,
}: {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[{ padding: t.space.lg, gap: t.space.lg }, contentStyle]}>
      {children}
    </ScrollView>
  );
}

export function Card({
  children,
  pad,
  style,
}: {
  children: ReactNode;
  pad?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.surface,
          borderRadius: t.radiusCard,
          borderWidth: 1,
          borderColor: t.line,
        },
        t.shadowCard,
        pad && { padding: t.space.lg },
        style,
      ]}>
      {children}
    </View>
  );
}

export function CardRow({
  children,
  onPress,
  accessibilityLabel,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.space.md,
          backgroundColor: t.surface,
          borderWidth: 1,
          borderColor: t.line,
          borderRadius: t.radiusCard,
          paddingVertical: t.space.md,
          paddingHorizontal: t.space.lg,
        },
        t.shadowCard,
        pressed && { transform: [{ scale: 0.985 }] },
        style,
      ]}>
      {children}
    </Pressable>
  );
}

/* ------------------------------------------------------------------- Avatar */
/** Visualizador de foto em tela cheia. Toque (na foto, no fundo ou no X) fecha. */
function PhotoViewer({
  visible,
  url,
  name,
  onClose,
}: {
  visible: boolean;
  url: string;
  name?: string;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.93)' }}>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fechar foto"
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <Image
            source={{ uri: url }}
            resizeMode="contain"
            accessibilityLabel={name ? `Foto de ${name}` : 'Foto'}
            style={{ width: '100%', height: '100%' }}
          />
        </Pressable>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          hitSlop={10}
          style={{
            position: 'absolute',
            top: insets.top + 10,
            right: 16,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.16)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <IconX size={22} color="#fff" />
        </Pressable>
      </View>
    </Modal>
  );
}

export function Avatar({
  name,
  size = 44,
  color,
  photoUrl,
  enlargeable,
}: {
  name: string;
  size?: number;
  color?: string;
  photoUrl?: string;
  /** toque abre a foto em tela cheia (só quando há photoUrl). */
  enlargeable?: boolean;
}) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  // Decorative por padrão: o nome aparece ao lado, então a imagem/iniciais só
  // somam ruído na árvore de acessibilidade.
  const a11y = {
    accessibilityElementsHidden: true,
    importantForAccessibility: 'no-hide-descendants' as const,
  };
  const imgStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: t.surface2,
  };

  if (photoUrl && enlargeable) {
    return (
      <>
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Ver foto de ${name}`}>
          <Image source={{ uri: photoUrl }} resizeMode="cover" style={imgStyle} />
        </Pressable>
        <PhotoViewer visible={open} url={photoUrl} name={name} onClose={() => setOpen(false)} />
      </>
    );
  }
  if (photoUrl) {
    return <Image {...a11y} source={{ uri: photoUrl }} resizeMode="cover" style={imgStyle} />;
  }
  return (
    <View
      {...a11y}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color ?? avatarColor(name),
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Txt weight="bold" color={t.onPrimary} style={{ fontSize: size * 0.38, letterSpacing: 0.3 }}>
        {initials(name)}
      </Txt>
    </View>
  );
}

/* ------------------------------------------------------------- Icon button */
export function IconButton({
  children,
  onPress,
  soft,
  disabled,
  accessibilityLabel,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  soft?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={6}
      style={({ pressed }) => [
        {
          width: 44,
          height: 44,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: soft ? t.primarySoft : 'transparent',
        },
        pressed && (soft ? { opacity: 0.6 } : { backgroundColor: t.surface2 }),
        disabled && { opacity: 0.4 },
        style,
      ]}>
      {children}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ App bar */
export function AppBar({
  title,
  sub,
  onBack,
  right,
  flat,
}: {
  title: string;
  sub?: string;
  onBack?: () => void;
  right?: ReactNode;
  flat?: boolean;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space.sm,
        paddingHorizontal: t.space.lg,
        paddingVertical: t.space.sm,
        minHeight: 58,
        backgroundColor: flat ? 'transparent' : t.surface,
        borderBottomWidth: flat ? 0 : 1,
        borderBottomColor: t.line,
      }}>
      {onBack ? (
        <IconButton onPress={onBack} accessibilityLabel="Voltar">
          <IconBack size={22} />
        </IconButton>
      ) : null}
      <View style={{ flex: 1 }}>
        <Txt weight="extrabold" style={{ fontSize: 19 }} numberOfLines={1}>
          {title}
        </Txt>
        {sub ? (
          <Txt weight="semibold" size={12.5} color={t.inkSoft}>
            {sub}
          </Txt>
        ) : null}
      </View>
      {right}
    </View>
  );
}

/* ------------------------------------------------------------- Status chips */
export function StatusChip({ kind }: { kind: AttendanceMark | YouthStatus }) {
  const t = useTheme();
  const map: Record<string, [string, string, string]> = {
    Presente: [t.presentSoft, t.presentDeep, 'Presente'],
    Falta: [t.absentSoft, t.absentDeep, 'Falta'],
    Pendente: [t.surface2, t.inkSoft, 'Pendente'],
    Ativo: [t.presentSoft, t.presentDeep, 'Ativo'],
    Inativo: [t.surface2, t.inkSoft, 'Inativo'],
  };
  const [bg, fg, label] = map[kind] ?? [t.surface2, t.inkSoft, kind];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: bg,
        borderRadius: 999,
        paddingVertical: 4,
        paddingHorizontal: 11,
        alignSelf: 'flex-start',
      }}>
      <View style={{ width: 7, height: 7, borderRadius: 99, backgroundColor: fg }} />
      <Txt weight="bold" size={12} color={fg}>
        {label}
      </Txt>
    </View>
  );
}

export type ChipTone = 'primary' | 'gold' | 'present' | 'absent';
export function Chip({ children, tone = 'primary' }: { children: ReactNode; tone?: ChipTone }) {
  const t = useTheme();
  const tones: Record<ChipTone, [string, string]> = {
    primary: [t.primarySoft, t.primaryDeep],
    gold: [t.goldSoft, t.goldDeep],
    present: [t.presentSoft, t.presentDeep],
    absent: [t.absentSoft, t.absentDeep],
  };
  const [bg, fg] = tones[tone];
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 999,
        paddingVertical: 4,
        paddingHorizontal: 11,
        alignSelf: 'flex-start',
      }}>
      <Txt weight="bold" size={12} color={fg}>
        {children}
      </Txt>
    </View>
  );
}

/* ------------------------------------------------------------------ Button */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger-soft';
export function Button({
  children,
  variant = 'primary',
  onPress,
  icon,
  sm,
  bg,
  fg,
  disabled,
  loading,
  accessibilityLabel,
  style,
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  onPress?: () => void;
  icon?: ReactElement<IconProps>;
  sm?: boolean;
  bg?: string;
  fg?: string;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const variants: Record<ButtonVariant, { bg: string; fg: string }> = {
    primary: { bg: t.primary, fg: t.onPrimary },
    // primaryDeep (não primary) p/ passar AA sobre o primarySoft (5.65:1)
    secondary: { bg: t.primarySoft, fg: t.primaryDeep },
    ghost: { bg: 'transparent', fg: t.inkSoft },
    'danger-soft': { bg: t.absentSoft, fg: t.absentDeep },
  };
  const v = variants[variant];
  const bgColor = bg ?? v.bg;
  const fgColor = fg ?? v.fg;
  const blocked = disabled || loading;
  return (
    <Pressable
      onPress={blocked ? undefined : onPress}
      disabled={blocked}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: t.space.sm,
          backgroundColor: bgColor,
          minHeight: 44,
          borderRadius: sm ? 11 : t.radiusBtn,
          paddingVertical: sm ? t.space.md : t.space.lg,
          paddingHorizontal: sm ? t.space.md : t.space.lg,
          alignSelf: sm ? 'flex-start' : 'stretch',
        },
        variant === 'primary' && !bg && t.shadowFab,
        pressed && { transform: [{ scale: 0.97 }] },
        pressed && variant === 'ghost' && { backgroundColor: t.surface2 },
        blocked && { opacity: 0.5 },
        style,
      ]}>
      {loading ? <ActivityIndicator size="small" color={fgColor} /> : tint(icon, fgColor)}
      <Txt weight="bold" size={sm ? 14 : 16} color={fgColor} numberOfLines={1}>
        {children}
      </Txt>
    </Pressable>
  );
}

/* ------------------------------------------------------------- Form fields */
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  icon,
  keyboardType,
  editable = true,
  error,
  required,
  dateMask,
  phoneMask,
  accessibilityLabel,
  autoComplete,
  textContentType,
}: {
  label?: string;
  value?: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  icon?: ReactElement<IconProps>;
  keyboardType?: KeyboardTypeOptions;
  editable?: boolean;
  error?: string;
  required?: boolean;
  /** Formata dd/mm/aaaa enquanto digita (+ teclado numérico). */
  dateMask?: boolean;
  /** Formata (11) 99999-8888 enquanto digita (+ teclado de telefone). */
  phoneMask?: boolean;
  accessibilityLabel?: string;
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
}) {
  const t = useTheme();
  const errId = useId();
  // datas: aplica a máscara dd/mm/aaaa internamente, então nenhum campo esquece
  const handleChange =
    dateMask && onChangeText
      ? (v: string) => onChangeText(maskDateBR(v))
      : phoneMask && onChangeText
        ? (v: string) => onChangeText(maskPhoneBR(v))
        : onChangeText;
  const [focused, setFocused] = useState(false);
  const borderColor = error ? t.absent : focused ? t.primary : t.line;
  // react-native-web encaminha aria-*: marca inválido + aponta a mensagem de
  // erro + sinaliza obrigatório para leitores de tela.
  const webA11y: Record<string, unknown> = {};
  if (error) {
    webA11y['aria-invalid'] = true;
    webA11y['aria-describedby'] = errId;
  }
  if (required) webA11y['aria-required'] = true;
  return (
    <View style={{ gap: t.space.sm }}>
      {label ? (
        <Txt weight="bold" size={13} color={t.inkSoft} numberOfLines={1}>
          {label}
          {required ? <Txt color={t.primary}> *</Txt> : null}
        </Txt>
      ) : null}
      <View style={{ justifyContent: 'center' }}>
        {icon ? (
          <View
            style={{ position: 'absolute', left: 13, top: 0, bottom: 0, justifyContent: 'center', zIndex: 1 }}>
            {tint(icon, t.inkSoft)}
          </View>
        ) : null}
        <TextInput
          {...(webA11y as object)}
          value={value ?? ''}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={t.inkFaint}
          secureTextEntry={secureTextEntry}
          keyboardType={dateMask ? 'number-pad' : phoneMask ? 'phone-pad' : keyboardType}
          maxLength={dateMask ? 10 : phoneMask ? 15 : undefined}
          editable={editable}
          accessibilityLabel={accessibilityLabel ?? label}
          autoComplete={autoComplete}
          textContentType={textContentType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            fontFamily: t.font.regular,
            fontSize: 15.5,
            color: t.ink,
            backgroundColor: t.surface,
            borderWidth: 1.5,
            borderColor,
            borderRadius: t.radiusField,
            paddingVertical: t.space.md,
            paddingHorizontal: t.space.md,
            paddingLeft: icon ? 42 : t.space.md,
          }}
        />
      </View>
      {error ? (
        <Txt
          weight="semibold"
          size={12}
          color={t.absentDeep}
          nativeID={errId}
          accessibilityLiveRegion="polite">
          {error}
        </Txt>
      ) : null}
    </View>
  );
}

export function TextArea({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label?: string;
  value?: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
}) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: t.space.sm }}>
      {label ? (
        <Txt weight="bold" size={13} color={t.inkSoft} numberOfLines={1}>
          {label}
        </Txt>
      ) : null}
      <TextInput
        value={value ?? ''}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.inkSoft}
        accessibilityLabel={label}
        multiline
        textAlignVertical="top"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          fontFamily: t.font.regular,
          fontSize: 15.5,
          lineHeight: 23,
          color: t.ink,
          backgroundColor: t.surface,
          borderWidth: 1.5,
          borderColor: focused ? t.primary : t.line,
          borderRadius: t.radiusField,
          padding: t.space.md,
          minHeight: 84,
        }}
      />
    </View>
  );
}

function OptionSheet({
  open,
  title,
  options,
  value,
  onClose,
  onSelect,
}: {
  open: boolean;
  title?: string;
  options: Option[];
  value?: string;
  onClose: () => void;
  onSelect: (v: string) => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: t.scrim, justifyContent: 'flex-end' }}>
        <Pressable
          onPress={() => {}}
          style={[
            {
              backgroundColor: t.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: t.space.lg,
              paddingBottom: insets.bottom + t.space.md,
              maxHeight: '70%',
            },
            t.shadowPop,
          ]}>
          <View
            style={{ width: 38, height: 4, borderRadius: 99, backgroundColor: t.line, alignSelf: 'center', marginBottom: t.space.md }}
          />
          {title ? (
            <Txt weight="bold" size={16} style={{ paddingHorizontal: 20, paddingBottom: t.space.sm }}>
              {title}
            </Txt>
          ) : null}
          <ScrollView>
            {options.map((o) => {
              const active = o.value === value;
              return (
                <Pressable
                  key={o.value}
                  onPress={() => onSelect(o.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: t.space.lg,
                      paddingHorizontal: 20,
                    },
                    pressed && { backgroundColor: t.surface2 },
                  ]}>
                  <Txt
                    weight={active ? 'bold' : 'semibold'}
                    size={15.5}
                    color={active ? t.primary : t.ink}>
                    {o.label}
                  </Txt>
                  {active ? <IconCheck size={19} color={t.primary} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value?: string;
  options: Option[];
  onChange?: (v: string) => void;
}) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  // sem match (ex.: value vazio sem opção vazia) NÃO cai no 1º item — senão o
  // campo parece já ter algo selecionado quando na verdade está vazio.
  const currentLabel = current?.label ?? 'Selecione...';
  return (
    <View style={{ gap: t.space.sm }}>
      {label ? (
        <Txt weight="bold" size={13} color={t.inkSoft} numberOfLines={1}>
          {label}
        </Txt>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: open }}
        accessibilityValue={{ text: currentLabel }}
        style={({ pressed }) => [
          {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: t.surface,
            borderWidth: 1.5,
            borderColor: open ? t.primary : t.line,
            borderRadius: t.radiusField,
            paddingVertical: t.space.md,
            paddingHorizontal: t.space.md,
          },
          pressed && { borderColor: t.primary, opacity: 0.9 },
        ]}>
        <Txt size={15.5} style={{ flex: 1 }} numberOfLines={1} color={value ? t.ink : t.inkSoft}>
          {currentLabel}
        </Txt>
        <IconChevD size={18} color={t.inkSoft} />
      </Pressable>
      <OptionSheet
        open={open}
        title={label}
        options={options}
        value={value}
        onClose={() => setOpen(false)}
        onSelect={(v) => {
          onChange?.(v);
          setOpen(false);
        }}
      />
    </View>
  );
}

export function Segmented({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value?: string;
  options: string[];
  onChange?: (v: string) => void;
}) {
  const t = useTheme();
  return (
    <View style={{ gap: t.space.sm }}>
      {label ? (
        <Txt weight="bold" size={13} color={t.inkSoft} numberOfLines={1}>
          {label}
        </Txt>
      ) : null}
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={label}
        style={{ flexDirection: 'row', gap: t.space.xs, backgroundColor: t.surface2, padding: t.space.xs, borderRadius: 14 }}>
        {options.map((o) => {
          const on = value === o;
          return (
            <Pressable
              key={o}
              onPress={() => onChange?.(o)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              style={({ pressed }) => [
                { flex: 1, minHeight: 44, paddingVertical: t.space.md, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
                on && { backgroundColor: t.surface, ...t.shadowCard },
                pressed && { opacity: 0.7 },
              ]}>
              <Txt weight="bold" size={14} color={on ? t.primary : t.inkSoft} numberOfLines={1}>
                {o}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function FieldSection({ icon, children }: { icon?: ReactElement<IconProps>; children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.sm, marginTop: t.space.sm, marginHorizontal: 2 }}>
      {tint(icon, t.primaryDeep)}
      <Txt weight="bold" size={13} color={t.primaryDeep} style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
        {children}
      </Txt>
    </View>
  );
}

/* ------------------------------------------------------------------ Search */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar...',
  accessibilityLabel,
}: {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space.sm,
        backgroundColor: t.surface,
        borderWidth: 1.5,
        borderColor: t.line,
        borderRadius: 999,
        paddingVertical: t.space.md,
        paddingHorizontal: t.space.lg,
      }}>
      <IconSearch size={19} color={t.inkSoft} />
      <TextInput
        value={value ?? ''}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={t.inkSoft}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        style={{ flex: 1, fontFamily: t.font.regular, fontSize: 15, color: t.ink, padding: 0 }}
      />
    </View>
  );
}

/* ------------------------------------------------------------- Filter chips */
export function FilterChips({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value?: string;
  onChange?: (v: string) => void;
}) {
  const t = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
      {options.map((o) => {
        const on = value === o.value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange?.(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={({ pressed }) => [
              {
                minHeight: 44,
                justifyContent: 'center',
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 999,
                borderWidth: 1.5,
                borderColor: on ? t.primary : t.line,
                backgroundColor: on ? t.primary : t.surface,
              },
              pressed && { opacity: 0.7 },
            ]}>
            <Txt weight="bold" size={13.5} color={on ? t.onPrimary : t.inkSoft}>
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/* -------------------------------------------------------------- Group icon */
export function GroupIcon({
  icon,
  size = 46,
  tone = 'primary',
}: {
  icon: GroupIconName;
  size?: number;
  tone?: 'primary' | 'gold' | 'present';
}) {
  const t = useTheme();
  // tom *Deep no ícone p/ passar o piso de 3:1 (1.4.11) sobre o fundo soft
  const tones: Record<string, [string, string]> = {
    primary: [t.primarySoft, t.primaryDeep],
    gold: [t.goldSoft, t.goldDeep],
    present: [t.presentSoft, t.presentDeep],
  };
  const [bg, fg] = tones[tone] ?? tones.primary;
  const I: IconComponent =
    icon === 'baby' ? IconBabyFace : icon === 'book' ? IconBook : icon === 'users' ? IconUsers : IconGroup3;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <I size={size * 0.5} color={fg} />
    </View>
  );
}

/* -------------------------------------------------------------- Stat tile */
export type StatTone = 'primary' | 'present' | 'absent' | 'gold';
export function StatTile({
  num,
  label,
  icon,
  tone = 'primary',
  style,
}: {
  num: ReactNode;
  label: string;
  icon?: ReactElement<IconProps>;
  tone?: StatTone;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  // ícone em tom *Deep p/ legibilidade sobre o fundo soft (>=4.7:1)
  const tones: Record<StatTone, [string, string]> = {
    primary: [t.primarySoft, t.primaryDeep],
    present: [t.presentSoft, t.presentDeep],
    absent: [t.absentSoft, t.absentDeep],
    gold: [t.goldSoft, t.goldDeep],
  };
  const [bg, fg] = tones[tone];
  return (
    <View
      style={[
        { backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, borderRadius: t.radiusCard, padding: t.space.md },
        t.shadowCard,
        style,
      ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Txt weight="bold" style={{ fontSize: 26, lineHeight: 28 }}>
          {num}
        </Txt>
        {icon ? (
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 11,
              backgroundColor: bg,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {tint(icon, fg)}
          </View>
        ) : null}
      </View>
      <Txt weight="semibold" size={12} color={t.inkSoft} style={{ marginTop: t.space.xs }}>
        {label}
      </Txt>
    </View>
  );
}

/* ---------------------------------------------------------- Progress bar */
export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const t = useTheme();
  return (
    <View style={{ height: 8, borderRadius: 999, backgroundColor: t.surface2, overflow: 'hidden' }}>
      <View style={{ height: '100%', width: `${value}%`, borderRadius: 999, backgroundColor: color ?? t.primary }} />
    </View>
  );
}

/* ------------------------------------------------------------- Bottom nav */
export interface BottomNavItem {
  id: RouteName;
  label: string;
  icon: IconComponent;
}
export function BottomNav({
  items,
  active,
  onChange,
}: {
  items: BottomNavItem[];
  active: RouteName;
  onChange: (id: RouteName) => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: t.surface,
        borderTopWidth: 1,
        borderTopColor: t.line,
        paddingTop: 6,
        paddingHorizontal: 6,
        paddingBottom: 8 + insets.bottom,
      }}>
      {items.map((it) => {
        const on = active === it.id;
        const I = it.icon;
        return (
          <Pressable
            key={it.id}
            onPress={() => onChange(it.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={it.label}
            style={({ pressed }) => [
              { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 6 },
              pressed && { opacity: 0.6 },
            ]}>
            <View
              style={{
                width: 52,
                height: 30,
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: on ? t.primarySoft : 'transparent',
              }}>
              <I size={22} sw={on ? 2.4 : 2} color={on ? t.primary : t.inkSoft} />
            </View>
            <Txt weight="bold" size={10.5} color={on ? t.primary : t.inkSoft}>
              {it.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

/* -------------------------------------------------------------- Logo mark */
export function LogoMark({ size = 88 }: { size?: number }) {
  const t = useTheme();
  return (
    <LinearGradient
      colors={t.gradientLogo}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[
        { width: size, height: size, borderRadius: size * 0.3, alignItems: 'center', justifyContent: 'center' },
        t.shadowFab,
      ]}>
      <Svg width={size * 0.62} height={size * 0.62} viewBox="0 0 48 48" fill="none">
        <Circle cx={16} cy={16} r={5.4} fill="#fff" opacity={0.95} />
        <Path d="M6 38v-2.5C6 30.8 9.8 27 14.5 27h3C22.2 27 26 30.8 26 35.5V38" fill="#fff" opacity={0.95} />
        <Circle cx={33} cy={18.5} r={4.4} fill="#fff" opacity={0.7} />
        <Path d="M25 38v-2C25 32.1 28.1 29 32 29h2c3.9 0 7 3.1 7 7v2" fill="#fff" opacity={0.7} />
        <G transform="translate(28, 4)">
          <Path
            d="M8 15s-6-3.7-6-8C2 4.7 3.6 3 5.6 3 6.9 3 7.6 3.8 8 4.4 8.4 3.8 9.1 3 10.4 3 12.4 3 14 4.7 14 7c0 4.3-6 8-6 8z"
            fill={t.gold}
          />
        </G>
      </Svg>
    </LinearGradient>
  );
}

/* --------------------------------------------------------- Confirm dialog */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable
        onPress={onCancel}
        style={{ flex: 1, backgroundColor: t.scrim, justifyContent: 'flex-end' }}>
        <Pressable
          onPress={() => {}}
          style={[
            {
              backgroundColor: t.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: t.space.lg,
              paddingTop: t.space.xl,
              paddingBottom: insets.bottom + t.space.lg,
            },
            t.shadowPop,
          ]}>
          <View
            style={{ width: 38, height: 4, borderRadius: 99, backgroundColor: t.line, alignSelf: 'center', marginBottom: 16 }}
          />
          <View style={{ flexDirection: 'row', gap: t.space.md, alignItems: 'flex-start' }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: danger ? t.absentSoft : t.primarySoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <IconAlert size={22} color={danger ? t.absent : t.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt weight="bold" size={17}>
                {title}
              </Txt>
              <Txt weight="semibold" size={13.5} color={t.inkSoft} style={{ lineHeight: 20, marginTop: 4 }}>
                {message}
              </Txt>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: t.space.md, marginTop: t.space.xl }}>
            <Button variant="secondary" onPress={onCancel} style={{ flex: 1 }}>
              Cancelar
            </Button>
            <Button onPress={onConfirm} bg={danger ? t.absent : t.primary} fg={t.onPrimary} style={{ flex: 1 }}>
              {confirmLabel}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ------------------------------------------------------------- Info row */
export function InfoRow({
  icon,
  label,
  value,
  action,
}: {
  icon?: ReactElement<IconProps>;
  label: string;
  value?: string;
  action?: ReactNode;
}) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {tint(icon, t.primary)}
      <View style={{ flex: 1 }}>
        <Txt weight="bold" size={11.5} color={t.inkSoft} style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
          {label}
        </Txt>
        <Txt weight="semibold" size={14.5} numberOfLines={2}>
          {value || '—'}
        </Txt>
      </View>
      {action}
    </View>
  );
}

/* -------------------------------------------------------------- Mini stat */
export function MiniStat({
  icon,
  label,
  tone,
}: {
  icon?: ReactElement<IconProps>;
  label: string;
  tone?: 'present';
}) {
  const t = useTheme();
  const c = tone === 'present' ? t.present : t.inkSoft;
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        backgroundColor: t.surface2,
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 6,
      }}>
      {tint(icon, c)}
      <Txt weight="bold" size={12} color={c} numberOfLines={1}>
        {label}
      </Txt>
    </View>
  );
}

/* --------------------------------------------------------------- Sum pill */
export type SumTone = 'ink' | 'present' | 'absent' | 'gold';
export function SumPill({ num, label, tone }: { num: ReactNode; label: string; tone: SumTone }) {
  const t = useTheme();
  const map: Record<SumTone, [string, string]> = {
    ink: [t.surface2, t.ink],
    present: [t.presentSoft, t.presentDeep],
    absent: [t.absentSoft, t.absentDeep],
    gold: [t.goldSoft, t.goldDeep],
  };
  const [bg, fg] = map[tone];
  return (
    <View style={{ flex: 1, backgroundColor: bg, borderRadius: 14, paddingVertical: t.space.sm, paddingHorizontal: t.space.xs, alignItems: 'center' }}>
      <Txt weight="bold" color={fg} style={{ fontSize: 21, lineHeight: 22 }}>
        {num}
      </Txt>
      <Txt weight="bold" size={10.5} color={t.inkSoft} style={{ marginTop: t.space.xs }}>
        {label}
      </Txt>
    </View>
  );
}

/* --------------------------------------------------------------- Mark btn */
export function MarkBtn({
  active,
  kind,
  onPress,
}: {
  active: boolean;
  kind: 'present' | 'absent';
  onPress: () => void;
}) {
  const t = useTheme();
  const present = kind === 'present';
  const deep = present ? t.presentDeep : t.absentDeep;
  const line = present ? t.presentLine : t.absentLine;
  const fg = active ? t.onPrimary : deep;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={present ? 'Marcar presente' : 'Marcar falta'}
      style={({ pressed }) => [
        {
          flex: 1,
          borderWidth: 2,
          borderRadius: 14,
          paddingVertical: 12,
          paddingHorizontal: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          backgroundColor: active ? deep : 'transparent',
          borderColor: active ? deep : line,
        },
        pressed && { transform: [{ scale: 0.97 }] },
      ]}>
      {present ? <IconCheck size={19} color={fg} /> : <IconX size={19} color={fg} />}
      <Txt weight="bold" size={15} color={fg}>
        {present ? 'Presente' : 'Falta'}
      </Txt>
    </Pressable>
  );
}

/* ------------------------------------------------------------ Section label */
export function SectionLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 2,
        marginTop: t.space.md,
        gap: t.space.md,
      }}>
      <Txt weight="bold" size={14} color={t.ink}>
        {children}
      </Txt>
      {action}
    </View>
  );
}

export function Link({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
      style={({ pressed }) => [{ paddingVertical: 8, paddingHorizontal: 2 }, pressed && { opacity: 0.6 }]}>
      <Txt weight="bold" size={13.5} color={t.primaryDeep}>
        {children}
      </Txt>
    </Pressable>
  );
}

/* ----------------------------------------------------------- Floating action */
export function Fab({
  label,
  onPress,
  hasBottomNav,
}: {
  label: string;
  onPress: () => void;
  hasBottomNav?: boolean;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          position: 'absolute',
          right: 16,
          bottom: (hasBottomNav ? 78 : 18) + insets.bottom,
          height: 52,
          borderRadius: 18,
          paddingHorizontal: 20,
          backgroundColor: t.primary,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        t.shadowFab,
        pressed && { transform: [{ scale: 0.97 }] },
      ]}>
      <IconPlus size={20} color={t.onPrimary} />
      <Txt weight="bold" size={15} color={t.onPrimary}>
        {label}
      </Txt>
    </Pressable>
  );
}
