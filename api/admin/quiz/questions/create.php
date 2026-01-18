<?php
// api/admin/quiz/questions/create.php - Create question with options

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../../../../config/database.php';
include_once '../../../../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $database = new Database();
    $db = $database->getConnection();
    
    // Verify JWT token
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
    
    if (!isset($data->quiz_id) || !isset($data->question_text) || !isset($data->options)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Données manquantes"]);
        exit();
    }
    
    if (count($data->options) < 2) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Au moins 2 options sont requises"]);
        exit();
    }
    
    $quiz_id = (int)$data->quiz_id;
    $question_text = trim($data->question_text);
    $order_number = isset($data->order_number) ? (int)$data->order_number : 1;
    
    try {
        // Insert question
        $questionQuery = "INSERT INTO quiz_questions (quiz_id, question_text, order_number) 
                         VALUES (:quiz_id, :question_text, :order_number)";
        $questionStmt = $db->prepare($questionQuery);
        $questionStmt->bindParam(':quiz_id', $quiz_id, PDO::PARAM_INT);
        $questionStmt->bindParam(':question_text', $question_text);
        $questionStmt->bindParam(':order_number', $order_number, PDO::PARAM_INT);
        $questionStmt->execute();
        
        $question_id = $db->lastInsertId();
        
        // Insert options
        $optionQuery = "INSERT INTO quiz_options (question_id, option_text, risk_score) 
                       VALUES (:question_id, :option_text, :risk_score)";
        $optionStmt = $db->prepare($optionQuery);
        
        foreach ($data->options as $option) {
            $option_text = trim($option->option_text);
            $risk_score = (int)$option->risk_score;
            
            $optionStmt->bindParam(':question_id', $question_id, PDO::PARAM_INT);
            $optionStmt->bindParam(':option_text', $option_text);
            $optionStmt->bindParam(':risk_score', $risk_score, PDO::PARAM_INT);
            $optionStmt->execute();
        }
        
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Question créée avec succès",
            "question_id" => $question_id
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Erreur: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Méthode non autorisée"]);
}
?>
