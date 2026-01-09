let calendarioActivo = null

const calendarios = []
let eventoSeleccionado = null

/* =========================
   BOTONES NEXT / PREV
========================= */
document.getElementById("nextBtn").addEventListener("click", () => {
    calendarios[1].next()
    const fecha = calendarios[1].getDate()
    calendarios[2].gotoDate(fecha)
})

document.getElementById("prevBtn").addEventListener("click", () => {
    calendarios[1].prev()
    const fecha = calendarios[1].getDate()
    calendarios[2].gotoDate(fecha)
})

/* =========================
   BOTON HOY
========================= */
document.getElementById("todayBtn").addEventListener("click", () => {
    const hoy = new Date()
    calendarios[1].gotoDate(hoy)
    calendarios[2].gotoDate(hoy)
})

/* =========================
   CREAR CALENDARIO
========================= */
function crearCalendario(id, casaId) {
    const calendar = new FullCalendar.Calendar(
        document.getElementById(id),
        {
            initialView: "dayGridWeek",
            locale: "es",
            height: "auto",
            firstDay: 1,

            selectable: true,
            selectMirror: true,
            allDaySlot: false,

            headerToolbar: {
                left: "",
                center: "title",
                right: ""
            },

            dayCellClassNames: function (arg) {
                // 0 = domingo, 6 = sábado
                if (arg.date.getDay() === 0 || arg.date.getDay() === 6) {
                    return ["fin-de-semana"];
                }
                return [];
            },

            eventClick: function (info) {
                abrirModalEvento(info.event);
            }
        }
    );

    calendar.render();
    calendarios[casaId] = calendar;
}

/* =========================
   MODALES
========================= */
function abrirModalReservas() {
    eventoSeleccionado = null
    document.getElementById("modalReservasTitle").textContent = "Nueva reserva"
    // habilitar inputs/controls para nueva reserva (no deshabilitar botones)
    document.querySelectorAll('#modalReservas input, #modalReservas select').forEach(i => i.disabled = false)
    // botones: crear
    if (document.getElementById('btnGuardarReserva')) document.getElementById('btnGuardarReserva').style.display = 'inline-block'
    if (document.getElementById('btnGuardarCambios')) document.getElementById('btnGuardarCambios').style.display = 'none'
    if (document.getElementById('btnModificarReserva')) document.getElementById('btnModificarReserva').style.display = 'none'
    if (document.getElementById('btnEliminarReserva')) document.getElementById('btnEliminarReserva').style.display = 'none'
    if (document.getElementById('btnGenerarVoucher')) document.getElementById('btnGenerarVoucher').style.display = 'none'

    document.getElementById("modalReservas").style.display = "flex"
    actualizarColoresPorCasa()
}

function abrirModalBloquear() {
    document.getElementById("modalBloquear").style.display = "flex"
}

function cerrarModalReservas() {
    document.getElementById("modalReservas").style.display = "none"
    limpiarFormularioReservas()
    eventoSeleccionado = null
    // reset botones
    if (document.getElementById('btnGuardarReserva')) document.getElementById('btnGuardarReserva').style.display = 'inline-block'
    if (document.getElementById('btnGuardarCambios')) document.getElementById('btnGuardarCambios').style.display = 'none'
    if (document.getElementById('btnModificarReserva')) document.getElementById('btnModificarReserva').style.display = 'none'
    if (document.getElementById('btnEliminarReserva')) document.getElementById('btnEliminarReserva').style.display = 'none'
    if (document.getElementById('btnGenerarVoucher')) document.getElementById('btnGenerarVoucher').style.display = 'none'
}

function cerrarModalBloquear() {
    document.getElementById("modalBloquear").style.display = "none"
    limpiarFormularioBloqueo()
}

/* =========================
   LOGICA COLORES POR CASA ⭐
========================= */
const casaReservaSelect = document.getElementById("casaReserva")
const colorOptions = document.getElementById("colorOptions")
const colorLabels = colorOptions.querySelectorAll("label")

