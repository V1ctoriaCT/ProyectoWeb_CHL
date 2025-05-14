<?php
// Configuración de conexión para Webcindario 
$host = "mysql.webcindario.com";
$usuario = "cestosbasuras";
$password = "root";
$dbname = "cestosbasuras";

// Conectar a la base de datos
$conexion = new mysqli($host, $usuario, $password, $dbname);

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

// Recibir datos del formulario
$ubicacion = $_POST['ubicacion'];
$descripcion = $_POST['descripcion'];
$tabla = $_POST['tabla']; // 'lleno' o 'danado'

// Validar tabla
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
