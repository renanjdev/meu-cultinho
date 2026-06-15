/**
 * InstallGate — no celular, o app só roda em tela cheia depois de instalado como
 * PWA. Esta tela bloqueia o uso no navegador e ensina a instalar. Quem NÃO passa
 * por aqui (ver App.tsx): PWA já instalado (standalone), computador (desktop) e o
 * link de autocadastro de auxiliar (?aux=).
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Button, Card, LogoMark, Screen, Txt } from '../components/ui';
import { IconAlert, IconCheckCircle, IconDownload } from '../components/Icons';

export type GatePlatform = 'ios' | 'android';

interface Props {
  platform: GatePlatform;
  /** navegador embutido de outro app (Instagram/WhatsApp/etc) — não instala. */
  inApp: boolean;
  /** iOS fora do Safari (Chrome/Firefox no iPhone) — instalação só pelo Safari. */
  iosNeedsSafari: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  interface Window {
    __pwaInstall?: { prompt: unknown };
  }
}

function StepRow({ n, children }: { n: number; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: t.space.md, alignItems: 'flex-start' }}>
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: t.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 1,
        }}>
        <Txt weight="bold" size={13} color={t.primary}>
          {n}
        </Txt>
      </View>
      <Txt weight="semibold" size={14.5} color={t.ink} style={{ flex: 1, lineHeight: 21 }}>
        {children}
      </Txt>
    </View>
  );
}

