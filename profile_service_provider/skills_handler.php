<?php
// profile_service_provider/skills_handler.php

session_start();
header('Content-Type: application/json');

require_once 'profile_db.php';

// Get action from request
$action = $_GET['action'] ?? $_POST['action'] ?? null;

// Get provider ID from request or session
$providerId = $_GET['providerId'] ?? $_POST['providerId'] ?? null;

try {
    $profileDB = new ProfileDB();
    
    switch($action) {
        
        // ==================== GET SKILLS ====================
        case 'getSkills':
            if (!$providerId) {
                throw new Exception('Provider ID required');
            }
            
            $skills = $profileDB->getSkills($providerId);
            
            echo json_encode([
                'success' => true,
                'data' => $skills
            ]);
            break;
            
        // ==================== ADD SKILL ====================
        case 'addSkill':
    // Check if user is owner
    if (!$profileDB->isProfileOwner($providerId)) {
        throw new Exception('Not authorized to add skills');
    }
    
    if (!isset($_POST['title']) || !isset($_POST['icon']) || !isset($_POST['mastery'])) {
        throw new Exception('Skill title, icon, and mastery level required');
    }
    
    $title = $_POST['title'];
    $icon = $_POST['icon'];
    $mastery = intval($_POST['mastery']);
    $color = $_POST['color'] ?? '#7B3FE4';
    
    // Validate mastery level (0-100)
    if ($mastery < 0 || $mastery > 100) {
        throw new Exception('Mastery level must be between 0 and 100');
    }
    
    $skillId = $profileDB->addSkill($providerId, $icon, $title, $mastery, $color);
    
    if ($skillId) {
        echo json_encode([
            'success' => true,
            'message' => 'Skill added successfully',
            'skillId' => $skillId,
            'skill' => [
                'id_skill' => $skillId,
                'title' => $title,
                'icon' => $icon,
                'mastery' => $mastery,
                'color' => $color
            ]
        ]);
    } else {
        throw new Exception('Failed to add skill');
    }
    break;
            
        // ==================== UPDATE SKILL ====================
        case 'updateSkill':
    // Check if user is owner
    if (!$profileDB->isProfileOwner($providerId)) {
        throw new Exception('Not authorized to update skills');
    }
    
    if (!isset($_POST['skillId']) || !isset($_POST['title']) || !isset($_POST['icon']) || !isset($_POST['mastery'])) {
        throw new Exception('Skill ID, title, icon, and mastery level required');
    }
    
    $skillId = $_POST['skillId'];
    $title = $_POST['title'];
    $icon = $_POST['icon'];
    $mastery = intval($_POST['mastery']);
    $color = $_POST['color'] ?? null;
    
    // Validate mastery level (0-100)
    if ($mastery < 0 || $mastery > 100) {
        throw new Exception('Mastery level must be between 0 and 100');
    }
    
    $success = $profileDB->updateSkill($skillId, $icon, $title, $mastery, $color);
    
    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Skill updated successfully'
        ]);
    } else {
        throw new Exception('Failed to update skill');
    }
    break;
            
        // ==================== DELETE SKILL ====================
        case 'deleteSkill':
            // Check if user is owner
            if (!$profileDB->isProfileOwner($providerId)) {
                throw new Exception('Not authorized to delete skills');
            }
            
            if (!isset($_POST['skillId'])) {
                throw new Exception('Skill ID required');
            }
            
            $skillId = $_POST['skillId'];
            
            $success = $profileDB->deleteSkill($providerId, $skillId);
            
            if ($success) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Skill deleted successfully'
                ]);
            } else {
                throw new Exception('Failed to delete skill');
            }
            break;
            
        default:
            throw new Exception('Invalid action');
    }
    
} catch(Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
}
?>