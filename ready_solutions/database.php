<?php
// main_page/database.php

class Database {
    private $host = "localhost";
    private $db_name = "skillara_db";
    private $username = "root";
    private $password = "";
    private $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,  // ← FIXED: Added missing "me" and comma
                $this->password   // ← FIXED: Proper indentation
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            error_log("Database connection error: " . $exception->getMessage());
        }

        return $this->conn;
    }
}
?>