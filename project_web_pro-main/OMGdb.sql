-- สร้างตาราง users
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY ,AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT,
    phone_number TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('customer', 'seller')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_number) REFERENCES points(phone_number)
);

-- สร้างตาราง products
CREATE TABLE IF NOT EXISTS products (
    product_id INTEGER PRIMARY KEY ,AUTOINCREMENT,
    product_name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('food', 'drink')),
    stock INTEGER NOT NULL,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง orders
CREATE TABLE IF NOT EXISTS orders (
    order_id INTEGER PRIMARY KEY ,AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_price REAL NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'processing', 'completed')),
    delivery_type TEXT NOT NULL CHECK(delivery_type IN ('pickup', 'delivery')),
    address_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (address_id) REFERENCES addresses(address_id)
);

-- สร้างตาราง order_items
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INTEGER PRIMARY KEY ,AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    topping_id INTEGER NOT NULL,
    sweetness_level TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (topping_id) REFERENCES toppings(topping_id)
);

-- สร้างตาราง addresses
CREATE TABLE IF NOT EXISTS addresses (
    address_id INTEGER PRIMARY KEY ,AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- สร้างตาราง deliveries
CREATE TABLE IF NOT EXISTS deliveries (
    delivery_id INTEGER PRIMARY KEY ,AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    address_id INTEGER NOT NULL,
    delivery_status TEXT NOT NULL CHECK(delivery_status IN ('pending', 'shipped', 'delivered')),
    shipped_at DATETIME,
    delivered_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (address_id) REFERENCES addresses(address_id)
);



-- สร้างตาราง transactions
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INTEGER PRIMARY KEY ,AUTOINCREMENT,
    phone_number TEXT NOT NULL,
    reward_id INTEGER NOT NULL,
    points_used INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (phone_number) REFERENCES points(phone_number),
    FOREIGN KEY (reward_id) REFERENCES rewards(reward_id)
);

-- สร้างตาราง payments
CREATE TABLE IF NOT EXISTS payments (
    payment_id INTEGER PRIMARY KEY ,AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'e-wallet' CHECK(payment_method = 'e-wallet'),
    payment_status TEXT NOT NULL CHECK(payment_status IN ('pending', 'completed', 'failed')),
    qr_code TEXT NOT NULL,
    transaction_id TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);


