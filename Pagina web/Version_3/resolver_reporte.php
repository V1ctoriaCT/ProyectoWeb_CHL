<?php 
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $conexion = new mysqli("localhost", "root", "", "reportes_basura");

    if ($conexion->connect_error) {
        http_response_code(500);
        echo json_encode(["error" => "Error de conexión"]);
        exit;
    }

    $tabla = $_POST['tabla']; // "lleno" o "danado"
    $serie = $_POST['serie'];
    $estado = $_POST['estado'] ?? null;
    $comentarios = $_POST['comentarios'] ?? null;

    if (!in_array($tabla, ['lleno', 'danado']) || empty($serie)) {
        http_response_code(400);
        echo json_encode(["error" => "Datos inválidos"]);
        exit;
    }

    // ✅ CAMBIO DE ESTADO
    if ($estado) {
        // 1. Actualizar el estado en la tabla del reporte
        if ($estado === 'resuelto') {
            $stmt = $conexion->prepare("UPDATE reportes_$tabla SET estado = ?, fecha_resuelto = NOW() WHERE serie = ?");
        } else {
            $stmt = $conexion->prepare("UPDATE reportes_$tabla SET estado = ? WHERE serie = ?");
        }
        $stmt->bind_param("ss", $estado, $serie);
        $stmt->execute();

        // 2. Sincronizar con la tabla cestos_basura
        $nuevo_servicio = null;

        if ($estado === 'pendiente') {
            $nuevo_servicio = 'inactivo';
        } elseif ($estado === 'proceso') {
            $nuevo_servicio = 'reparación';
        } elseif ($estado === 'resuelto') {
            $nuevo_servicio = 'activo';
        }

        if ($nuevo_servicio) {
            $stmt2 = $conexion->prepare("UPDATE cestos_basura SET servicio = ? WHERE serie = ?");
            $stmt2->bind_param("ss", $nuevo_servicio, $serie);
            $stmt2->execute();
        }

        echo json_encode(["success" => true]);
        exit;
    }

    // ✅ GUARDAR COMENTARIO
    if ($comentarios) {
        $stmt = $conexion->prepare("UPDATE reportes_$tabla SET comentarios = ? WHERE serie = ?");
        $stmt->bind_param("ss", $comentarios, $serie);
        $stmt->execute();

        echo json_encode(["success" => true]);
        exit;
    }

    echo json_encode(["error" => "No se especificó acción."]);
}
?>

