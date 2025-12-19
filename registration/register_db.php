<?php
// registration/register_db.php

require_once 'database.php';

class RegisterDB {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Check if user exists in either Client or Service_provider tables
     */
    public function checkUserExists($email, $username, $phone) {
        try {
            // Check in Client table
            $sql_client = "SELECT COUNT(*) as count FROM Client WHERE email = :email OR username = :username OR phone_number = :phone";
            $stmt_client = $this->conn->prepare($sql_client);
            $stmt_client->bindParam(":email", $email);
            $stmt_client->bindParam(":username", $username);
            $stmt_client->bindParam(":phone", $phone);
            $stmt_client->execute();
            $result_client = $stmt_client->fetch(PDO::FETCH_ASSOC);

            // Check in Service_provider table
            $sql_provider = "SELECT COUNT(*) as count FROM Service_provider WHERE email = :email OR username = :username OR phone_number = :phone";
            $stmt_provider = $this->conn->prepare($sql_provider);
            $stmt_provider->bindParam(":email", $email);
            $stmt_provider->bindParam(":username", $username);
            $stmt_provider->bindParam(":phone", $phone);
            $stmt_provider->execute();
            $result_provider = $stmt_provider->fetch(PDO::FETCH_ASSOC);

            // If any count > 0, user exists
            if ($result_client['count'] > 0 || $result_provider['count'] > 0) {
                // Find out which field is duplicate
                $this->checkSpecificDuplicates($email, $username, $phone);
            }

            return false;
        } catch(PDOException $e) {
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    /**
     * Check which specific field is duplicate
     */
    private function checkSpecificDuplicates($email, $username, $phone) {
        $errors = [];

        // Check email
        $sql_email = "SELECT 'Client' as table_name FROM Client WHERE email = :email 
                      UNION 
                      SELECT 'Service_provider' as table_name FROM Service_provider WHERE email = :email";
        $stmt_email = $this->conn->prepare($sql_email);
        $stmt_email->bindParam(":email", $email);
        $stmt_email->execute();
        if ($stmt_email->rowCount() > 0) {
            $errors[] = "Email already exists";
        }

        // Check username
        $sql_username = "SELECT 'Client' as table_name FROM Client WHERE username = :username 
                         UNION 
                         SELECT 'Service_provider' as table_name FROM Service_provider WHERE username = :username";
        $stmt_username = $this->conn->prepare($sql_username);
        $stmt_username->bindParam(":username", $username);
        $stmt_username->execute();
        if ($stmt_username->rowCount() > 0) {
            $errors[] = "Username already exists";
        }

        // Check phone
        $sql_phone = "SELECT 'Client' as table_name FROM Client WHERE phone_number = :phone 
                      UNION 
                      SELECT 'Service_provider' as table_name FROM Service_provider WHERE phone_number = :phone";
        $stmt_phone = $this->conn->prepare($sql_phone);
        $stmt_phone->bindParam(":phone", $phone);
        $stmt_phone->execute();
        if ($stmt_phone->rowCount() > 0) {
            $errors[] = "Phone number already exists";
        }

        if (!empty($errors)) {
            throw new Exception(implode(", ", $errors));
        }
    }

    /**
     * Register a new client
     */
    public function registerClient($fullname, $username, $email, $phone, $password) {
        try {
            // Hash the password
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);

            // Insert into Client table
            $sql = "INSERT INTO Client (fullname, username, email, phone_number, password, profile_picture) 
                    VALUES (:fullname, :username, :email, :phone, :password, 'default_avatar.jpg')";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":fullname", $fullname);
            $stmt->bindParam(":username", $username);
            $stmt->bindParam(":email", $email);
            $stmt->bindParam(":phone", $phone);
            $stmt->bindParam(":password", $hashed_password);

            if ($stmt->execute()) {
                $client_id = $this->conn->lastInsertId();
                
                // Also insert into Publisher table
                $this->insertIntoPublisher($username);
                
                return [
                    'id' => $client_id,
                    'fullname' => $fullname,
                    'username' => $username,
                    'email' => $email,
                    'phone' => $phone,
                    'user_type' => 'client'
                ];
            }

            return false;
        } catch(PDOException $e) {
            throw new Exception("Error registering client: " . $e->getMessage());
        }
    }

    /**
     * Register a new service provider
     */
    public function registerProvider($fullname, $username, $email, $phone, $password, $location, $bio, $service_type, $business_name) {
        try {
            // Hash the password
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);

            // Insert into Service_provider table
            $sql = "INSERT INTO Service_provider (fullname, username, email, phone_number, password, profile_picture, location, bio) 
                    VALUES (:fullname, :username, :email, :phone, :password, 'default_avatar.jpg', :location, :bio)";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":fullname", $fullname);
            $stmt->bindParam(":username", $username);
            $stmt->bindParam(":email", $email);
            $stmt->bindParam(":phone", $phone);
            $stmt->bindParam(":password", $hashed_password);
            $stmt->bindParam(":location", $location);
            $stmt->bindParam(":bio", $bio);

            if ($stmt->execute()) {
                $provider_id = $this->conn->lastInsertId();
                
                // Insert into Publisher table
                $this->insertIntoPublisher($username);
                
                // Handle service type
                $service_type_id = $this->handleServiceType($service_type);
                if ($service_type_id) {
                    $this->linkProviderServiceType($provider_id, $service_type_id);
                }
                
                // Handle business name
                $business_id = $this->handleBusiness($business_name);
                if ($business_id) {
                    $this->linkProviderBusiness($provider_id, $business_id);
                }
                
                return [
                    'id' => $provider_id,
                    'fullname' => $fullname,
                    'username' => $username,
                    'email' => $email,
                    'phone' => $phone,
                    'location' => $location,
                    'user_type' => 'provider'
                ];
            }

            return false;
        } catch(PDOException $e) {
            throw new Exception("Error registering provider: " . $e->getMessage());
        }
    }

