<?php
// api/admin/articles/list.php - List all articles (draft + published)

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../../../config/database.php';
include_once '../../../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
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
    
    // Check if user is admin or medical professional
    if ($decoded['role'] !== 'ADMIN' && $decoded['role'] !== 'MEDICAL_PROFESSIONAL') {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Accès refusé. Administrateur ou professionnel médical requis."
        ]);
        exit();
    }
    
    try {
        // Get all articles with author information
        $query = "SELECT 
                    a.id,
                    a.title,
                    a.content,
                    a.category,
                    a.status,
                    a.cover_image as image_url,
                    a.created_at,
                    a.updated_at,
                    u.username as author_name
                  FROM articles a
                  LEFT JOIN users u ON a.author_id = u.id
                  ORDER BY a.updated_at DESC, a.created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "data" => $articles
        ]);
        
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
