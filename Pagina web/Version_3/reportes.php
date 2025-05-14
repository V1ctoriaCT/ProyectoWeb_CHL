<?php
// Conexión a la base de datos Webcindario
$host = "mysql.webcindario.com";
$usuario = "cestosbasuras";
$password = "root";
$dbname = "cestosbasuras";

$conexion = new mysqli($host, $usuario, $password, $dbname);
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

// Consultar ambas tablas
$llenos = $conexion->query("SELECT * FROM reportes_lleno ORDER BY fecha_reporte DESC");
$danados = $conexion->query("SELECT * FROM reportes_danado ORDER BY fecha_reporte DESC");
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reportes de Cestos</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f4f8;
            padding: 20px;
        }
        h2 {
            color: #2196F3;
        }
        .contenedor-reportes {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }
        .tarjeta {
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            padding: 15px;
            width: 300px;
        }
        .tarjeta img {
            width: 100%;
            border-radius: 8px;
            max-height: 200px;
            object-fit: cover;
        }
        .tipo {
            font-weight: bold;
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            display: inline-block;
            margin-bottom: 10px;
        }
        .lleno { background-color: #ff9800; }
        .danado { background-color: #f44336; }
    </style>
</head>
<body>

<h2>Reportes de Cestos Llenos</h2>
<div class="contenedor-reportes">
<?php while ($row = $llenos->fetch_assoc()): ?>
    <div class="tarjeta">
        <span class="tipo lleno">Lleno</span>
        <img src="uploads/lleno/<?= htmlspecialchars($row['imagen_nombre']) ?>" alt="Imagen">
        <p><strong>Ubicación:</strong> <?= htmlspecialchars($row['ubicacion']) ?></p>
        <p><strong>Descripción:</strong> <?= htmlspecialchars($row['descripcion']) ?></p>
        <p><small><strong>Fecha:</strong> <?= $row['fecha_reporte'] ?></small></p>
    </div>
<?php endwhile; ?>
</div>

<h2>Reportes de Cestos Dañados</h2>
<div class="contenedor-reportes">
<?php while ($row = $danados->fetch_assoc()): ?>
    <div class="tarjeta">
        <span class="tipo danado">Dañado</span>
        <img src="uploads/danado/<?= htmlspecialchars($row['imagen_nombre']) ?>" alt="Imagen">
        <p><strong>Ubicación:</strong> <?= htmlspecialchars($row['ubicacion']) ?></p>
        <p><strong>Descripción:</strong> <?= htmlspecialchars($row['descripcion']) ?></p>
        <p><small><strong>Fecha:</strong> <?= $row['fecha_reporte'] ?></small></p>
    </div>
<?php endwhile; ?>
</div>

</body>
</html>