function actualizarColoresPorCasa() {
    const casa = casaReservaSelect.value

    // Sin casa → ocultar todo
    if (!casa) {
        colorOptions.style.display = "none"
        document.querySelectorAll('input[name="color"]').forEach(r => r.checked = false)
        return
    }

    colorOptions.style.display = "flex"

    colorLabels.forEach(label => {
        const tipo = label.dataset.color

        if (casa === "1") {
            label.style.display = (tipo === "1" || tipo === "3") ? "inline-flex" : "none"
        }

        if (casa === "2") {
            label.style.display = (tipo === "2" || tipo === "3") ? "inline-flex" : "none"
        }
    })

    // Si el color seleccionado quedó oculto, se limpia
    const seleccionado = document.querySelector('input[name="color"]:checked')
    if (
        seleccionado &&
        seleccionado.closest("label").style.display === "none"
    ) {
        seleccionado.checked = false
    }
}

casaReservaSelect.addEventListener("change", actualizarColoresPorCasa)

/* =========================
   GUARDAR RESERVA
========================= */
function guardarReserva() {
    const casa = document.getElementById("casaReserva").value
    const fecha_inicio = document.getElementById("fecha_inicio_reserva").value
    const fecha_fin = document.getElementById("fecha_fin_reserva").value
    const nombre = document.getElementById("nombre").value
    const apellido = document.getElementById("apellido").value
    const telefono = document.getElementById("telefono").value
    const personas = document.getElementById("personas").value
    const costo = document.getElementById("costo").value
    const sena = document.getElementById("sena").value

    const colorInput = document.querySelector('input[name="color"]:checked')
    if (!colorInput) {
        alert("Debe seleccionar un color")
        return
    }
    const color = colorInput.value

    if (!nombre || !apellido) {
        alert("Nombre y apellido son obligatorios")
        return
    }
    if (!casa) {
        alert("Debe seleccionar una casa")
        return
    }
    if (!fecha_inicio || !fecha_fin) {
        alert("Fechas obligatorias")
        return
    }
    if (new Date(fecha_fin) < new Date(fecha_inicio)) {
        alert("La fecha de fin no puede ser anterior")
        return
    }

    if (casa == 1) calendarioActivo = calendarios[1]
    else calendarioActivo = calendarios[2]

    const fecha_fin_date = new Date(fecha_fin + "T00:00:00")
    fecha_fin_date.setDate(fecha_fin_date.getDate() + 1)

    calendarioActivo.addEvent({
        title: nombre + " " + apellido,
        start: fecha_inicio,
        end: fecha_fin_date,
        allDay: true,
        color: color,
        extendedProps: {
            nombre,
            apellido,
            personas,
            costo,
            sena,
            telefono,
            casa
        }
    })

    cerrarModalReservas()
}

/* =========================
   MOSTRAR EVENTO EN MODAL
========================= */
function abrirModalEvento(event) {
    document.getElementById("modalReservasTitle").textContent = "Información de reserva"

    eventoSeleccionado = event

    // Poblar campos
    const ext = event.extendedProps || {}
    if (ext.casa) document.getElementById("casaReserva").value = ext.casa

    const start = event.start
    const end = event.end ? new Date(event.end) : null
    const fmt = d => d.toISOString().slice(0, 10)
    document.getElementById("fecha_inicio_reserva").value = start ? fmt(new Date(start)) : ""
    if (end) {
        // FullCalendar uses exclusive end for allDay events; mostrar inclusive
        end.setDate(end.getDate() - 1)
        document.getElementById("fecha_fin_reserva").value = fmt(end)
    } else {
        document.getElementById("fecha_fin_reserva").value = document.getElementById("fecha_inicio_reserva").value
    }

    // Prefer explicit stored nombre/apellido; si no están, hacer fallback por título
    document.getElementById("nombre").value = ext.nombre || (event.title ? event.title.split(" ")[0] : "")
    document.getElementById("apellido").value = ext.apellido || (event.title ? event.title.split(" ").slice(1).join(" ") : "")

    document.getElementById("personas").value = ext.personas || ""
    document.getElementById("costo").value = ext.costo || ""
    document.getElementById("sena").value = ext.sena || ""
    document.getElementById("telefono").value = ext.telefono || ""

    // marcar color si coincide
    const color = event.backgroundColor || ext.color || event.color
    if (color) {
        const radio = document.querySelector(`input[name="color"][value="${color}"]`)
        if (radio) radio.checked = true
    }

    // mostrar opciones según casa
    actualizarColoresPorCasa()

    // mostrar en modo solo lectura: deshabilitar inputs/select
    document.querySelectorAll('#modalReservas input, #modalReservas select').forEach(i => i.disabled = true)

    // botones: ver/modificar/eliminar
    if (document.getElementById('btnGuardarReserva')) document.getElementById('btnGuardarReserva').style.display = 'none'
    if (document.getElementById('btnGuardarCambios')) document.getElementById('btnGuardarCambios').style.display = 'none'
    if (document.getElementById('btnModificarReserva')) document.getElementById('btnModificarReserva').style.display = 'inline-block'
    if (document.getElementById('btnEliminarReserva')) document.getElementById('btnEliminarReserva').style.display = 'inline-block'
    if (document.getElementById('btnGenerarVoucher')) document.getElementById('btnGenerarVoucher').style.display = 'inline-block'

    const cancelar = document.querySelector('#modalReservas button[onclick="cerrarModalReservas()"]')
    if (cancelar) cancelar.disabled = false

    document.getElementById("modalReservas").style.display = "flex"
}