export default function InstallGate({ platform, inApp, iosNeedsSafari }: Props) {
  const t = useTheme();
  const [canInstall, setCanInstall] = useState(
    typeof window !== 'undefined' && !!window.__pwaInstall?.prompt,
  );
  const [installed, setInstalled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyErr, setCopyErr] = useState(false);
  const [url] = useState(() =>
    typeof window !== 'undefined' ? window.location.origin || window.location.href : '',
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onAvail = () => setCanInstall(true);
    const onBip = (e: Event) => {
      e.preventDefault();
      window.__pwaInstall = { prompt: e };
      setCanInstall(true);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener('pwa-installable', onAvail);
    window.addEventListener('beforeinstallprompt', onBip as EventListener);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('pwa-installable', onAvail);
      window.removeEventListener('beforeinstallprompt', onBip as EventListener);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const doInstall = async () => {
    const p = window.__pwaInstall?.prompt as
      | { prompt: () => void; userChoice: Promise<unknown> }
      | null
      | undefined;
    if (!p) return;
    try {
      p.prompt();
      await p.userChoice;
    } catch {
      /* usuário fechou o diálogo de instalação */
    }
    window.__pwaInstall = { prompt: null };
    setCanInstall(false);
  };

  const copyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setCopyErr(false);
        return;
      }
    } catch {
      /* sem permissão de clipboard (comum em navegador in-app): cai no fallback */
    }
    // sem clipboard: a URL fica visível e selecionável para copiar à mão
    setCopyErr(true);
  };

  // Bloco de cópia do link, reaproveitado no ramo in-app e no escape do iOS.
  const copyBlock = (
    <View style={{ gap: 8, alignItems: 'center', width: '100%' }}>
      <Button variant="secondary" onPress={copyLink}>
        {copied ? 'Link copiado!' : 'Copiar link'}
      </Button>
      {url ? (
        <Txt
          selectable
          weight="semibold"
          size={12.5}
          color={t.inkSoft}
          style={{ textAlign: 'center' }}>
          {url}
        </Txt>
      ) : null}
      {copyErr ? (
        <Txt weight="semibold" size={12} color={t.inkSoft} style={{ textAlign: 'center' }}>
          Selecione o link acima e copie manualmente.
        </Txt>
      ) : null}
    </View>
  );

  return (
    <Screen statusBarColor={t.bg}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: 32,
        }}
        showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', maxWidth: 360, alignItems: 'center' }}>
          <LogoMark size={76} />

          {installed ? (
            <>
              <View style={{ marginTop: 18, alignItems: 'center', gap: 8 }}>
                <IconCheckCircle size={40} color={t.present} />
                <Txt weight="extrabold" size={22} style={{ textAlign: 'center' }}>
                  App instalado!
                </Txt>
              </View>
              <Txt
                weight="semibold"
                size={14.5}
                color={t.inkSoft}
                style={{ textAlign: 'center', marginTop: 10, lineHeight: 21 }}>
                Agora abra o “Meu Cultinho” pelo ícone na tela inicial do seu celular. Ele vai abrir
                em tela cheia, sem a barra do navegador.
              </Txt>
            </>
          ) : (
            <>
              <Txt weight="extrabold" size={22} style={{ textAlign: 'center', marginTop: 18 }}>
                Instale o Meu Cultinho
              </Txt>
              <Txt
                weight="semibold"
                size={14.5}
                color={t.inkSoft}
                style={{ textAlign: 'center', marginTop: 8, lineHeight: 21 }}>
                No celular o app funciona melhor instalado: abre em tela cheia, sem a barra do
                navegador atrapalhando.
              </Txt>

              <Card pad style={{ width: '100%', marginTop: 22, gap: t.space.lg }}>
                {inApp ? (
                  <View style={{ alignItems: 'center', gap: 12 }}>
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 16,
                        backgroundColor: t.goldSoft,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <IconAlert size={24} color={t.goldDeep} />
                    </View>
                    <Txt weight="bold" size={15.5} style={{ textAlign: 'center' }}>
                      Abra no navegador do celular
                    </Txt>
                    <Txt
                      weight="semibold"
                      size={14}
                      color={t.inkSoft}
                      style={{ textAlign: 'center', lineHeight: 21 }}>
                      Você abriu por dentro de outro app, e esse navegador não instala. Abra esta
                      página no {platform === 'ios' ? 'Safari' : 'Chrome'} para conseguir instalar.
                    </Txt>
                    {copyBlock}
                  </View>
                ) : platform === 'ios' ? (
                  <>
                    {iosNeedsSafari ? (
                      <Txt
                        weight="bold"
                        size={14}
                        color={t.goldDeep}
                        style={{ textAlign: 'center', lineHeight: 20 }}>
                        No iPhone a instalação funciona pelo Safari. Abra esta página no Safari e
                        siga os passos:
                      </Txt>
                    ) : null}
                    <StepRow n={1}>
                      Toque no botão Compartilhar (o quadrado com uma seta para cima).
                    </StepRow>
                    <StepRow n={2}>Role a lista e toque em “Adicionar à Tela de Início”.</StepRow>
                    <StepRow n={3}>
                      Toque em “Adicionar”. O ícone aparece na tela inicial.
                    </StepRow>
                    <View
                      style={{
                        borderTopWidth: 1,
                        borderTopColor: t.line,
                        paddingTop: t.space.md,
                        gap: 10,
                      }}>
                      <Txt
                        weight="semibold"
                        size={12.5}
                        color={t.inkSoft}
                        style={{ textAlign: 'center', lineHeight: 18 }}>
                        Não achou “Adicionar à Tela de Início”? Você pode estar dentro de outro app
                        (e-mail, etc). Copie o link e abra no Safari.
                      </Txt>
                      {copyBlock}
                    </View>
                  </>
                ) : (
                  <>
                    {canInstall ? (
                      <Button
                        variant="primary"
                        icon={<IconDownload size={19} />}
                        onPress={doInstall}>
                        Instalar app
                      </Button>
                    ) : null}
                    <View style={{ gap: t.space.md }}>
                      {canInstall ? (
                        <Txt
                          weight="semibold"
                          size={13}
                          color={t.inkSoft}
                          style={{ textAlign: 'center' }}>
                          Não abriu? Faça pelo menu do navegador:
                        </Txt>
                      ) : null}
                      <StepRow n={1}>
                        Toque no menu do navegador (os três pontinhos, no canto).
                      </StepRow>
                      <StepRow n={2}>
                        Toque em “Instalar app” ou “Adicionar à tela inicial”.
                      </StepRow>
                      <StepRow n={3}>Confirme. O ícone aparece na tela inicial.</StepRow>
                    </View>
                  </>
                )}
              </Card>

              <Txt
                weight="semibold"
                size={12.5}
                color={t.inkSoft}
                style={{ textAlign: 'center', marginTop: 16, lineHeight: 18 }}>
                Depois de instalar, abra o app pelo ícone na tela inicial.
              </Txt>
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
