<?php
// api/donations/create.php - Create new donation

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../../config/database.php';
include_once '../../config/jwt.php';

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
    
    if (!$decoded) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Token invalide"]);
        exit();
    }
    
    $data = json_decode(file_get_contents("php://input"));
    
    // Validation
    if (!isset($data->recipient_id) || empty($data->recipient_id)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Destinataire requis"]);
        exit();
    }
    
    if (!isset($data->amount) || empty($data->amount) || $data->amount <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Montant invalide"]);
        exit();
    }
    
    $donor_id = $decoded['id'];
    $recipient_id = (int)$data->recipient_id;
    $amount = (float)$data->amount;
    $donor_name = isset($data->donor_name) && !empty(trim($data->donor_name)) ? trim($data->donor_name) : null;
    $message = isset($data->message) && !empty(trim($data->message)) ? trim($data->message) : null;
    
    // Validate amount range
    if ($amount < 5 || $amount > 1000) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Le montant doit être entre 5€ et 1000€"]);
        exit();
    }
    
    // Prevent self-donation
    if ($donor_id === $recipient_id) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Vous ne pouvez pas faire un don à vous-même"]);
        exit();
    }
    
    // Check if recipient exists and is admin or medical professional
    $checkQuery = "SELECT role FROM users WHERE id = :recipient_id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':recipient_id', $recipient_id, PDO::PARAM_INT);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Destinataire introuvable"]);
        exit();
    }
    
    $recipient = $checkStmt->fetch();
    if (!in_array($recipient['role'], ['ADMIN', 'MEDICAL_PROFESSIONAL'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Vous pouvez seulement faire des dons aux admins et professionnels médicaux"]);
        exit();
    }
    
    try {
        $query = "INSERT INTO donations (donor_id, donor_name, recipient_id, amount, message) 
                  VALUES (:donor_id, :donor_name, :recipient_id, :amount, :message)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':donor_id', $donor_id, PDO::PARAM_INT);
        
        if ($donor_name === null) {
            $stmt->bindValue(':donor_name', null, PDO::PARAM_NULL);
        } else {
            $stmt->bindParam(':donor_name', $donor_name);
        }
        
        $stmt->bindParam(':recipient_id', $recipient_id, PDO::PARAM_INT);
        $stmt->bindParam(':amount', $amount);
        
        if ($message === null) {
            $stmt->bindValue(':message', null, PDO::PARAM_NULL);
        } else {
            $stmt->bindParam(':message', $message);
        }
        
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Don envoyé avec succès! Merci pour votre soutien.",
                "donation_id" => $db->lastInsertId()
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Erreur lors de l'envoi du don"]);
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
