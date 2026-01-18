<?php
// api/forums/posts/list.php - Get posts for a category

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

include_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$category_id = isset($_GET['category_id']) ? (int)$_GET['category_id'] : 0;

if ($category_id <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "ID de catégorie invalide"
    ]);
    exit();
}

try {
    $query = "SELECT 
                p.id,
                p.title,
                p.content,
                p.is_pinned,
                p.is_locked,
                p.created_at,
                p.updated_at,
                u.username,
                u.first_name,
                u.last_name,
                (SELECT COUNT(*) FROM forum_comments WHERE post_id = p.id) as comments_count,
                (SELECT COALESCE(SUM(vote_value), 0) FROM forum_votes WHERE post_id = p.id) as vote_score
              FROM forum_posts p
              JOIN users u ON p.author_id = u.id
              WHERE p.category_id = :category_id
              ORDER BY p.is_pinned DESC, p.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':category_id', $category_id, PDO::PARAM_INT);
    $stmt->execute();
    
    $posts = $stmt->fetchAll();
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $posts
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur lors de la récupération des posts: " . $e->getMessage()
    ]);
}
?>
