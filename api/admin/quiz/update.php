<?php
// api/admin/quiz/update.php - Update quiz metadata

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
    
    // Check if user is admin or medical professional
    if ($decoded['role'] !== 'ADMIN' && $decoded['role'] !== 'MEDICAL_PROFESSIONAL') {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Accès refusé. Administrateur ou professionnel médical requis."
        ]);
        exit();
    }
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->quiz_id)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "ID du quiz manquant"
        ]);
        exit();
    }
    
    if (!isset($data->title) || empty(trim($data->title))) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Le titre est requis"
        ]);
        exit();
    }
    
    $quiz_id = (int)$data->quiz_id;
    $title = trim($data->title);
    $description = isset($data->description) ? trim($data->description) : '';
    $active = isset($data->active) ? (bool)$data->active : true;
    
    try {
        $query = "UPDATE quizzes 
                  SET title = :title, description = :description, active = :active 
                  WHERE id = :quiz_id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':active', $active, PDO::PARAM_BOOL);
        $stmt->bindParam(':quiz_id', $quiz_id, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Quiz mis à jour avec succès"
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Erreur lors de la mise à jour du quiz"
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
