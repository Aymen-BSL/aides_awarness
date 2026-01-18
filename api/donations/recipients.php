<?php
// api/donations/recipients.php - Get list of admins and medical professionals for donations

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $database = new Database();
    $db = $database->getConnection();
    
    try {
        $query = "SELECT 
                    u.id,
                    u.username,
                    u.first_name,
                    u.last_name,
                    u.role,
                    COALESCE(SUM(d.amount), 0) as total_donations,
                    COUNT(d.id) as donation_count
                  FROM users u
                  LEFT JOIN donations d ON u.id = d.recipient_id
                  WHERE u.role IN ('ADMIN', 'MEDICAL_PROFESSIONAL')
                  GROUP BY u.id, u.username, u.first_name, u.last_name, u.role
                  ORDER BY total_donations DESC, u.username ASC";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $recipients = $stmt->fetchAll();
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "data" => $recipients
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
