import { useEffect, useState } from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SendHorizontal, Ban } from 'lucide-react-native';
import { colors } from '@/theme';
import { ComentarioConvenio as Comentario, comentarioService} from '../services/comentarioService';

type Props = {
  idConvenio: number;
};

function iniciales(comentario: Comentario): string {
  return `${comentario.usuario.nombre.charAt(0)}${comentario.usuario.apellido.charAt(0)}`
    .toUpperCase();
}

function fechaComentario(fecha: string): string {
  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ComentarioItem({ comentario }: { comentario: Comentario }) {
  return (
    <View style={styles.commentRow}>
      <View
        style={[
          styles.avatar,
          comentario.es_ofensivo && styles.offensiveAvatar,
        ]}
      >
        {comentario.es_ofensivo ? (
          <Ban size={16} color={colors.error} />
        ) : (
          <Text style={styles.avatarText}>{iniciales(comentario)}</Text>
        )}
      </View>

      <View
        style={[
          styles.commentBubble,
          comentario.es_ofensivo && styles.offensiveBubble,
        ]}
      >
        {!comentario.es_ofensivo ? (
          <Text style={styles.commentAuthor}>
            {comentario.usuario.nombre} {comentario.usuario.apellido}
            {' · '}
            {fechaComentario(comentario.created_at)}
          </Text>
        ) : null}

        <Text
          style={[
            styles.commentText,
            comentario.es_ofensivo && styles.offensiveText,
          ]}
        >
          {comentario.comentario}
        </Text>
      </View>
    </View>
  );
}

export function ComentariosConvenio({ idConvenio }: Props) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [texto, setTexto] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string>();
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;

    if (!Number.isSafeInteger(idConvenio) || idConvenio <= 0) {
      setError('El identificador del convenio no es válido.');
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(undefined);
    setComentarios([]);

    comentarioService.listar(idConvenio)
      .then((resultado) => {
        if (activo) {
          setComentarios(resultado);
        }
      })
      .catch((cause: unknown) => {
        if (activo) {
          setError(
            cause instanceof Error
              ? cause.message
              : 'No se pudieron cargar los comentarios.',
          );
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [idConvenio, intento]);

  const enviarComentario = async () => {
    const comentario = texto.trim();

    if (!comentario || enviando) {
      return;
    }

    setEnviando(true);
    setError(undefined);

    try {
      const creado = await comentarioService.crear(idConvenio, comentario);
      setComentarios((actuales) => [...actuales, creado]);
      setTexto('');
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No se pudo enviar el comentario.',
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Comentarios internos · {comentarios.length}
      </Text>

      {cargando ? (
        <ActivityIndicator color={colors.primary} />
      ) : error && comentarios.length === 0 ? (
        <View style={styles.message}>
          <Text style={styles.error}>{error}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setIntento((actual) => actual + 1)}
          >
            <Text style={styles.retry}>Reintentar</Text>
          </Pressable>
        </View>
      ) : comentarios.length === 0 ? (
        <Text style={styles.empty}>Todavía no hay comentarios.</Text>
      ) : (
        comentarios.map((comentario) => (
          <ComentarioItem key={comentario.id} comentario={comentario} />
        ))
      )}

      {error && comentarios.length > 0 ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      <View style={styles.composer}>
        <TextInput
          accessibilityLabel="Escribí un comentario"
          editable={!enviando}
          maxLength={2000}
          multiline
          onChangeText={setTexto}
          placeholder="Escribí un comentario..."
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={texto}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enviar comentario"
          disabled={!texto.trim() || enviando}
          onPress={() => void enviarComentario()}
          style={[
            styles.sendButton,
            (!texto.trim() || enviando) && styles.sendDisabled,
          ]}
        >
          {enviando ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <SendHorizontal size={20} color="#FFFFFF" />
          )}
        </Pressable>
      </View>

      <Text style={styles.note}>
        Los comentarios solo están disponibles para usuarios autorizados a ver
        este convenio.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DEE5F0',
    borderRadius: 16,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: colors.primary,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  offensiveAvatar: {
    backgroundColor: '#FEECEC',
  },
  commentBubble: {
    flex: 1,
    gap: 4,
    padding: 10,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  offensiveBubble: {
    backgroundColor: '#FEECEC',
  },
  commentAuthor: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  commentText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  offensiveText: {
    color: colors.error,
    fontStyle: 'italic',
  },
  composer: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 12,
    borderWidth: 1,
    borderColor: '#B9CBE5',
    borderRadius: 12,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
  },
  sendButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  sendDisabled: {
    opacity: 0.5,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 13,
  },
  message: {
    alignItems: 'center',
    gap: 8,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
  },
  retry: {
    padding: 8,
    color: colors.primary,
    fontWeight: '700',
  },
  note: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
});