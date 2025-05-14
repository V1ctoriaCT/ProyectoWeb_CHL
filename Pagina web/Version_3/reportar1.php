<?php
// Conexión a la base de datos
$conn = new mysqli("localhost", "root", "", "reportes_basura");
if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

// Recibir datos del formulario
$serie = $_POST['serie'];
$descripcion = $_POST['descripcion'];
$tabla = $_POST['tabla']; // 'lleno' o 'danado'

// Validar tipo de reporte
if ($tabla !== 'lleno' && $tabla !== 'danado') {
    die("Tipo de reporte no válido.");
}

// Obtener datos del cesto por la serie
$stmt = $conn->prepare("SELECT tipo, latitud, longitud FROM cestos_basura WHERE serie = ?");
$stmt->bind_param("s", $serie);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    die("Cesto no encontrado.");
}

$cesto = $result->fetch_assoc();
$tipo = $cesto['tipo'];
$lat = $cesto['latitud'];
$lon = $cesto['longitud'];

$stmt->close();

// Procesar imagen
$imagen_nombre = '';
$ruta_imagen = '';
if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] == 0) {
    $carpeta_destino = "uploads/$tabla/";
    if (!file_exists($carpeta_destino)) {
        mkdir($carpeta_destino, 0777, true);
    }

    $imagen_nombre = basename($_FILES["imagen"]["name"]);
    $ruta_imagen = $carpeta_destino . $imagen_nombre;
    move_uploaded_file($_FILES["imagen"]["tmp_name"], $ruta_imagen);
}

// Insertar en la tabla correspondiente
$tabla_destino = ($tabla === 'lleno') ? 'reportes_lleno' : 'reportes_danado';
$stmt = $conn->prepare("INSERT INTO $tabla_destino (tipo, serie, latitud, longitud, descripcion, imagen_nombre) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssddss", $tipo, $serie, $lat, $lon, $descripcion, $imagen_nombre);
$stmt->execute();

// Cambiar el estado del cesto a 'inactivo'
$update = $conn->prepare("UPDATE cestos_basura SET servicio = 'inactivo' WHERE serie = ?");
$update->bind_param("s", $serie);
$update->execute();

// Mensaje de éxito o error
if ($stmt->affected_rows > 0) {
    echo "Reporte guardado correctamente.";
} else {
    echo "Error al guardar el reporte.";
}

// Cerrar conexiones
$stmt->close();
$update->close();
$conn->close();
?>