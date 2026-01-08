let calendarioActivo = null

const calendarios = []

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
    document.getElementById("modalReservas").style.display = "flex"
    actualizarColoresPorCasa() // ⭐
}

function abrirModalBloquear() {
    document.getElementById("modalBloquear").style.display = "flex"
}

function cerrarModalReservas() {
    document.getElementById("modalReservas").style.display = "none"
    limpiarFormularioReservas()
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
            personas,
            costo,
            sena,
            telefono
        }
    })

    cerrarModalReservas()
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