    /**
     * Insert user into Publisher table
     */
    private function insertIntoPublisher($username) {
        try {
            $sql = "INSERT INTO Publisher (publisher_username, profile_picture) 
                    VALUES (:username, 'default_avatar.jpg')";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":username", $username);
            $stmt->execute();
            
            return true;
        } catch(PDOException $e) {
            // If duplicate publisher, that's okay - just continue
            return false;
        }
    }

    /**
     * Handle service type insertion/linking
     */
    private function handleServiceType($service_type) {
        try {
            // First, check if service type exists
            $sql_check = "SELECT id_service_type FROM Service_type WHERE name_service_type = :service_type";
            $stmt_check = $this->conn->prepare($sql_check);
            $stmt_check->bindParam(":service_type", $service_type);
            $stmt_check->execute();
            
            if ($stmt_check->rowCount() > 0) {
                $result = $stmt_check->fetch(PDO::FETCH_ASSOC);
                return $result['id_service_type'];
            } else {
                // Insert new service type
                $sql_insert = "INSERT INTO Service_type (name_service_type) VALUES (:service_type)";
                $stmt_insert = $this->conn->prepare($sql_insert);
                $stmt_insert->bindParam(":service_type", $service_type);
                $stmt_insert->execute();
                
                return $this->conn->lastInsertId();
            }
        } catch(PDOException $e) {
            throw new Exception("Error handling service type: " . $e->getMessage());
        }
    }

    /**
     * Link provider with service type
     */
    private function linkProviderServiceType($provider_id, $service_type_id) {
        try {
            $sql = "INSERT IGNORE INTO Provider_service_type (id_provider, id_service_type) 
                    VALUES (:provider_id, :service_type_id)";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":provider_id", $provider_id);
            $stmt->bindParam(":service_type_id", $service_type_id);
            $stmt->execute();
            
            return true;
        } catch(PDOException $e) {
            throw new Exception("Error linking provider with service type: " . $e->getMessage());
        }
    }

    /**
     * Handle business insertion/linking
     */
    private function handleBusiness($business_name) {
        try {
            // First, check if business exists
            $sql_check = "SELECT id_business FROM Business WHERE name_business = :business_name";
            $stmt_check = $this->conn->prepare($sql_check);
            $stmt_check->bindParam(":business_name", $business_name);
            $stmt_check->execute();
            
            if ($stmt_check->rowCount() > 0) {
                $result = $stmt_check->fetch(PDO::FETCH_ASSOC);
                return $result['id_business'];
            } else {
                // Insert new business
                $sql_insert = "INSERT INTO Business (name_business) VALUES (:business_name)";
                $stmt_insert = $this->conn->prepare($sql_insert);
                $stmt_insert->bindParam(":business_name", $business_name);
                $stmt_insert->execute();
                
                return $this->conn->lastInsertId();
            }
        } catch(PDOException $e) {
            throw new Exception("Error handling business: " . $e->getMessage());
        }
    }

    /**
     * Link provider with business
     */
    private function linkProviderBusiness($provider_id, $business_id) {
        try {
            $sql = "INSERT IGNORE INTO Provider_business (id_provider, id_business) 
                    VALUES (:provider_id, :business_id)";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":provider_id", $provider_id);
            $stmt->bindParam(":business_id", $business_id);
            $stmt->execute();
            
            return true;
        } catch(PDOException $e) {
            throw new Exception("Error linking provider with business: " . $e->getMessage());
        }
    }
}
?>