<?php 
$conn = new mysqli("localhost", "root", "", "reportes_basura");
if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

// Recibir variables del formulario
$serie = $_POST['serie'] ?? '';
$descripcion = $_POST['descripcion'] ?? '';
$tipo_reporte = $_POST['tipo_reporte'] ?? '';

if ($tipo_reporte !== 'lleno' && $tipo_reporte !== 'danado') {
    die("Tipo de reporte no válido.");
}

// Buscar cesto por serie
$consulta = "SELECT tipo, latitud, longitud, servicio FROM cestos_basura WHERE serie = ?";
$stmt = $conn->prepare($consulta);
$stmt->bind_param("s", $serie);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    die("Cesto no encontrado.");
}

$fila = $resultado->fetch_assoc();
$estadoCesto = strtolower($fila['servicio']); // activo, inactivo, reparación
$tipo = $fila['tipo'];
$lat = $fila['latitud'];
$lon = $fila['longitud'];

if ($estadoCesto !== 'activo') {
    die("Este cesto no está disponible para reportes.");
}

// Procesar imagen si se subió
$imagen_nombre = '';
if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === 0) {
    $carpeta = "uploads/$tipo_reporte/";
    if (!file_exists($carpeta)) {
        mkdir($carpeta, 0777, true);
    }

    $imagen_nombre = basename($_FILES['imagen']['name']);
    $ruta_completa = $carpeta . $imagen_nombre;

    move_uploaded_file($_FILES['imagen']['tmp_name'], $ruta_completa);
}

// Determinar tabla de destino y estado inicial
$tabla = ($tipo_reporte === 'lleno') ? 'reportes_lleno' : 'reportes_danado';
$estado_reporte = "pendiente";

// Insertar reporte
$insert = $conn->prepare("INSERT INTO $tabla (tipo, serie, latitud, longitud, descripcion, imagen_nombre, estado) VALUES (?, ?, ?, ?, ?, ?, ?)");
$insert->bind_param("ssddsss", $tipo, $serie, $lat, $lon, $descripcion, $imagen_nombre, $estado_reporte);
$exito = $insert->execute();

if ($exito) {
    // Actualizar estado del cesto
    $update = $conn->prepare("UPDATE cestos_basura SET servicio = 'inactivo' WHERE serie = ?");
    $update->bind_param("s", $serie);
    $update->execute();
    $update->close();

    echo "Reporte enviado con éxito";
} else {
    echo "Error al guardar el reporte.";
}

$stmt->close();
$insert->close();
$conn->close();
?>
