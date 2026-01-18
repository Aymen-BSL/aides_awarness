<?php
// api/admin/users/ban.php - Ban user with duration

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../../../config/database.php';
include_once '../../../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $database = new Database();
    $db = $database->getConnection();
    
    // Verify JWT token
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Non autorisé"
        ]);
        exit();
    }
    
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $decoded = JWT::decode($token);
    
    if (!$decoded) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Token invalide"
        ]);
        exit();
    }
    
    // Check if user is admin
    if ($decoded['role'] !== 'ADMIN') {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Accès refusé. Administrateur requis."
        ]);
        exit();
    }
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->user_id)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "ID utilisateur manquant"
        ]);
        exit();
    }
    
    $user_id = (int)$data->user_id;
    $reason = isset($data->reason) ? trim($data->reason) : null;
    $duration = isset($data->duration) ? $data->duration : 'permanent'; // 1day, 7days, 30days, permanent
    
    // Cannot ban yourself
    if ($user_id === $decoded['id']) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Vous ne pouvez pas bannir votre propre compte"
        ]);
        exit();
    }
    
    // Calculate ban_until based on duration
    $ban_until = null;
    if ($duration === '1day') {
        $ban_until = date('Y-m-d H:i:s', strtotime('+1 day'));
    } elseif ($duration === '7days') {
        $ban_until = date('Y-m-d H:i:s', strtotime('+7 days'));
    } elseif ($duration === '30days') {
        $ban_until = date('Y-m-d H:i:s', strtotime('+30 days'));
    }
    // permanent: ban_until stays null
    
    try {
        $banQuery = "UPDATE users 
                     SET is_banned = TRUE, 
                         ban_reason = :reason, 
                         banned_at = NOW(), 
                         ban_until = :ban_until,
                         banned_by = :banned_by
                     WHERE id = :user_id";
        
        $banStmt = $db->prepare($banQuery);
        $banStmt->bindParam(':reason', $reason);
        $banStmt->bindParam(':ban_until', $ban_until);
        $banStmt->bindParam(':banned_by', $decoded['id'], PDO::PARAM_INT);
        $banStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        
        if ($banStmt->execute()) {
            $durationText = $duration === 'permanent' ? 'de façon permanente' : 
                            ($duration === '1day' ? "pour 1 jour" :
                            ($duration === '7days' ? "pour 7 jours" : "pour 30 jours"));
            
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Utilisateur banni " . $durationText
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Erreur lors du bannissement"
            ]);
        }
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Erreur: " . $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Méthode non autorisée"
    ]);
}
?>
