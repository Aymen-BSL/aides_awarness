<?php
// api/user/profile.php - Update user profile

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
    
    if (!isset($data->email) || !isset($data->first_name) || !isset($data->last_name)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Données manquantes"
        ]);
        exit();
    }
    
    $email = trim($data->email);
    $first_name = trim($data->first_name);
    $last_name = trim($data->last_name);
    
    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Email invalide"
        ]);
        exit();
    }
    
    try {
        // Check if email is already taken by another user
        $checkQuery = "SELECT id FROM users WHERE email = :email AND id != :user_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':email', $email);
        $checkStmt->bindParam(':user_id', $decoded['id'], PDO::PARAM_INT);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Cet email est déjà utilisé"
            ]);
            exit();
        }
        
        // Update user profile
        $updateQuery = "UPDATE users 
                        SET email = :email, first_name = :first_name, last_name = :last_name 
                        WHERE id = :user_id";
        
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':email', $email);
        $updateStmt->bindParam(':first_name', $first_name);
        $updateStmt->bindParam(':last_name', $last_name);
        $updateStmt->bindParam(':user_id', $decoded['id'], PDO::PARAM_INT);
        
        if ($updateStmt->execute()) {
            // Get updated user data
            $getUserQuery = "SELECT id, username, email, first_name, last_name, role FROM users WHERE id = :user_id";
            $getUserStmt = $db->prepare($getUserQuery);
            $getUserStmt->bindParam(':user_id', $decoded['id'], PDO::PARAM_INT);
            $getUserStmt->execute();
            $user = $getUserStmt->fetch();
            
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Profil mis à jour avec succès",
                "data" => $user
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Erreur lors de la mise à jour"
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
