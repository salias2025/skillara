<?php
// profile_service_provider/profile_db.php

require_once 'database.php';

class ProfileDB {
    private $conn;

    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }

    // ==================== PROFILE SECTION ====================

    /**
     * Get complete profile data for a provider (top section)
     */
    public function getProfileData($providerId) {
        try {
            $sql = "SELECT 
                sp.id_provider,
                sp.username,
                sp.fullname,
                sp.email,
                sp.phone_number,
                sp.password,
                sp.profile_picture,
                sp.banner_image,
                sp.background_image,
                sp.location,
                sp.bio,
                sp.created_at,
                b.name_business,
                GROUP_CONCAT(DISTINCT st.name_service_type SEPARATOR ', ') as service_types
            FROM Service_provider sp
            LEFT JOIN Provider_business pb ON sp.id_provider = pb.id_provider
            LEFT JOIN Business b ON pb.id_business = b.id_business
            LEFT JOIN Provider_service_type pst ON sp.id_provider = pst.id_provider
            LEFT JOIN Service_type st ON pst.id_service_type = st.id_service_type
            WHERE sp.id_provider = :provider_id
            GROUP BY sp.id_provider";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":provider_id", $providerId);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch(PDOException $e) {
            error_log("ProfileDB getProfileData error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update profile picture
     */
    public function updateProfilePicture($providerId, $imagePath) {
        try {
            $sql = "UPDATE Service_provider 
                    SET profile_picture = :image_path 
                    WHERE id_provider = :provider_id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":image_path", $imagePath);
            $stmt->bindParam(":provider_id", $providerId);
            
            return $stmt->execute();
            
        } catch(PDOException $e) {
            error_log("ProfileDB updateProfilePicture error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update banner image
     */
    public function updateBannerImage($providerId, $imagePath) {
        try {
            $sql = "UPDATE Service_provider 
                    SET banner_image = :image_path 
                    WHERE id_provider = :provider_id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":image_path", $imagePath);
            $stmt->bindParam(":provider_id", $providerId);
            
            return $stmt->execute();
            
        } catch(PDOException $e) {
            error_log("ProfileDB updateBannerImage error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update background image
     */
    public function updateBackgroundImage($providerId, $imagePath) {
        try {
            $sql = "UPDATE Service_provider 
                    SET background_image = :image_path 
                    WHERE id_provider = :provider_id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":image_path", $imagePath);
            $stmt->bindParam(":provider_id", $providerId);
            
            return $stmt->execute();
            
        } catch(PDOException $e) {
            error_log("ProfileDB updateBackgroundImage error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update username
     */
    public function updateUsername($providerId, $username) {
        try {
            $sql = "UPDATE Service_provider 
                    SET username = :username 
                    WHERE id_provider = :provider_id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":username", $username);
            $stmt->bindParam(":provider_id", $providerId);
            
            return $stmt->execute();
            
        } catch(PDOException $e) {
            error_log("ProfileDB updateUsername error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update business association
     */
    public function updateBusiness($providerId, $businessName) {
        try {
            // First, get or create business ID
            $businessId = $this->getOrCreateBusiness($businessName);
            
            // Check if provider already has a business
            $checkSql = "SELECT id_business FROM Provider_business WHERE id_provider = :provider_id";
            $checkStmt = $this->conn->prepare($checkSql);
            $checkStmt->bindParam(":provider_id", $providerId);
            $checkStmt->execute();
            
            if ($checkStmt->rowCount() > 0) {
                // Update existing
                $sql = "UPDATE Provider_business 
                        SET id_business = :business_id 
                        WHERE id_provider = :provider_id";
            } else {
                // Insert new
                $sql = "INSERT INTO Provider_business (id_provider, id_business) 
                        VALUES (:provider_id, :business_id)";
            }
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":provider_id", $providerId);
            $stmt->bindParam(":business_id", $businessId);
            
            return $stmt->execute();
            
        } catch(PDOException $e) {
            error_log("ProfileDB updateBusiness error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Helper: Get or create business
     */
    private function getOrCreateBusiness($businessName) {
        try {
            // Check if exists
            $sql = "SELECT id_business FROM Business WHERE name_business = :name";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":name", $businessName);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                return $row['id_business'];
            } else {
                // Create new
                $insertSql = "INSERT INTO Business (name_business) VALUES (:name)";
                $insertStmt = $this->conn->prepare($insertSql);
                $insertStmt->bindParam(":name", $businessName);
                $insertStmt->execute();
                
                return $this->conn->lastInsertId();
            }
            
        } catch(PDOException $e) {
            throw new Exception("Business creation error: " . $e->getMessage());
        }
    }

    /**
     * Update location
     */
    public function updateLocation($providerId, $location) {
        try {
            $sql = "UPDATE Service_provider 
                    SET location = :location 
                    WHERE id_provider = :provider_id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":location", $location);
            $stmt->bindParam(":provider_id", $providerId);
            
            return $stmt->execute();
            
        } catch(PDOException $e) {
            error_log("ProfileDB updateLocation error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update bio
     */
    public function updateBio($providerId, $bio) {
        try {
            $sql = "UPDATE Service_provider 
                    SET bio = :bio 
                    WHERE id_provider = :provider_id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":bio", $bio);
            $stmt->bindParam(":provider_id", $providerId);
            
            return $stmt->execute();
            
        } catch(PDOException $e) {
            error_log("ProfileDB updateBio error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update service types
     */
    public function updateServiceTypes($providerId, $serviceTypes) {
        try {
            // Start transaction
            $this->conn->beginTransaction();
            
            // Delete existing service types
            $deleteSql = "DELETE FROM Provider_service_type WHERE id_provider = :provider_id";
            $deleteStmt = $this->conn->prepare($deleteSql);
            $deleteStmt->bindParam(":provider_id", $providerId);
            $deleteStmt->execute();
            
            // Insert new service types
            $serviceTypesArray = explode(',', $serviceTypes);
            foreach ($serviceTypesArray as $serviceType) {
                $serviceType = trim($serviceType);
                if (!empty($serviceType)) {
                    $serviceTypeId = $this->getOrCreateServiceType($serviceType);
                    
                    $insertSql = "INSERT INTO Provider_service_type (id_provider, id_service_type) 
                                  VALUES (:provider_id, :service_type_id)";
                    $insertStmt = $this->conn->prepare($insertSql);
                    $insertStmt->bindParam(":provider_id", $providerId);
                    $insertStmt->bindParam(":service_type_id", $serviceTypeId);
                    $insertStmt->execute();
                }
            }
            
            $this->conn->commit();
            return true;
            
        } catch(PDOException $e) {
            $this->conn->rollBack();
            error_log("ProfileDB updateServiceTypes error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Helper: Get or create service type
     */
    private function getOrCreateServiceType($serviceType) {
        try {
            // Check if exists
            $sql = "SELECT id_service_type FROM Service_type WHERE name_service_type = :name";
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":name", $serviceType);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                return $row['id_service_type'];
            } else {
                // Create new
                $insertSql = "INSERT INTO Service_type (name_service_type) VALUES (:name)";
                $insertStmt = $this->conn->prepare($insertSql);
                $insertStmt->bindParam(":name", $serviceType);
                $insertStmt->execute();
                
                return $this->conn->lastInsertId();
            }
            
        } catch(PDOException $e) {
            throw new Exception("Service type creation error: " . $e->getMessage());
        }
    }

    // ==================== SOCIAL MEDIA SECTION ====================

    /**
     * Get social media links for a provider
     */
    public function getSocialMedia($providerId) {
        try {
            $sql = "SELECT 
                sm.id_media,
                sm.name_media,
                smp.link
            FROM social_medias_provider smp
            JOIN social_medias sm ON smp.id_media = sm.id_media
            WHERE smp.id_provider = :provider_id
            ORDER BY sm.name_media";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":provider_id", $providerId);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch(PDOException $e) {
            error_log("ProfileDB getSocialMedia error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Update social media link
     */
    public function updateSocialMedia($providerId, $mediaId, $link) {
        try {
            // Check if exists
            $checkSql = "SELECT id_media FROM social_medias_provider 
                        WHERE id_provider = :provider_id AND id_media = :media_id";
            $checkStmt = $this->conn->prepare($checkSql);
            $checkStmt->bindParam(":provider_id", $providerId);
            $checkStmt->bindParam(":media_id", $mediaId);
            $checkStmt->execute();
            
            if ($checkStmt->rowCount() > 0) {
                // Update existing
                $sql = "UPDATE social_medias_provider 
                        SET link = :link 
                        WHERE id_provider = :provider_id AND id_media = :media_id";
            } else {
                // Insert new
                $sql = "INSERT INTO social_medias_provider (id_media, id_provider, link) 
                        VALUES (:media_id, :provider_id, :link)";
            }
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":provider_id", $providerId);
            $stmt->bindParam(":media_id", $mediaId);
            $stmt->bindParam(":link", $link);
            
            return $stmt->execute();
            
        } catch(PDOException $e) {
            error_log("ProfileDB updateSocialMedia error: " . $e->getMessage());
            return false;
        }
    }

    // ==================== SERVICES SECTION ====================

    /**
     * Get services for a provider
     */
    public function getServices($providerId) {
        try {
            $sql = "SELECT 
                s.id_service,
                s.icon,
                s.title,
                s.description
            FROM services_provider sp
            JOIN services s ON sp.id_service = s.id_service
            WHERE sp.id_provider = :provider_id
            ORDER BY s.title";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":provider_id", $providerId);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch(PDOException $e) {
            error_log("ProfileDB getServices error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Add a new service
     */
    public function addService($providerId, $icon, $title, $description) {
        try {
            $this->conn->beginTransaction();
            
            // Insert into services table
            $sql = "INSERT INTO services (icon, title, description) 
                    VALUES (:icon, :title, :description)";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":icon", $icon);
            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":description", $description);
            $stmt->execute();
            
            $serviceId = $this->conn->lastInsertId();
            
            // Link to provider
            $linkSql = "INSERT INTO services_provider (id_service, id_provider) 
                        VALUES (:service_id, :provider_id)";
            
            $linkStmt = $this->conn->prepare($linkSql);
            $linkStmt->bindParam(":service_id", $serviceId);
            $linkStmt->bindParam(":provider_id", $providerId);
            $linkStmt->execute();
            
            $this->conn->commit();
            return $serviceId;
            
        } catch(PDOException $e) {
            $this->conn->rollBack();
            error_log("ProfileDB addService error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update a service
     */
    public function updateService($serviceId, $icon, $title, $description) {
        try {
            $sql = "UPDATE services 
                    SET icon = :icon,
                        title = :title, 
                        description = :description
                    WHERE id_service = :service_id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":icon", $icon);
            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":description", $description);
            $stmt->bindParam(":service_id", $serviceId);
            
            return $stmt->execute();
            
        } catch(PDOException $e) {
            error_log("ProfileDB updateService error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete a service
     */
    public function deleteService($providerId, $serviceId) {
        try {
            $this->conn->beginTransaction();
            
            // First delete from services_provider
            $deleteLinkSql = "DELETE FROM services_provider 
                             WHERE id_service = :service_id AND id_provider = :provider_id";
            $deleteLinkStmt = $this->conn->prepare($deleteLinkSql);
            $deleteLinkStmt->bindParam(":service_id", $serviceId);
            $deleteLinkStmt->bindParam(":provider_id", $providerId);
            $deleteLinkStmt->execute();
            
            // Then delete from services
            $deleteServiceSql = "DELETE FROM services WHERE id_service = :service_id";
            $deleteServiceStmt = $this->conn->prepare($deleteServiceSql);
            $deleteServiceStmt->bindParam(":service_id", $serviceId);
            $deleteServiceStmt->execute();
            
            $this->conn->commit();
            return true;
            
        } catch(PDOException $e) {
            $this->conn->rollBack();
            error_log("ProfileDB deleteService error: " . $e->getMessage());
            return false;
        }
    }

    // ==================== SKILLS SECTION ====================

    /**
     * Get skills for a provider
     */
   public function getSkills($providerId) {
    try {
        $sql = "SELECT 
            s.id_skill,
            s.icon,
            s.title,
            s.mastery,
            s.color
        FROM Skills_provider sp
        JOIN Skills s ON sp.id_skill = s.id_skill
        WHERE sp.id_provider = :provider_id
        ORDER BY s.title";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":provider_id", $providerId);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
        
    } catch(PDOException $e) {
        error_log("ProfileDB getSkills error: " . $e->getMessage());
        return [];
    }
}

    /**
     * Add a new skill
     */
    public function addSkill($providerId, $icon, $title, $mastery, $color = '#7B3FE4') {
    try {
        $this->conn->beginTransaction();
        
        // Insert into Skills table WITH COLOR
        $sql = "INSERT INTO Skills (icon, title, mastery, color) 
                VALUES (:icon, :title, :mastery, :color)";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":icon", $icon);
        $stmt->bindParam(":title", $title);
        $stmt->bindParam(":mastery", $mastery);
        $stmt->bindParam(":color", $color);
        $stmt->execute();
        
        $skillId = $this->conn->lastInsertId();
        
        // Link to provider
        $linkSql = "INSERT INTO Skills_provider (id_skill, id_provider) 
                    VALUES (:skill_id, :provider_id)";
        
        $linkStmt = $this->conn->prepare($linkSql);
        $linkStmt->bindParam(":skill_id", $skillId);
        $linkStmt->bindParam(":provider_id", $providerId);
        $linkStmt->execute();
        
        $this->conn->commit();
        return $skillId;
        
    } catch(PDOException $e) {
        $this->conn->rollBack();
        error_log("ProfileDB addSkill error: " . $e->getMessage());
        return false;
    }
}
    /**
     * Update a skill
     */
    public function updateSkill($skillId, $icon, $title, $mastery, $color = null) {
    try {
        if ($color) {
            // Update with color
            $sql = "UPDATE Skills 
                    SET icon = :icon,
                        title = :title,
                        mastery = :mastery,
                        color = :color
                    WHERE id_skill = :skill_id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":icon", $icon);
            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":mastery", $mastery);
            $stmt->bindParam(":color", $color);
            $stmt->bindParam(":skill_id", $skillId);
        } else {
            // Update without color (for backward compatibility)
            $sql = "UPDATE Skills 
                    SET icon = :icon,
                        title = :title,
                        mastery = :mastery
                    WHERE id_skill = :skill_id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":icon", $icon);
            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":mastery", $mastery);
            $stmt->bindParam(":skill_id", $skillId);
        }
        
        return $stmt->execute();
        
    } catch(PDOException $e) {
        error_log("ProfileDB updateSkill error: " . $e->getMessage());
        return false;
    }
}

    /**
     * Delete a skill
     */
    public function deleteSkill($providerId, $skillId) {
        try {
            $this->conn->beginTransaction();
            
            // First delete from Skills_provider
            $deleteLinkSql = "DELETE FROM Skills_provider 
                             WHERE id_skill = :skill_id AND id_provider = :provider_id";
            $deleteLinkStmt = $this->conn->prepare($deleteLinkSql);
            $deleteLinkStmt->bindParam(":skill_id", $skillId);
            $deleteLinkStmt->bindParam(":provider_id", $providerId);
            $deleteLinkStmt->execute();
            
            // Then delete from Skills
            $deleteSkillSql = "DELETE FROM Skills WHERE id_skill = :skill_id";
            $deleteSkillStmt = $this->conn->prepare($deleteSkillSql);
            $deleteSkillStmt->bindParam(":skill_id", $skillId);
            $deleteSkillStmt->execute();
            
            $this->conn->commit();
            return true;
            
        } catch(PDOException $e) {
            $this->conn->rollBack();
            error_log("ProfileDB deleteSkill error: " . $e->getMessage());
            return false;
        }
    }

    // ==================== CERTIFICATIONS SECTION ====================

    /**
     * Get certifications for a provider
     */
    public function getCertifications($providerId) {
        try {
            $sql = "SELECT 
                c.id_certification,
                c.title,
                c.issuer,
                c.date,
                c.description,
                c.link,
                c.logo
            FROM Certifications_provider cp
            JOIN Certifications c ON cp.id_certification = c.id_certification
            WHERE cp.id_provider = :provider_id
            ORDER BY c.date DESC";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":provider_id", $providerId);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch(PDOException $e) {
            error_log("ProfileDB getCertifications error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Add a new certification
     */
    public function addCertification($providerId, $title, $issuer, $date, $description, $link, $logo) {
        try {
            $this->conn->beginTransaction();
            
            // Insert into Certifications table
            $sql = "INSERT INTO Certifications (title, issuer, date, description, link, logo) 
                    VALUES (:title, :issuer, :date, :description, :link, :logo)";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":issuer", $issuer);
            $stmt->bindParam(":date", $date);
            $stmt->bindParam(":description", $description);
            $stmt->bindParam(":link", $link);
            $stmt->bindParam(":logo", $logo);
            $stmt->execute();
            
            $certId = $this->conn->lastInsertId();
            
            // Link to provider
            $linkSql = "INSERT INTO Certifications_provider (id_certification, id_provider) 
                        VALUES (:cert_id, :provider_id)";
            
            $linkStmt = $this->conn->prepare($linkSql);
            $linkStmt->bindParam(":cert_id", $certId);
            $linkStmt->bindParam(":provider_id", $providerId);
            $linkStmt->execute();
            
            $this->conn->commit();
            return $certId;
            
        } catch(PDOException $e) {
            $this->conn->rollBack();
            error_log("ProfileDB addCertification error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update a certification
     */
    public function updateCertification($certificationId, $title, $issuer, $date, $description, $link, $logo) {
        try {
            $sql = "UPDATE Certifications 
                    SET title = :title,
                        issuer = :issuer,
                        date = :date,
                        description = :description,
                        link = :link,
                        logo = :logo
                    WHERE id_certification = :certification_id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":issuer", $issuer);
            $stmt->bindParam(":date", $date);
            $stmt->bindParam(":description", $description);
            $stmt->bindParam(":link", $link);
            $stmt->bindParam(":logo", $logo);
            $stmt->bindParam(":certification_id", $certificationId);
            
            return $stmt->execute();
            
        } catch(PDOException $e) {
            error_log("ProfileDB updateCertification error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete a certification
     */
    public function deleteCertification($providerId, $certificationId) {
        try {
            $this->conn->beginTransaction();
            
            // First delete from Certifications_provider
            $deleteLinkSql = "DELETE FROM Certifications_provider 
                             WHERE id_certification = :certification_id AND id_provider = :provider_id";
            $deleteLinkStmt = $this->conn->prepare($deleteLinkSql);
            $deleteLinkStmt->bindParam(":certification_id", $certificationId);
            $deleteLinkStmt->bindParam(":provider_id", $providerId);
            $deleteLinkStmt->execute();
            
            // Then delete from Certifications
            $deleteCertSql = "DELETE FROM Certifications WHERE id_certification = :certification_id";
            $deleteCertStmt = $this->conn->prepare($deleteCertSql);
            $deleteCertStmt->bindParam(":certification_id", $certificationId);
            $deleteCertStmt->execute();
            
            $this->conn->commit();
            return true;
            
        } catch(PDOException $e) {
            $this->conn->rollBack();
            error_log("ProfileDB deleteCertification error: " . $e->getMessage());
            return false;
        }
    }

    // ==================== PORTFOLIO SECTION ====================

    /**
     * Get portfolio items for a provider
     */
    public function getPortfolio($providerId) {
        try {
            $sql = "SELECT 
                p.id_portfolio,
                p.title,
                p.category,
                p.img,
                p.link
            FROM Portfolios_provider pp
            JOIN Portfolios p ON pp.id_portfolio = p.id_portfolio
            WHERE pp.id_provider = :provider_id
            ORDER BY p.title";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":provider_id", $providerId);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch(PDOException $e) {
            error_log("ProfileDB getPortfolio error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Add a new portfolio item
     */
    public function addPortfolio($providerId, $title, $category, $img, $link) {
        try {
            $this->conn->beginTransaction();
            
            // Insert into Portfolios table
            $sql = "INSERT INTO Portfolios (title, category, img, link) 
                    VALUES (:title, :category, :img, :link)";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":category", $category);
            $stmt->bindParam(":img", $img);
            $stmt->bindParam(":link", $link);
            $stmt->execute();
            
            $portfolioId = $this->conn->lastInsertId();
            
            // Link to provider
            $linkSql = "INSERT INTO Portfolios_provider (id_portfolio, id_provider) 
                        VALUES (:portfolio_id, :provider_id)";
            
            $linkStmt = $this->conn->prepare($linkSql);
            $linkStmt->bindParam(":portfolio_id", $portfolioId);
            $linkStmt->bindParam(":provider_id", $providerId);
            $linkStmt->execute();
            
            $this->conn->commit();
            return $portfolioId;
            
        } catch(PDOException $e) {
            $this->conn->rollBack();
            error_log("ProfileDB addPortfolio error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update a portfolio item
     */
    public function updatePortfolio($portfolioId, $title, $category, $img, $link) {
        try {
            $sql = "UPDATE Portfolios 
                    SET title = :title,
                        category = :category,
                        img = :img,
                        link = :link
                    WHERE id_portfolio = :portfolio_id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":title", $title);
            $stmt->bindParam(":category", $category);
            $stmt->bindParam(":img", $img);
            $stmt->bindParam(":link", $link);
            $stmt->bindParam(":portfolio_id", $portfolioId);
            
            return $stmt->execute();
            
        } catch(PDOException $e) {
            error_log("ProfileDB updatePortfolio error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete a portfolio item
     */
    public function deletePortfolio($providerId, $portfolioId) {
        try {
            $this->conn->beginTransaction();
            
            // First delete from Portfolios_provider
            $deleteLinkSql = "DELETE FROM Portfolios_provider 
                             WHERE id_portfolio = :portfolio_id AND id_provider = :provider_id";
            $deleteLinkStmt = $this->conn->prepare($deleteLinkSql);
            $deleteLinkStmt->bindParam(":portfolio_id", $portfolioId);
            $deleteLinkStmt->bindParam(":provider_id", $providerId);
            $deleteLinkStmt->execute();
            
            // Then delete from Portfolios
            $deletePortfolioSql = "DELETE FROM Portfolios WHERE id_portfolio = :portfolio_id";
            $deletePortfolioStmt = $this->conn->prepare($deletePortfolioSql);
            $deletePortfolioStmt->bindParam(":portfolio_id", $portfolioId);
            $deletePortfolioStmt->execute();
            
            $this->conn->commit();
            return true;
            
        } catch(PDOException $e) {
            $this->conn->rollBack();
            error_log("ProfileDB deletePortfolio error: " . $e->getMessage());
            return false;
        }
    }

    // ==================== TESTIMONIALS SECTION ====================

    /**
     * Get testimonials for a provider
     */
    public function getTestimonials($providerId) {
    try {
        // USE THIS EXACT SQL (no id_testimonial, no created_at)
        $sql = "SELECT 
            c.profile_picture,
            c.username,
            t.message,
            t.rating
        FROM Testimonials t
        JOIN Client c ON t.id_client = c.id_client
        WHERE t.id_provider = :provider_id
        ORDER BY t.id_testimonial DESC";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":provider_id", $providerId);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
        
    } catch(PDOException $e) {
        error_log("ProfileDB getTestimonials error: " . $e->getMessage());
        return [];
    }
}

    /**
     * Add a new testimonial
     */
    public function addTestimonial($providerId, $clientId, $message, $rating) {
        try {
            $sql = "INSERT INTO Testimonials (id_provider, id_client, message, rating) 
                    VALUES (:provider_id, :client_id, :message, :rating)";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":provider_id", $providerId);
            $stmt->bindParam(":client_id", $clientId);
            $stmt->bindParam(":message", $message);
            $stmt->bindParam(":rating", $rating);
            
            return $stmt->execute();
            
        } catch(PDOException $e) {
            error_log("ProfileDB addTestimonial error: " . $e->getMessage());
            return false;
        }
    }

    // ==================== STATISTICS SECTION ====================

    /**
     * Get all statistics for a provider
     */
    public function getStatistics($providerId) {
        try {
            $stats = [];
            
            // Client count
            $clientSql = "SELECT COUNT(DISTINCT id_client) as client_count 
                         FROM Testimonials 
                         WHERE id_provider = :provider_id";
            $clientStmt = $this->conn->prepare($clientSql);
            $clientStmt->bindParam(":provider_id", $providerId);
            $clientStmt->execute();
            $stats['client_count'] = $clientStmt->fetch(PDO::FETCH_ASSOC)['client_count'] ?? 0;
            
            // Testimonial count
            $testimonialSql = "SELECT COUNT(*) as testimonial_count 
                              FROM Testimonials 
                              WHERE id_provider = :provider_id";
            $testimonialStmt = $this->conn->prepare($testimonialSql);
            $testimonialStmt->bindParam(":provider_id", $providerId);
            $testimonialStmt->execute();
            $stats['testimonial_count'] = $testimonialStmt->fetch(PDO::FETCH_ASSOC)['testimonial_count'] ?? 0;
            
            // Service count
            $serviceSql = "SELECT COUNT(*) as service_count 
                          FROM services_provider 
                          WHERE id_provider = :provider_id";
            $serviceStmt = $this->conn->prepare($serviceSql);
            $serviceStmt->bindParam(":provider_id", $providerId);
            $serviceStmt->execute();
            $stats['service_count'] = $serviceStmt->fetch(PDO::FETCH_ASSOC)['service_count'] ?? 0;
            
            // Skill count
            $skillSql = "SELECT COUNT(*) as skill_count 
                        FROM Skills_provider 
                        WHERE id_provider = :provider_id";
            $skillStmt = $this->conn->prepare($skillSql);
            $skillStmt->bindParam(":provider_id", $providerId);
            $skillStmt->execute();
            $stats['skill_count'] = $skillStmt->fetch(PDO::FETCH_ASSOC)['skill_count'] ?? 0;
            
            // Certification count
            $certSql = "SELECT COUNT(*) as certification_count 
                       FROM Certifications_provider 
                       WHERE id_provider = :provider_id";
            $certStmt = $this->conn->prepare($certSql);
            $certStmt->bindParam(":provider_id", $providerId);
            $certStmt->execute();
            $stats['certification_count'] = $certStmt->fetch(PDO::FETCH_ASSOC)['certification_count'] ?? 0;
            
            // Portfolio count
            $portfolioSql = "SELECT COUNT(*) as portfolio_count 
                           FROM Portfolios_provider 
                           WHERE id_provider = :provider_id";
            $portfolioStmt = $this->conn->prepare($portfolioSql);
            $portfolioStmt->bindParam(":provider_id", $providerId);
            $portfolioStmt->execute();
            $stats['portfolio_count'] = $portfolioStmt->fetch(PDO::FETCH_ASSOC)['portfolio_count'] ?? 0;
            
            // Average rating
            $ratingSql = "SELECT 
                         AVG(rating) as average_rating,
                         COUNT(*) as total_reviews
                         FROM Testimonials 
                         WHERE id_provider = :provider_id";
            $ratingStmt = $this->conn->prepare($ratingSql);
            $ratingStmt->bindParam(":provider_id", $providerId);
            $ratingStmt->execute();
            $ratingData = $ratingStmt->fetch(PDO::FETCH_ASSOC);
            $stats['average_rating'] = $ratingData['average_rating'] ?? 0;
            $stats['total_reviews'] = $ratingData['total_reviews'] ?? 0;
            
            // Join date and experience
            $experienceSql = "SELECT 
                             TIMESTAMPDIFF(YEAR, created_at, NOW()) as years_experience,
                             TIMESTAMPDIFF(MONTH, created_at, NOW()) % 12 as months_experience,
                             created_at as join_date
                             FROM Service_provider 
                             WHERE id_provider = :provider_id";
            $experienceStmt = $this->conn->prepare($experienceSql);
            $experienceStmt->bindParam(":provider_id", $providerId);
            $experienceStmt->execute();
            $expData = $experienceStmt->fetch(PDO::FETCH_ASSOC);
            $stats['years_experience'] = $expData['years_experience'] ?? 0;
            $stats['months_experience'] = $expData['months_experience'] ?? 0;
            $stats['join_date'] = $expData['join_date'] ?? '';
            
            // Total works (to-do list)
            $worksSql = "SELECT COUNT(*) as total_works 
                        FROM Work w
                        JOIN List l ON w.id_list = l.id_list
                        WHERE l.id_provider = :provider_id";
            $worksStmt = $this->conn->prepare($worksSql);
            $worksStmt->bindParam(":provider_id", $providerId);
            $worksStmt->execute();
            $stats['total_works'] = $worksStmt->fetch(PDO::FETCH_ASSOC)['total_works'] ?? 0;
            
            return $stats;
            
        } catch(PDOException $e) {
            error_log("ProfileDB getStatistics error: " . $e->getMessage());
            return [];
        }
    }

    // ==================== SUBSCRIPTION FUNCTIONS ====================

/**
 * Subscribe a client to a provider
 */
public function subscribeClient($providerId, $clientId) {
    try {
        // First check if already subscribed
        if ($this->isClientSubscribed($providerId, $clientId)) {
            return ['success' => false, 'message' => 'Already subscribed'];
        }
        
        $sql = "INSERT INTO Client_provider (id_provider, id_client) 
                VALUES (:provider_id, :client_id)";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":provider_id", $providerId);
        $stmt->bindParam(":client_id", $clientId);
        
        $result = $stmt->execute();
        
        return $result ? 
            ['success' => true, 'message' => 'Subscribed successfully'] :
            ['success' => false, 'message' => 'Subscription failed'];
            
    } catch(PDOException $e) {
        error_log("ProfileDB subscribeClient error: " . $e->getMessage());
        return ['success' => false, 'message' => 'Database error'];
    }
}

/**
 * Check if a client is subscribed to a provider
 */
public function isClientSubscribed($providerId, $clientId) {
    try {
        $sql = "SELECT * FROM Client_provider 
                WHERE id_provider = :provider_id AND id_client = :client_id";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(":provider_id", $providerId);
        $stmt->bindParam(":client_id", $clientId);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
        
    } catch(PDOException $e) {
        error_log("ProfileDB isClientSubscribed error: " . $e->getMessage());
        return false;
    }
}

/**
 * Get client ID from session (for testimonials/subscriptions)
 */
public function getCurrentClientId() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (isset($_SESSION['user_id']) && isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'client') {
        return $_SESSION['user_id'];
    }
    
    return false;
}

    // ==================== CLIENTS LIST SECTION ====================

    /**
     * Get clients for a provider
     */
    public function getClients($providerId) {
        try {
            $sql = "SELECT 
                c.username,
                c.profile_picture,
                c.email,
                c.phone_number
            FROM Client_provider cp
            JOIN Client c ON cp.id_client = c.id_client
            WHERE cp.id_provider = :provider_id
            ORDER BY c.username";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":provider_id", $providerId);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch(PDOException $e) {
            error_log("ProfileDB getClients error: " . $e->getMessage());
            return [];
        }
    }

    // ==================== TO-DO LIST SECTION ====================

    /**
     * Get to-do list items for a provider
     */
    public function getTodoList($providerId) {
        try {
            $sql = "SELECT 
                w.id_work,
                w.client_name,
                w.description,
                w.added_date,
                w.due_date,
                w.status,
                l.id_list
            FROM Work w
            JOIN List l ON w.id_list = l.id_list
            WHERE l.id_provider = :provider_id
            ORDER BY 
                CASE 
                    WHEN w.status = 'In Progress' THEN 1
                    WHEN w.status = 'Planning' THEN 2
                    WHEN w.status = 'Completed' THEN 3
                    ELSE 4
                END,
                w.due_date ASC";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":provider_id", $providerId);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch(PDOException $e) {
            error_log("ProfileDB getTodoList error: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Add a work item to to-do list
     */
    public function addTodoItem($providerId, $clientName, $description, $dueDate, $status = 'Planning') {
        try {
            $this->conn->beginTransaction();
            
            // Check if provider has a list
            $listSql = "SELECT id_list FROM List WHERE id_provider = :provider_id";
            $listStmt = $this->conn->prepare($listSql);
            $listStmt->bindParam(":provider_id", $providerId);
            $listStmt->execute();
            
            $listId = null;
            if ($listStmt->rowCount() > 0) {
                $list = $listStmt->fetch(PDO::FETCH_ASSOC);
                $listId = $list['id_list'];
            } else {
                // Create new list
                $createListSql = "INSERT INTO List (id_provider) VALUES (:provider_id)";
                $createListStmt = $this->conn->prepare($createListSql);
                $createListStmt->bindParam(":provider_id", $providerId);
                $createListStmt->execute();
                $listId = $this->conn->lastInsertId();
            }
            
            // Add work item
            $workSql = "INSERT INTO Work (id_list, client_name, description, added_date, due_date, status)
                       VALUES (:list_id, :client_name, :description, CURDATE(), :due_date, :status)";
            
            $workStmt = $this->conn->prepare($workSql);
            $workStmt->bindParam(":list_id", $listId);
            $workStmt->bindParam(":client_name", $clientName);
            $workStmt->bindParam(":description", $description);
            $workStmt->bindParam(":due_date", $dueDate);
            $workStmt->bindParam(":status", $status);
            $workStmt->execute();
            
            $this->conn->commit();
            return $this->conn->lastInsertId();
            
        } catch(PDOException $e) {
            $this->conn->rollBack();
            error_log("ProfileDB addTodoItem error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Update a work item
     */
    public function updateTodoItem($workId, $clientName, $description, $dueDate, $status) {
        try {
            $sql = "UPDATE Work 
                    SET client_name = :client_name,
                        description = :description,
                        due_date = :due_date,
                        status = :status
                    WHERE id_work = :work_id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":client_name", $clientName);
            $stmt->bindParam(":description", $description);
            $stmt->bindParam(":due_date", $dueDate);
            $stmt->bindParam(":status", $status);
            $stmt->bindParam(":work_id", $workId);
            
            return $stmt->execute();
            
        } catch(PDOException $e) {
            error_log("ProfileDB updateTodoItem error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Delete a work item
     */
    public function deleteTodoItem($workId) {
        try {
            $sql = "DELETE FROM Work WHERE id_work = :work_id";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bindParam(":work_id", $workId);
            
            return $stmt->execute();
            
        } catch(PDOException $e) {
            error_log("ProfileDB deleteTodoItem error: " . $e->getMessage());
            return false;
        }
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Get current logged-in provider ID from session
     * Returns false if not logged in or not a provider
     */
    public function getCurrentProviderId() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (isset($_SESSION['user_id']) && isset($_SESSION['user_type']) && $_SESSION['user_type'] === 'provider') {
            return $_SESSION['user_id'];
        }
        
        return false;
    }

    /**
     * Verify if a user is the owner of a profile
     */
    public function isProfileOwner($providerId) {
        $currentProviderId = $this->getCurrentProviderId();
        return $currentProviderId && $currentProviderId == $providerId;
    }

    /**
     * Get client info for testimonials
     */
    public function getClientInfo($clientId) {
        try {
            $sql = "SELECT username, profile_picture FROM Client WHERE id_client = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$clientId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $result ?: ['username' => 'Anonymous', 'profile_picture' => ''];
            
        } catch(Exception $e) {
            return ['username' => 'Anonymous', 'profile_picture' => ''];
        }
    }
}





?>