<?php
// api/auth/login.php - Connexion d'un utilisateur

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
    
    if (!empty($data->email) && !empty($data->password)) {
        
        $query = "SELECT id, username, email, password, role, first_name, last_name, avatar 
                  FROM users WHERE email = :email LIMIT 1";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":email", $data->email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Vérifier le mot de passe (pas de hachage)
            if ($data->password === $row['password']) {
                
                // Créer le token JWT
                $payload = [
                    'id' => $row['id'],
                    'username' => $row['username'],
                    'email' => $row['email'],
                    'role' => $row['role'],
                    'exp' => time() + (24 * 60 * 60) // Expire dans 24 heures
                ];
                
                $jwt = JWT::encode($payload);
                
                http_response_code(200);
                echo json_encode([
                    "success" => true,
                    "message" => "Connexion réussie",
                    "token" => $jwt,
                    "user" => [
                        "id" => $row['id'],
                        "username" => $row['username'],
                        "email" => $row['email'],
                        "role" => $row['role'],
                        "firstName" => $row['first_name'],
                        "lastName" => $row['last_name'],
                        "avatar" => $row['avatar']
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode([
                    "success" => false,
                    "message" => "Email ou mot de passe incorrect"
                ]);
            }
        } else {
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "Email ou mot de passe incorrect"
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Veuillez fournir un email et un mot de passe"
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
