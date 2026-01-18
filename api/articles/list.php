<?php
// api/articles/list.php - Get list of published articles

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Get page number from query string (for pagination)
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

try {
    // Get total count
    $countQuery = "SELECT COUNT(*) as total FROM articles WHERE status = 'PUBLISHED'";
    $countStmt = $db->prepare($countQuery);
    $countStmt->execute();
    $totalArticles = $countStmt->fetch()['total'];
    
    // Get articles with author info
    $query = "SELECT 
                a.id,
                a.title,
                a.excerpt,
                a.cover_image,
                a.published_at,
                a.created_at,
                u.username as author_username,
                u.first_name as author_first_name,
                u.last_name as author_last_name,
                (SELECT COUNT(*) FROM article_likes WHERE article_id = a.id) as likes_count,
                (SELECT COUNT(*) FROM article_comments WHERE article_id = a.id) as comments_count
              FROM articles a
              JOIN users u ON a.author_id = u.id
              WHERE a.status = 'PUBLISHED'
              ORDER BY a.published_at DESC
              LIMIT :limit OFFSET :offset";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $articles = $stmt->fetchAll();
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => [
            "articles" => $articles,
            "pagination" => [
                "page" => $page,
                "limit" => $limit,
                "total" => (int)$totalArticles,
                "pages" => ceil($totalArticles / $limit)
            ]
        ]
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur lors de la récupération des articles: " . $e->getMessage()
    ]);
}
?>
