<?php
header("Content-Type: application/json");
require("conexion.php");

try {
    $stmt = $conexion->query("SELECT tipo, serie, servicio, latitud, longitud FROM cestos_basura");
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($resultados);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>

