'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { useAuth } from '@/app/context/authContext'

import {
    obtenerOpcionesCreacion,
    crearConvenio,
    obtenerConvenioParaEdicion,
    actualizarConvenio,
} from '@/model/convenioModel'

const PASOS = [
    'Datos básicos',
    'Vigencia y referencia',
    'Cláusulas',
    'Resolución',
]

const CAMPOS_INICIALES = {
    titulo: '',
    fecha_inicio: '',
    fecha_fin: '',
    fecha_preaviso: '',
    numero_resolucion: '',
    referencia_expediente: '',
    notas: '',
    objeto: '',
    marco_legal: '',
    obligaciones: '',
    condiciones_terminacion: '',
    condiciones_renovacion: '',
    confidencialidad: '',
    alcance_actividades: '',
}

const CAMPOS_POR_PASO = [
    ['titulo', 'id_tipo_instrumento', 'id_institucion'],
    ['fecha_inicio', 'fecha_fin', 'fecha_preaviso'],
    [
        'objeto',
        'marco_legal',
        'obligaciones',
        'condiciones_terminacion',
        'condiciones_renovacion',
        'confidencialidad',
        'alcance_actividades',
    ],
    ['numero_resolucion', 'referencia_expediente', 'notas'],
]

function fechaParaInput(valor) {
    if (!valor) return ''

    return String(valor).slice(0, 10)
}

function normalizarCampos(datos = {}) {
    const resultado = {}

    for (const campo of Object.keys(CAMPOS_INICIALES)) {
        resultado[campo] = String(datos?.[campo] ?? '')
    }

    resultado.fecha_inicio = fechaParaInput(datos?.fecha_inicio)
    resultado.fecha_fin = fechaParaInput(datos?.fecha_fin)
    resultado.fecha_preaviso = fechaParaInput(datos?.fecha_preaviso)

    return resultado
}

function CampoTexto({
    label,
    name,
    value,
    onChange,
    error,
    multiline = false,
    maxLength,
    placeholder,
}) {
    const clases = `form-control ${error ? 'is-invalid' : ''}`

    return (
        <div>
            <label htmlFor={name} className="form-label small fw-semibold">
                {label}
            </label>

            {multiline ? (
                <textarea
                    id={name}
                    name={name}
                    className={clases}
                    rows={3}
                    value={value}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    onChange={(e) => onChange(name, e.target.value)}
                />
            ) : (
                <input
                    id={name}
                    name={name}
                    type="text"
                    className={clases}
                    value={value}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    onChange={(e) => onChange(name, e.target.value)}
                />
            )}

            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    )
}

function CampoFecha({ label, name, value, onChange, min, error }) {
    return (
        <div>
            <label htmlFor={name} className="form-label small fw-semibold">
                {label}
            </label>

            <input
                id={name}
                name={name}
                type="date"
                className={`form-control ${error ? 'is-invalid' : ''}`}
                value={value}
                min={min}
                onChange={(e) => onChange(name, e.target.value)}
            />

            {error && <div className="invalid-feedback">{error}</div>}
        </div>
    )
}

