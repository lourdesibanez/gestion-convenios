import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { File as ExpoFile } from 'expo-file-system';
import { ChevronDown, ChevronRight, FileText, X } from 'lucide-react-native';
import { SelectField, type SelectFieldOption, SinConexion } from '@/components/molecules';
import { spacing, useTema, type Colores } from '@/theme';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  busquedaService,
  type ArchivoBusqueda,
  type CatalogosBusqueda,
  type FiltrosBusqueda,
  type NodoConvenio,
  type UnidadBusqueda,
} from '../services/busquedaService';
import { useBusqueda } from '@/features/busqueda/context/BusquedaContext';
import { router } from 'expo-router';
import { PdfJsViewer } from '@/features/firma/pdfViewer/PdfJsViewer';
import { useOffline } from '@/services/useOffline';
import { EstadoBadge } from '@/components/atoms';
import { useUnidad } from '@/features/unidades/context/UnidadContext';

type Opcion = {
  valor: string;
  etiqueta: string;
};

function tamanoArchivo(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function estadoFirmado(estado: string): boolean {
  return estado.trim().toLocaleLowerCase('es-AR') === 'firmado';
}

function filtrarFirmados(nodo: NodoConvenio): NodoConvenio | null {
  if (!estadoFirmado(nodo.estado)) return null;

  return {
    ...nodo,
    hijos: nodo.hijos.flatMap((hijo) => {
      const convenio = filtrarFirmados(hijo.convenio);
      return convenio ? [{ ...hijo, convenio }] : [];
    }),
  };
}

function opcionesConTodos(opciones: Opcion[]): Opcion[] {
  return [{ valor: '', etiqueta: 'Todos' }, ...opciones];
}

function adaptarOpciones(opciones: Opcion[]): SelectFieldOption[] {
  return opciones.map((opcion) => ({
    value: opcion.valor,
    label: opcion.etiqueta,
  }));
}

function DocumentoBusqueda({ archivo }: { archivo: ArchivoBusqueda }) {
  const { colors, fs } = useTema();
  const styles = useMemo(() => crearEstilos(colors, fs), [colors, fs]);
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState('');
  const [pdfLocal, setPdfLocal] = useState<ExpoFile | null>(null);

  const abrirPdf = async () => {
    if (descargando) return;

    setDescargando(true);
    setError('');
    try {
      setPdfLocal(await busquedaService.descargarPdf(archivo.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo abrir el PDF.');
    } finally {
      setDescargando(false);
    }
  };

  return (
    <>
      <View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Abrir PDF ${archivo.nombre}`}
          disabled={descargando}
          onPress={() => void abrirPdf()}
          style={styles.documentButton}
        >
          {descargando ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <FileText size={16} color="#DC2626" />
          )}
          <Text numberOfLines={2} style={styles.documentText}>
            {archivo.nombre} · {tamanoArchivo(archivo.tamanio_bytes)}
          </Text>
        </Pressable>
        {error ? <Text style={styles.documentError}>{error}</Text> : null}
      </View>

      <Modal
        animationType="slide"
        onRequestClose={() => setPdfLocal(null)}
        visible={pdfLocal !== null}
      >
        <View style={styles.pdfModal}>
          <View style={styles.pdfHeader}>
            <Text numberOfLines={1} style={styles.pdfTitle}>{archivo.nombre}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar PDF"
              hitSlop={8}
              onPress={() => setPdfLocal(null)}
            >
              <X size={22} color={colors.textMuted} />
            </Pressable>
          </View>
          {pdfLocal ? <PdfJsViewer file={pdfLocal} /> : null}
        </View>
      </Modal>
    </>
  );
}

function SelectorOrdenamiento({
  titulo,
  valor,
  opciones,
  onSeleccionar,
}: {
  titulo: string;
  valor: string;
  opciones: Opcion[];
  onSeleccionar: (valor: string) => void;
}) {
  const { colors, fs } = useTema();
  const styles = useMemo(() => crearEstilos(colors, fs), [colors, fs]);
  const [abierto, setAbierto] = useState(false);
  const etiqueta = opciones.find((opcion) => opcion.valor === valor)?.etiqueta ?? 'Todos';

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ordenar: ${etiqueta}`}
        accessibilityState={{ expanded: abierto }}
        onPress={() => setAbierto(true)}
        style={styles.sortSelector}
      >
        <Text numberOfLines={1} style={styles.sortLabel}>
          {etiqueta}
        </Text>
        <ChevronDown size={17} color={colors.textMuted} />
      </Pressable>

      <Modal
        animationType="fade"
        onRequestClose={() => setAbierto(false)}
        transparent
        visible={abierto}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setAbierto(false)}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{titulo}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                onPress={() => setAbierto(false)}
                hitSlop={8}
              >
                <X size={21} color={colors.textMuted} />
              </Pressable>
            </View>

            {opciones.map((opcion) => (
              <Pressable
                key={`${titulo}-${opcion.valor}`}
                onPress={() => {
                  onSeleccionar(opcion.valor);
                  setAbierto(false);
                }}
                style={styles.option}
              >
                <Text
                  style={[
                    styles.optionText,
                    opcion.valor === valor && styles.optionSelected,
                  ]}
                >
                  {opcion.etiqueta}
                </Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function NodoArbol({nodo,raiz = false, }: {
  nodo: NodoConvenio;
  raiz?: boolean;
}) {
  const { colors, fs } = useTema();
  const styles = useMemo(() => crearEstilos(colors, fs), [colors, fs]);
  const [abierto, setAbierto] = useState(false);

  const tieneContenido = nodo.hijos.length > 0 || nodo.archivos.length > 0 || Boolean(nodo.numero_resolucion);
  
  return (
    <View style={[styles.node, !raiz && styles.childNode]}>
      <View style={styles.nodeHeader}>
        {tieneContenido ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${abierto ? 'Contraer' : 'Expandir'} ${nodo.codigo}`}
            accessibilityState={{ expanded: abierto }}
            onPress={() => setAbierto((actual) => !actual)}
            style={styles.nodeExpandButton}
            hitSlop={4}
          >
            {abierto ? (
              <ChevronDown size={18} color={colors.textMuted} />
            ) : (
              <ChevronRight size={18} color={colors.textMuted} />
            )}
          </Pressable>
        ) : (
          <View style={styles.nodeExpandButton} />
        )}

        <View
          style={[
            styles.typeBadge,
            { backgroundColor: nodo.categoria === 'adenda' ? '#B45309' : colors.primary },
          ]}
        >
          <Text style={styles.typeBadgeText}>
            {(nodo.categoria || nodo.tipo).slice(0, 3).toUpperCase()}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ver detalle del convenio ${nodo.codigo}`}
          accessibilityHint="Abre el detalle del convenio"
          onPress={() =>
            router.push({
              pathname: '/agreement/[id]',
              params: { id: String(nodo.id) },
            })
          }
          style={styles.nodeInfo}
        >
          <Text style={styles.nodeTitle}>{nodo.titulo}</Text>
          <Text style={styles.nodeCode}>
            {nodo.codigo}
            {nodo.vence ? ` · vigente hasta ${nodo.vence.slice(0, 10)}` : ''}
          </Text>

          {raiz && nodo.hijos_count > 0 ? (
            <Text style={styles.nodeCode}>
              {nodo.hijos_count} {nodo.hijos_count === 1 ? 'hijo' : 'hijos'}
              {nodo.documentos_count > 0 ? ` · ${nodo.documentos_count} docs` : ''}
            </Text>
          ) : null}
        </Pressable>

        <EstadoBadge estado={nodo.estado} />
      </View>

      {abierto ? (
        <View style={styles.nodeContent}>
          {nodo.numero_resolucion ? (
            <View style={styles.documentRow}>
              <FileText size={16} color={colors.primary} />
              <Text style={styles.documentText}>
                Resolución {nodo.numero_resolucion}
              </Text>
            </View>
          ) : null}

          {nodo.archivos.map((archivo) =>
            archivo.tipo_mime === 'application/pdf' ? (
              <DocumentoBusqueda key={archivo.id} archivo={archivo} />
            ) : (
              <View key={archivo.id} style={styles.documentRow}>
                <FileText size={16} color={colors.textMuted} />
                <Text numberOfLines={2} style={styles.documentText}>
                  {archivo.nombre} · {tamanoArchivo(archivo.tamanio_bytes)}
                </Text>
              </View>
            ),
          )}

          {nodo.hijos.map((hijo) => (
            <NodoArbol key={`${hijo.convenio.id}-${hijo.tipo_vinculo}`} nodo={hijo.convenio} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function BuscarScreen() {
  const { colors, fs } = useTema();
  const styles = useMemo(() => crearEstilos(colors, fs), [colors, fs]);
  const { query } = useBusqueda();
  const { tipoPerfil } = useAuth();
  const esConsulta = tipoPerfil === 'consulta';
  const offline = useOffline();
  const [catalogos, setCatalogos] = useState<CatalogosBusqueda>({
    tipos: [],
    categorias: [],
  });
  const [unidades, setUnidades] = useState<UnidadBusqueda[]>([]);
  const [catalogosCargando, setCatalogosCargando] = useState(true);
  const [catalogosError, setCatalogosError] = useState('');
  const [filtros, setFiltros] = useState<FiltrosBusqueda>({
    orden: 'recientes',
  });
  const [resultados, setResultados] = useState<NodoConvenio[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [ultimaPagina, setUltimaPagina] = useState(1);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');
  const solicitudActual = useRef(0);
  const { unidadActiva } = useUnidad();

  useEffect(() => {
    setFiltros((actuales) => ({
      ...actuales,
      unidad: unidadActiva ? String(unidadActiva.id) : undefined,
    }));
  }, [unidadActiva]);
  
  const cargarCatalogos = useCallback(async () => {
    setCatalogosCargando(true);
    setCatalogosError('');

    try {
      const [opciones, listaUnidades] = await Promise.all([
        busquedaService.obtenerCatalogos(),
        busquedaService.obtenerUnidades(),
      ]);
      setCatalogos(opciones);
      setUnidades(listaUnidades);
    } catch (cause) {
      setCatalogosError(
        cause instanceof Error ? cause.message : 'No se pudieron cargar los filtros.',
      );
    } finally {
      setCatalogosCargando(false);
    }
  }, []);

  const buscar = useCallback(async (
    criterios: FiltrosBusqueda,
    numeroPagina = 1,
  ) => {
    const numeroSolicitud = ++solicitudActual.current;
    setBuscando(true);
    setError('');

    try {
      const respuesta = await busquedaService.buscar({
        ...criterios,
        page: numeroPagina,
      });
      if (numeroSolicitud !== solicitudActual.current) return;
      const convenios = esConsulta
        ? respuesta.data
            .map(filtrarFirmados)
            .filter((convenio): convenio is NodoConvenio => convenio !== null)
        : respuesta.data;
      setResultados(convenios);
      setTotal(respuesta.meta.total);
      setPagina(respuesta.meta.current_page);
      setUltimaPagina(respuesta.meta.last_page);
    } catch (cause) {
      if (numeroSolicitud !== solicitudActual.current) return;
      setError(cause instanceof Error ? cause.message : 'No se pudo realizar la búsqueda.');
      setResultados([]);
      setTotal(0);
    } finally {
      if (numeroSolicitud === solicitudActual.current) {
        setBuscando(false);
      }
    }
  }, [esConsulta]);

  useEffect(() => {
    if (offline) return;
    void cargarCatalogos();
  }, [cargarCatalogos, offline]);

  useEffect(() => {
    if (offline) return; // sin red no se busca; al volver, se re-ejecuta
    const timer = setTimeout(() => {
      void buscar(
        { ...filtros, q: query.trim() || undefined },
        1,
      );
    }, query.trim() ? 350 : 0);

    return () => clearTimeout(timer);
  }, [buscar, filtros, query, offline]);


  const actualizarFiltro = (clave: keyof FiltrosBusqueda, valor: string) => {
    setFiltros((actuales) => ({
      ...actuales,
      [clave]: valor || undefined,
    }));
  };

  const tipos = opcionesConTodos(catalogos.tipos);
  const categorias = opcionesConTodos(catalogos.categorias);
  const opcionesUnidades: Opcion[] = opcionesConTodos(
    unidades.map((unidad) => ({
      valor: String(unidad.id),
      etiqueta: unidad.nombre,
    })),
  );

  const activo =
    Boolean(filtros.anio || filtros.tipo || filtros.categoria || filtros.unidad);

  const cabecera = (
    <View style={styles.header}>
      <Text style={styles.heading}>Buscar convenios</Text>

      <View style={styles.filterPanel}>
        <Text style={styles.panelTitle}>Filtros{activo ? ' aplicados' : ''}</Text>

        {catalogosCargando ? (
          <ActivityIndicator color={colors.primary} />
        ) : catalogosError ? (
          <Pressable onPress={() => void cargarCatalogos()}>
            <Text style={styles.errorText}>{catalogosError} · Reintentar</Text>
          </Pressable>
        ) : (
          <>
            <View style={styles.filterRow}>
              <View style={styles.filterField}>
                <Text style={styles.filterLabel}>Año de firma</Text>
                <TextInput
                  accessibilityLabel="Año de firma"
                  keyboardType="number-pad"
                  maxLength={4}
                  onChangeText={(valor) => actualizarFiltro('anio', valor.replace(/\D/g, ''))}
                  placeholder="Todos"
                  placeholderTextColor={colors.textMuted}
                  style={styles.selector}
                  value={filtros.anio ?? ''}
                />
              </View>

              <SelectField
                label="Tipo"
                value={filtros.tipo ?? ''}
                options={adaptarOpciones(tipos)}
                onValueChange={(valor) => actualizarFiltro('tipo', valor)}
                placeholder="Todos"
              />
            </View>

            <View style={styles.filterRow}>
              <SelectField
                label="Categoría"
                value={filtros.categoria ?? ''}
                options={adaptarOpciones(categorias)}
                onValueChange={(valor) => actualizarFiltro('categoria', valor)}
                placeholder="Todos"
              />
              <SelectField
                label="Unidad"
                value={filtros.unidad ?? ''}
                options={adaptarOpciones(opcionesUnidades)}
                onValueChange={(valor) => actualizarFiltro('unidad', valor)}
                placeholder="Todos"
              />
            </View>
          </>
        )}
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {buscando
            ? 'Buscando…'
            : esConsulta
              ? `${resultados.length} convenios firmados en esta página`
              : `${total} resultados`}
        </Text>
        <SelectorOrdenamiento
          titulo="Ordenar resultados"
          valor={filtros.orden ?? 'recientes'}
          opciones={[
            { valor: 'recientes', etiqueta: 'Más recientes' },
            { valor: 'antiguos', etiqueta: 'Más antiguos' },
            { valor: 'titulo', etiqueta: 'Título' },
          ]}
          onSeleccionar={(valor) =>
            setFiltros((actuales) => ({
              ...actuales,
              orden: (valor || 'recientes') as FiltrosBusqueda['orden'],
            }))
          }
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  // el buscador indica que no hay conexión.
  if (offline) {
    return <SinConexion mensaje="El buscador necesita conexión. Probá de nuevo cuando vuelva la red." />;
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={resultados}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          buscando ? (
            <ActivityIndicator style={styles.empty} color={colors.primary} />
          ) : error ? undefined : (
            <Text style={styles.empty}>No se encontraron convenios.</Text>
          )
        }
        ListFooterComponent={
          total > 0 ? (
            <View style={styles.pagination}>
              <Pressable
                disabled={pagina <= 1 || buscando}
                onPress={() =>
                  void buscar(
                    { ...filtros, q: query.trim() || undefined },
                    pagina - 1,
                  )
                }
                style={styles.pageButton}
              >
                <Text style={styles.pageButtonText}>Anterior</Text>
              </Pressable>
              <Text style={styles.pageText}>
                Página {pagina} de {ultimaPagina}
              </Text>
              <Pressable
                disabled={pagina >= ultimaPagina || buscando}
                onPress={() =>
                  void buscar(
                    { ...filtros, q: query.trim() || undefined },
                    pagina + 1,
                  )
                }
                style={styles.pageButton}
              >
                <Text style={styles.pageButtonText}>Siguiente</Text>
              </Pressable>
            </View>
          ) : undefined
        }
        ListHeaderComponent={cabecera}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => <NodoArbol nodo={item} raiz />}
      />
    </View>
  );
}

const crearEstilos = (colors: Colores, fs: (tamano: number) => number) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    listContent: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
    },
    header: {
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    heading: {
      color: colors.primary,
      fontSize: fs(22),
      fontWeight: '700',
    },
    filterPanel: {
      gap: spacing.sm,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: '#DEE5F0',
      borderRadius: 16,
      backgroundColor: colors.background,
    },
    panelTitle: {
      color: colors.primary,
      fontSize: fs(15),
      fontWeight: '700',
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    filterField: {
      flex: 1,
      gap: 6,
    },
    filterLabel: {
      color: colors.text,
      fontSize: fs(13),
      fontWeight: '600',
    },
    selector: {
      minHeight: 44,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.background,
      color: colors.text,
      fontSize: fs(14),
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: 'center',
      padding: spacing.lg,
      backgroundColor: colors.overlay,
    },
    modalCard: {
      maxHeight: '75%',
      padding: spacing.md,
      borderRadius: 16,
      backgroundColor: colors.elevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    modalTitle: {
      color: colors.text,
      fontSize: fs(17),
      fontWeight: '700',
    },
    option: {
      paddingVertical: 13,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    optionText: {
      color: colors.text,
      fontSize: fs(15),
    },
    optionSelected: {
      color: colors.primary,
      fontWeight: '700',
    },
    resultsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: spacing.sm,
    },
    resultsCount: {
      color: colors.primary,
      fontSize: fs(15),
      fontWeight: '700',
    },
    sortLabel: {
      color: colors.primary,
      fontSize: fs(13),
      fontWeight: '600',
    },
    sortSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingLeft: spacing.sm,
    },
    empty: {
      paddingVertical: spacing.xl,
      color: colors.textMuted,
      textAlign: 'center',
    },
    errorText: {
      color: colors.error,
      fontSize: fs(13),
    },
    node: {
      marginBottom: spacing.sm,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: '#DEE5F0',
      borderRadius: 15,
      backgroundColor: colors.background,
    },
    childNode: {
      marginBottom: spacing.xs,
      borderWidth: 0,
      borderLeftWidth: 2,
      borderLeftColor: '#D9E2EF',
      borderRadius: 0,
    },
    nodeHeader: {
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    nodeExpandButton: {
      width: 40,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    typeBadge: {
      width: 34,
      height: 34,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 9,
    },
    typeBadgeText: {
      color: colors.background,
      fontSize: fs(10),
      fontWeight: '800',
    },
    nodeInfo: {
      flex: 1,
      gap: 3,
    },
    nodeTitle: {
      color: colors.text,
      fontSize: fs(14),
      fontWeight: '700',
    },
    nodeCode: {
      color: colors.textMuted,
      fontSize: fs(12),
    },
    nodeContent: {
      gap: spacing.sm,
      marginTop: spacing.sm,
      marginLeft: 26,
      paddingLeft: spacing.sm,
      borderLeftWidth: 2,
      borderLeftColor: '#D9E2EF',
    },
    documentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: 4,
    },
    documentButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: 44,
      paddingVertical: 4,
    },
    documentText: {
      flex: 1,
      color: colors.primary,
      fontSize: fs(13),
    },
    documentError: {
      marginLeft: 24,
      color: colors.error,
      fontSize: fs(12),
    },
    pdfModal: {
      flex: 1,
      backgroundColor: colors.background,
    },
    pdfHeader: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      paddingHorizontal: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    pdfTitle: {
      flex: 1,
      color: colors.text,
      fontSize: fs(16),
      fontWeight: '700',
    },
    pagination: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
    },
    pageButton: {
      padding: spacing.sm,
    },
    pageButtonText: {
      color: colors.primary,
      fontWeight: '700',
    },
    pageText: {
      color: colors.textMuted,
      fontSize: fs(13),
    },
  });