<?php
// ready_solutions/ready_solutions_db.php

require_once 'database.php';

class ReadySolutionsDB {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    /**
     * Add a new ready solution
     */
    public function addSolution($title, $description, $img, $link, $id_publisher) {
        try {
            $sql = "INSERT INTO Ready (img, title, description, link, id_publisher) 
                    VALUES (:img, :title, :description, :link, :id_publisher)";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":img", $img);
            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":description", $description);
            $stmt->bindParam(":link", $link);
            $stmt->bindParam(":id_publisher", $id_publisher);
            
            return $stmt->execute() ? $this->conn->lastInsertId() : false;
            
        } catch(PDOException $e) {
            error_log("ReadySolutionsDB addSolution error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all ready solutions with publisher info
     */
    public function getAllSolutions() {
        try {
            $sql = "SELECT r.*, p.publisher_username, p.profile_picture 
                    FROM Ready r
                    LEFT JOIN Publisher p ON r.id_publisher = p.id_publisher
                    ORDER BY r.id_ready DESC";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch(PDOException $e) {
            error_log("ReadySolutionsDB getAllSolutions error: " . $e->getMessage());
            return [];
        }
    }
}
?>