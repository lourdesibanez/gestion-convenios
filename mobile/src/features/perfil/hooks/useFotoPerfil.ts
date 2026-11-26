import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/features/auth/context/AuthContext';
import { perfilService } from '../service/perfilService';

export function useFotoPerfil() {
  const { usuario, actualizarFoto } = useAuth();
  const [subiendo, setSubiendo] = useState(false);
  const fotoUrl = usuario?.foto_url ?? null;

  const elegir = async () => {
    try {
      // Se cargan recién acá: si la app instalada no trae los módulos nativos,
      // falla solo esta función y no toda la app al arrancar.
      const ImagePicker = await import('expo-image-picker');
      const { ImageManipulator, SaveFormat } = await import('expo-image-manipulator');

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (resultado.canceled) return;

      setSubiendo(true);

      // Se achica a 512 px antes de subir: una foto de cámara pesa varios MB.
      const contexto = ImageManipulator.manipulate(resultado.assets[0].uri);
      contexto.resize({ width: 512 });
      const imagen = await contexto.renderAsync();
      const reducida = await imagen.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.7,
        base64: true,
      });
      if (!reducida.base64) throw new Error('No se pudo procesar la imagen.');

      const { data } = await perfilService.guardarFoto(reducida.base64);
      await actualizarFoto(data.foto_url);
    } catch (e) {
      const sinModulo = e instanceof Error && e.message.includes('native module');
      Alert.alert(
        'No se pudo guardar la foto',
        sinModulo
          ? 'Esta versión de la app todavía no incluye la selección de fotos. Hay que instalar el APK nuevo.'
          : e instanceof Error
            ? e.message
            : 'Intentá nuevamente.',
      );
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