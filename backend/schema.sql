-- Folks at Home database schema
-- All tables prefixed fah_

CREATE TABLE IF NOT EXISTS fah_users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  public_id     VARCHAR(10)  NOT NULL UNIQUE,
  role          ENUM('volunteer','member') NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  dob           DATE,
  home_phone    VARCHAR(20),
  cell_phone    VARCHAR(20),
  street_address VARCHAR(255),
  city          VARCHAR(100),
  state         VARCHAR(50),
  zip           VARCHAR(10),
  avatar_file   VARCHAR(255),
  status        ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fah_volunteer_details (
  volunteer_id  INT PRIMARY KEY,
  bio           TEXT,
  why_volunteer TEXT,
  ec_name       VARCHAR(200),
  ec_phone      VARCHAR(20),
  ec_relation   VARCHAR(100),
  has_license   TINYINT(1) DEFAULT 0,
  has_transport TINYINT(1) DEFAULT 0,
  bg_check      TINYINT(1) DEFAULT 0,
  frequency     VARCHAR(50),
  start_date    DATE,
  FOREIGN KEY (volunteer_id) REFERENCES fah_users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fah_volunteer_availability (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  volunteer_id  INT NOT NULL,
  slot          VARCHAR(50) NOT NULL,
  UNIQUE KEY uniq_slot (volunteer_id, slot),
  FOREIGN KEY (volunteer_id) REFERENCES fah_users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fah_volunteer_skills (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  volunteer_id  INT NOT NULL,
  skill         VARCHAR(100) NOT NULL,
  UNIQUE KEY uniq_skill (volunteer_id, skill),
  FOREIGN KEY (volunteer_id) REFERENCES fah_users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fah_member_details (
  member_id     INT PRIMARY KEY,
  plan          VARCHAR(100),
  ec_name       VARCHAR(200),
  ec_phone      VARCHAR(20),
  ec_relation   VARCHAR(100),
  FOREIGN KEY (member_id) REFERENCES fah_users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fah_member_contact_methods (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  member_id     INT NOT NULL,
  method        ENUM('Phone','Mail','E-mail') NOT NULL,
  UNIQUE KEY uniq_method (member_id, method),
  FOREIGN KEY (member_id) REFERENCES fah_users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fah_member_services (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  member_id     INT NOT NULL,
  service       VARCHAR(100) NOT NULL,
  UNIQUE KEY uniq_service (member_id, service),
  FOREIGN KEY (member_id) REFERENCES fah_users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fah_tasks (
  task_id       INT AUTO_INCREMENT PRIMARY KEY,
  member_id     INT NOT NULL,
  category      VARCHAR(100) NOT NULL,
  description   TEXT,
  scheduled_at  DATETIME,
  status        ENUM('Open','Claimed','Completed','Cancelled') NOT NULL DEFAULT 'Open',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES fah_users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fah_volunteer_requests (
  request_id    INT AUTO_INCREMENT PRIMARY KEY,
  task_id       INT NOT NULL,
  volunteer_id  INT NOT NULL,
  status        ENUM('Pending','Confirmed','Cancelled') NOT NULL DEFAULT 'Pending',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_claim (task_id, volunteer_id),
  FOREIGN KEY (task_id) REFERENCES fah_tasks(task_id) ON DELETE CASCADE,
  FOREIGN KEY (volunteer_id) REFERENCES fah_users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fah_task_history (
  history_id    INT AUTO_INCREMENT PRIMARY KEY,
  task_id       INT NOT NULL,
  volunteer_id  INT,
  action        VARCHAR(100) NOT NULL,
  note          TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES fah_tasks(task_id) ON DELETE CASCADE,
  FOREIGN KEY (volunteer_id) REFERENCES fah_users(user_id) ON DELETE SET NULL
);
