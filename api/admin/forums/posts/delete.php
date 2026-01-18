<?php
// api/admin/forums/posts/delete.php - Admin delete any post

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../../../../config/database.php';
include_once '../../../../config/jwt.php';

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
    
    // Check if user is admin
    if ($decoded['role'] !== 'ADMIN') {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Accès refusé. Administrateur requis."
        ]);
        exit();
    }
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->post_id)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "ID du post manquant"
        ]);
        exit();
    }
    
    $post_id = (int)$data->post_id;
    
    try {
        // First delete all comments related to this post
        $deleteCommentsQuery = "DELETE FROM forum_comments WHERE post_id = :post_id";
        $deleteCommentsStmt = $db->prepare($deleteCommentsQuery);
        $deleteCommentsStmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
        $deleteCommentsStmt->execute();
        
        // Delete all votes related to this post
        $deleteVotesQuery = "DELETE FROM forum_votes WHERE post_id = :post_id";
        $deleteVotesStmt = $db->prepare($deleteVotesQuery);
        $deleteVotesStmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
        $deleteVotesStmt->execute();
        
        // Delete the post itself
        $deletePostQuery = "DELETE FROM forum_posts WHERE id = :post_id";
        $deletePostStmt = $db->prepare($deletePostQuery);
        $deletePostStmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
        
        if ($deletePostStmt->execute()) {
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Post supprimé avec succès"
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
