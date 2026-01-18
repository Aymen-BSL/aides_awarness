<?php
// api/forums/comments/add.php - Add comment to forum post

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
    
    if (!isset($data->post_id) || !isset($data->content)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Données manquantes"
        ]);
        exit();
    }
    
    $post_id = (int)$data->post_id;
    $parent_id = isset($data->parent_id) ? (int)$data->parent_id : null;
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
        $query = "INSERT INTO forum_comments (post_id, parent_id, user_id, content) 
                  VALUES (:post_id, :parent_id, :user_id, :content)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
        $stmt->bindParam(':parent_id', $parent_id, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $decoded['id'], PDO::PARAM_INT);
        $stmt->bindParam(':content', $content);
        
        if ($stmt->execute()) {
            $comment_id = $db->lastInsertId();
            
            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Commentaire ajouté",
                "data" => [
                    "id" => (int)$comment_id
                ]
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
