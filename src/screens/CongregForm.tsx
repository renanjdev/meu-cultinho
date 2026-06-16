/** 17. Dados da comum — cooperador edita; auxiliar visualiza. Compartilha a localização. */
import React, { useEffect, useState } from 'react';
import { Linking, Platform, View } from 'react-native';
import { useNav } from '../navigation/useNav';
import { useSession } from '../state/session';
import { useToast } from '../components/Toast';
import { useCongregacao, updateCongregacao } from '../data/repo';
import { AppBar, Button, Field, Screen, ScreenScroll, Txt } from '../components/ui';
import { useTheme } from '../theme/ThemeProvider';
import { IconCheck, IconMapPin } from '../components/Icons';

interface CongregDraft {
  name: string;
  endereco: string;
  cooperadorOficial: string;
  cooperadorJovens: string;
}

export default function CongregForm() {
  const t = useTheme();
  const { back, go } = useNav();
  const { show } = useToast();
  const { session } = useSession();
  const isAdmin = session?.role === 'cooperador';
  const { congregacao } = useCongregacao();
  const [f, setF] = useState<CongregDraft>({ name: '', endereco: '', cooperadorOficial: '', cooperadorJovens: '' });
  const [seeded, setSeeded] = useState(false);
  const [triedSave, setTriedSave] = useState(false);
  const [busy, setBusy] = useState(false);

  // semeia o form quando a comum carrega — uma vez só
  useEffect(() => {
    if (congregacao && !seeded) {
      setF({
        name: congregacao.name,
        endereco: congregacao.endereco,
        cooperadorOficial: congregacao.cooperadorOficial,
        cooperadorJovens: congregacao.cooperadorJovens,
      });
      setSeeded(true);
    }
  }, [congregacao, seeded]);

  const set = (k: keyof CongregDraft) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const nameEmpty = !f.name.trim();
  const hasEndereco = !!f.endereco.trim();

  const onSave = async () => {
    if (nameEmpty) {
      setTriedSave(true);
      return;
    }
    setBusy(true);
    try {
      await updateCongregacao(f);
      show('Dados da comum salvos');
      if (back) back();
      else go('Settings');
    } catch {
      show('Não foi possível salvar.', 'error');
      setBusy(false);
    }
  };

  // Compartilha a localização: usa a folha de compartilhamento do celular
  // (Web Share API) quando disponível; senão, abre o endereço no Google Maps.
  const shareLocation = async () => {
    const q = f.endereco.trim();
    if (!q) return;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
    const text = `${f.name.trim() || 'Comum'} — ${q}`;
    try {
      const nav: any = typeof navigator !== 'undefined' ? navigator : undefined;
      if (Platform.OS === 'web' && nav && typeof nav.share === 'function') {
        await nav.share({ title: 'Localização da comum', text, url: mapsUrl });
      } else {
        await Linking.openURL(mapsUrl);
      }
    } catch {
      // compartilhamento cancelado pelo usuário ou indisponível — silencioso
    }
  };

  return (
    <Screen>
      <AppBar title="Dados da comum" onBack={back} />
      <ScreenScroll contentStyle={{ paddingBottom: 24 }}>
        <Field
          label="Comum"
          required
          editable={isAdmin}
          placeholder="Ex: Central"
          value={f.name}
          onChangeText={set('name')}
          error={triedSave && nameEmpty ? 'Informe o nome da comum' : undefined}
        />
        <Field
          label="Endereço"
          editable={isAdmin}
          placeholder="Rua, número, bairro, cidade"
          value={f.endereco}
          onChangeText={set('endereco')}
        />
        <Field
          label="Cooperador Oficial"
          editable={isAdmin}
          placeholder="Nome do cooperador oficial"
          value={f.cooperadorOficial}
          onChangeText={set('cooperadorOficial')}
        />
        <Field
          label="Cooperador de Jovens"
          editable={isAdmin}
          placeholder="Nome do cooperador de jovens"
          value={f.cooperadorJovens}
          onChangeText={set('cooperadorJovens')}
        />

        <Button
          variant="secondary"
          icon={<IconMapPin size={18} />}
          disabled={!hasEndereco}
          onPress={shareLocation}>
          Compartilhar localização
        </Button>
        {!hasEndereco ? (
          <Txt weight="semibold" size={12} color={t.inkSoft} style={{ marginTop: 4 }}>
            Preencha o endereço para compartilhar a localização.
          </Txt>
        ) : null}

        {isAdmin ? (
          <>
            <View style={{ height: 8 }} />
            <Button variant="primary" icon={<IconCheck size={19} />} loading={busy} onPress={onSave}>
              Salvar
            </Button>
            <Button variant="ghost" onPress={back}>
              Cancelar
            </Button>
          </>
        ) : (
          <Txt weight="semibold" size={13} color={t.inkSoft} style={{ marginTop: 8 }}>
            Somente o cooperador pode editar os dados da comum.
          </Txt>
        )}
      </ScreenScroll>
    </Screen>
  );
}
