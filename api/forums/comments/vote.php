<?php
// api/forums/comments/vote.php - Vote on a forum comment

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
    
    $data = json_decode(file_get_contents("php://input"));
    $comment_id = isset($data->comment_id) ? (int)$data->comment_id : 0;
    $vote_value = isset($data->vote_value) ? (int)$data->vote_value : 0;
    
    if ($comment_id <= 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "ID de commentaire invalide"
        ]);
        exit();
    }
    
    if ($vote_value !== 1 && $vote_value !== -1 && $vote_value !== 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Valeur de vote invalide"
        ]);
        exit();
    }
    
    try {
        // Check if user already voted
        $checkQuery = "SELECT id FROM forum_votes 
                       WHERE comment_id = :comment_id AND user_id = :user_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':comment_id', $comment_id, PDO::PARAM_INT);
        $checkStmt->bindParam(':user_id', $decoded['id'], PDO::PARAM_INT);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() > 0) {
            $existing = $checkStmt->fetch();
            
            if ($vote_value === 0) {
                // Remove vote
                $deleteQuery = "DELETE FROM forum_votes WHERE id = :id";
                $deleteStmt = $db->prepare($deleteQuery);
                $deleteStmt->bindParam(':id', $existing['id'], PDO::PARAM_INT);
                $deleteStmt->execute();
            } else {
                // Update vote
                $updateQuery = "UPDATE forum_votes SET vote_value = :vote_value WHERE id = :id";
                $updateStmt = $db->prepare($updateQuery);
                $updateStmt->bindParam(':vote_value', $vote_value, PDO::PARAM_INT);
                $updateStmt->bindParam(':id', $existing['id'], PDO::PARAM_INT);
                $updateStmt->execute();
            }
        } else {
            if ($vote_value !== 0) {
                // Insert new vote
                $insertQuery = "INSERT INTO forum_votes (comment_id, user_id, vote_value) 
                                VALUES (:comment_id, :user_id, :vote_value)";
                $insertStmt = $db->prepare($insertQuery);
                $insertStmt->bindParam(':comment_id', $comment_id, PDO::PARAM_INT);
                $insertStmt->bindParam(':user_id', $decoded['id'], PDO::PARAM_INT);
                $insertStmt->bindParam(':vote_value', $vote_value, PDO::PARAM_INT);
                $insertStmt->execute();
            }
        }
        
        // Get updated vote score
        $scoreQuery = "SELECT COALESCE(SUM(vote_value), 0) as score 
                       FROM forum_votes WHERE comment_id = :comment_id";
        $scoreStmt = $db->prepare($scoreQuery);
        $scoreStmt->bindParam(':comment_id', $comment_id, PDO::PARAM_INT);
        $scoreStmt->execute();
        $score = $scoreStmt->fetch()['score'];
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Vote enregistré",
            "data" => [
                "vote_score" => (int)$score,
                "user_vote" => $vote_value
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
