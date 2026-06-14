/**
 * data/photos.ts — seleção + upload de fotos (Supabase Storage, bucket público
 * "fotos"). Web-first: o seletor abre o file input do navegador; o upload usa
 * fetch(uri) -> Blob. O redimensionamento é best-effort (ImageManipulator).
 */
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../services/supabase';

const BUCKET = 'fotos';
export type PhotoFolder = 'jovens' | 'auxiliares';

/** Abre o seletor e devolve um uri local já reduzido (~512px), ou null se cancelou. */
export async function pickImage(): Promise<string | null> {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    // o editor de corte não existe no navegador; só ativa no celular nativo
    allowsEditing: Platform.OS !== 'web',
    aspect: [1, 1],
    quality: 0.7,
  });
  if (res.canceled || !res.assets?.[0]) return null;
  const uri = res.assets[0].uri;
  return (await reduce(uri)) ?? uri;
}

/**
 * Reduz a imagem (~512px) antes do upload. Tenta o API contextual novo do SDK 56
 * (que fica em `ImageManipulator.ImageManipulator.manipulate`, NÃO no topo do
 * namespace), depois o `manipulateAsync` (deprecado, mas ainda presente) e, se
 * nada funcionar (ex.: web sem suporte), devolve null para manter o original.
 */
async function reduce(uri: string): Promise<string | null> {
  const IM: any = ImageManipulator;
  try {
    const ctx = IM.ImageManipulator;
    if (ctx && typeof ctx.manipulate === 'function') {
      const rendered = await ctx.manipulate(uri).resize({ width: 512 }).renderAsync();
      const out = await rendered.saveAsync({ format: IM.SaveFormat.JPEG, compress: 0.7 });
      return out.uri;
    }
  } catch {
    /* cai no fallback abaixo */
  }
  try {
    if (typeof IM.manipulateAsync === 'function') {
      const out = await IM.manipulateAsync(uri, [{ resize: { width: 512 } }], {
        format: IM.SaveFormat.JPEG,
        compress: 0.7,
      });
      return out.uri;
    }
  } catch {
    /* mantém o original */
  }
  return null;
}

/** Envia um uri local pro bucket e devolve a URL pública. */
export async function uploadPhoto(folder: PhotoFolder, id: string, uri: string): Promise<string> {
  const blob = await (await fetch(uri)).blob();
  // caminho único (id + timestamp) evita cache do navegador e colisão
  const path = `${folder}/${id}-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type || 'image/jpeg',
    upsert: true,
  });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Seleciona + envia direto (para telas onde o id já existe). */
export async function pickAndUploadPhoto(folder: PhotoFolder, id: string): Promise<string | null> {
  const uri = await pickImage();
  if (!uri) return null;
  return uploadPhoto(folder, id, uri);
}
