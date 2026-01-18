<?php
// api/admin/articles/create.php - Create new article

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
        echo json_encode(["success" => false, "message" => "Non autorisé"]);
        exit();
    }
    
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $decoded = JWT::decode($token);
    
    if (!$decoded || ($decoded['role'] !== 'ADMIN' && $decoded['role'] !== 'MEDICAL_PROFESSIONAL')) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Accès refusé"]);
        exit();
    }
    
    $data = json_decode(file_get_contents("php://input"));
    
    // Validation
    if (!isset($data->title) || empty(trim($data->title))) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Le titre est requis"]);
        exit();
    }
    
    if (!isset($data->category) || empty(trim($data->category))) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "La catégorie est requise"]);
        exit();
    }
    
    if (!isset($data->content) || empty(trim($data->content))) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Le contenu est requis"]);
        exit();
    }
    
    $title = trim($data->title);
    $category = trim($data->category);
    $content = trim($data->content);
    $cover_image = isset($data->image_url) && !empty(trim($data->image_url)) ? trim($data->image_url) : null;
    $status = isset($data->status) ? strtoupper(trim($data->status)) : 'DRAFT';
    $author_id = $decoded['id']; // Fixed: JWT uses 'id' not 'user_id'
    
    // Validate status
    if (!in_array($status, ['DRAFT', 'PUBLISHED'])) {
        $status = 'DRAFT';
    }
    
    try {
        $query = "INSERT INTO articles (title, content, category, status, cover_image, author_id) 
                  VALUES (:title, :content, :category, :status, :cover_image, :author_id)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':category', $category);
        $stmt->bindParam(':status', $status);
        
        // Bind cover_image as NULL if empty
        if ($cover_image === null) {
            $stmt->bindValue(':cover_image', null, PDO::PARAM_NULL);
        } else {
            $stmt->bindParam(':cover_image', $cover_image);
        }
        
        $stmt->bindParam(':author_id', $author_id, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Article créé avec succès",
                "article_id" => $db->lastInsertId()
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Erreur lors de la création"]);
        }
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Erreur: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Méthode non autorisée"]);
}
?>
