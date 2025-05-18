function marcarProceso(tabla, serie) {
    fetch('resolver_reporte.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `tabla=${tabla}&serie=${serie}&estado=proceso`
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Confirmar el proceso a resolver.");
            location.reload();
        } else {
            alert("Error al actualizar.");
        }
    });
}

function marcarResuelto(tabla, serie) {
    if (!confirm("¿Deseas marcar este reporte como resuelto?")) return;

    fetch('resolver_reporte.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `tabla=${tabla}&serie=${serie}&estado=resuelto`
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Reporte resuelto.");
            location.reload();
        } else {
            alert("Error al actualizar.");
        }
    });
}

function guardarComentarios(tabla, serie) {
    const textarea = document.getElementById(`comentarios-${tabla}-${serie}`);
    const comentarios = encodeURIComponent(textarea.value.trim());

    if (!comentarios) return alert("El comentarios no puede estar vacío.");

    fetch('resolver_reporte.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `tabla=${tabla}&serie=${serie}&comentarios=${comentarios}`
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Comentarios guardado.");
            location.reload();
        } else {
            alert("No se pudo guardar.");
        }
    });
}

function abrirImagen(src) {
    const visor = document.getElementById("visor-imagen");
    const img = document.getElementById("imagen-ampliada");
    img.src = src;
    visor.style.display = "flex";
}

function cerrarImagen() {
    document.getElementById("visor-imagen").style.display = "none";
}

window.guardarComentarios = guardarComentarios;
window.marcarProceso = marcarProceso;
window.marcarResuelto = marcarResuelto;
window.abrirImagen = abrirImagen;
window.cerrarImagen = cerrarImagen;
