<?php
// landing_page/landing_page_db.php

require_once 'database.php';

class LandingPageDB {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    // ==================== COUNTERS SECTION ====================

    /**
     * Get all counters for landing page
     */
    public function getLandingCounters() {
        try {
            $counters = [];
            
            // Get total clients count
            $clientsSql = "SELECT COUNT(*) as total_clients FROM Client";
            $clientsStmt = $this->conn->prepare($clientsSql);
            $clientsStmt->execute();
            $counters['total_clients'] = $clientsStmt->fetch(PDO::FETCH_ASSOC)['total_clients'] ?? 0;
            
            // Get total providers count
            $providersSql = "SELECT COUNT(*) as total_providers FROM Service_provider";
            $providersStmt = $this->conn->prepare($providersSql);
            $providersStmt->execute();
            $counters['total_providers'] = $providersStmt->fetch(PDO::FETCH_ASSOC)['total_providers'] ?? 0;
            
            // Get total services count
            $servicesSql = "SELECT COUNT(*) as total_services FROM services";
            $servicesStmt = $this->conn->prepare($servicesSql);
            $servicesStmt->execute();
            $counters['total_services'] = $servicesStmt->fetch(PDO::FETCH_ASSOC)['total_services'] ?? 0;
            
            // Get total projects count
            $projectsSql = "SELECT COUNT(*) as total_projects FROM Work";
            $projectsStmt = $this->conn->prepare($projectsSql);
            $projectsStmt->execute();
            $counters['total_projects'] = $projectsStmt->fetch(PDO::FETCH_ASSOC)['total_projects'] ?? 0;
            
            return $counters;
            
        } catch(PDOException $e) {
            error_log("LandingPageDB getLandingCounters error: " . $e->getMessage());
            return [
                'total_clients' => 0,
                'total_providers' => 0,
                'total_services' => 0,
                'total_projects' => 0
            ];
        }
    }

    // ==================== TESTIMONIALS SECTION ====================

    /**
     * Get testimonials for landing page bubbles
     */
    public function getLandingTestimonials($limit = 6) {
        try {
            $sql = "SELECT 
                cu.message,
                c.username as client_name,
                c.profile_picture,
                LEAST(5, GREATEST(1, ROUND(COALESCE(
                    (SELECT AVG(t.rating) 
                     FROM Testimonials t 
                     WHERE t.id_client = c.id_client), 
                    5
                )))) as star_rating
            FROM ContactUS cu
            JOIN Client c ON cu.id_client = c.id_client
            GROUP BY c.id_client, c.username, c.profile_picture, cu.message
            ORDER BY cu.datetime DESC
            LIMIT :limit";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch(PDOException $e) {
            error_log("LandingPageDB getLandingTestimonials error: " . $e->getMessage());
            return [];
        }
    }

    // ==================== CONTACT US SECTION ====================

    /**
     * Check if client exists by username and email
     */
    public function checkClientExists($username, $email) {
        try {
            $sql = "SELECT id_client 
                    FROM Client 
                    WHERE username = :username AND email = :email";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":username", $username);
            $stmt->bindParam(":email", $email);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ? $result['id_client'] : false;
            
        } catch(PDOException $e) {
            error_log("LandingPageDB checkClientExists error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Submit contact us message (for existing clients only)
     */
    public function submitContactMessage($clientId, $message) {
        try {
            $sql = "INSERT INTO ContactUS (id_client, message, datetime) 
                    VALUES (:client_id, :message, NOW())";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":client_id", $clientId);
            $stmt->bindParam(":message", $message);
            
            return $stmt->execute();
            
        } catch(PDOException $e) {
            error_log("LandingPageDB submitContactMessage error: " . $e->getMessage());
            return false;
        }
    }
}
?>