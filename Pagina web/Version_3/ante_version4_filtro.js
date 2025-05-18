document.addEventListener("DOMContentLoaded", function () {
    // Mapa
    const map = L.map('map').setView([18.005345, -94.555404], 18);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap & CartoDB',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Íconos
    const iconoOrganico = L.icon({
        iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-green.png',
        iconSize: [28, 35], iconAnchor: [14, 34], popupAnchor: [0, -30]
    });

    const iconoInorganico = L.icon({
        iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-grey.png',
        iconSize: [28, 35], iconAnchor: [14, 34], popupAnchor: [0, -30]
    });
    const iconoNoDisponible = L.icon({
    iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-orange.png', // Naranja oscuro, estilo pin
    iconSize: [30, 40], iconAnchor: [15, 40], popupAnchor: [0, -35]
});

    const iconoMoradoClaro = L.icon({
    iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-violet.png', // Morado claro, estilo pin
    iconSize: [30, 40], iconAnchor: [15, 40], popupAnchor: [0, -35]
});

    // Filtros     
    let modoCercanosActivo = false;
    let filtroOrganicoActivo = false;
    let filtroInorganicoActivo = false;
    let marcadoresCestos = [];

    function limpiarMarcadores() {
    marcadoresCestos.forEach(marker => map.removeLayer(marker));
    marcadoresCestos = [];
}

    function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radio de la tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // en metros
}




function cargarCestosFiltrados() {
        fetch("obtener_cestos_mapa.php")
            .then(res => res.json())
            .then(data => {
                limpiarMarcadores();

                data.forEach(cesto => {
                    const tipo = cesto.tipo.trim().toLowerCase();
                    const servicio = cesto.servicio.toLowerCase();
                    const esOrganico = tipo === "orgánico";
                    const esInorganico = tipo === "inorgánico";
                    const noDisponible = servicio === "inactivo" || servicio === "reparación";

                    const lat = parseFloat(cesto.latitud);
                    const lon = parseFloat(cesto.longitud);

                    let mostrar = false;
                    if (!filtroOrganicoActivo && !filtroInorganicoActivo) {
                        mostrar = true;
                    } else if (filtroOrganicoActivo && !filtroInorganicoActivo && esOrganico) {
                        mostrar = true;
                    } else if (!filtroOrganicoActivo && filtroInorganicoActivo && esInorganico) {
                        mostrar = true;
                    } else if (filtroOrganicoActivo && filtroInorganicoActivo && (esOrganico || esInorganico)) {
                        mostrar = true;
                    }

                    if (!mostrar) return;

                    let icono = iconoMoradoClaro;
                    if (noDisponible) {
                        icono = iconoNoDisponible;
                    } else if (esOrganico && filtroOrganicoActivo) {
                        icono = iconoOrganico;
                    } else if (esInorganico && filtroInorganicoActivo) {
                        icono = iconoInorganico;
                    }

                    const popup = `<strong>Tipo:</strong> ${cesto.tipo}<br><strong>Serie:</strong> ${cesto.serie}<br><strong>Servicio:</strong> ${cesto.servicio}`;
                    const marker = L.marker([lat, lon], { icon: icono }).addTo(map).bindPopup(popup);
                    marcadoresCestos.push(marker);
                });
            });
    }

    function mostrarCercanos() {
        const ubicacionUsuario = userMarker?.getLatLng();
        if (!ubicacionUsuario) {
            alert("Ubicación del usuario no disponible.");
            return;
        }

        fetch("obtener_cestos_mapa.php")
            .then(res => res.json())
            .then(data => {
                limpiarMarcadores();

                const activos = data.filter(c => c.servicio.toLowerCase() === "activo");
                const conDistancia = activos.map(c => {
                    const tipo = c.tipo.trim().toLowerCase();
                    const lat = parseFloat(c.latitud);
                    const lon = parseFloat(c.longitud);
                    const distancia = calcularDistancia(ubicacionUsuario.lat, ubicacionUsuario.lng, lat, lon);
                    return { ...c, tipo, lat, lon, distancia };
                });

                const org = conDistancia.filter(c => c.tipo === "orgánico").sort((a, b) => a.distancia - b.distancia);
                const inorg = conDistancia.filter(c => c.tipo === "inorgánico").sort((a, b) => a.distancia - b.distancia);

                let seleccionados = [];
                if (filtroOrganicoActivo && !filtroInorganicoActivo) {
                    seleccionados = org.slice(0, 2);
                } else if (!filtroOrganicoActivo && filtroInorganicoActivo) {
                    seleccionados = inorg.slice(0, 2);
                } else {
                    seleccionados = [...org.slice(0, 2), ...inorg.slice(0, 2)];
                }

                seleccionados.forEach(c => {
                    const popup = `<strong>Tipo:</strong> ${c.tipo}<br><strong>Serie:</strong> ${c.serie}<br><strong>Servicio:</strong> ${c.servicio}`;
                    const marker = L.marker([c.lat, c.lon], { icon: iconoMoradoClaro }).addTo(map).bindPopup(popup);
                    marcadoresCestos.push(marker);
                });
            })
            .catch(err => console.error("Error al obtener cestos cercanos:", err));
    }

    // Botones de filtro
const filtroOrgBtn = document.getElementById("filtro-organico-btn");
const filtroInorgBtn = document.getElementById("filtro-inorganico-btn");

    filtroOrgBtn?.addEventListener("click", function () {
        filtroOrganicoActivo = !filtroOrganicoActivo;
        this.classList.toggle("selected", filtroOrganicoActivo);
        cargarCestosFiltrados();
    });

    filtroInorgBtn?.addEventListener("click", function () {
        filtroInorganicoActivo = !filtroInorganicoActivo;
        this.classList.toggle("selected", filtroInorganicoActivo);
        cargarCestosFiltrados();
    });

  document.getElementById("mostrar-cercanos")?.addEventListener("click", mostrarCercanos);





    // Ubicación del usuario
    let userMarker;
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
        const coords = JSON.parse(savedLocation);
        userMarker = L.marker([coords.lat, coords.lon], { draggable: true }).addTo(map)
            .bindPopup("Ubicación guardada").openPopup();
        map.setView([coords.lat, coords.lon], 19);
        cargarCestosFiltrados();
    } else {
        userMarker = L.marker([0, 0], { draggable: true }).addTo(map);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(pos => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                userMarker.setLatLng([lat, lon])
                    .bindPopup("Ubicación exacta").openPopup();
                map.setView([lat, lon], 19);
                localStorage.setItem("userLocation", JSON.stringify({ lat, lon }));
                cargarCestosFiltrados();
            });
        }
    }

    function updateLocation(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    userMarker.setLatLng([lat, lon])
        .bindPopup("Ubicación exacta (±" + accuracy.toFixed(1) + "m)").openPopup();
    map.setView([lat, lon], 19);
    localStorage.setItem("userLocation", JSON.stringify({ lat, lon }));

    // Mostrar todos los cestos por primera vez (sin filtros)
    cargarCestosFiltrados(); // Nuevo argumento para mostrar todos
    }

    function locationError(error) {
        console.error("Error de geolocalización:", error.message);
    }

    if (!savedLocation && "geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        userMarker.setLatLng([lat, lon])
            .bindPopup("Ubicación exacta (±" + pos.coords.accuracy.toFixed(1) + "m)").openPopup();
        map.setView([lat, lon], 19);
        localStorage.setItem("userLocation", JSON.stringify({ lat, lon }));

        // Mostrar todos los cestos disponibles sin filtros
        cargarCestosFiltrados();
    }, err => {
        console.error("Error de geolocalización:", err.message);
    }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    });
} else {
    // Si ya hay una ubicación guardada, también cargamos todos
    cargarCestosFiltrados();
}





    // Pantalla completa
    function toggleFullscreen() {
        const mapContainer = document.getElementById("map");
        if (!document.fullscreenElement) {
            if (mapContainer.requestFullscreen) mapContainer.requestFullscreen();
            else if (mapContainer.mozRequestFullScreen) mapContainer.mozRequestFullScreen();
            else if (mapContainer.webkitRequestFullscreen) mapContainer.webkitRequestFullscreen();
            else if (mapContainer.msRequestFullscreen) mapContainer.msRequestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            else if (document.msExitFullscreen) document.msExitFullscreen();
        }
    }

    document.getElementById("fullscreen-button")?.addEventListener("click", function (e) {
        e.preventDefault();
        toggleFullscreen();
    });

    document.addEventListener("fullscreenchange", function () {
        setTimeout(() => map.invalidateSize(), 300);
    });

    // Modales


    document.querySelectorAll("[data-modal]").forEach(button => {
        button.addEventListener("click", function () {
            const modalId = this.getAttribute("data-modal");
            toggleModal(modalId, true);
        });
    });

    document.querySelectorAll(".close").forEach(closeButton => {
        closeButton.addEventListener("click", function () {
            const modal = this.closest(".modal");
            toggleModal(modal.id, false);
        });
    });

    document.querySelectorAll(".modal").forEach(modal => {
        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                toggleModal(modal.id, false);
            }
        });
    });


    // Suponiendo que tienes una función openModal
