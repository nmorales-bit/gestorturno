// ========================================
// SISTEMA DE GESTIÓN DE TURNOS
// ========================================

// Obtener elementos del HTML
const formulario = document.getElementById("formTurno");
const nombreInput = document.getElementById("nombre");
const fechaInput = document.getElementById("fecha");
const horaInput = document.getElementById("hora");
const especialidadInput = document.getElementById("especialidad");

const listaTurnos = document.getElementById("listaTurnos");
const mensaje = document.getElementById("mensaje");
const cantidadTurnos = document.getElementById("cantidadTurnos");


// ========================================
// CARGAR TURNOS GUARDADOS
// ========================================

let turnos = JSON.parse(localStorage.getItem("turnos")) || [];


// ========================================
// FECHA DE HOY (formato YYYY-MM-DD)
// ========================================

function obtenerFechaHoy() {

    const hoy = new Date();

    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

const fechaHoy = obtenerFechaHoy();

// Bloquear selección de fechas anteriores a hoy
fechaInput.min = fechaHoy;


// ========================================
// GENERAR FRANJAS HORARIAS (cada 30 min, 8:00 a 18:00)
// ========================================

function generarHorarios() {

    const horaInicio = 8;   // 8 AM
    const horaFin = 18;     // 18 (6 PM)

    for (let h = horaInicio; h <= horaFin; h++) {

        for (const min of ["00", "30"]) {

            // No agregar 18:30, el límite es 18:00
            if (h === horaFin && min === "30") {
                continue;
            }

            const horaFormateada = `${String(h).padStart(2, "0")}:${min}`;

            const opcion = document.createElement("option");

            opcion.value = horaFormateada;
            opcion.textContent = horaFormateada;

            horaInput.appendChild(opcion);
        }
    }
}

generarHorarios();


// ========================================
// MOSTRAR TURNOS
// ========================================

function mostrarTurnos() {

    listaTurnos.innerHTML = "";

    // Ordenar por fecha y horario
    turnos.sort((a, b) => {

        const turnoA = `${a.fecha}T${a.hora}`;
        const turnoB = `${b.fecha}T${b.hora}`;

        return turnoA.localeCompare(turnoB);
    });


    // Actualizar contador
    cantidadTurnos.textContent = turnos.length;


    // Si no existen turnos
    if (turnos.length === 0) {

        listaTurnos.innerHTML = `
            <div class="sin-turnos">

                <div class="icono-vacio">📅</div>

                <h3>No hay turnos registrados</h3>

                <p>
                    Utilizá el formulario para agregar el primer turno.
                </p>

            </div>
        `;

        return;
    }


    // Crear cada turno
    turnos.forEach(turno => {

        const tarjeta = document.createElement("article");

        tarjeta.classList.add("turno");

        tarjeta.innerHTML = `

            <div class="fecha-hora">

                <span class="hora">
                    ${turno.hora}
                </span>

                <span class="fecha">
                    ${formatearFecha(turno.fecha)}
                </span>

            </div>


            <div class="info-paciente">

                <h3>
                    ${turno.nombre}
                </h3>

                <p>
                    Turno médico
                </p>

                <span class="especialidad">
                    ${turno.especialidad}
                </span>

            </div>


            <button
                class="btn-eliminar"
                onclick="eliminarTurno(${turno.id})"
                title="Eliminar turno"
            >
                🗑
            </button>

        `;

        listaTurnos.appendChild(tarjeta);

    });

}


// ========================================
// GUARDAR TURNO
// ========================================

formulario.addEventListener("submit", function(event) {

    event.preventDefault();


    // Obtener valores
    const nombre = nombreInput.value.trim();
    const fecha = fechaInput.value;
    const hora = horaInput.value;
    const especialidad = especialidadInput.value;


    // ====================================
    // VALIDACIÓN
    // ====================================

    if (!nombre || !fecha || !hora || !especialidad) {

        mostrarMensaje(
            "Completá todos los campos.",
            "error"
        );

        return;
    }


    // ====================================
    // VERIFICAR QUE LA FECHA NO SEA ANTERIOR A HOY
    // ====================================

    if (fecha < fechaHoy) {

        mostrarMensaje(
            "⚠️ No podés registrar un turno en una fecha anterior a hoy.",
            "error"
        );

        return;
    }


    // ====================================
    // VERIFICAR HORARIO REPETIDO
    // ====================================

    const horarioOcupado = turnos.some(turno => {

        return turno.fecha === fecha &&
               turno.hora === hora;

    });


    if (horarioOcupado) {

        mostrarMensaje(
            "⚠️ Ese horario ya está ocupado.",
            "error"
        );

        return;
    }


    // ====================================
    // CREAR NUEVO TURNO
    // ====================================

    const nuevoTurno = {

        id: Date.now(),

        nombre: nombre,

        fecha: fecha,

        hora: hora,

        especialidad: especialidad

    };


    // Agregar a la lista
    turnos.push(nuevoTurno);


    // Guardar en el navegador
    localStorage.setItem(
        "turnos",
        JSON.stringify(turnos)
    );


    // Mostrar nuevamente
    mostrarTurnos();


    // Limpiar formulario
    formulario.reset();


    // Mostrar mensaje
    mostrarMensaje(
        "✓ Turno guardado correctamente.",
        "exito"
    );

});


// ========================================
// ELIMINAR TURNO
// ========================================

function eliminarTurno(id) {

    const confirmar = confirm(
        "¿Querés eliminar este turno?"
    );


    if (!confirmar) {
        return;
    }


    // Filtrar el turno seleccionado
    turnos = turnos.filter(turno => {

        return turno.id !== id;

    });


    // Actualizar localStorage
    localStorage.setItem(
        "turnos",
        JSON.stringify(turnos)
    );


    // Actualizar pantalla
    mostrarTurnos();


    mostrarMensaje(
        "Turno eliminado correctamente.",
        "exito"
    );
}


// ========================================
// FORMATEAR FECHA
// ========================================

function formatearFecha(fecha) {

    const partes = fecha.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


// ========================================
// MOSTRAR MENSAJES
// ========================================

function mostrarMensaje(texto, tipo) {

    mensaje.textContent = texto;

    mensaje.className = `mensaje ${tipo}`;


    setTimeout(() => {

        mensaje.textContent = "";

        mensaje.className = "mensaje";

    }, 3000);
}


// ========================================
// INICIAR APLICACIÓN
// ========================================

mostrarTurnos();