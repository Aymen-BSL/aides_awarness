<?php
// api/forums/posts/vote.php - Vote on a forum post

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
    $post_id = isset($data->post_id) ? (int)$data->post_id : 0;
    $vote_value = isset($data->vote_value) ? (int)$data->vote_value : 0;
    
    if ($post_id <= 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "ID de post invalide"
        ]);
        exit();
    }
    
    if ($vote_value !== 1 && $vote_value !== -1 && $vote_value !== 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Valeur de vote invalide (1, -1, ou 0)"
        ]);
        exit();
    }
    
    try {
        // Check if user already voted
        $checkQuery = "SELECT id, vote_value FROM forum_votes 
                       WHERE post_id = :post_id AND user_id = :user_id AND comment_id IS NULL";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
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
                $insertQuery = "INSERT INTO forum_votes (post_id, user_id, vote_value) 
                                VALUES (:post_id, :user_id, :vote_value)";
                $insertStmt = $db->prepare($insertQuery);
                $insertStmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
                $insertStmt->bindParam(':user_id', $decoded['id'], PDO::PARAM_INT);
                $insertStmt->bindParam(':vote_value', $vote_value, PDO::PARAM_INT);
                $insertStmt->execute();
            }
        }
        
        // Get updated vote score
        $scoreQuery = "SELECT COALESCE(SUM(vote_value), 0) as score 
                       FROM forum_votes WHERE post_id = :post_id";
        $scoreStmt = $db->prepare($scoreQuery);
        $scoreStmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
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
