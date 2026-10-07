ALTER TABLE online_orders 
  ADD COLUMN IF NOT EXISTS table_number varchar(50)
    DEFAULT 'Table 1';