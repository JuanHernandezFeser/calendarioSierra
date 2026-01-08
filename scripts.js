let calendarioActivo = null

const calendarios = []

//FUNCIONES FLECHAS NEXT Y PREV
document.getElementById("nextBtn").addEventListener("click", () => {
    console.log("DATO 1")
    console.log(calendarios[1].getDate());
    calendarios[1].next();

    const fecha = calendarios[1].getDate();
    console.log("DATO 2")
    console.log(fecha);
    calendarios[2].gotoDate(fecha);

});

document.getElementById("prevBtn").addEventListener("click", () => {
    calendarios[1].prev();

    const fecha = calendarios[1].getDate();
    calendarios[2].gotoDate(fecha);

});

// FUNCION BOTON HOY
document.getElementById("todayBtn").addEventListener("click", () => {
  const hoy = new Date();

  calendarios[1].gotoDate(hoy);
  calendarios[2].gotoDate(hoy);

});

function crearCalendario(id, casaId) {
    const calendar = new FullCalendar.Calendar(
        document.getElementById(id),
        {
            initialView: "dayGridWeek",
            locale: "es",
            height: "auto",

            selectable: true,
            selectMirror: true,

            allDaySlot: false,

            headerToolbar: {
                left: "",
                center: "title",
                right: ""
            },
            eventClick: function (info) {
                abrirModalEvento(info.event);
            }
        }
    )

    calendar.render()

    calendarios[casaId] = calendar

}

function abrirModalReservas() {
    document.getElementById("modalReservas").style.display = "flex"
}

function abrirModalBloquear() {
    document.getElementById("modalBloquear").style.display = "flex"
}

function abrirModalEvento(evento) {
    console.log(evento)
    document.getElementById("modalNombre").textContent = evento.title;
    document.getElementById("modalInicio").textContent = evento.start.toLocaleDateString("es-AR");
    document.getElementById("modalFin").textContent =
        evento.end
            ? new Date(evento.end.getTime() - 86400000).toLocaleDateString("es-AR")
            : "";

    document.getElementById("modalPersonas").textContent = evento.extendedProps.personas;
    document.getElementById("modalCosto").textContent = formatoPesos(evento.extendedProps.costo);
    document.getElementById("modalSena").textContent = formatoPesos(evento.extendedProps.sena);

    abrirModalReservas();
}


function cerrarModalReservas() {
    document.getElementById("modalReservas").style.display = "none"

    limpiarFormularioReservas()
}

function cerrarModalBloquear() {
    document.getElementById("modalBloquear").style.display = "none"

    limpiarFormularioBloqueo()
}

// FUNCION GUARDAR RESERVA
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

    if (!nombre || nombre.trim() === "" || nombre.length === 0 || nombre == null || !apellido || apellido.trim() === "" || apellido.length === 0 || apellido == null) {
        alert("Nombre y apellido son obligatorios")
        return
    } else if (!casa || casa.trim() === "" || casa.length === 0 || casa == null) {
        alert("Debe seleccionar una casa")
        return
    } else if (!fecha_inicio || fecha_inicio.trim() === "" || fecha_inicio.length === 0 || fecha_inicio == null) {
        alert("Fecha de inicio es obligatoria")
        return
    } else if (!fecha_fin || fecha_fin.trim() === "" || fecha_fin.length === 0 || fecha_fin == null) {
        alert("Fecha de fin es obligatoria")
        return
    } else if (new Date(fecha_fin) < new Date(fecha_inicio)) {
        alert("La fecha de fin no puede ser anterior a la fecha de inicio")
        return
    }

    // SE CREA EL EVENTO PARA GUARDAR

    const evento = {
        nombre: nombre,
        apellido: apellido,
        telefono: telefono,
        fecha_inicio: fecha_inicio,
        fecha_fin: fecha_fin,
        personas: personas,
        costo: costo,
        sena: sena,
        casa_id: casa
    }

    // SE AGREGA EL EVENTO AL CALENDARIO CORRESPONDIENTE

    if (evento.casa_id == 1) {
        calendarioActivo = calendarios[1]
    } else {
        calendarioActivo = calendarios[2]
    }

    const fecha_fin_date = new Date(evento.fecha_fin + "T00:00:00");
    fecha_fin_date.setDate(fecha_fin_date.getDate() + 1);

    calendarioActivo.addEvent({
        title: evento.nombre + " " + evento.apellido,
        start: evento.fecha_inicio,
        end: fecha_fin_date,
        allDay: true,
        extendedProps: {
            personas: evento.personas,
            costo: evento.costo,
            sena: evento.sena,
            telefono: evento.telefono,
        }
    })
    cerrarModalReservas()
}

// FUNCION GUARDAR BLOQUEO
function guardarBloqueo() {
    const casa = document.getElementById("casaBloqueo").value
    const fecha_inicio = document.getElementById("fecha_inicio_bloqueo").value
    const fecha_fin = document.getElementById("fecha_fin_bloqueo").value

    if (!casa || casa.trim() === "" || casa.length === 0 || casa == null) {
        alert("Debe seleccionar una casa")
        return
    } else if (!fecha_inicio || fecha_inicio.trim() === "" || fecha_inicio.length === 0 || fecha_inicio == null) {
        alert("Fecha de inicio es obligatoria")
        return
    } else if (!fecha_fin || fecha_fin.trim() === "" || fecha_fin.length === 0 || fecha_fin == null) {
        alert("Fecha de fin es obligatoria")
        return
    } else if (new Date(fecha_fin) < new Date(fecha_inicio)) {
        alert("La fecha de fin no puede ser anterior a la fecha de inicio")
        return
    }

    // SE CREA EL EVENTO DE BLOQUEO PARA GUARDAR
    const evento = {
        fecha_inicio: fecha_inicio,
        fecha_fin: fecha_fin,
        casa_id: casa
    }

    // SE AGREGA EL EVENTO AL CALENDARIO CORRESPONDIENTE
    if (evento.casa_id == 1) {
        calendarioActivo = calendarios[1]
    } else {
        calendarioActivo = calendarios[2]
    }

    const fecha_fin_date = new Date(evento.fecha_fin + "T00:00:00");
    fecha_fin_date.setDate(fecha_fin_date.getDate() + 1);

    calendarioActivo.addEvent({
        title: "BLOQUEADO",
        start: evento.fecha_inicio,
        end: fecha_fin_date,
        allDay: true,
        color: 'red'
    })

    cerrarModalBloquear()
}

//FUNCION LIMPIAR FORMULARIO UNA VEZ QUE SE CIERRA
function limpiarFormularioReservas() {
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

// SE RENDERIZAN LOS CALENDARIOS PARA CADA CASA
crearCalendario("cal1", 1)
crearCalendario("cal2", 2)