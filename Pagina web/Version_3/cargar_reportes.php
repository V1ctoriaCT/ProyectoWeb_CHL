
<?php
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

$conexion = new mysqli("localhost", "root", "", "reportes_basura");
if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión"]);
    exit;
}

$resultados = [];

// Obtener los 3 más recientes de cada tipo
$llenos = $conexion->query("SELECT latitud, longitud, descripcion, imagen_nombre, estado, fecha_reporte, serie FROM reportes_lleno ORDER BY fecha_reporte DESC LIMIT 3");
if ($llenos) {
    while ($row = $llenos->fetch_assoc()) {
        $row['tipo'] = 'Lleno';
        $row['estado'] = strtolower(trim($row['estado'] ?? 'pendiente'));
        $row['imagen'] = 'uploads/lleno/' . $row['imagen_nombre']; 
        $resultados[] = $row;
    }
}

$danados = $conexion->query("SELECT latitud, longitud, descripcion, imagen_nombre, estado, fecha_reporte, serie FROM reportes_danado ORDER BY fecha_reporte DESC LIMIT 3");
if ($danados) {
    while ($row = $danados->fetch_assoc()) {
        $row['tipo'] = 'Dañado';
        $row['estado'] = strtolower(trim($row['estado'] ?? 'pendiente'));
        $row['imagen'] = 'uploads/danado/' . $row['imagen_nombre'];
        $resultados[] = $row;
    }
}

// Puedes ordenar por fecha total si lo deseas:
usort($resultados, function($a, $b) {
    return strtotime($b['fecha_reporte']) - strtotime($a['fecha_reporte']);
});

echo json_encode($resultados);
?>


