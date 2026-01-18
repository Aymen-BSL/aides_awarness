<?php
// api/admin/users/list.php - Get all users (Admin only)

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

include_once '../../../config/database.php';
include_once '../../../config/jwt.php';

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

try {
    // Get all users
    $query = "SELECT id, username, email, first_name, last_name, role, created_at,
                     is_banned, ban_reason, banned_at, ban_until 
              FROM users 
              ORDER BY created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $users = $stmt->fetchAll();
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $users
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur: " . $e->getMessage()
    ]);
}
?>
