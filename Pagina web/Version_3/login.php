<?php
session_start();
if (isset($_SESSION['rol']) && $_SESSION['rol'] === 'personal') {
    header("Location: panel_admin.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Personal de Limpieza</title>
    <link rel="stylesheet" href="style7.2_version3.css"> 
    
</head>
<body>

    <img src="logo.png" alt="Logo" class="logo">

    <header>Ubica los Cestos de Basura</header>

    <nav><a>Acceso Personal Autorizado</a></nav>

    <div class="login-container">
        <form method="POST" action="verificar_login.php" class="form-login">
            <input type="text" name="usuario" placeholder="Usuario" required>
            <input type="password" name="contraseña" placeholder="Contraseña" required>
            <center><button type="submit" class="btn-login">Iniciar Sesión</button></center>
        </form>

        <!-- Botón para volver -->
        <a href="index.html" class="btn-volver">Volver a página principal</a>
    </div>

</body>
</html>