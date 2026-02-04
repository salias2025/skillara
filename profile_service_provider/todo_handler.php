<?php
/**
 * To-Do List Handler
 * Complete backend for your to-do list
 */

// ============================================
// 1. INITIALIZATION
// ============================================
session_start();
header('Content-Type: application/json');

// ============================================
// 2. DATABASE CONNECTION - Using YOUR database.php
// ============================================
try {
    // Include your database.php (same directory)
    require_once __DIR__ . '/database.php';
    
    $database = new Database();
    $pdo = $database->getConnection();
    
    if (!$pdo) {
        throw new Exception("Failed to connect to database");
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed',
        'error' => $e->getMessage()
    ]);
    exit();
}


// ============================================
// 3. HELPER FUNCTIONS
// ============================================
function sendResponse($success, $data = [], $message = '', $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}

function checkProviderAuth() {
    // Check if user is logged in (using your session structure)
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_type'])) {
        sendResponse(false, [], 'Please login first', 401);
    }
    
    // Check if user is a service provider
    if ($_SESSION['user_type'] !== 'provider') {
        sendResponse(false, [], 'Access denied. Only service providers can access to-do list', 403);
    }
    
    return $_SESSION['user_id']; // Return provider_id
}

function getProviderListId($pdo, $provider_id) {
    // Check if provider has a list (your exact query)
    $sql = "SELECT id_list FROM List WHERE id_provider = :provider_id";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':provider_id', $provider_id, PDO::PARAM_INT);
    $stmt->execute();
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result) {
        return $result['id_list'];
    }
    
    // Create a new list for this provider (your exact query)
    $sql = "INSERT INTO List (id_provider) VALUES (:provider_id)";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':provider_id', $provider_id, PDO::PARAM_INT);
    
    if ($stmt->execute()) {
        return $pdo->lastInsertId();
    }
    
    return null;
}

// ============================================
// 4. MAIN REQUEST HANDLER
// ============================================
$action = $_GET['action'] ?? $_POST['action'] ?? '';

if (empty($action)) {
    echo json_encode([
        'success' => false,
        'message' => 'No action specified',
        'actions' => ['get_work', 'add_work', 'update_status', 'delete_work', 'get_counts']
    ]);
    exit();
}

// Check authentication
$provider_id = checkProviderAuth();

// Route to appropriate handler
try {
    switch ($action) {
        case 'get_work':
            handleGetWork($pdo, $provider_id);
            break;
            
        case 'add_work':
            handleAddWork($pdo, $provider_id);
            break;
            
        case 'update_status':
            handleUpdateStatus($pdo, $provider_id);
            break;
            
        case 'delete_work':
            handleDeleteWork($pdo, $provider_id);
            break;
            
        case 'get_counts':
            handleGetCounts($pdo, $provider_id);
            break;
            
        default:
            sendResponse(false, [], "Unknown action: $action", 400);
    }
} catch (Exception $e) {
    sendResponse(false, [], 'Server error: ' . $e->getMessage(), 500);
}

// ============================================
// 5. API HANDLERS
// ============================================

/**
 * GET: Retrieve work items - Matches YOUR exact query
 */
function handleGetWork($pdo, $provider_id) {
    $status_filter = $_GET['status'] ?? 'all';
    
    // Get provider's list ID
    $list_id = getProviderListId($pdo, $provider_id);
    if (!$list_id) {
        sendResponse(true, [], 'No work items found');
    }
    
    // YOUR EXACT QUERY with formatting
    $sql = "SELECT 
                w.id_work,
                w.client_name,
                w.description,
                DATE_FORMAT(w.added_date, '%m/%d/%Y') as added_date,
                DATE_FORMAT(w.due_date, '%m/%d/%Y') as due_date,
                w.status,
                l.id_list
            FROM Work w
            JOIN List l ON w.id_list = l.id_list
            WHERE l.id_provider = :provider_id";
    
    $params = [':provider_id' => $provider_id];
    
    // Apply status filter
    if ($status_filter !== 'all') {
        $status_map = [
            'pending' => 'Pending',
            'in-progress' => 'In Progress',
            'completed' => 'Completed'
        ];
        
        if (isset($status_map[$status_filter])) {
            $sql .= " AND w.status = :status";
            $params[':status'] = $status_map[$status_filter];
        }
    }
    
    // YOUR EXACT ORDERING
    $sql .= " ORDER BY 
                CASE 
                    WHEN w.status = 'In Progress' THEN 1
                    WHEN w.status = 'Pending' THEN 2
                    WHEN w.status = 'Completed' THEN 3
                    ELSE 4
                END,
                w.due_date ASC";
    
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $work_items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse(true, $work_items, 'Work items retrieved successfully');
        
    } catch (PDOException $e) {
        sendResponse(false, [], 'Database error: ' . $e->getMessage(), 500);
    }
}

/**
 * POST: Add new work item - Matches YOUR exact query
 */
