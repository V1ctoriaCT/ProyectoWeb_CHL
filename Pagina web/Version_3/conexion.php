<?php
$host = "localhost";       // O el IP del servidor
$db = "reportes_basura"; // 🔁 Cámbialo por el nombre real de tu base de datos
$user = "root";            // Usuario por defecto en WAMP
$pass = "";                // Contraseña por defecto en WAMP (normalmente vacía)

try {
    $conexion = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}
?>
