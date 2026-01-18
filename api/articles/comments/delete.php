<?php
// api/articles/comments/delete.php - Delete a comment (own comments only)

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
    
    $data = json_decode(file_get_contents("php://input"));
    $comment_id = isset($data->comment_id) ? (int)$data->comment_id : 0;
    
    if ($comment_id <= 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "ID de commentaire invalide"
        ]);
        exit();
    }
    
    try {
        // Check if comment exists and belongs to user (or user is admin)
        $checkQuery = "SELECT user_id FROM article_comments WHERE id = :comment_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':comment_id', $comment_id, PDO::PARAM_INT);
        $checkStmt->execute();
        
        if ($checkStmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode([
                "success" => false,
                "message" => "Commentaire non trouvé"
            ]);
            exit();
        }
        
        $comment = $checkStmt->fetch();
        
        // Only allow deletion if user owns the comment or is admin
        if ($comment['user_id'] != $decoded['id'] && $decoded['role'] != 'ADMIN') {
            http_response_code(403);
            echo json_encode([
                "success" => false,
                "message" => "Vous ne pouvez supprimer que vos propres commentaires"
            ]);
            exit();
        }
        
        // Delete the comment
        $deleteQuery = "DELETE FROM article_comments WHERE id = :comment_id";
        $deleteStmt = $db->prepare($deleteQuery);
        $deleteStmt->bindParam(':comment_id', $comment_id, PDO::PARAM_INT);
        
        if ($deleteStmt->execute()) {
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Commentaire supprimé"
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Erreur lors de la suppression"
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