function iniciarEdicionReserva() {
    if (!eventoSeleccionado) return
    // habilitar campos para editar
    document.querySelectorAll('#modalReservas input, #modalReservas select').forEach(i => i.disabled = false)
    // mostrar guardar cambios
    if (document.getElementById('btnGuardarCambios')) document.getElementById('btnGuardarCambios').style.display = 'inline-block'
    if (document.getElementById('btnGuardarReserva')) document.getElementById('btnGuardarReserva').style.display = 'none'
    if (document.getElementById('btnModificarReserva')) document.getElementById('btnModificarReserva').style.display = 'none'
    if (document.getElementById('btnEliminarReserva')) document.getElementById('btnEliminarReserva').style.display = 'none'
}

function actualizarReserva() {
    if (!eventoSeleccionado) return
    const casa = document.getElementById("casaReserva").value
    const fecha_inicio = document.getElementById("fecha_inicio_reserva").value
    const fecha_fin = document.getElementById("fecha_fin_reserva").value
    const nombre = document.getElementById("nombre").value
    const apellido = document.getElementById("apellido").value
    const telefono = document.getElementById("telefono").value
    const personas = document.getElementById("personas").value
    const costo = document.getElementById("costo").value
    const sena = document.getElementById("sena").value

    const colorInput = document.querySelector('input[name="color"]:checked')
    const color = colorInput ? colorInput.value : null

    if (!nombre || !apellido) {
        alert("Nombre y apellido son obligatorios")
        return
    }
    if (!casa) {
        alert("Debe seleccionar una casa")
        return
    }
    if (!fecha_inicio || !fecha_fin) {
        alert("Fechas obligatorias")
        return
    }
    if (new Date(fecha_fin) < new Date(fecha_inicio)) {
        alert("La fecha de fin no puede ser anterior")
        return
    }

    // actualizar propiedades del evento
    eventoSeleccionado.setProp('title', nombre + ' ' + apellido)
    eventoSeleccionado.setStart(fecha_inicio)
    const fecha_fin_date = new Date(fecha_fin + "T00:00:00")
    fecha_fin_date.setDate(fecha_fin_date.getDate() + 1)
    eventoSeleccionado.setEnd(fecha_fin_date)
    if (color) eventoSeleccionado.setProp('color', color)

    // extended props
    eventoSeleccionado.setExtendedProp('nombre', nombre)
    eventoSeleccionado.setExtendedProp('apellido', apellido)
    eventoSeleccionado.setExtendedProp('personas', personas)
    eventoSeleccionado.setExtendedProp('costo', costo)
    eventoSeleccionado.setExtendedProp('sena', sena)
    eventoSeleccionado.setExtendedProp('telefono', telefono)
    eventoSeleccionado.setExtendedProp('casa', casa)

    cerrarModalReservas()
}

function eliminarReserva() {
    if (!eventoSeleccionado) return
    if (!confirm('¿Eliminar reserva?')) return
    eventoSeleccionado.remove()
    cerrarModalReservas()
}