export default function CrearConvenioPage({ id = null }) {
    const router = useRouter()

    const editando = id !== null && id !== undefined

    const {
        token,
        isAuth,
        cargando: sesionCargando,
        logout,
    } = useAuth()

    const [opciones, setOpciones] = useState({
        puede_crear: false,
        tipos: [],
        instituciones: [],
    })

    const [campos, setCampos] = useState(CAMPOS_INICIALES)
    const [tipoId, setTipoId] = useState('')
    const [institucionId, setInstitucionId] = useState('')
    const [version, setVersion] = useState(null)

    const [paso, setPaso] = useState(0)
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)

    const [errorCarga, setErrorCarga] = useState(null)
    const [errorEnvio, setErrorEnvio] = useState(null)
    const [errores, setErrores] = useState({})

    // --------------------------------------------------
    // Cargar opciones y datos del convenio
    // --------------------------------------------------

    useEffect(() => {
        if (sesionCargando) return

        if (!isAuth || !token) {
            router.replace('/login')
            return
        }

        let activo = true

        async function cargarFormulario() {
            setCargando(true)
            setErrorCarga(null)

            try {
                const resultadoOpciones = await obtenerOpcionesCreacion(token)

                if (!activo) return

                let nuevasOpciones = {
                    puede_crear: resultadoOpciones?.puede_crear === true,
                    tipos: Array.isArray(resultadoOpciones?.tipos)
                        ? resultadoOpciones.tipos
                        : [],
                    instituciones: Array.isArray(resultadoOpciones?.instituciones)
                        ? resultadoOpciones.instituciones
                        : [],
                }

                if (editando) {
                    const resultadoEdicion = await obtenerConvenioParaEdicion(
                        token,
                        id
                    )

                    if (!activo) return

                    const datos = resultadoEdicion.datos

                    setVersion(resultadoEdicion.version)

                    setCampos(normalizarCampos(datos))

                    setTipoId(
                        String(datos.id_tipo_instrumento ?? '')
                    )

                    setInstitucionId(
                        String(datos.id_institucion ?? '')
                    )

                    // Si las opciones de creación no incluyen el tipo actual,
                    // lo conservamos para que pueda visualizarse en el formulario.
                    if (
                        datos.id_tipo_instrumento &&
                        !nuevasOpciones.tipos.some(
                            (tipo) => String(tipo.id) === String(datos.id_tipo_instrumento)
                        )
                    ) {
                        nuevasOpciones.tipos = [
                            {
                                id: datos.id_tipo_instrumento,
                                nombre: resultadoEdicion.tipoNombre || 'Tipo actual',
                            },
                            ...nuevasOpciones.tipos,
                        ]
                    }

                    // Lo mismo para la unidad responsable actual.
                    if (
                        datos.id_institucion &&
                        !nuevasOpciones.instituciones.some(
                            (unidad) => String(unidad.id) === String(datos.id_institucion)
                        )
                    ) {
                        nuevasOpciones.instituciones = [
                            {
                                id: datos.id_institucion,
                                nombre: resultadoEdicion.institucionNombre || 'Unidad actual',
                            },
                            ...nuevasOpciones.instituciones,
                        ]
                    }
                } else {
                    if (!nuevasOpciones.puede_crear) {
                        setOpciones(nuevasOpciones)
                        return
                    }

                    if (nuevasOpciones.instituciones.length === 1) {
                        setInstitucionId(
                            String(nuevasOpciones.instituciones[0].id)
                        )
                    }
                }

                setOpciones(nuevasOpciones)
            } catch (err) {
                if (!activo) return

                if (err.status === 401) {
                    logout()
                    router.replace('/login')
                    return
                }

                if (err.status === 403) {
                    setErrorCarga(
                        editando
                            ? 'No tenés autorización para editar este convenio.'
                            : 'No tenés autorización para crear convenios.'
                    )
                    return
                }

                setErrorCarga(
                    err.datos?.message ??
                    err.message ??
                    'No se pudo cargar la información del formulario.'
                )
            } finally {
                if (activo) setCargando(false)
            }
        }

        cargarFormulario()

        return () => {
            activo = false
        }
    }, [token, isAuth, sesionCargando, logout, router, editando, id])

    // --------------------------------------------------
    // Actualización de campos
    // --------------------------------------------------

    function actualizarCampo(nombre, valor) {
        setCampos((actuales) => ({
            ...actuales,
            [nombre]: valor,
        }))

        setErrores((actuales) => ({
            ...actuales,
            [nombre]: '',
        }))

        setErrorEnvio(null)
    }

    // --------------------------------------------------
    // Validaciones
    // --------------------------------------------------

    function validarPasoActual() {
        const nuevosErrores = {}

        if (paso === 0) {
            if (!String(campos.titulo ?? '').trim()) {
                nuevosErrores.titulo = 'Ingresá el título del convenio.'
            }

            if (!tipoId) {
                nuevosErrores.id_tipo_instrumento =
                    'Seleccioná un tipo de instrumento.'
            }

            if (!institucionId) {
                nuevosErrores.id_institucion =
                    'Seleccioná la unidad responsable.'
            }
        }

        if (paso === 1) {
            if (
                campos.fecha_inicio &&
                campos.fecha_fin &&
                campos.fecha_fin < campos.fecha_inicio
            ) {
                nuevosErrores.fecha_fin =
                    'El vencimiento no puede ser anterior a la fecha de inicio.'
            }
        }

        setErrores((actuales) => ({
            ...actuales,
            ...nuevosErrores,
        }))

        return Object.keys(nuevosErrores).length === 0
    }

    function validarFormularioCompleto() {
        const nuevosErrores = {}

        if (!String(campos.titulo ?? '').trim()) {
            nuevosErrores.titulo = 'Ingresá el título del convenio.'
        }

        if (!tipoId) {
            nuevosErrores.id_tipo_instrumento =
                'Seleccioná un tipo de instrumento.'
        }

        if (!institucionId) {
            nuevosErrores.id_institucion =
                'Seleccioná la unidad responsable.'
        }

        if (
            campos.fecha_inicio &&
            campos.fecha_fin &&
            campos.fecha_fin < campos.fecha_inicio
        ) {
            nuevosErrores.fecha_fin =
                'El vencimiento no puede ser anterior a la fecha de inicio.'
        }

        setErrores(nuevosErrores)

        if (Object.keys(nuevosErrores).length > 0) {
            const pasoConError = CAMPOS_POR_PASO.findIndex(
                (camposPaso) =>
                    camposPaso.some((campo) => nuevosErrores[campo])
            )

            if (pasoConError !== -1) {
                setPaso(pasoConError)
            }

            return false
        }

        return true
    }

    function avanzar() {
        if (!validarPasoActual()) return

        setPaso((actual) => Math.min(actual + 1, PASOS.length - 1))
    }

    function retroceder() {
        setPaso((actual) => Math.max(actual - 1, 0))
    }

    // --------------------------------------------------
    // Preparar datos para Laravel
    // --------------------------------------------------

    function construirPayload() {
        const textoOpcional = (valor) =>
            String(valor ?? '').trim() || null

        return {
            titulo: campos.titulo.trim(),

            id_tipo_instrumento: Number(tipoId),
            id_institucion: Number(institucionId),

            fecha_inicio: textoOpcional(campos.fecha_inicio),
            fecha_fin: textoOpcional(campos.fecha_fin),
            fecha_preaviso: textoOpcional(campos.fecha_preaviso),

            numero_resolucion: textoOpcional(campos.numero_resolucion),
            referencia_expediente: textoOpcional(campos.referencia_expediente),
            notas: textoOpcional(campos.notas),

            objeto: textoOpcional(campos.objeto),
            marco_legal: textoOpcional(campos.marco_legal),
            obligaciones: textoOpcional(campos.obligaciones),
            condiciones_terminacion: textoOpcional(campos.condiciones_terminacion),
            condiciones_renovacion: textoOpcional(campos.condiciones_renovacion),
            confidencialidad: textoOpcional(campos.confidencialidad),
            alcance_actividades: textoOpcional(campos.alcance_actividades),
        }
    }

    // --------------------------------------------------
    // Guardar: crear o actualizar
    // --------------------------------------------------

    async function guardarConvenio() {

        if (!validarFormularioCompleto()) return
        if (guardando) return

        if (editando && (version === null || version === undefined)) {
            setErrorEnvio(
                'No se recibió la versión del convenio. Recargá la ficha antes de editar.'
            )
            return
        }

        setGuardando(true)
        setErrorEnvio(null)

        const payload = construirPayload()

        try {
            if (editando) {
                await actualizarConvenio(
                    token,
                    id,
                    payload,
                    version
                )

                router.replace(`/convenios/${id}`)
                router.refresh()
            } else {
                const creado = await crearConvenio(token, payload)

                if (!creado?.id) {
                    throw new Error(
                        'Laravel no devolvió el identificador del convenio creado.'
                    )
                }

                router.replace(`/convenios/${creado.id}`)
            }
        } catch (err) {
            if (err.status === 401) {
                logout()
                router.replace('/login')
                return
            }

            if (err.status === 403) {
                setErrorEnvio(
                    editando
                        ? 'No tenés autorización para editar este convenio.'
                        : 'Tu perfil no tiene autorización para crear convenios.'
                )
                return
            }

            if (err.status === 409 || err.status === 412) {
                setErrorEnvio(
                    'El convenio fue modificado por otro usuario. Recargá la ficha y volvé a realizar los cambios.'
                )
                return
            }

            const erroresApi = err.datos?.errors ?? {}

            const erroresNormalizados = Object.fromEntries(
                Object.entries(erroresApi).map(([campo, mensajes]) => [
                    campo,
                    Array.isArray(mensajes)
                        ? mensajes[0]
                        : String(mensajes),
                ])
            )

            setErrores((actuales) => ({
                ...actuales,
                ...erroresNormalizados,
            }))

            const pasoConError = CAMPOS_POR_PASO.findIndex(
                (camposPaso) =>
                    camposPaso.some((campo) => erroresNormalizados[campo])
            )

            if (pasoConError !== -1) {
                setPaso(pasoConError)
            }

            setErrorEnvio(
                err.datos?.message ??
                err.message ??
                `No se pudo ${editando ? 'actualizar' : 'crear'} el convenio.`
            )
        } finally {
            setGuardando(false)
        }
    }

    // --------------------------------------------------
    // Estados de pantalla
    // --------------------------------------------------

    if (sesionCargando || cargando) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border spinner-border-sm text-primary me-2" />

                <span className="small text-muted">
                    {editando
                        ? 'Cargando convenio...'
                        : 'Cargando opciones...'}
                </span>
            </div>
        )
    }

    if (errorCarga) {
        return (
            <div className="alert alert-danger">
                {errorCarga}

                <div className="mt-3">
                    <Link
                        href={editando ? `/convenios/${id}` : '/convenios'}
                        className="btn btn-outline-secondary btn-sm"
                    >
                        {editando ? 'Volver al convenio' : 'Volver a convenios'}
                    </Link>
                </div>
            </div>
        )
    }

    if (!editando && !opciones.puede_crear) {
        return (
            <div className="alert alert-warning">
                <h2 className="h6">Creación no disponible</h2>

                Tu perfil puede consultar convenios, pero no tiene permisos
                para crear uno.

                <div className="mt-3">
                    <Link
                        href="/convenios"
                        className="btn btn-outline-secondary btn-sm"
                    >
                        Volver a convenios
                    </Link>
                </div>
            </div>
        )
    }

    // --------------------------------------------------
    // Render
    // --------------------------------------------------

    return (
        <div className="container-fluid px-0">

            {/* Encabezado */}

            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <nav className="small text-muted mb-2">
                        <Link href="/convenios" className="text-decoration-none">
                            Convenios
                        </Link>

                        {editando ? (
                            <>
                                {' / '}
                                <Link
                                    href={`/convenios/${id}`}
                                    className="text-decoration-none"
                                >
                                    Convenio
                                </Link>
                                {' / Editar'}
                            </>
                        ) : (
                            ' / Nuevo'
                        )}
                    </nav>

                    <h1 className="h4 mb-1">
                        {editando ? 'Editar convenio' : 'Nuevo convenio'}
                    </h1>

                    <p className="text-muted small mb-0">
                        {editando
                            ? 'Modificá los datos del borrador y guardá los cambios.'
                            : 'Completá los datos para registrar un nuevo instrumento.'}
                    </p>
                </div>

                <Link
                    href={editando ? `/convenios/${id}` : '/convenios'}
                    className="btn btn-outline-secondary btn-sm"
                >
                    Cancelar
                </Link>
            </div>

            <div>

                {/* Indicador de pasos */}

                <div className="card shadow-sm mb-3">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="small text-muted">
                                Paso {paso + 1} de {PASOS.length}
                            </span>

                            <span className="small fw-semibold text-primary">
                                {PASOS[paso]}
                            </span>
                        </div>

                        <div className="progress" style={{ height: 6 }}>
                            <div
                                className="progress-bar"
                                role="progressbar"
                                style={{
                                    width: `${((paso + 1) / PASOS.length) * 100}%`,
                                }}
                                aria-valuenow={paso + 1}
                                aria-valuemin={1}
                                aria-valuemax={PASOS.length}
                            />
                        </div>

                        <div className="row g-2 mt-3">
                            {PASOS.map((nombre, index) => (
                                <div className="col-3" key={nombre}>
                                    <button
                                        type="button"
                                        className={`btn btn-sm w-100 ${paso === index
                                            ? 'btn-primary'
                                            : index < paso
                                                ? 'btn-outline-primary'
                                                : 'btn-outline-secondary'
                                            }`}
                                        disabled={guardando || index > paso}
                                        onClick={() => {
                                            if (validarPasoActual()) {
                                                setPaso(index)
                                            }
                                        }}
                                    >
                                        <span className="d-none d-md-inline">
                                            {nombre}
                                        </span>

                                        <span className="d-md-none">
                                            {index + 1}
                                        </span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Campos */}

                <div className="card shadow-sm">
                    <div className="card-body p-3 p-md-4">

                        {/* PASO 1 */}

                        {paso === 0 && (
                            <div>
                                <h2 className="h6 text-primary mb-3">
                                    Datos básicos
                                </h2>

                                <div className="row g-3">
                                    <div className="col-12">
                                        <CampoTexto
                                            label="Título del convenio *"
                                            name="titulo"
                                            value={campos.titulo ?? ''}
                                            onChange={actualizarCampo}
                                            error={errores.titulo}
                                            maxLength={255}
                                            placeholder="Ej.: Convenio de pasantías 2027"
                                        />
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label
                                            htmlFor="id_tipo_instrumento"
                                            className="form-label small fw-semibold"
                                        >
                                            Tipo de instrumento *
                                        </label>

                                        <select
                                            id="id_tipo_instrumento"
                                            className={`form-select ${errores.id_tipo_instrumento ? 'is-invalid' : ''
                                                }`}
                                            value={tipoId}
                                            disabled={guardando}
                                            onChange={(e) => {
                                                setTipoId(e.target.value)

                                                setErrores((actuales) => ({
                                                    ...actuales,
                                                    id_tipo_instrumento: '',
                                                }))
                                            }}
                                        >
                                            <option value="">Seleccionar tipo...</option>

                                            {opciones.tipos.map((tipo) => (
                                                <option key={tipo.id} value={tipo.id}>
                                                    {tipo.nombre}
                                                </option>
                                            ))}
                                        </select>

                                        {errores.id_tipo_instrumento && (
                                            <div className="invalid-feedback">
                                                {errores.id_tipo_instrumento}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label
                                            htmlFor="id_institucion"
                                            className="form-label small fw-semibold"
                                        >
                                            Unidad responsable *
                                        </label>

                                        <select
                                            id="id_institucion"
                                            className={`form-select ${errores.id_institucion ? 'is-invalid' : ''
                                                }`}
                                            value={institucionId}
                                            disabled={guardando}
                                            onChange={(e) => {
                                                setInstitucionId(e.target.value)

                                                setErrores((actuales) => ({
                                                    ...actuales,
                                                    id_institucion: '',
                                                }))
                                            }}
                                        >
                                            <option value="">Seleccionar unidad...</option>

                                            {opciones.instituciones.map((unidad) => (
                                                <option key={unidad.id} value={unidad.id}>
                                                    {unidad.nombre}
                                                </option>
                                            ))}
                                        </select>

                                        {errores.id_institucion && (
                                            <div className="invalid-feedback">
                                                {errores.id_institucion}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PASO 2 */}

                        {paso === 1 && (
                            <div>
                                <h2 className="h6 text-primary mb-3">
                                    Vigencia y referencia
                                </h2>

                                <div className="row g-3">
                                    <div className="col-12 col-md-4">
                                        <CampoFecha
                                            label="Fecha de inicio"
                                            name="fecha_inicio"
                                            value={campos.fecha_inicio ?? ''}
                                            onChange={actualizarCampo}
                                            error={errores.fecha_inicio}
                                        />
                                    </div>

                                    <div className="col-12 col-md-4">
                                        <CampoFecha
                                            label="Fecha de vencimiento"
                                            name="fecha_fin"
                                            value={campos.fecha_fin}
                                            onChange={actualizarCampo}
                                            error={errores.fecha_fin}
                                            min={campos.fecha_inicio || undefined}
                                        />
                                    </div>

                                    <div className="col-12 col-md-4">
                                        <CampoFecha
                                            label="Fecha de preaviso"
                                            name="fecha_preaviso"
                                            value={campos.fecha_preaviso}
                                            onChange={actualizarCampo}
                                            error={errores.fecha_preaviso}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <CampoTexto
                                            label="Referencia de expediente"
                                            name="referencia_expediente"
                                            value={campos.referencia_expediente}
                                            onChange={actualizarCampo}
                                            error={errores.referencia_expediente}
                                            maxLength={255}
                                            placeholder="Ej.: EX-2026-000123"
                                        />
                                    </div>

                                    <div className="col-12">
                                        <CampoTexto
                                            label="Notas"
                                            name="notas"
                                            value={campos.notas}
                                            onChange={actualizarCampo}
                                            error={errores.notas}
                                            multiline
                                            placeholder="Información complementaria..."
                                        />
                                    </div>

                                    <div className="col-12">
                                        <div className="alert alert-light border small mb-0">
                                            Las fechas son opcionales. Si no se registra
                                            vencimiento, el convenio se mostrará como
                                            «Sin vencimiento registrado».
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PASO 3 */}

                        {paso === 2 && (
                            <div>
                                <h2 className="h6 text-primary mb-3">
                                    Cláusulas y condiciones
                                </h2>

                                <div className="row g-3">
                                    <div className="col-12">
                                        <CampoTexto
                                            label="Objeto"
                                            name="objeto"
                                            value={campos.objeto}
                                            onChange={actualizarCampo}
                                            multiline
                                            placeholder="Describí el objeto del convenio..."
                                        />
                                    </div>

                                    <div className="col-12">
                                        <CampoTexto
                                            label="Alcance de actividades"
                                            name="alcance_actividades"
                                            value={campos.alcance_actividades}
                                            onChange={actualizarCampo}
                                            multiline
                                        />
                                    </div>

                                    <div className="col-12">
                                        <CampoTexto
                                            label="Obligaciones de las partes"
                                            name="obligaciones"
                                            value={campos.obligaciones}
                                            onChange={actualizarCampo}
                                            multiline
                                        />
                                    </div>

                                    <div className="col-12">
                                        <CampoTexto
                                            label="Marco legal"
                                            name="marco_legal"
                                            value={campos.marco_legal}
                                            onChange={actualizarCampo}
                                            multiline
                                        />
                                    </div>

                                    <div className="col-12">
                                        <CampoTexto
                                            label="Condiciones de rescisión o terminación"
                                            name="condiciones_terminacion"
                                            value={campos.condiciones_terminacion}
                                            onChange={actualizarCampo}
                                            multiline
                                        />
                                    </div>

                                    <div className="col-12">
                                        <CampoTexto
                                            label="Condiciones de renovación"
                                            name="condiciones_renovacion"
                                            value={campos.condiciones_renovacion}
                                            onChange={actualizarCampo}
                                            multiline
                                        />
                                    </div>

                                    <div className="col-12">
                                        <CampoTexto
                                            label="Confidencialidad"
                                            name="confidencialidad"
                                            value={campos.confidencialidad}
                                            onChange={actualizarCampo}
                                            multiline
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PASO 4 */}

                        {paso === 3 && (
                            <div>
                                <h2 className="h6 text-primary mb-3">
                                    Resolución y confirmación
                                </h2>

                                <div className="row g-3">
                                    <div className="col-12">
                                        <CampoTexto
                                            label="Número de resolución"
                                            name="numero_resolucion"
                                            value={campos.numero_resolucion}
                                            onChange={actualizarCampo}
                                            error={errores.numero_resolucion}
                                            maxLength={255}
                                            placeholder="Ej.: RES-CD-0205/2026"
                                        />
                                    </div>

                                    <div className="col-12">
                                        <div className="alert alert-info small">
                                            <strong>Documentación:</strong> los archivos PDF
                                            pueden adjuntarse desde la ficha del convenio.
                                            Se admiten documentos de hasta 20 MB.
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <div className="card bg-light border-0">
                                            <div className="card-body">
                                                <h3 className="h6 mb-3">
                                                    Resumen del convenio
                                                </h3>

                                                <dl className="row small mb-0">
                                                    <dt className="col-sm-4 text-muted">Título</dt>
                                                    <dd className="col-sm-8">
                                                        {campos.titulo || '—'}
                                                    </dd>

                                                    <dt className="col-sm-4 text-muted">Tipo</dt>
                                                    <dd className="col-sm-8">
                                                        {opciones.tipos.find(
                                                            (t) => String(t.id) === tipoId
                                                        )?.nombre ?? '—'}
                                                    </dd>

                                                    <dt className="col-sm-4 text-muted">Unidad</dt>
                                                    <dd className="col-sm-8">
                                                        {opciones.instituciones.find(
                                                            (u) => String(u.id) === institucionId
                                                        )?.nombre ?? '—'}
                                                    </dd>

                                                    <dt className="col-sm-4 text-muted">Inicio</dt>
                                                    <dd className="col-sm-8">
                                                        {campos.fecha_inicio || 'Sin especificar'}
                                                    </dd>

                                                    <dt className="col-sm-4 text-muted">Vencimiento</dt>
                                                    <dd className="col-sm-8">
                                                        {campos.fecha_fin || 'Sin vencimiento registrado'}
                                                    </dd>

                                                    {editando ? (
                                                        <>
                                                            <dt className="col-sm-4 text-muted">
                                                                Identificador
                                                            </dt>
                                                            <dd className="col-sm-8 mb-0">
                                                                {id}
                                                            </dd>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <dt className="col-sm-4 text-muted">
                                                                Estado inicial
                                                            </dt>
                                                            <dd className="col-sm-8 mb-0">
                                                                <span className="badge text-bg-secondary">
                                                                    Borrador
                                                                </span>
                                                            </dd>
                                                        </>
                                                    )}
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Errores del servidor */}

                        {errorEnvio && (
                            <div className="alert alert-danger small mt-4 mb-0">
                                {errorEnvio}
                            </div>
                        )}
                    </div>

                    {/* Navegación inferior */}

                    {/* Navegación inferior */}

                    <div className="d-flex justify-content-between align-items-center gap-2 mt-3">
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={retroceder}
                            disabled={paso === 0 || guardando}
                        >
                            Anterior
                        </button>

                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={guardando}
                            onClick={() => {
                                if (paso < PASOS.length - 1) {
                                    avanzar()
                                } else {
                                    guardarConvenio()
                                }
                            }}
                        >
                            {paso < PASOS.length - 1 ? (
                                'Siguiente'
                            ) : guardando ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    {editando ? 'Guardando cambios...' : 'Creando borrador...'}
                                </>
                            ) : (
                                editando ? 'Guardar cambios' : 'Crear borrador'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}