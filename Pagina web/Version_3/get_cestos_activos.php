<?php
$conn = new mysqli("localhost", "root", "", "reportes_basura");
if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

$sql = "SELECT tipo, serie FROM cestos_basura WHERE servicio = 'activo'";
$result = $conn->query($sql);

$cestos = [];
while ($row = $result->fetch_assoc()) {
    $cestos[] = $row;
}

header('Content-Type: application/json');
echo json_encode($cestos);

$conn->close();
?>
