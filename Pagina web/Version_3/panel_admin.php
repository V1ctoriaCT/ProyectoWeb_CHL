<?php
session_start();
if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'personal') {
    header("Location: login.php");
    exit;
}

// Conexión a la base de datos local (WAMP)
$conexion = new mysqli("localhost", "root", "", "reportes_basura");
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

// Obtener reportes
$llenos = $conexion->query("SELECT * FROM reportes_lleno ORDER BY fecha_reporte DESC");
$danados = $conexion->query("SELECT * FROM reportes_danado ORDER BY fecha_reporte DESC");
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel del Personal</title>
    <link rel="stylesheet" type="text/css" href="style7.2_version3.css">
</head>
<body>

<div class="page-container">

    <img src="logo.png" alt="Logo" class="logo">

    <header>Ubicación de Cestos de Basura </header>

    <nav>
        <a>Panel del Personal de Limpieza</a> 
    </nav>

    <div class="main-content">

        <h2>Reportes de Cestos Llenos</h2>
        <div class="reportes">
        <?php while ($row = $llenos->fetch_assoc()): ?>
            <div class="tarjeta">
                <span class="estado <?= $row['estado'] === 'resuelto' ? 'resuelto' : 'pendiente' ?>">
                    <?= ucfirst($row['estado']) ?>
                </span>
                <img src="uploads/lleno/<?= htmlspecialchars($row['imagen_nombre']) ?>" alt="Imagen">
                <p><strong>Ubicación:</strong> Lat: <?= htmlspecialchars($row['latitud']) ?>, Lng: <?= htmlspecialchars($row['longitud']) ?></p>
                <p><strong>Descripción:</strong> <?= htmlspecialchars($row['descripcion']) ?></p>
                <p><small>Fecha: <?= $row['fecha_reporte'] ?></small></p>

                <?php if ($row['estado'] === 'pendiente'): ?>
                    <form method="POST" action="acciones.php">
                        <input type="hidden" name="id" value="<?= $row['id'] ?>">
                        <input type="hidden" name="tabla" value="lleno">
                        <button type="submit" name="resolver">Marcar como resuelto</button>
                    </form>
                <?php endif; ?>
            </div>
        <?php endwhile; ?>
        </div>

        <h2>Reportes de Cestos Dañados</h2>
        <div class="reportes">
        <?php while ($row = $danados->fetch_assoc()): ?>
            <div class="tarjeta">
                <span class="estado <?= $row['estado'] === 'resuelto' ? 'resuelto' : 'pendiente' ?>">
                    <?= ucfirst($row['estado']) ?>
                </span>
                <img src="uploads/danado/<?= htmlspecialchars($row['imagen_nombre']) ?>" alt="Imagen">
                <p><strong>Ubicación:</strong> Lat: <?= htmlspecialchars($row['latitud']) ?>, Lng: <?= htmlspecialchars($row['longitud']) ?></p>
                <p><strong>Descripción:</strong> <?= htmlspecialchars($row['descripcion']) ?></p>
                <p><small>Fecha: <?= $row['fecha_reporte'] ?></small></p>

                <?php if ($row['estado'] === 'pendiente'): ?>
                    <form method="POST" action="acciones.php">
                        <input type="hidden" name="id" value="<?= $row['id'] ?>">
                        <input type="hidden" name="tabla" value="danado">
                        <button type="submit" name="resolver">Marcar como resuelto</button>
                    </form>
                <?php endif; ?>
            </div>
        <?php endwhile; ?>
        </div>

    </div> <!-- main-content -->

    <div class="footer">
        <form action="logout.php" method="POST">
            <button type="submit" class="btn-cerrar-sesion">Cerrar sesión</button>
        </form>
    </div>

</div> <!-- page-container -->

</body>
</html>

