<?php
// api/quiz/submit.php - Submit quiz answers and get results

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../../config/database.php';
include_once '../../config/jwt.php';

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
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->quiz_id) || !isset($data->answers)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Données manquantes"
        ]);
        exit();
    }
    
    $quiz_id = (int)$data->quiz_id;
    $answers = $data->answers; // Array of {question_id, option_id}
    
    try {
        // Calculate total score
        $total_score = 0;
        
        foreach ($answers as $answer) {
            $optionQuery = "SELECT risk_score FROM quiz_options WHERE id = :option_id";
            $optionStmt = $db->prepare($optionQuery);
            $optionStmt->bindParam(':option_id', $answer->option_id, PDO::PARAM_INT);
            $optionStmt->execute();
            
            if ($optionStmt->rowCount() > 0) {
                $option = $optionStmt->fetch();
                $total_score += $option['risk_score'];
            }
        }
        
        // Determine risk level
        $risk_level = 'LOW';
        if ($total_score > 30) {
            $risk_level = 'VERY_HIGH';
        } elseif ($total_score > 20) {
            $risk_level = 'HIGH';
        } elseif ($total_score > 10) {
            $risk_level = 'MODERATE';
        }
        
        // Save result to database
        $saveQuery = "INSERT INTO quiz_results (user_id, quiz_id, total_score, risk_level, answers) 
                      VALUES (:user_id, :quiz_id, :total_score, :risk_level, :answers)";
        
        $saveStmt = $db->prepare($saveQuery);
        $saveStmt->bindParam(':user_id', $decoded['id'], PDO::PARAM_INT);
        $saveStmt->bindParam(':quiz_id', $quiz_id, PDO::PARAM_INT);
        $saveStmt->bindParam(':total_score', $total_score, PDO::PARAM_INT);
        $saveStmt->bindParam(':risk_level', $risk_level);
        $saveStmt->bindParam(':answers', json_encode($answers));
        
        $saveStmt->execute();
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "data" => [
                "total_score" => $total_score,
                "risk_level" => $risk_level
            ]
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
