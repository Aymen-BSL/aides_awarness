<?php
// api/forums/posts/detail.php - Get single post with comments

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

include_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$post_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($post_id <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "ID de post invalide"
    ]);
    exit();
}

try {
    // Get post details
    $postQuery = "SELECT 
                    p.*,
                    u.username,
                    u.first_name,
                    u.last_name,
                    c.name as category_name,
                    (SELECT COALESCE(SUM(vote_value), 0) FROM forum_votes WHERE post_id = p.id AND comment_id IS NULL) as vote_score,
                    (SELECT COUNT(*) FROM forum_comments WHERE post_id = p.id) as comments_count
                  FROM forum_posts p
                  JOIN users u ON p.author_id = u.id
                  JOIN forum_categories c ON p.category_id = c.id
                  WHERE p.id = :post_id";
    
    $postStmt = $db->prepare($postQuery);
    $postStmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
    $postStmt->execute();
    
    if ($postStmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Post non trouvé"
        ]);
        exit();
    }
    
    $post = $postStmt->fetch();
    
    // Get comments for this post
    $commentsQuery = "SELECT 
                        c.*,
                        u.username,
                        u.first_name,
                        u.last_name,
                        (SELECT COALESCE(SUM(vote_value), 0) FROM forum_votes WHERE comment_id = c.id AND post_id IS NULL) as vote_score
                      FROM forum_comments c
                      JOIN users u ON c.user_id = u.id
                      WHERE c.post_id = :post_id
                      ORDER BY c.created_at ASC";
    
    $commentsStmt = $db->prepare($commentsQuery);
    $commentsStmt->bindParam(':post_id', $post_id, PDO::PARAM_INT);
    $commentsStmt->execute();
    
    $comments = $commentsStmt->fetchAll();
    
    $post['comments'] = $comments;
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $post
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur: " . $e->getMessage()
    ]);
}
?>
