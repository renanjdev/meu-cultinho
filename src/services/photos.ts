/**
 * services/photos.ts — pick, compress, upload and offline-sync member photos.
 *
 * Built on the installed package versions:
 * - expo-image-picker 56.x      (new `mediaTypes: 'images'` string API)
 * - expo-image-manipulator 56.x (contextual `ImageManipulator.manipulate(...)` API)
 * - @react-native-firebase/storage 24.x   (modular `ref`/`putFile`/`getDownloadURL`)
 * - @react-native-firebase/firestore 24.x (modular `doc`/`setDoc`/`collection`/`getDocs`)
 */
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import {
  collection,
  doc,
  getDocs,
  setDoc,
} from '@react-native-firebase/firestore';
import {
  getDownloadURL,
  putFile,
  ref,
} from '@react-native-firebase/storage';

import { db, storage } from './firebase';
import { storagePath } from './photoPaths';

/** Collections that hold member photos. */
export type PhotoKind = 'jovens' | 'auxiliares';

/** Target width (px) for the compressed image; height keeps the source ratio. */
const TARGET_WIDTH = 512;

/** JPEG compression level (0 = smallest, 1 = best quality). */
const COMPRESS_QUALITY = 0.7;

/**
 * Picks an image from the library or camera and returns a compressed local URI.
 *
 * Requests the matching permission first; if it is denied the function returns
 * `null`. The picker is opened with square editing enabled. If the user cancels,
 * `null` is returned. Otherwise the chosen image is resized to ~512px wide and
 * compressed to ~0.7 JPEG, and its local URI is returned.
 *
 * @param source Where to pick from: the photo library or the camera.
 * @returns The local URI of the processed image, or `null` if denied/cancelled.
 */
export async function pickAndCompress(
  source: 'library' | 'camera' = 'library',
): Promise<string | null> {
  // Ask for the permission that matches the requested source.
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    return null;
  }

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: 'images',
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  };

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  const pickedUri = result.assets[0].uri;

  // Contextual image-manipulator API: resize then render, then save as JPEG.
  const context = ImageManipulator.manipulate(pickedUri).resize({
    width: TARGET_WIDTH,
  });
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({
    compress: COMPRESS_QUALITY,
    format: SaveFormat.JPEG,
  });

  return saved.uri;
}

/**
 * Uploads a local image to Storage and records its download URL in Firestore.
 *
 * The file is uploaded to `storagePath(kind, id)`; once finished, the document
 * `kind/{id}` is updated (merge) with the resolved download URL and the pending
 * flag is cleared.
 *
 * @param kind Which collection the member belongs to.
 * @param id Document id of the member.
 * @param localUri Local URI of the image to upload.
 * @returns The resolved download URL.
 */
export async function uploadPhoto(
  kind: PhotoKind,
  id: string,
  localUri: string,
): Promise<string> {
  const objectRef = ref(storage, storagePath(kind, id));
  await putFile(objectRef, localUri);

  const photoUrl = await getDownloadURL(objectRef);

  await setDoc(
    doc(db, kind, id),
    { photoUrl, photoPending: null },
    { merge: true },
  );

  return photoUrl;
}

/**
 * Sets a member's photo, uploading now when online or queuing it when offline.
 *
 * When online the image is uploaded immediately via {@link uploadPhoto}. When
 * offline the local URI is stored under `photoPending` so it can be uploaded
 * later by {@link flushPendingPhotos}.
 *
 * @param kind Which collection the member belongs to.
 * @param id Document id of the member.
 * @param localUri Local URI of the image to set.
 * @param isOnline Whether the device currently has connectivity.
 */
export async function setPhoto(
  kind: PhotoKind,
  id: string,
  localUri: string,
  isOnline: boolean,
): Promise<void> {
  if (isOnline) {
    await uploadPhoto(kind, id, localUri);
    return;
  }

  await setDoc(doc(db, kind, id), { photoPending: localUri }, { merge: true });
}

/**
 * Uploads every queued (`photoPending`) photo in the given collection.
 *
 * Each document with a non-empty `photoPending` string is uploaded via
 * {@link uploadPhoto}. Uploads are isolated with try/catch so a single failure
 * does not abort the remaining ones.
 *
 * @param kind Which collection to flush.
 */
export async function flushPendingPhotos(kind: PhotoKind): Promise<void> {
  const snapshot = await getDocs(collection(db, kind));

  for (const docSnap of snapshot.docs) {
    const pending = docSnap.data()?.photoPending;

    if (typeof pending !== 'string' || pending.length === 0) {
      continue;
    }

    try {
      await uploadPhoto(kind, docSnap.id, pending);
    } catch {
      // Ignore this document's failure so the others can still be uploaded.
    }
  }
}
