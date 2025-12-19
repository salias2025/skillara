<?php
// login/login_db.php

require_once 'database.php';

class LoginDB {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Authenticate user by checking both Client and Service_provider tables
     */
    public function authenticateUser($username, $password) {
        try {
            // IMPORTANT: We need to check the hashed password
            // First, get the user's data to verify password
            
            // Check in Client table
            $sql_client = "SELECT id_client as id, fullname, username, email, phone_number, 
                                  profile_picture, password, 'client' as user_type 
                           FROM Client 
                           WHERE username = :username OR email = :username";
            
            $stmt_client = $this->conn->prepare($sql_client);
            $stmt_client->bindParam(":username", $username);
            $stmt_client->execute();
            
            if ($stmt_client->rowCount() > 0) {
                $user = $stmt_client->fetch(PDO::FETCH_ASSOC);
                
                // Verify password (hashed)
                if (password_verify($password, $user['password'])) {
                    // Remove password from returned data for security
                    unset($user['password']);
                    return $user;
                }
            }
            
            // Check in Service_provider table
            $sql_provider = "SELECT id_provider as id, fullname, username, email, phone_number, 
                                    profile_picture, banner_image, background_image, 
                                    password, location, bio, 'provider' as user_type 
                             FROM Service_provider 
                             WHERE username = :username OR email = :username";
            
            $stmt_provider = $this->conn->prepare($sql_provider);
            $stmt_provider->bindParam(":username", $username);
            $stmt_provider->execute();
            
            if ($stmt_provider->rowCount() > 0) {
                $user = $stmt_provider->fetch(PDO::FETCH_ASSOC);
                
                // Verify password (hashed)
                if (password_verify($password, $user['password'])) {
                    // Remove password from returned data for security
                    unset($user['password']);
                    return $user;
                }
            }
            
            // If we get here, authentication failed
            return false;
            
        } catch(PDOException $e) {
            error_log("Authentication error: " . $e->getMessage());
            throw new Exception("Database error during authentication");
        }
    }

    /**
     * Get additional provider data if needed
     */
    public function getProviderDetails($provider_id) {
        try {
            $sql = "SELECT 
                    GROUP_CONCAT(DISTINCT st.name_service_type) as service_types,
                    GROUP_CONCAT(DISTINCT b.name_business) as business_names
                    FROM Service_provider sp
                    LEFT JOIN Provider_service_type pst ON sp.id_provider = pst.id_provider
                    LEFT JOIN Service_type st ON pst.id_service_type = st.id_service_type
                    LEFT JOIN Provider_business pb ON sp.id_provider = pb.id_provider
                    LEFT JOIN Business b ON pb.id_business = b.id_business
                    WHERE sp.id_provider = :provider_id
                    GROUP BY sp.id_provider";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":provider_id", $provider_id);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch(PDOException $e) {
            error_log("Get provider details error: " . $e->getMessage());
            return [];
        }
    }
}
?>