function openModal(id) {
    document.getElementById(id).style.display = "block";
    if (id === "modalLleno") {
        cargarCestosDisponibles();
    }
}
function mostrarMensaje(texto, tipo = "success") {
    const modal = document.getElementById("modalMensaje");
    const contenido = modal.querySelector(".modal-content");
    const mensajeTexto = document.getElementById("mensajeTexto");

    mensajeTexto.textContent = texto;

    // Estilo según tipo
    contenido.classList.remove("success", "error");
    contenido.classList.add(tipo);

    toggleModal("modalMensaje", true);

    // Auto cerrar después de 3 segundos
    setTimeout(() => {
        toggleModal("modalMensaje", false);
    }, 3000);
}


function configurarEnvioFormulario(formularioId) {
    const formulario = document.getElementById(formularioId);
    formulario.addEventListener('submit', function(event) {
        event.preventDefault();

        const datos = new FormData(formulario);

        fetch('reportar1.php', {
            method: 'POST',
            body: datos
        })
        .then(response => response.text())
        .then(resultado => {
            if (resultado.toLowerCase().includes('éxito')) {
                mostrarMensajeEmergente('Reporte enviado correctamente.', true);
                formulario.reset();
                cerrarModalActivo();
            } else {
                mostrarMensajeEmergente('Error al enviar el reporte.', false);
            }
        })
        .catch(error => {
            console.error('Error en el envío:', error);
            mostrarMensajeEmergente('Error de conexión.', false);
        });
    });
}

