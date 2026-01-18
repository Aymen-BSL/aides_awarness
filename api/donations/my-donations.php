<?php
// api/donations/my-donations.php - Get user's donation history

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include_once '../../config/database.php';
include_once '../../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
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
    
    $user_id = $decoded['id'];
    
    try {
        $query = "SELECT 
                    d.id,
                    d.amount,
                    d.donor_name,
                    d.message,
                    d.created_at,
                    u.username as recipient_username,
                    u.first_name as recipient_first_name,
                    u.last_name as recipient_last_name,
                    u.role as recipient_role
                  FROM donations d
                  JOIN users u ON d.recipient_id = u.id
                  WHERE d.donor_id = :user_id
                  ORDER BY d.created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->execute();
        
        $donations = $stmt->fetchAll();
        
        // Calculate total
        $total = array_sum(array_column($donations, 'amount'));
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "data" => [
                "donations" => $donations,
                "total_donated" => (float)$total,
                "count" => count($donations)
            ]
        ]);
        
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Erreur: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Méthode non autorisée"]);
}
?>
