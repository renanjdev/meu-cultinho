/** 17. Evento — criar/editar um evento do calendário (título, data, descrição). */
import React, { useEffect, useState } from 'react';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useNav } from '../navigation/useNav';
import { useToast } from '../components/Toast';
import { saveEvento, deleteEvento, useEvento, isoToBR, brToISO } from '../data/repo';
import { validateDateBR } from '../data/date';
import type { RootStackParamList } from '../navigation/types';
import {
  AppBar,
  Button,
  ConfirmDialog,
  Field,
  Screen,
  ScreenScroll,
  TextArea,
} from '../components/ui';
import { IconCalendar, IconCheck, IconNote, IconX } from '../components/Icons';

interface Form {
  title: string;
  data: string; // dd/mm/aaaa
  descricao: string;
}

export default function EventForm() {
  const { go, back } = useNav();
  const { show } = useToast();
  const route = useRoute<RouteProp<RootStackParamList, 'EventForm'>>();
  const editId = route.params?.id;
  const initialDate = route.params?.date ? isoToBR(route.params.date) : '';
  const { evento } = useEvento(editId);

  const [f, setF] = useState<Form>({ title: '', data: initialDate, descricao: '' });
  const [prefilled, setPrefilled] = useState(false);
  const [triedSave, setTriedSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const set = (k: keyof Form) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (evento && !prefilled) {
      setF({ title: evento.title, data: isoToBR(evento.data), descricao: evento.descricao });
      setPrefilled(true);
    }
  }, [evento, prefilled]);

  const title = f.title.trim();
  const titleMissing = title.length === 0;
  // eventos podem ser no futuro (planejamento), então allowFuture
  const dateErr = f.data.trim() ? validateDateBR(f.data, { allowFuture: true }) : 'Informe a data';
  const showDateErr = !!dateErr && (triedSave || f.data.length >= 10);

  const handleSave = async () => {
    if (titleMissing || dateErr) {
      setTriedSave(true);
      return;
    }
    setSaving(true);
    try {
      await saveEvento({ id: editId, title, data: brToISO(f.data), descricao: f.descricao });
      show(editId ? 'Evento atualizado' : 'Evento criado');
      if (back) back();
      else go('Calendar');
    } catch {
      show('Erro ao salvar o evento');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <AppBar title={editId ? 'Editar evento' : 'Novo evento'} onBack={back} />
      <ScreenScroll contentStyle={{ paddingBottom: 24 }}>
        <Field
          label="Título"
          placeholder="Ex: Ensaio do coral"
          value={f.title}
          onChangeText={set('title')}
          icon={<IconNote size={17} />}
          error={triedSave && titleMissing ? 'Informe o título' : undefined}
        />
        <Field
          label="Data"
          dateMask
          placeholder="dd/mm/aaaa"
          value={f.data}
          onChangeText={set('data')}
          icon={<IconCalendar size={17} />}
          error={showDateErr ? dateErr : undefined}
        />
        <TextArea
          label="Descrição"
          placeholder="Detalhes do evento (opcional)"
          value={f.descricao}
          onChangeText={set('descricao')}
        />

        <Button variant="primary" icon={<IconCheck size={19} />} loading={saving} onPress={handleSave}>
          Salvar evento
        </Button>
        {editId ? (
          <Button variant="danger-soft" icon={<IconX size={18} />} onPress={() => setConfirmDel(true)}>
            Excluir evento
          </Button>
        ) : (
          <Button variant="ghost" onPress={back}>
            Cancelar
          </Button>
        )}
      </ScreenScroll>

      <ConfirmDialog
        open={confirmDel}
        danger
        title="Excluir evento?"
        message="O evento será removido do calendário."
        confirmLabel="Excluir"
        onCancel={() => setConfirmDel(false)}
        onConfirm={async () => {
          setConfirmDel(false);
          if (!editId) return;
          try {
            await deleteEvento(editId);
            show('Evento excluído');
            if (back) back();
            else go('Calendar');
          } catch {
            show('Erro ao excluir');
          }
        }}
      />
    </Screen>
  );
}
