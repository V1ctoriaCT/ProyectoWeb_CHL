<?php
include("conexion.php");
$resultado = $conn->query("SELECT tipo, serie FROM cestos_basura WHERE estado = 'activo'");
$cestos = [];

while ($fila = $resultado->fetch_assoc()) {
    $cestos[] = $fila;
}

echo json_encode($cestos);
?>
