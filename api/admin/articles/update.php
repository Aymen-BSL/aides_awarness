<?php
// api/admin/articles/update.php - Update article

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
    
    // Verify JWT
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
    
    if (!isset($data->article_id)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "ID de l'article manquant"]);
        exit();
    }
    
    $article_id = (int)$data->article_id;
    $title = isset($data->title) ? trim($data->title) : null;
    $category = isset($data->category) ? trim($data->category) : null;
    $content = isset($data->content) ? trim($data->content) : null;
    $cover_image = isset($data->image_url) ? trim($data->image_url) : null;
    $status = isset($data->status) ? strtoupper(trim($data->status)) : null;
    
    if (!$title || !$category || !$content) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Tous les champs requis doivent être remplis"]);
        exit();
    }
    
    if ($status && !in_array($status, ['DRAFT', 'PUBLISHED'])) {
        $status = 'DRAFT';
    }
    
    try {
        $query = "UPDATE articles 
                  SET title = :title, 
                      content = :content, 
                      category = :category, 
                      status = :status, 
                      cover_image = :cover_image,
                      updated_at = CURRENT_TIMESTAMP
                  WHERE id = :article_id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':category', $category);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':cover_image', $cover_image);
        $stmt->bindParam(':article_id', $article_id, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["success" => true, "message" => "Article mis à jour avec succès"]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Erreur lors de la mise à jour"]);
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
