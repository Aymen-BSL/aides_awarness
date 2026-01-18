<?php
// api/admin/users/delete.php - Delete user (Admin only)

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../../../config/database.php';
include_once '../../../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] === 'DELETE' || $_SERVER['REQUEST_METHOD'] === 'POST') {
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
    $user_id = isset($data->user_id) ? (int)$data->user_id : 0;
    
    if ($user_id <= 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "ID utilisateur invalide"
        ]);
        exit();
    }
    
    // Prevent deleting own account
    if ($user_id === $decoded['id']) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Vous ne pouvez pas supprimer votre propre compte"
        ]);
        exit();
    }
    
    try {
        // Delete user
        $deleteQuery = "DELETE FROM users WHERE id = :user_id";
        $deleteStmt = $db->prepare($deleteQuery);
        $deleteStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        
        if ($deleteStmt->execute()) {
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Utilisateur supprimé avec succès"
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Erreur lors de la suppression"
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
