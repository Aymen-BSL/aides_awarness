<?php
// api/forums/categories/list.php - Get all forum categories

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

include_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT 
                c.id,
                c.name,
                c.description,
                c.icon,
                (SELECT COUNT(*) FROM forum_posts WHERE category_id = c.id) as posts_count
              FROM forum_categories c
              ORDER BY c.id ASC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $categories = $stmt->fetchAll();
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $categories
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur lors de la récupération des catégories: " . $e->getMessage()
    ]);
}
?>
