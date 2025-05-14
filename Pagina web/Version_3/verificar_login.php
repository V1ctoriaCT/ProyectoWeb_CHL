<?php
session_start();

// Conexión a la base de datos local en WAMP
$conexion = new mysqli("localhost", "root", "", "reportes_basura");

// Verificar conexión
if ($conexion->connect_error) {
    die("Problemas con la conexión: " . $conexion->connect_error);
}

$usuario = $_POST['usuario'];
$contrasena = $_POST['contrasena'];

// Buscar al usuario
$stmt = $conexion->prepare("SELECT * FROM personal WHERE usuario = ?");
$stmt->bind_param("s", $usuario);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $row = $result->fetch_assoc();

    // Comparar directamente por ahora (luego se recomienda password_verify)
    if ($contrasena === $row['contrasena']) {
        $_SESSION['rol'] = 'personal';
        $_SESSION['usuario'] = $usuario;
        header("Location: panel_admin.php");
        exit;
    }
}

echo "Credenciales incorrectas.";
?>
