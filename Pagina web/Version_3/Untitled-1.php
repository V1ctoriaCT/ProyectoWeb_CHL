<?php
// Conexión a la base de datos
$conexion = new mysqli("localhost", "root", "", "reportes_basura");

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

// Recibir datos del formulario
$ubicacion = $_POST['ubicacion'];
$descripcion = $_POST['descripcion'];
$tabla = $_POST['tabla']; // 'lleno' o 'danado'

// Validar la tabla
if ($tabla !== 'lleno' && $tabla !== 'danado') {
    die("Tipo de reporte no válido.");
}

// Procesar imagen
$imagen_nombre = '';
if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] == 0) {
    $carpeta_destino = "uploads/$tabla/";
    if (!file_exists($carpeta_destino)) {
        mkdir($carpeta_destino, 0777, true);
    }

    $imagen_nombre = basename($_FILES["imagen"]["name"]);
    $ruta_destino = $carpeta_destino . $imagen_nombre;
    move_uploaded_file($_FILES["imagen"]["tmp_name"], $ruta_destino);
}

// Insertar en la tabla correspondiente
$tabla_destino = ($tabla === 'lleno') ? 'reportes_lleno' : 'reportes_danado';
$stmt = $conexion->prepare("INSERT INTO $tabla_destino (ubicacion, descripcion, imagen_nombre) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $ubicacion, $descripcion, $imagen_nombre);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo "Reporte guardado correctamente.";
} else {
    echo "Error al guardar el reporte.";
}

$stmt->close();
$conexion->close();
?>




<?php
// Conexión a la base de datos
$conexion = new mysqli("localhost", "root", "", "reportes_basura");

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

// Recibir datos del formulario
$ubicacion = $_POST['ubicacion'];
$descripcion = $_POST['descripcion'];
$tabla = $_POST['tabla']; // 'lleno' o 'danado'

// Validar la tabla
if ($tabla !== 'lleno' && $tabla !== 'danado') {
    die("Tipo de reporte no válido.");
}

// Procesar imagen
$imagen_nombre = '';
if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] == 0) {
    $carpeta_destino = "uploads/$tabla/";
    if (!file_exists($carpeta_destino)) {
        mkdir($carpeta_destino, 0777, true);
    }

    $imagen_nombre = basename($_FILES["imagen"]["name"]);
    $ruta_destino = $carpeta_destino . $imagen_nombre;
    move_uploaded_file($_FILES["imagen"]["tmp_name"], $ruta_destino);
}

// Insertar en la tabla correspondiente
$tabla_destino = ($tabla === 'lleno') ? 'reportes_lleno' : 'reportes_danado';
$stmt = $conexion->prepare("INSERT INTO $tabla_destino (ubicacion, descripcion, imagen_nombre) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $ubicacion, $descripcion, $imagen_nombre);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo "Reporte guardado correctamente.";
} else {
    echo "Error al guardar el reporte.";
}

$serie = $_POST['serie']; // la serie seleccionada por el usuario

// Obtener los datos del cesto correspondiente
$stmt = $conn->prepare("SELECT tipo, latitud, longitud FROM cestos_basura WHERE serie = ?");
$stmt->bind_param("s", $serie);
$stmt->execute();
$result = $stmt->get_result();
$cesto = $result->fetch_assoc();

$tipo = $cesto['tipo'];
$lat = $cesto['latitud'];
$lon = $cesto['longitud'];

// Insertar el reporte con esos datos
$stmt = $conn->prepare("INSERT INTO reportes_lleno (tipo, serie, latitud, longitud, descripcion, imagen) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssddss", $tipo, $serie, $lat, $lon, $descripcion, $ruta_imagen);
$stmt->execute();



$stmt->close();
$conexion->close();
?>