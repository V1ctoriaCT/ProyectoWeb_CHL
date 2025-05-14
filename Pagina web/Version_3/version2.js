document.addEventListener("DOMContentLoaded", function () {

// Coordenadas del Instituto Tecnológico Nacional de México Campus Minatitlán
var campusCoords = [18.005345, -94.555404];

// Crear el mapa en el div con id "map" y centrarlo en el campus
var map = L.map('map').setView(campusCoords, 18); // Nivel de zoom 16

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
attribution: '&copy; OpenStreetMap & CartoDB',
subdomains: 'abcd',
maxZoom: 19


}).addTo(map);

// Recuperar ubicación guardada
var savedLocation = localStorage.getItem("userLocation");
var userMarker;

if (savedLocation) {
    let coords = JSON.parse(savedLocation);
    userMarker = L.marker([coords.lat, coords.lon], { draggable: true }).addTo(map)
        .bindPopup("Ubicación guardada (Arrastra para cambiar)").openPopup();
    map.setView([coords.lat, coords.lon], 19);
} else {
    userMarker = L.marker([0, 0], { draggable: true }).addTo(map);
}

// Opciones para mejorar precisión
var geoOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
};

// Función para actualizar la ubicación
function updateLocation(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    var accuracy = position.coords.accuracy;

    userMarker.setLatLng([lat, lon])
        .bindPopup("Ubicación exacta (±" + accuracy.toFixed(1) + "m)").openPopup();
    map.setView([lat, lon], 19);

    // Guardar ubicación en localStorage
    localStorage.setItem("userLocation", JSON.stringify({ lat, lon }));
}

// Evento para arrastrar el marcador manualmente
userMarker.on("dragend", function (e) {
    var newCoords = e.target.getLatLng();
    localStorage.setItem("userLocation", JSON.stringify({ lat: newCoords.lat, lon: newCoords.lng }));
    userMarker.bindPopup("Ubicación guardada").openPopup();
});

// Manejo de errores
function locationError(error) {
    console.error("Error de geolocalización:", error.message);
}

// Si no hay ubicación guardada, solicitar GPS
if (!savedLocation && "geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(updateLocation, locationError, geoOptions);
}

// Selecciona todos los botones que abren modales
document.querySelectorAll("[data-modal]").forEach(button => {
    button.addEventListener("click", function () {
        const modalId = this.getAttribute("data-modal");
        toggleModal(modalId, true);
    });
});

// Selecciona todos los botones de cerrar modales
document.querySelectorAll(".close").forEach(closeButton => {
    closeButton.addEventListener("click", function () {
        const modal = this.closest(".modal");
        toggleModal(modal.id, false);
    });
});

// Cierra el modal si se hace clic fuera del contenido
document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            toggleModal(modal.id, false);
        }
    });
});

// Función para abrir/cerrar modales
function toggleModal(id, show) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.toggle("active", show);
    }
}

// Función para pantalla completa
function toggleFullscreen() {
    const mapContainer = document.getElementById("map");

    if (!document.fullscreenElement) {
        // Entrar 
        if (mapContainer.requestFullscreen) {
            mapContainer.requestFullscreen();
        } else if (mapContainer.mozRequestFullScreen) { 
            mapContainer.mozRequestFullScreen();
        } else if (mapContainer.webkitRequestFullscreen) { 
            mapContainer.webkitRequestFullscreen();
        } else if (mapContainer.msRequestFullscreen) { 
            mapContainer.msRequestFullscreen();
        }
    } else {
        // Salir 
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { 
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { 
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { 
            document.msExitFullscreen();
        }
    }
}


document.getElementById("fullscreen-button").addEventListener("click", function (e) {
    e.preventDefault(); 
    toggleFullscreen(); 
});

// Ajustar el tamaño del mapa al cambiar a pantalla completa
document.addEventListener("fullscreenchange", function () {
    setTimeout(function () {
        map.invalidateSize(); 
    }, 300);
});

function cargarTiposYSeries(tipoId, serieId) {
const tipoSelect = document.getElementById(tipoId);
const serieSelect = document.getElementById(serieId);

// Cargar tipos únicos desde la base de datos
fetch('obtener_cestos.php')
    .then(response => response.json())
    .then(data => {
        tipoSelect.innerHTML = '<option value="">--Seleccionar tipo--</option>';
       // [...new Set(data.map(c => c.tipo))].forEach(tipo => {
            data.forEach(tipo => {

            const option = document.createElement('option');
            option.value = tipo;
            option.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
            tipoSelect.appendChild(option);
        });
    });

// Evento para cargar series cuando se elige un tipo
tipoSelect.addEventListener('change', () => {
    const tipoSeleccionado = tipoSelect.value;
    fetch(`obtener_cestos.php?tipo=${tipoSeleccionado}`)
        .then(response => response.json())
        .then(data => {
            serieSelect.innerHTML = '<option value="">--Seleccionar serie--</option>';
            data.forEach(cesto => {
                const option = document.createElement('option');
                option.value = cesto.serie;
                option.textContent = cesto.serie;
                option.setAttribute("data-lat", cesto.latitud);
                option.setAttribute("data-lon", cesto.longitud);
                serieSelect.appendChild(option);
            });


serieSelect.addEventListener("change", function () {
const selectedOption = serieSelect.options[serieSelect.selectedIndex];
const lat = selectedOption.getAttribute("data-lat");
const lon = selectedOption.getAttribute("data-lon");

if (lat && lon) {
    const coords = [parseFloat(lat), parseFloat(lon)];
    L.marker(coords).addTo(map)
        .bindPopup(`Cesto: ${selectedOption.value}`).openPopup();
    map.setView(coords, 19);
}


});

});
});


}

// Cargar para ambos formularios
cargarTiposYSeries('tipoLleno', 'serieLleno');
cargarTiposYSeries('tipoDanado', 'serieDanado');

cargarReportes();

});

setTimeout(function () {
map.invalidateSize();
}, 500);

// Esta función puede ir FUERA
function cargarReportes() {
console.log("Cargando reportes...");
fetch("./cargar_reportes.php")

.then(res => res.json())
    .then(data => {
        const contenedor = document.getElementById("lista-reportes");
        console.log("Datos recibidos:", data);

        if (!contenedor) return;

        contenedor.innerHTML = ""; // Limpiar antes de agregar

        if (data.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center;'>No hay reportes disponibles.</p>";
        return;
        }


        data.forEach(reporte => {
            const div = document.createElement("div");
            div.className = "tarjeta-reporte";

            const estadoClase = reporte.estado === "resuelto" ? "resuelto" : "pendiente";

            div.innerHTML = `
<span class="estado ${estadoClase}">${reporte.estado}</span>
<img src="${reporte.imagen}" alt="Reporte">
<p><strong>Reporte:</strong> ${reporte.tipo}</p>
<p><strong>Serie:</strong> ${reporte.serie}</p>
<p><strong>Ubicación:</strong> (${reporte.latitud}, ${reporte.longitud})</p> 
<p><strong>Descripción:</strong> ${reporte.descripcion}</p>
<p><small>Fecha: ${reporte.fecha_reporte}</small></p>


`;

contenedor.appendChild(div);
        });
    })
    .catch(err => {
        console.error("Error al cargar reportes:", err);
    });


}