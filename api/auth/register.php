<?php
// api/auth/register.php - Inscription d'un nouvel utilisateur

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';
include_once '../../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $database = new Database();
    $db = $database->getConnection();
    
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->username) && !empty($data->email) && !empty($data->password)) {
        
        // Vérifier si l'username existe déjà
        $query = "SELECT id FROM users WHERE username = :username OR email = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":username", $data->username);
        $stmt->bindParam(":email", $data->email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Nom d'utilisateur ou email déjà utilisé"
            ]);
            exit();
        }
        
        // Insérer le nouvel utilisateur
        $query = "INSERT INTO users (username, email, password, first_name, last_name, role) 
                  VALUES (:username, :email, :password, :first_name, :last_name, 'USER')";
        
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":username", $data->username);
        $stmt->bindParam(":email", $data->email);
        $stmt->bindParam(":password", $data->password); // Pas de hachage comme demandé
        $stmt->bindParam(":first_name", $data->firstName);
        $stmt->bindParam(":last_name", $data->lastName);
        
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Utilisateur créé avec succès"
            ]);
        } else {
            http_response_code(503);
            echo json_encode([
                "success" => false,
                "message" => "Impossible de créer l'utilisateur"
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Données incomplètes. Veuillez remplir tous les champs requis."
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
