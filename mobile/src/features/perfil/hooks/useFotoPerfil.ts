import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/features/auth/context/AuthContext';
import { perfilService } from '../service/perfilService';

export function useFotoPerfil() {
  const { usuario, actualizarFoto } = useAuth();
  const [subiendo, setSubiendo] = useState(false);
  const fotoUrl = usuario?.foto_url ?? null;

  const elegir = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (resultado.canceled) return;

    setSubiendo(true);
    try {
      // Se achica a 512 px antes de subir: una foto de cámara pesa varios MB.
   
    const reducida = await manipulateAsync(
    resultado.assets[0].uri,
    [{ resize: { width: 512 } }],
    { format: SaveFormat.JPEG, compress: 0.7, base64: true },
    );
      if (!reducida.base64) throw new Error('No se pudo procesar la imagen.');

      const { data } = await perfilService.guardarFoto(reducida.base64);
      await actualizarFoto(data.foto_url);
    } catch (e) {
      Alert.alert('No se pudo guardar la foto', e instanceof Error ? e.message : 'Intentá nuevamente.');
    } finally {
      setSubiendo(false);
    }
  };

  const quitar = async () => {
    setSubiendo(true);
    try {
      await perfilService.quitarFoto();
      await actualizarFoto(null);
    } catch (e) {
      Alert.alert('No se pudo quitar la foto', e instanceof Error ? e.message : 'Intentá nuevamente.');
    } finally {
      setSubiendo(false);
    }
  };

  const abrirMenu = () =>
    Alert.alert('Foto de perfil', undefined, [
      { text: 'Elegir de la galería', onPress: () => void elegir() },
      ...(fotoUrl
        ? [{ text: 'Quitar foto', style: 'destructive' as const, onPress: () => void quitar() }]
        : []),
      { text: 'Cancelar', style: 'cancel' as const },
    ]);

  return { fotoUrl, subiendo, abrirMenu };
}