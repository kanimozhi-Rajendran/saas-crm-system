-- ═══════════════════════════════════════════════════════════════
--  AI-SaaS-CRM-System — SQL Schema Reference
--  (Primary DB is MongoDB — this schema is for reference/migration)
-- ═══════════════════════════════════════════════════════════════

-- Users table (roles: Admin, Sales, Support)
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20) NOT NULL DEFAULT 'Sales' CHECK (role IN ('Admin', 'Sales', 'Support')),
    is_active   BOOLEAN DEFAULT TRUE,
    last_login  TIMESTAMP,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                 VARCHAR(150) NOT NULL,
    email                VARCHAR(255) UNIQUE NOT NULL,
    phone                VARCHAR(30),
    company              VARCHAR(150),
    company_size         VARCHAR(20) CHECK (company_size IN ('1-10','11-50','51-200','201-500','500+')),
    industry             VARCHAR(100),
    status               VARCHAR(20) DEFAULT 'Prospect' CHECK (status IN ('Active','Inactive','Prospect')),
    total_revenue        DECIMAL(15,2) DEFAULT 0,
    interaction_count    INT DEFAULT 0,
    previous_conversion  BOOLEAN DEFAULT FALSE,
    notes                TEXT,
    assigned_to          UUID REFERENCES users(id),
    created_by           UUID NOT NULL REFERENCES users(id),
    created_at           TIMESTAMP DEFAULT NOW(),
    updated_at           TIMESTAMP DEFAULT NOW()
);

-- Leads table (AI scoring fields included)
CREATE TABLE leads (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                 VARCHAR(150) NOT NULL,
    email                VARCHAR(255) NOT NULL,
    phone                VARCHAR(30),
    company              VARCHAR(150),
    -- AI Scoring inputs
    budget               DECIMAL(15,2) NOT NULL,
    company_size         VARCHAR(20) CHECK (company_size IN ('1-10','11-50','51-200','201-500','500+')),
    interaction_count    INT DEFAULT 0,
    email_response_rate  DECIMAL(5,2) DEFAULT 0 CHECK (email_response_rate BETWEEN 0 AND 100),
    previous_conversion  BOOLEAN DEFAULT FALSE,
    -- AI output
    lead_score           INT DEFAULT 0 CHECK (lead_score BETWEEN 0 AND 100),
    lead_category        VARCHAR(10) DEFAULT 'Low' CHECK (lead_category IN ('Low','Medium','High')),
    -- CRM fields
    source               VARCHAR(30) DEFAULT 'Other',
    status               VARCHAR(20) DEFAULT 'New',
    notes                TEXT,
    assigned_to          UUID REFERENCES users(id),
    customer_id          UUID REFERENCES customers(id),
    created_by           UUID NOT NULL REFERENCES users(id),
    created_at           TIMESTAMP DEFAULT NOW(),
    updated_at           TIMESTAMP DEFAULT NOW()
);

-- Deals table (AI prediction fields included)
CREATE TABLE deals (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title                   VARCHAR(255) NOT NULL,
    value                   DECIMAL(15,2) NOT NULL,
    currency                VARCHAR(10) DEFAULT 'USD',
    -- AI prediction inputs
    stage                   VARCHAR(30) DEFAULT 'Prospecting',
    lead_score              INT DEFAULT 0,
    days_in_pipeline        INT DEFAULT 0,
    competitor_count        INT DEFAULT 0,
    stakeholder_count       INT DEFAULT 1,
    has_budget_confirmed    BOOLEAN DEFAULT FALSE,
    has_champion            BOOLEAN DEFAULT FALSE,
    -- AI output
    deal_probability        INT DEFAULT 0 CHECK (deal_probability BETWEEN 0 AND 100),
    deal_prediction_status  VARCHAR(100),
    -- CRM fields
    close_date              DATE,
    actual_close_date       DATE,
    customer_id             UUID REFERENCES customers(id),
    lead_id                 UUID REFERENCES leads(id),
    assigned_to             UUID REFERENCES users(id),
    created_by              UUID NOT NULL REFERENCES users(id),
    notes                   TEXT,
    is_active               BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMP DEFAULT NOW(),
    updated_at              TIMESTAMP DEFAULT NOW()
);

-- Support tickets table
CREATE TABLE tickets (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title                 VARCHAR(255) NOT NULL,
    description           TEXT NOT NULL,
    priority              VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low','Medium','High','Critical')),
    status                VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open','In Progress','Resolved','Closed')),
    category              VARCHAR(30) DEFAULT 'General',
    customer_id           UUID REFERENCES customers(id),
    assigned_to           UUID REFERENCES users(id),
    created_by            UUID NOT NULL REFERENCES users(id),
    resolved_at           TIMESTAMP,
    resolution_time_hours INT,
    created_at            TIMESTAMP DEFAULT NOW(),
    updated_at            TIMESTAMP DEFAULT NOW()
);

-- Ticket comments
CREATE TABLE ticket_comments (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id  UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author_id  UUID NOT NULL REFERENCES users(id),
    text       TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_leads_score ON leads(lead_score DESC);
CREATE INDEX idx_leads_category ON leads(lead_category);
CREATE INDEX idx_deals_probability ON deals(deal_probability DESC);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_customers_email ON customers(email);