/* =========================
   GENERAR VOUCHER (PDF)
========================= */
function loadImageDataUrlWithAlpha(url, targetW, targetH, alpha = 0.12) {
    return new Promise(async (resolve, reject) => {
        // Intentar cargar la imagen como blob vía fetch (funciona si la imagen se sirve desde el mismo origen)
        try {
            const resp = await fetch(url)
            if (!resp.ok) throw new Error('fetch failed')
            const blob = await resp.blob()
            const imgUrl = URL.createObjectURL(blob)
            const img = new Image()
            img.onload = () => {
                const w = targetW || img.width
                const h = targetH || img.height
                const canvas = document.createElement('canvas')
                canvas.width = w
                canvas.height = h
                const ctx = canvas.getContext('2d')
                ctx.globalAlpha = alpha
                ctx.drawImage(img, 0, 0, w, h)
                URL.revokeObjectURL(imgUrl)
                try {
                    resolve(canvas.toDataURL('image/jpeg', 0.8))
                } catch (e) {
                    reject(e)
                }
            }
            img.onerror = (e) => {
                URL.revokeObjectURL(imgUrl)
                reject(e)
            }
            img.src = imgUrl
            return
        } catch (e) {
            // Si fetch falla (CORS o file://), intentar fallback directo (puede taintear canvas)
            const img = new Image()
            img.onload = () => {
                const w = targetW || img.width
                const h = targetH || img.height
                const canvas = document.createElement('canvas')
                canvas.width = w
                canvas.height = h
                const ctx = canvas.getContext('2d')
                ctx.globalAlpha = alpha
                ctx.drawImage(img, 0, 0, w, h)
                try {
                    resolve(canvas.toDataURL('image/jpeg', 0.8))
                } catch (err) {
                    reject(err)
                }
            }
            img.onerror = (err) => reject(err)
            img.src = url
        }
    })
}

function loadImageDataUrlFromFile(file, targetW, targetH, alpha = 0.12) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const img = new Image()
            img.onload = () => {
                const w = targetW || img.width
                const h = targetH || img.height
                const canvas = document.createElement('canvas')
                canvas.width = w
                canvas.height = h
                const ctx = canvas.getContext('2d')
                ctx.globalAlpha = alpha
                ctx.drawImage(img, 0, 0, w, h)
                try {
                    resolve(canvas.toDataURL('image/jpeg', 0.8))
                } catch (e) {
                    reject(e)
                }
            }
            img.onerror = (e) => reject(e)
            img.src = reader.result
        }
        reader.onerror = (e) => reject(e)
        reader.readAsDataURL(file)
    })
}

