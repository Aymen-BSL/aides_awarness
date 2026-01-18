<?php
// api/admin/articles/upload-image.php - Upload article cover image

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
    
    // Check if file was uploaded
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Aucune image téléchargée"]);
        exit();
    }
    
    $file = $_FILES['image'];
    
    // Get file extension
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    // Validate file extension
    if (!in_array($extension, $allowedExtensions)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP"]);
        exit();
    }
    
    // Validate file size (max 5MB)
    $maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "La taille du fichier ne doit pas dépasser 5MB"]);
        exit();
    }
    
    // Create uploads directory if it doesn't exist
    $uploadDir = '../../../uploads/articles/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('article_', true) . '.' . $extension;
    $filePath = $uploadDir . $filename;
    
    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        // Return the URL path
        $imageUrl = '/aids/uploads/articles/' . $filename;
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Image téléchargée avec succès",
            "image_url" => $imageUrl
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Erreur lors du téléchargement de l'image"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Méthode non autorisée"]);
}
?>
