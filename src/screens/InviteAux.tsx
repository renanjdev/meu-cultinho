/**
 * Convidar auxiliares — o cooperador compartilha um link com código de convite.
 * Cada auxiliar abre o link e cria a própria conta (ver AuxSignup).
 */
import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useNav } from '../navigation/useNav';
import { useToast } from '../components/Toast';
import { useInviteCode, regenerateInviteCode } from '../data/repo';
import { AppBar, Button, Card, Screen, ScreenScroll, Txt } from '../components/ui';
import { IconShield, IconWhats } from '../components/Icons';

export default function InviteAux() {
  const t = useTheme();
  const { back } = useNav();
  const { show } = useToast();
  const { code, reload } = useInviteCode();
  const [busy, setBusy] = useState(false);

  const origin =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.origin
      : 'https://meu-cultinho.vercel.app';
  const link = code ? `${origin}/?aux=${code}` : '';

  const copy = async (text: string, what: string) => {
    if (!text) return;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        show(`${what} copiado`);
      } else {
        show('Selecione e copie manualmente');
      }
    } catch {
      show('Não foi possível copiar');
    }
  };

  const regen = async () => {
    setBusy(true);
    try {
      await regenerateInviteCode();
      await reload();
      show('Novo código gerado');
    } catch {
      show('Erro ao gerar o código');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <AppBar title="Convidar auxiliares" onBack={back} />
      <ScreenScroll contentStyle={{ paddingBottom: 24 }}>
        <Card pad style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: t.presentSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <IconWhats size={22} color={t.present} />
            </View>
            <Txt weight="semibold" size={13.5} color={t.inkSoft} style={{ flex: 1, lineHeight: 19 }}>
              Mande este link aos auxiliares (ex.: no grupo). Cada um cria a própria conta e senha.
            </Txt>
          </View>

          <View
            style={{
              backgroundColor: t.primarySoft,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
              gap: 4,
            }}>
            <Txt weight="semibold" size={11.5} color={t.primaryDeep} style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Código de convite
            </Txt>
            <Txt weight="extrabold" size={30} color={t.primary} style={{ letterSpacing: 6 }}>
              {code || '—'}
            </Txt>
          </View>

          <Txt selectable weight="semibold" size={12.5} color={t.inkSoft} style={{ textAlign: 'center' }}>
            {link || '—'}
          </Txt>

          <Button variant="primary" onPress={() => copy(link, 'Link')}>
            Copiar link
          </Button>
          <Button variant="secondary" onPress={() => copy(code, 'Código')}>
            Copiar só o código
          </Button>
        </Card>

        <Card pad style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <IconShield size={18} color={t.inkSoft} />
            <Txt weight="bold" size={14}>
              Segurança
            </Txt>
          </View>
          <Txt weight="semibold" size={12.5} color={t.inkSoft} style={{ lineHeight: 18 }}>
            Gere um novo código para invalidar os links antigos (ex.: se o link foi parar com alguém de fora). Quem já se cadastrou continua com acesso.
          </Txt>
          <Button variant="danger-soft" loading={busy} onPress={regen}>
            Gerar novo código
          </Button>
        </Card>
      </ScreenScroll>
    </Screen>
  );
}
