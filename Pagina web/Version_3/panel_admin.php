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
//1V=$llenos = $conexion->query("SELECT * FROM reportes_lleno ORDER BY fecha_reporte DESC");
//1V=$danados = $conexion->query("SELECT * FROM reportes_danado ORDER BY fecha_reporte DESC");

$reportes = [];

$llenos = $conexion->query("SELECT * FROM reportes_lleno ORDER BY fecha_reporte DESC");
while ($row = $llenos->fetch_assoc()) {
    $row['tipo_cesto'] = $row['tipo']; // guarda el original (organico/inorganico)
    $row['tipo'] = 'lleno'; 
    $row['imagen'] = 'uploads/lleno/' . $row['imagen_nombre'];
    $reportes[] = $row;
}

$danados = $conexion->query("SELECT * FROM reportes_danado ORDER BY fecha_reporte DESC");
while ($row = $danados->fetch_assoc()) {
    $row['tipo_cesto'] = $row['tipo'];
    $row['tipo'] = 'danado';

    $row['imagen'] = 'uploads/danado/' . $row['imagen_nombre'];
    $reportes[] = $row;
}

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

<img src="logo.png" alt="Logo" class="logo">

    <header>Ubica los Cestos de Basura </header>

    <nav>
        <a>Panel del Personal de Limpieza</a> 
    </nav>

<!-- NUEVO BLOQUE DE BOTONES -->
<div class="top-buttons">
    <a href="tareas.php" class="btn-tareas">Tareas</a>
    <form action="logout.php" method="POST" class="logout-form">
        <button type="submit" class="btn-cerrar-sesion">Cerrar sesión</button>
    </form>
</div>


    
<div class="page-container">

<div class="main-content">
    <center><h2>Reportes de Cestos</h2></center>
    
    <div class="reportes">
        <?php foreach ($reportes as $reporte): ?>
<?php
    $estado = $reporte['estado'] ?? 'pendiente';
    $estado_legible = ucfirst($estado);
?>
           
        <div class="tarjeta">
            <div class="tarjeta-resumen" onclick="this.parentElement.classList.toggle('expandida')">
                <p><strong>Reporte:</strong> <?= ucfirst($reporte['tipo'] === 'lleno' ? 'Lleno' : 'Dañado') ?></p>
                <p><strong>Tipo:</strong> <?= ucfirst($reporte['tipo_cesto']) ?></p>
                <p><strong>Serie:</strong> <?= $reporte['serie'] ?></p>
                <p><strong>Estado:</strong> <span class="estado <?= $estado ?>"><?= $estado_legible ?></span></p>
            </div>
            
            <div class="contenido-expandido">
    
                <img src="<?= $reporte['imagen'] ?>" alt="Reporte" class="imagen-reporte" onclick="abrirImagen(this.src)">

                <p><strong>Ubicación:</strong> (<?= $reporte['latitud'] ?>, <?= $reporte['longitud'] ?>)</p>
                <p><strong>Descripción:</strong> <?= $reporte['descripcion'] ?></p>
                <p><strong>Fecha de reporte:</strong> <?= $reporte['fecha_reporte'] ?></p>

                <?php if ($reporte['estado'] === 'resuelto' && !empty($reporte['fecha_resuelto'])): ?>
                    <p><strong>Fecha de resuelto:</strong> <?= $reporte['fecha_resuelto'] ?></p>
                 <?php endif; ?>

                <?php if (!empty($reporte['comentarios'])): ?>
                    <p><strong>Comentario del personal:</strong> <?= $reporte['comentarios'] ?></p>
                <?php endif; ?>

                <?php if ($reporte['estado'] !== 'resuelto'): ?>
                    <textarea id="comentarios-<?= $reporte['tipo'] ?>-<?= $reporte['serie'] ?>" placeholder="Agregar comentario..."></textarea>
                    <button class="btn-guardar" onclick="event.stopPropagation(); guardarComentarios('<?= $reporte['tipo'] ?>', '<?= $reporte['serie'] ?>')">Guardar comentario</button>
                    <button class="btn-proceso" onclick="event.stopPropagation(); marcarProceso('<?= $reporte['tipo'] ?>', '<?= $reporte['serie'] ?>')">Proceso</button>
                    <button class="btn-resuelto" onclick="event.stopPropagation(); marcarResuelto('<?= $reporte['tipo'] ?>', '<?= $reporte['serie'] ?>')">Resuelto</button>
                <?php endif; ?>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</div> <!-- main-content -->


</div> <!-- page-container -->

<!-- Modal para mostrar imagen ampliada -->
<div id="visor-imagen" class="overlay-imagen" onclick="cerrarImagen()">
  <img id="imagen-ampliada" src="" alt="Imagen ampliada" onclick="event.stopPropagation()">
</div>

<script src="panel_version3.js"></script>

</body>
</html>