function handleAddWork($pdo, $provider_id) {
    // Get form data (from your HTML inputs)
    $client_name = trim($_POST['client_name'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $added_date = $_POST['added_date'] ?? '';
    $due_date = $_POST['due_date'] ?? '';
    $status = $_POST['status'] ?? 'pending';
    
    // Validation
    if (empty($client_name) || empty($added_date) || empty($due_date)) {
        sendResponse(false, [], 'Client name, added date, and due date are required', 400);
    }
    
    // Validate date format (YYYY-MM-DD)
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $added_date) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $due_date)) {
        sendResponse(false, [], 'Dates must be in YYYY-MM-DD format', 400);
    }
    
    // Check if due date is after added date
    if (strtotime($due_date) < strtotime($added_date)) {
        sendResponse(false, [], 'Due date must be after added date', 400);
    }
    
    // Map status to database format
    $status_map = [
        'pending' => 'Pending',
        'in-progress' => 'In Progress',
        'completed' => 'Completed'
    ];
    $db_status = $status_map[$status] ?? $status;
    
    try {
        // Get or create list (YOUR query)
        $list_id = getProviderListId($pdo, $provider_id);
        
        // Insert work item (YOUR exact query)
        $sql = "INSERT INTO Work (id_list, client_name, description, added_date, due_date, status) 
                VALUES (:list_id, :client_name, :description, :added_date, :due_date, :status)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':list_id', $list_id, PDO::PARAM_INT);
        $stmt->bindParam(':client_name', $client_name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':added_date', $added_date);
        $stmt->bindParam(':due_date', $due_date);
        $stmt->bindParam(':status', $db_status);
        
        if ($stmt->execute()) {
            $work_id = $pdo->lastInsertId();
            
            // Return the new item
            $sql = "SELECT 
                        id_work,
                        client_name,
                        description,
                        DATE_FORMAT(added_date, '%m/%d/%Y') as added_date,
                        DATE_FORMAT(due_date, '%m/%d/%Y') as due_date,
                        status
                    FROM Work 
                    WHERE id_work = :work_id";
            
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':work_id', $work_id, PDO::PARAM_INT);
            $stmt->execute();
            $new_item = $stmt->fetch(PDO::FETCH_ASSOC);
            
            sendResponse(true, $new_item, 'Work item added successfully', 201);
        } else {
            sendResponse(false, [], 'Failed to add work item', 500);
        }
        
    } catch (PDOException $e) {
        sendResponse(false, [], 'Database error: ' . $e->getMessage(), 500);
    }
}

/**
 * POST: Update work status
 */
function handleUpdateStatus($pdo, $provider_id) {
    $work_id = $_POST['work_id'] ?? 0;
    $status = $_POST['status'] ?? '';
    
    if (!$work_id) {
        sendResponse(false, [], 'Work ID is required', 400);
    }
    
    if (empty($status)) {
        sendResponse(false, [], 'Status is required', 400);
    }
    
    // Map status
    $status_map = [
        'pending' => 'Pending',
        'in-progress' => 'In Progress',
        'completed' => 'Completed'
    ];
    
    if (!isset($status_map[$status])) {
        sendResponse(false, [], 'Invalid status value', 400);
    }
    
    $db_status = $status_map[$status];
    
    try {
        // Verify ownership (YOUR query style)
        $list_id = getProviderListId($pdo, $provider_id);
        
        $sql = "SELECT id_work FROM Work WHERE id_work = :work_id AND id_list = :list_id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':work_id', $work_id, PDO::PARAM_INT);
        $stmt->bindParam(':list_id', $list_id, PDO::PARAM_INT);
        $stmt->execute();
        
        if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
            sendResponse(false, [], 'Work item not found or unauthorized', 404);
        }
        
        // Update status
        $sql = "UPDATE Work SET status = :status WHERE id_work = :work_id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':status', $db_status);
        $stmt->bindParam(':work_id', $work_id, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            sendResponse(true, [], 'Work item updated successfully');
        } else {
            sendResponse(false, [], 'Failed to update work item', 500);
        }
        
    } catch (PDOException $e) {
        sendResponse(false, [], 'Database error: ' . $e->getMessage(), 500);
    }
}

/**
 * POST: Delete work item
 */
function handleDeleteWork($pdo, $provider_id) {
    $work_id = $_POST['work_id'] ?? 0;
    
    if (!$work_id) {
        sendResponse(false, [], 'Work ID is required', 400);
    }
    
    try {
        // Verify ownership
        $list_id = getProviderListId($pdo, $provider_id);
        
        $sql = "SELECT id_work FROM Work WHERE id_work = :work_id AND id_list = :list_id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':work_id', $work_id, PDO::PARAM_INT);
        $stmt->bindParam(':list_id', $list_id, PDO::PARAM_INT);
        $stmt->execute();
        
        if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
            sendResponse(false, [], 'Work item not found or unauthorized', 404);
        }
        
        // Delete item
        $sql = "DELETE FROM Work WHERE id_work = :work_id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':work_id', $work_id, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            sendResponse(true, [], 'Work item deleted successfully');
        } else {
            sendResponse(false, [], 'Failed to delete work item', 500);
        }
        
    } catch (PDOException $e) {
        sendResponse(false, [], 'Database error: ' . $e->getMessage(), 500);
    }
}

/**
 * GET: Get statistics/counts - Matches YOUR exact query
 */
function handleGetCounts($pdo, $provider_id) {
    try {
        $list_id = getProviderListId($pdo, $provider_id);
        if (!$list_id) {
            sendResponse(true, [
                'total' => 0,
                'pending' => 0,
                'in_progress' => 0,
                'completed' => 0
            ], 'No work items found');
        }
        
        // YOUR EXACT QUERY for counts
        $sql = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
                    SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed
                FROM Work
                WHERE id_list = :list_id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':list_id', $list_id, PDO::PARAM_INT);
        $stmt->execute();
        
        $counts = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Convert null to 0
        $counts = array_map(function($value) {
            return (int)$value;
        }, $counts);
        
        sendResponse(true, $counts, 'Counts retrieved successfully');
        
    } catch (PDOException $e) {
        sendResponse(false, [], 'Database error: ' . $e->getMessage(), 500);
    }
}
?>