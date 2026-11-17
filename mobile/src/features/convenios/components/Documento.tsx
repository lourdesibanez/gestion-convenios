import { useState, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import type { Documento } from '../Tipos';
import type { TipoDocumentoConvenio } from '../services/creacionConvenioService';
import { Seccion } from './Seccion';
import { fechaHora, useColoresConvenio, type ColoresConvenio } from './temas';
import { useTema } from '@/theme';
import { ModalOpciones } from '@/components/molecules';


export type OpcionSubidaDocumento = {
  tipo: TipoDocumentoConvenio;
  etiqueta: string;
};

interface Props {
  documentos: Documento[];
  onAbrir: (doc: Documento) => void; // descarga + visor PDF.js
  onSubir: (tipo: TipoDocumentoConvenio) => void;
  descargandoDocumentoId: number | null;
  tiposSubida: OpcionSubidaDocumento[];
  puedeSubir: boolean;
  subiendo?: boolean;
}

export function Documentos({
  documentos,
  onAbrir,
  onSubir,
  descargandoDocumentoId,
  tiposSubida,
  puedeSubir,
  subiendo = false,
}: Props) {
  const colores = useColoresConvenio();
  const { fs } = useTema();
  const s = useMemo(() => crearEstilos(colores, fs), [colores, fs]);
  const [selectorAbierto, setSelectorAbierto] = useState(false);

  return (
    <>
      <Seccion
        titulo={`Documentos · ${documentos.length}`}
        derecha={
          puedeSubir ? (
            <Pressable
              onPress={() => setSelectorAbierto(true)}
              style={[s.botonSubir, subiendo && s.botonDeshabilitado]}
              accessibilityRole="button"
              accessibilityState={{ disabled: subiendo }}
              disabled={subiendo}
            >
              <Text style={s.botonSubirTxt}>{subiendo ? 'Subiendo…' : '+ Subir PDF'}</Text>
            </Pressable>
          ) : null
        }
      >
        {documentos.map((d) => (
          <Pressable
            key={d.id}
            onPress={() => onAbrir(d)}
            style={s.fila}
            accessibilityRole="button"
            accessibilityLabel={`${descargandoDocumentoId === d.id ? 'Descargando' : 'Descargar'} ${d.nombre}`}
            accessibilityState={{ disabled: descargandoDocumentoId !== null }}
            disabled={descargandoDocumentoId !== null}
          >
            <View style={s.icono}>
              {descargandoDocumentoId === d.id ? (
                <ActivityIndicator size="small" color={colores.pdf} />
              ) : (
                <Text style={s.iconoTxt}>PDF</Text>
              )}
            </View>
            <View style={s.info}>
              <Text style={s.nombre}>
                {descargandoDocumentoId === d.id ? 'Descargando…' : d.nombre}
              </Text>
              <Text style={s.detalle}>{d.descripcion}</Text>
              {d.selladoPor && d.selladoEn && (
                <Text style={s.sello}>
                  <Check size={11} /> Sellado por la app · {d.selladoPor} · {fechaHora(d.selladoEn)}
                </Text>
              )}
            </View>
          </Pressable>
        ))}
      </Seccion>
      <ModalOpciones
        visible={puedeSubir && selectorAbierto}
        titulo="Tipo de documento"
        opciones={tiposSubida.map((opcion) => ({ value: opcion.tipo, label: opcion.etiqueta }))}
        onSeleccionar={(tipo) => {
          setSelectorAbierto(false);
          onSubir(tipo as TipoDocumentoConvenio);
        }}
        onCerrar={() => setSelectorAbierto(false)}
      />
    </>
  );
}

const crearEstilos = (colores: ColoresConvenio, fs: (tamano: number) => number) =>
  StyleSheet.create({
    botonSubir: { borderColor: colores.azul, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
    botonDeshabilitado: { opacity: 0.5 },
    botonSubirTxt: { color: colores.azul, fontWeight: '700', fontSize: fs(12) },
    fila: {
      flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, marginTop: 6,
      borderRadius: 10, borderWidth: 1, borderColor: colores.borde, backgroundColor: colores.tarjetaSuave,
    },
    icono: { backgroundColor: colores.rojoClaro, borderRadius: 6, paddingVertical: 8, paddingHorizontal: 6 },
    iconoTxt: { color: colores.pdf, fontWeight: '800', fontSize: fs(10) },
    info: { flex: 1 },
    nombre: { color: colores.texto, fontWeight: '700', fontSize: fs(13) },
    detalle: { color: colores.textoSuave, fontSize: fs(12) },
    sello: { color: colores.verde, fontSize: fs(11), marginTop: 2 },
  });