<?php
// api/articles/comments/list.php - Get comments for an article

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

include_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$article_id = isset($_GET['article_id']) ? (int)$_GET['article_id'] : 0;

if ($article_id <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "ID d'article invalide"
    ]);
    exit();
}

try {
    $query = "SELECT 
                c.id,
                c.content,
                c.created_at,
                c.updated_at,
                c.user_id,
                u.username,
                u.first_name,
                u.last_name
              FROM article_comments c
              JOIN users u ON c.user_id = u.id
              WHERE c.article_id = :article_id
              ORDER BY c.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':article_id', $article_id, PDO::PARAM_INT);
    $stmt->execute();
    
    $comments = $stmt->fetchAll();
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $comments
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur lors de la récupération des commentaires: " . $e->getMessage()
    ]);
}
?>
