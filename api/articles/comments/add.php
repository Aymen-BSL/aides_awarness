<?php
// api/articles/comments/add.php - Add a comment to an article

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
    
    if (!isset($data->article_id) || !isset($data->content)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Données manquantes"
        ]);
        exit();
    }
    
    $article_id = (int)$data->article_id;
    $content = trim($data->content);
    
    if (empty($content)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Le commentaire ne peut pas être vide"
        ]);
        exit();
    }
    
    try {
        $query = "INSERT INTO article_comments (article_id, user_id, content) 
                  VALUES (:article_id, :user_id, :content)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':article_id', $article_id, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $decoded['id'], PDO::PARAM_INT);
        $stmt->bindParam(':content', $content);
        
        if ($stmt->execute()) {
            $comment_id = $db->lastInsertId();
            
            // Get the created comment with user info
            $getQuery = "SELECT 
                            c.id,
                            c.content,
                            c.created_at,
                            c.user_id,
                            u.username,
                            u.first_name,
                            u.last_name
                         FROM article_comments c
                         JOIN users u ON c.user_id = u.id
                         WHERE c.id = :comment_id";
            
            $getStmt = $db->prepare($getQuery);
            $getStmt->bindParam(':comment_id', $comment_id, PDO::PARAM_INT);
            $getStmt->execute();
            $comment = $getStmt->fetch();
            
            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Commentaire ajouté",
                "data" => $comment
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Erreur lors de l'ajout du commentaire"
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
