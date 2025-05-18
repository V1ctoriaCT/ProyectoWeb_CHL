<?php
session_start();
if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'personal') {
    header("Location: login.php");
    exit;
}

$conexion = new mysqli("localhost", "root", "", "reportes_basura");
if ($conexion->connect_error) {
    die("Conexión fallida: " . $conexion->connect_error);
}

if (isset($_POST['resolver'])) {
    $id = $_POST['id'];
    $tabla = $_POST['tabla'];

    if ($tabla === 'lleno') {
        $tablaBD = 'reportes_lleno';
    } elseif ($tabla === 'danado') {
        $tablaBD = 'reportes_danado';
    } else {
        die("Tabla inválida.");
    }

    $stmt = $conexion->prepare("UPDATE $tablaBD SET estado = 'resuelto' WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();

    header("Location: panel_admin.php");
}
?>
