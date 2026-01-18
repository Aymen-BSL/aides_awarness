<?php
// api/admin/quiz/delete.php - Delete quiz with cascading deletion

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
    
    $quiz_id = (int)$data->quiz_id;
    
    try {
        // First, get all question IDs for this quiz
        $getQuestionsQuery = "SELECT id FROM quiz_questions WHERE quiz_id = :quiz_id";
        $getQuestionsStmt = $db->prepare($getQuestionsQuery);
        $getQuestionsStmt->bindParam(':quiz_id', $quiz_id, PDO::PARAM_INT);
        $getQuestionsStmt->execute();
        $questionIds = $getQuestionsStmt->fetchAll(PDO::FETCH_COLUMN);
        
        // Delete all options for these questions
        if (!empty($questionIds)) {
            $placeholders = implode(',', array_fill(0, count($questionIds), '?'));
            $deleteOptionsQuery = "DELETE FROM quiz_options WHERE question_id IN ($placeholders)";
            $deleteOptionsStmt = $db->prepare($deleteOptionsQuery);
            $deleteOptionsStmt->execute($questionIds);
        }
        
        // Delete all questions for this quiz
        $deleteQuestionsQuery = "DELETE FROM quiz_questions WHERE quiz_id = :quiz_id";
        $deleteQuestionsStmt = $db->prepare($deleteQuestionsQuery);
        $deleteQuestionsStmt->bindParam(':quiz_id', $quiz_id, PDO::PARAM_INT);
        $deleteQuestionsStmt->execute();
        
        // Delete the quiz itself
        $deleteQuizQuery = "DELETE FROM quizzes WHERE id = :quiz_id";
        $deleteQuizStmt = $db->prepare($deleteQuizQuery);
        $deleteQuizStmt->bindParam(':quiz_id', $quiz_id, PDO::PARAM_INT);
        
        if ($deleteQuizStmt->execute()) {
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Quiz supprimé avec succès"
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Erreur lors de la suppression du quiz"
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
