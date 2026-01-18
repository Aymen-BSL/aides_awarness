<?php
// api/articles/like.php - Toggle like on an article

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
    $article_id = isset($data->article_id) ? (int)$data->article_id : 0;
    
    if ($article_id <= 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "ID d'article invalide"
        ]);
        exit();
    }
    
    try {
        // Check if already liked
        $checkQuery = "SELECT id FROM article_likes WHERE article_id = :article_id AND user_id = :user_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':article_id', $article_id, PDO::PARAM_INT);
        $checkStmt->bindParam(':user_id', $decoded['id'], PDO::PARAM_INT);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() > 0) {
            // Unlike
            $deleteQuery = "DELETE FROM article_likes WHERE article_id = :article_id AND user_id = :user_id";
            $deleteStmt = $db->prepare($deleteQuery);
            $deleteStmt->bindParam(':article_id', $article_id, PDO::PARAM_INT);
            $deleteStmt->bindParam(':user_id', $decoded['id'], PDO::PARAM_INT);
            $deleteStmt->execute();
            
            $liked = false;
            $message = "Article retiré des favoris";
        } else {
            // Like
            $insertQuery = "INSERT INTO article_likes (article_id, user_id) VALUES (:article_id, :user_id)";
            $insertStmt = $db->prepare($insertQuery);
            $insertStmt->bindParam(':article_id', $article_id, PDO::PARAM_INT);
            $insertStmt->bindParam(':user_id', $decoded['id'], PDO::PARAM_INT);
            $insertStmt->execute();
            
            $liked = true;
            $message = "Article ajouté aux favoris";
        }
        
        // Get updated like count
        $countQuery = "SELECT COUNT(*) as count FROM article_likes WHERE article_id = :article_id";
        $countStmt = $db->prepare($countQuery);
        $countStmt->bindParam(':article_id', $article_id, PDO::PARAM_INT);
        $countStmt->execute();
        $likes_count = $countStmt->fetch()['count'];
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => $message,
            "data" => [
                "liked" => $liked,
                "likes_count" => (int)$likes_count
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
