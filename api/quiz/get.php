<?php
// api/quiz/get.php - Get quiz questions with options

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Get all active quizzes
    $quizzesQuery = "SELECT * FROM quizzes WHERE active = TRUE ORDER BY created_at DESC";
    $quizzesStmt = $db->prepare($quizzesQuery);
    $quizzesStmt->execute();
    
    if ($quizzesStmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Aucun quiz actif trouvé"
        ]);
        exit();
    }
    
    $quizzes = $quizzesStmt->fetchAll();
    
    // Get questions and options for each quiz
    foreach ($quizzes as &$quiz) {
        // Get all questions for this quiz
        $questionsQuery = "SELECT * FROM quiz_questions WHERE quiz_id = :quiz_id ORDER BY order_number ASC";
        $questionsStmt = $db->prepare($questionsQuery);
        $questionsStmt->bindParam(':quiz_id', $quiz['id'], PDO::PARAM_INT);
        $questionsStmt->execute();
        
        $questions = $questionsStmt->fetchAll();
        
        // Get options for each question
        foreach ($questions as &$question) {
            $optionsQuery = "SELECT * FROM quiz_options WHERE question_id = :question_id ORDER BY id ASC";
            $optionsStmt = $db->prepare($optionsQuery);
            $optionsStmt->bindParam(':question_id', $question['id'], PDO::PARAM_INT);
            $optionsStmt->execute();
            
            $question['options'] = $optionsStmt->fetchAll();
        }
        
        $quiz['questions'] = $questions;
    }
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $quizzes
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur: " . $e->getMessage()
    ]);
}
?>