async function generarVoucher() {
    if (!eventoSeleccionado) {
        alert('Seleccioná una reserva para generar el voucher')
        return
    }

    const ext = eventoSeleccionado.extendedProps || {}
    const start = eventoSeleccionado.start
    const end = eventoSeleccionado.end ? new Date(eventoSeleccionado.end) : null
    if (end) end.setDate(end.getDate() - 1)
    const fmt = d => d.toISOString().slice(0, 10)

    const casaName = ext.casa === '1' ? 'ONOKE - Al Amanecer' : ext.casa === '2' ? 'ASIKE - Al Atardecer' : (ext.casa || '')

    const { jsPDF } = window.jspdf || {}
    if (!jsPDF) {
        alert('La librería jsPDF no está cargada')
        return
    }

    const doc = new jsPDF({ orientation: 'landscape' })
    // Layout: border, title, image to the right, and bold labels
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    // border
    doc.setLineWidth(1)
    doc.rect(8, 8, pageW - 16, pageH - 16)

    // title (más grande)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Voucher de Reserva', 14, 26)

    // Image placement (mucho más grande y más a la derecha, dentro del borde)
    const imgW = Math.min(pageW * 0.72, pageW - 40)
    const imgH = imgW * 0.6
    const imgX = pageW - imgW - 12
    const imgY = 16

    doc.setFontSize(14)
    let y = 56

    const labelX = 26
    const valueX = 90

    const formatCurrency = (v) => {
        const n = parseFloat(v)
        if (isNaN(n)) return ''
        // use de-DE locale to get dot thousands and comma decimals
        return '$' + n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    const drawField = (label, value) => {
        doc.setFont('helvetica', 'bold')
        doc.text(label, labelX, y)
        doc.setFont('helvetica', 'normal')
        doc.text(value || '', valueX, y)
        y += 8
    }

    drawField('Casa:', casaName)
    drawField('Nombre:', `${ext.nombre || ''} ${ext.apellido || ''}`)
    // drawField('Fecha Inicio:', start ? fmt(new Date(start)) : '')
    drawField('Check-in:', start ? `${fmt(new Date(start))} 13:00 pm` : '')
    drawField('Check-out:', end ? `${fmt(new Date(end))} 09:00 am` : '')
    drawField('Personas:', ext.personas || '')
    drawField('Costo total:', formatCurrency(ext.costo))
    drawField('Seña:', formatCurrency(ext.sena))
    // Saldo = costo - seña
    const costoNum = parseFloat(ext.costo) || 0
    const senaNum = parseFloat(ext.sena) || 0
    const saldo = costoNum - senaNum
    const saldoStr = (ext.costo || ext.sena) ? formatCurrency(saldo) : ''
    drawField('Saldo:', saldoStr)

    // Intentar cargar imagen discreta desde assets/foto.jpg
    try {
        const imgData = await loadImageDataUrlWithAlpha('assets/foto.jpg', 120, 60, 0.12)
        // colocar en esquina superior derecha
        doc.addImage(imgData, 'JPEG', 150, 8, 40, 22)
    } catch (e) {
        // Si falla (CORS o file://) intentar usar imagen embebida en `window.VOUCHER_IMAGE_DATAURL`
        console.warn('No se pudo cargar assets/foto.jpg automáticamente:', e)
        if (window.VOUCHER_IMAGE_DATAURL) {
            try {
                doc.addImage(window.VOUCHER_IMAGE_DATAURL, 'JPEG', 150, 8, 40, 22)
            } catch (err) {
                console.warn('addImage con VOUCHER_IMAGE_DATAURL falló', err)
            }
        } else {
            const input = document.getElementById('voucherImageInput')
            if (!input) {
                console.warn('No existe el input para seleccionar imagen de voucher')
            } else {
                // Esperar a que el usuario seleccione un archivo
                const imgDataFromFile = await new Promise((resolve) => {
                    const handler = async (ev) => {
                        const file = ev.target.files && ev.target.files[0]
                        input.removeEventListener('change', handler)
                        input.value = ''
                        if (!file) return resolve(null)
                        try {
                            const data = await loadImageDataUrlFromFile(file, 120, 60, 0.12)
                            resolve(data)
                        } catch (err) {
                            console.warn('Error leyendo imagen seleccionada', err)
                            resolve(null)
                        }
                    }
                    input.addEventListener('change', handler)
                    input.click()
                })

                if (imgDataFromFile) {
                    try { doc.addImage(imgDataFromFile, 'JPEG', 150, 8, 40, 22) } catch (err) { console.warn('addImage fallo', err) }
                }
            }
        }
    }

    const filename = `voucher_${(ext.nombre || 'reserva').replace(/\s+/g, '_')}.pdf`
    doc.save(filename)
}

/* =========================
   GUARDAR BLOQUEO
========================= */
function guardarBloqueo() {
    const casa = document.getElementById("casaBloqueo").value
    const fecha_inicio = document.getElementById("fecha_inicio_bloqueo").value
    const fecha_fin = document.getElementById("fecha_fin_bloqueo").value

    if (!casa || !fecha_inicio || !fecha_fin) {
        alert("Datos obligatorios")
        return
    }

    if (casa == 1) calendarioActivo = calendarios[1]
    else calendarioActivo = calendarios[2]

    const fecha_fin_date = new Date(fecha_fin + "T00:00:00")
    fecha_fin_date.setDate(fecha_fin_date.getDate() + 1)

    calendarioActivo.addEvent({
        title: "BLOQUEADO",
        start: fecha_inicio,
        end: fecha_fin_date,
        allDay: true,
        color: "red"
    })

    cerrarModalBloquear()
}

/* =========================
   LIMPIAR FORMULARIOS
========================= */
function limpiarFormularioReservas() {
    document.getElementById("casaReserva").value = ""
    document.getElementById("fecha_inicio_reserva").value = ""
    document.getElementById("fecha_fin_reserva").value = ""
    document.getElementById("nombre").value = ""
    document.getElementById("apellido").value = ""
    document.getElementById("telefono").value = ""
    document.getElementById("personas").value = ""
    document.getElementById("costo").value = ""
    document.getElementById("sena").value = ""
}

function limpiarFormularioBloqueo() {
    document.getElementById("fecha_inicio_bloqueo").value = ""
    document.getElementById("fecha_fin_bloqueo").value = ""
}

/* =========================
   INICIALIZACION
========================= */
crearCalendario("cal1", 1)
crearCalendario("cal2", 2)
