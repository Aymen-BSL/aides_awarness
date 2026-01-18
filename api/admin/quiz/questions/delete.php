<?php
// api/admin/quiz/questions/delete.php - Delete question with options

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../../../../config/database.php';
include_once '../../../../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] === 'DELETE' || $_SERVER['REQUEST_METHOD'] === 'POST') {
    $database = new Database();
    $db = $database->getConnection();
    
    // Verify JWT
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Non autorisé"]);
        exit();
    }
    
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $decoded = JWT::decode($token);
    
    if (!$decoded || ($decoded['role'] !== 'ADMIN' && $decoded['role'] !== 'MEDICAL_PROFESSIONAL')) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Accès refusé"]);
        exit();
    }
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->question_id)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "ID de la question manquant"]);
        exit();
    }
    
    $question_id = (int)$data->question_id;
    
    try {
        // Delete options first
        $deleteOptionsQuery = "DELETE FROM quiz_options WHERE question_id = :question_id";
        $deleteOptionsStmt = $db->prepare($deleteOptionsQuery);
        $deleteOptionsStmt->bindParam(':question_id', $question_id, PDO::PARAM_INT);
        $deleteOptionsStmt->execute();
        
        // Delete question
        $deleteQuestionQuery = "DELETE FROM quiz_questions WHERE id = :question_id";
        $deleteQuestionStmt = $db->prepare($deleteQuestionQuery);
        $deleteQuestionStmt->bindParam(':question_id', $question_id, PDO::PARAM_INT);
        
        if ($deleteQuestionStmt->execute()) {
            http_response_code(200);
            echo json_encode(["success" => true, "message" => "Question supprimée avec succès"]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Erreur lors de la suppression"]);
        }
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Erreur: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Méthode non autorisée"]);
}
?>
