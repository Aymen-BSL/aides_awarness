<?php
// api/donations/stats.php - Get recipient donation statistics

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

include_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!isset($_GET['user_id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "ID utilisateur requis"]);
        exit();
    }
    
    $user_id = (int)$_GET['user_id'];
    
    try {
        // Get total amount and count
        $statsQuery = "SELECT 
                        COALESCE(SUM(amount), 0) as total_amount,
                        COUNT(*) as donation_count
                       FROM donations 
                       WHERE recipient_id = :user_id";
        
        $statsStmt = $db->prepare($statsQuery);
        $statsStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $statsStmt->execute();
        
        $stats = $statsStmt->fetch();
        
        // Get recent donations (last 5)
        $recentQuery = "SELECT 
                          d.id,
                          d.amount,
                          d.donor_name,
                          d.message,
                          d.created_at,
                          u.username as donor_username
                        FROM donations d
                        LEFT JOIN users u ON d.donor_id = u.id
                        WHERE d.recipient_id = :user_id
                        ORDER BY d.created_at DESC
                        LIMIT 5";
        
        $recentStmt = $db->prepare($recentQuery);
        $recentStmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $recentStmt->execute();
        
        $recent_donations = $recentStmt->fetchAll();
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "data" => [
                "total_amount" => (float)$stats['total_amount'],
                "donation_count" => (int)$stats['donation_count'],
                "recent_donations" => $recent_donations
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