configurarEnvioFormulario('formularioLleno');
configurarEnvioFormulario('formularioDanado');

function cargarCestosDisponibles() {
    fetch("obtener_cestos_disponibles.php")
        .then(res => res.json())
        .then(data => {
            const tipoSelect = document.getElementById("tipoLleno");
            const serieSelect = document.getElementById("serieLleno");

            tipoSelect.innerHTML = '<option value="">-Selecciona-</option>';
            serieSelect.innerHTML = '<option value=""> --El cesto primero--</option>';

            // Agrupar por tipo
            const tipos = {};
            data.forEach(cesto => {
                if (!tipos[cesto.tipo]) tipos[cesto.tipo] = [];
                tipos[cesto.tipo].push(cesto.serie);
            });

            // Llenar select de tipo
            Object.keys(tipos).forEach(tipo => {
                const option = document.createElement("option");
                option.value = tipo;
                option.textContent = tipo;
                tipoSelect.appendChild(option);
            });

            // Cambiar series cuando se seleccione un tipo
            tipoSelect.addEventListener("change", () => {
                const tipoSeleccionado = tipoSelect.value;
                serieSelect.innerHTML = '<option value=""> --Selecciona una serie--</option>';
                if (tipos[tipoSeleccionado]) {
                    tipos[tipoSeleccionado].forEach(serie => {
                        const option = document.createElement("option");
                        option.value = serie;
                        option.textContent = serie;
                        serieSelect.appendChild(option);
                    });
                }
            });
        })
        .catch(err => console.error("Error cargando cestos disponibles:", err));
}
    // Cargar tipos y series
    function cargarTiposYSeries(tipoId, serieId) {
        const tipoSelect = document.getElementById(tipoId);
        const serieSelect = document.getElementById(serieId);

        fetch('obtener_cestos.php')
            .then(response => response.json())
            .then(data => {
                tipoSelect.innerHTML = '<option value="">-Seleccionar tipo-</option>';
                data.forEach(tipo => {
                    const option = document.createElement('option');
                    option.value = tipo;
                    option.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
                    tipoSelect.appendChild(option);
                });
            });

        tipoSelect.addEventListener('change', () => {
            const tipoSeleccionado = tipoSelect.value;
            fetch(`obtener_cestos.php?tipo=${tipoSeleccionado}`)
                .then(response => response.json())
                .then(data => {
                    serieSelect.innerHTML = '<option value="">-Seleccionar serie-</option>';
                    data
    .filter(cesto => cesto.servicio.toLowerCase() === "activo")
    .forEach(cesto => {
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

    cargarTiposYSeries('tipoLleno', 'serieLleno');
    cargarTiposYSeries('tipoDanado', 'serieDanado');

    
    // Cargar reportes
    function cargarReportes() {
        fetch("cargar_reportes.php")
            .then(res => res.json())
            .then(data => {
                const contenedor = document.getElementById("lista-reportes");
                if (!contenedor) return;
                contenedor.innerHTML = "";

                if (data.length === 0) {
                    contenedor.innerHTML = "<p style='text-align:center;'>No hay reportes disponibles.</p>";
                    return;
                }

                data.forEach(reporte => {
                    const div = document.createElement("div");
                    div.className = "tarjeta-reporte";
                    const estadoClase = ["pendiente", "proceso", "resuelto"].includes(reporte.estado)
                        ? reporte.estado
                        : "pendiente";

                    div.innerHTML = `
                        <div class="tarjeta-resumen" onclick="expandirTarjeta(this.parentElement)">

                            <span class="estado ${estadoClase}">${reporte.estado}</span>
                            <p><strong>Reporte:</strong> ${reporte.tipo}</p>
                            <p><strong>Serie:</strong> ${reporte.serie}</p>
                        </div>
                        <div class="contenido-expandido">
                            <img src="${reporte.imagen}" alt="Reporte" onclick="abrirImagen('${reporte.imagen}')">
                            <p><strong>Ubicación:<br></strong> (${reporte.latitud}, ${reporte.longitud})</p>
                            <p><strong>Descripción:<br></strong> ${reporte.descripcion}</p>
                            <p><small>Fecha:<br>${reporte.fecha_reporte}</small></p>
                        </div>
                    `;
                    contenedor.appendChild(div);
                });
            })
            .catch(err => {
                console.error("Error al cargar reportes:", err);
            });
    }

    // Cierre automático al hacer clic fuera del menú
    document.addEventListener("click", function (event) {
        const navLinks = document.getElementById("nav-links");
        const menuToggle = document.getElementById("menu-toggle");

        // Cerrar menú si se hace clic fuera
        if (navLinks?.classList.contains("open") && !navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
            navLinks.classList.remove("open");
        }

    });

    function expandirTarjeta(tarjeta) {
        const yaExpandida = tarjeta.classList.contains("expandida");
        
        // Cierra todas las demás primero
        document.querySelectorAll(".tarjeta-reporte.expandida").forEach(t => {
            if (t !== tarjeta) t.classList.remove("expandida");
        });

        // Usa un pequeño retraso para evitar conflicto con el click global
        setTimeout(() => {
            if (!yaExpandida) {
                tarjeta.classList.add("expandida");
            }
        }, 10); // pequeño delay para evitar que el click global lo cierre de inmediato
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

    window.abrirImagen = abrirImagen;
    window.cerrarImagen = cerrarImagen;

    document.getElementById("menu-toggle")?.addEventListener("click", function () {
        document.getElementById("nav-links").classList.toggle("open");
    });


    const sidebars = document.querySelectorAll(".sidebar2");

    sidebars.forEach((sidebar) => {
      const header = sidebar.querySelector(".sidebar2-header");

        header.addEventListener("click", () => {
        sidebar.classList.toggle("open");
      });
    });
    
    setTimeout(() => map.invalidateSize(), 500);
    cargarCestosFiltrados();
    cargarReportes();
});

    function expandirTarjeta(tarjeta) {
        document.querySelectorAll(".tarjeta-reporte.expandida").forEach(t => {
            if (t !== tarjeta) t.classList.remove("expandida");
        });
        tarjeta.classList.toggle("expandida");
    }
    window.expandirTarjeta = expandirTarjeta;


// Modales
    function toggleModal(id, show) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.toggle("active", show);
        }
    }

function mostrarMensajeEmergente(texto, exito = true) {
    const div = document.getElementById("mensajeEmergente");
    if (!div) return;

    div.textContent = texto;
    div.className = "visible"; // Reset clases anteriores
    div.classList.add(exito ? "exito" : "error");

    setTimeout(() => {
        div.className = "";
    }, 3000);
}


function cerrarModalActivo() {
    document.querySelectorAll(".modal.active").forEach(modal => {
        modal.classList.remove("active");
    });
}

    window.mostrarMensajeEmergente = mostrarMensajeEmergente;
    window.toggleModal = toggleModal;
    window.cerrarModalActivo = cerrarModalActivo;
