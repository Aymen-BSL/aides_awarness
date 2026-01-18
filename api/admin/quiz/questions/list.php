<?php
// api/admin/quiz/questions/list.php - List questions for a specific quiz

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../../../../config/database.php';
include_once '../../../../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
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
    
    // Get quiz_id from query string
    if (!isset($_GET['quiz_id'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "ID du quiz manquant"
        ]);
        exit();
    }
    
    $quiz_id = (int)$_GET['quiz_id'];
    
    try {
        // Get all questions for this quiz
        $questionsQuery = "SELECT id, quiz_id, question_text, order_number 
                          FROM quiz_questions 
                          WHERE quiz_id = :quiz_id 
                          ORDER BY order_number ASC";
        
        $questionsStmt = $db->prepare($questionsQuery);
        $questionsStmt->bindParam(':quiz_id', $quiz_id, PDO::PARAM_INT);
        $questionsStmt->execute();
        
        $questions = $questionsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get options for each question
        foreach ($questions as &$question) {
            $optionsQuery = "SELECT id, option_text, risk_score 
                            FROM quiz_options 
                            WHERE question_id = :question_id 
                            ORDER BY id ASC";
            
            $optionsStmt = $db->prepare($optionsQuery);
            $optionsStmt->bindParam(':question_id', $question['id'], PDO::PARAM_INT);
            $optionsStmt->execute();
            
            $question['options'] = $optionsStmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "data" => $questions
        ]);
        
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
