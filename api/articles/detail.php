<?php
// api/articles/detail.php - Get single article with full content

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

include_once '../../config/database.php';
include_once '../../config/jwt.php';

$database = new Database();
$db = $database->getConnection();

$article_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($article_id <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "ID d'article invalide"
    ]);
    exit();
}

try {
    // Get article with author info
    $query = "SELECT 
                a.*,
                u.username as author_username,
                u.first_name as author_first_name,
                u.last_name as author_last_name,
                (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as likes_count,
                (SELECT COUNT(*) FROM article_comments WHERE article_id = a.id) as comments_count
              FROM articles a
              JOIN users u ON a.author_id = u.id
              WHERE a.id = :article_id AND a.status = 'PUBLISHED'";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':article_id', $article_id, PDO::PARAM_INT);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Article non trouvé"
        ]);
        exit();
    }
    
    $article = $stmt->fetch();
    
    // Check if current user has liked this article (if authenticated)
    $user_has_liked = false;
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        $token = str_replace('Bearer ', '', $headers['Authorization']);
        $decoded = JWT::decode($token);
        
        if ($decoded) {
            $likeQuery = "SELECT id FROM article_likes WHERE article_id = :article_id AND user_id = :user_id";
            $likeStmt = $db->prepare($likeQuery);
            $likeStmt->bindParam(':article_id', $article_id, PDO::PARAM_INT);
            $likeStmt->bindParam(':user_id', $decoded['id'], PDO::PARAM_INT);
            $likeStmt->execute();
            $user_has_liked = $likeStmt->rowCount() > 0;
        }
    }
    
    $article['user_has_liked'] = $user_has_liked;
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $article
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur lors de la récupération de l'article: " . $e->getMessage()
    ]);
}
?>
