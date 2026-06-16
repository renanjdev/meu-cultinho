/** 17. Dados da congregação — cooperador edita o nome; auxiliar visualiza. */
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useNav } from '../navigation/useNav';
import { useSession } from '../state/session';
import { useToast } from '../components/Toast';
import { useCongregacao, updateCongregacao } from '../data/repo';
import { AppBar, Button, Field, Screen, ScreenScroll, Txt } from '../components/ui';
import { useTheme } from '../theme/ThemeProvider';
import { IconCheck } from '../components/Icons';

export default function CongregForm() {
  const t = useTheme();
  const { back, go } = useNav();
  const { show } = useToast();
  const { session } = useSession();
  const isAdmin = session?.role === 'cooperador';
  const { congregacao } = useCongregacao();
  const [name, setName] = useState('');
  const [seeded, setSeeded] = useState(false);
  const [triedSave, setTriedSave] = useState(false);
  const [busy, setBusy] = useState(false);

  // semeia o campo quando a congregação carrega — uma vez só
  useEffect(() => {
    if (congregacao && !seeded) {
      setName(congregacao.name);
      setSeeded(true);
    }
  }, [congregacao, seeded]);

  const nameEmpty = !name.trim();

  const onSave = async () => {
    if (nameEmpty) {
      setTriedSave(true);
      return;
    }
    setBusy(true);
    try {
      await updateCongregacao(name);
      show('Dados da congregação salvos');
      if (back) back();
      else go('Settings');
    } catch {
      show('Não foi possível salvar.', 'error');
      setBusy(false);
    }
  };

  return (
    <Screen>
      <AppBar title="Dados da congregação" onBack={back} />
      <ScreenScroll contentStyle={{ paddingBottom: 24 }}>
        <Field
          label="Nome da congregação"
          required
          editable={isAdmin}
          placeholder="Ex: Central"
          value={name}
          onChangeText={setName}
          error={triedSave && nameEmpty ? 'Informe o nome da congregação' : undefined}
        />
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
            Somente o cooperador pode editar os dados da congregação.
          </Txt>
        )}
      </ScreenScroll>
    </Screen>
  );
}
