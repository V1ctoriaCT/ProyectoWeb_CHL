
document.addEventListener("DOMContentLoaded", function () {

    // Coordenadas del Campus 
    var campusCoords = [18.005345, -94.555404];

    // Crear el mapa y centrarlo en el campus
    var map = L.map('map').setView(campusCoords, 18); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
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
});

setTimeout(function () {
    map.invalidateSize();
}, 500);
