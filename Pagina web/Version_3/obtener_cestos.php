
<?php
// Conexión a la base de datos
$conn = new mysqli("localhost", "root", "", "reportes_basura");

// Verifica si hay error en la conexión
if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

$conn->set_charset("utf8");

// Si se proporciona el tipo, obtenemos las series relacionadas
if (isset($_GET['tipo'])) {
    $tipo = $_GET['tipo'];

    $stmt = $conn->prepare("SELECT serie, latitud, longitud, servicio FROM cestos_basura WHERE tipo = ?");

    if (!$stmt) {
        die("Error al preparar la consulta: " . $conn->error);
    }

    $stmt->bind_param("s", $tipo);
    $stmt->execute();
    $result = $stmt->get_result();

    $series = [];
    while ($row = $result->fetch_assoc()) {
        $series[] = $row;
    }
    echo json_encode($series);
    $stmt->close();

} else {
    // Si no se proporciona el tipo, obtenemos todos los tipos distintos
    $sql = "SELECT DISTINCT tipo FROM cestos_basura";
    $result = $conn->query($sql);

    $tipos = [];
    while ($row = $result->fetch_assoc()) {
        $tipos[] = $row['tipo'];
    }
    echo json_encode($tipos);

}

$conn->close();
?>
