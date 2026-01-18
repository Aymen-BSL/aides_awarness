<?php
// api/user/password.php - Change user password

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../../config/database.php';
include_once '../../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'POST') {
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
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->current_password) || !isset($data->new_password)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Données manquantes"
        ]);
        exit();
    }
    
    $current_password = $data->current_password;
    $new_password = $data->new_password;
    
    // Validate new password
    if (strlen($new_password) < 6) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Le mot de passe doit contenir au moins 6 caractères"
        ]);
        exit();
    }
    
    try {
        // Get current password from database
        $getUserQuery = "SELECT password FROM users WHERE id = :user_id";
        $getUserStmt = $db->prepare($getUserQuery);
        $getUserStmt->bindParam(':user_id', $decoded['id'], PDO::PARAM_INT);
        $getUserStmt->execute();
        
        if ($getUserStmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode([
                "success" => false,
                "message" => "Utilisateur non trouvé"
            ]);
            exit();
        }
        
        $user = $getUserStmt->fetch();
        
        // Verify current password (plain text for now)
        if ($user['password'] !== $current_password) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Mot de passe actuel incorrect"
            ]);
            exit();
        }
        
        // Update password
        $updateQuery = "UPDATE users SET password = :new_password WHERE id = :user_id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':new_password', $new_password);
        $updateStmt->bindParam(':user_id', $decoded['id'], PDO::PARAM_INT);
        
        if ($updateStmt->execute()) {
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Mot de passe modifié avec succès"
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Erreur lors de la modification"
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
