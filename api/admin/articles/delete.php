<?php
// api/admin/articles/delete.php - Delete article

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../../../config/database.php';
include_once '../../../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] === 'DELETE' || $_SERVER['REQUEST_METHOD'] === 'POST') {
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
    
    try {
        $query = "DELETE FROM articles WHERE id = :article_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':article_id', $article_id, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["success" => true, "message" => "Article supprimé avec succès"]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Erreur lors de la suppression"]);
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
