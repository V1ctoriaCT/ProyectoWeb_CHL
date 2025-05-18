
<?php
include("conexion.php");

$serie = $_POST['serie']; // Recibe la serie del cesto del formulario

// Cambiar estado del reporte a resuelto
$stmt = $conn->prepare("UPDATE reportes_lleno SET estado = 'resuelto' WHERE serie = ?");
$stmt->bind_param("s", $serie);
$stmt->execute();

// Cambiar estado del cesto a activo
$stmt = $conn->prepare("UPDATE cestos_basura SET estado = 'activo' WHERE serie = ?");
$stmt->bind_param("s", $serie);
$stmt->execute();

echo "Reporte resuelto y cesto reactivado correctamente.";
?>
