const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const multer = require("multer");
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3003;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ตั้งค่า Session
app.use(session({
    secret: 'max',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 30 }
}));

// Connect to SQLite Database
const db = new sqlite3.Database('./OMGdb.db', (err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// ตั้งค่า EJS และ Static Files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// =================================================================
// SECTION: CORE ROUTES (Login, Register, Main Pages)
// =================================================================

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.redirect('/login');
    }
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (err) {
            console.error(err);
            return res.redirect('/login');
        }
        if (row) {
            req.session.user = { userid: row.user_id, role: row.role }
            if (row.role === 'customer') {
                return res.redirect('/menu');
            } else if (row.role === 'seller') {
                // แก้ไข: เปลี่ยนจาก /reward เป็น /order_seller
                return res.redirect('/order_seller');
            } else {
                return res.redirect('/addmenu');
            }
        } else {
            return res.redirect('/login');
        }
    });
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const { firstname, surname, phone_num, username, password } = req.body;
    const full_name = `${firstname} ${surname}`;
    const sql = "INSERT INTO users (username, password, full_name, phone_number) VALUES (?, ?, ?, ?)";
    db.run(sql, [username, password, full_name, phone_num], function (err) {
        if (err) {
            console.error("Error saving data:", err.message);
            return res.status(500).send("Database error");
        }
        res.redirect("/login");
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("ไม่สามารถออกจากระบบได้");
        }
        res.redirect('/login');
    });
});

app.get('/menu', (req, res) => {
    const id_user = req.session.user ? req.session.user.userid : null;
    if (!id_user) {
        return res.redirect("/login");
    }
    res.render('menu', { id_user });
});

// =================================================================
// SECTION: ADDRESS MANAGEMENT
// =================================================================

app.get("/address", (req, res) => {
    const id_user = req.session.user ? req.session.user.userid : null;
    res.render("address", { id_user });
});

app.post("/address", (req, res) => {
    const { user_id, full_name, phone_number, province, district, subdistrict, postal_code } = req.body;
    if (!user_id || !full_name || !phone_number || !province || !district || !subdistrict || !postal_code) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบทุกช่อง" });
    }
    const query = `INSERT INTO addresses (user_id, full_name, phone_number, province, district, subdistrict, postal_code) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [user_id, full_name, phone_number, province, district, subdistrict, postal_code], function (err) {
        if (err) {
            return res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ", error: err.message });
        }
        res.json({ success: true, message: "ที่อยู่ถูกเพิ่มแล้ว", address_id: this.lastID });
    });
});

app.get("/select_address", (req, res) => {
    const user_id = req.session.user ? req.session.user.userid : null;
    if (!user_id) {
        return res.redirect("/login");
    }
    res.render("select_address", { user_id });
});

app.get("/get-user-addresses", async (req, res) => {
    const user_id = req.session.user ? req.session.user.userid : null;
    if (!user_id) {
        return res.status(401).json({ message: "กรุณาเข้าสู่ระบบ" });
    }
    db.all("SELECT * FROM addresses WHERE user_id = ?", [user_id], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลที่อยู่" });
        }
        res.json({ success: true, addresses: rows });
    });
});

// =================================================================
// SECTION: CART & CHECKOUT PROCESS
// =================================================================

app.get('/cart', (req, res) => {
    const id_user = req.session.user ? req.session.user.userid : null;
    if (!id_user) {
        return res.redirect("/login");
    }
    res.render("cart", { id_user });
});

app.post("/addToCart", (req, res) => {
    const { productName, price, quantity, sweetness, image_product } = req.body;
    // ลบ toppings ออก
    const cartItem = { productName, price, quantity, sweetness, image_product };
    if (!req.session.cart) {
        req.session.cart = [];
    }
    req.session.cart.push(cartItem);
    res.json({ success: true, message: "เพิ่มสินค้าลงในตะกร้าเรียบร้อย!" });
});

app.get("/getCart", (req, res) => {
    res.json({ cart: req.session.cart || [] });
});

app.get("/payment", (req, res) => {
    const id_user = req.session.user ? req.session.user.userid : null;
    if (!id_user) {
        return res.redirect('/login');
    }
    res.render("payment", { id_user });
});

// POST: สร้าง Order และบันทึกรายการสินค้า (เวอร์ชันตัด Topping ออก)
app.post('/create-order', async (req, res) => {
    if (!req.session.cart || req.session.cart.length === 0) {
        return res.status(400).json({ success: false, message: "ตะกร้าสินค้าว่างเปล่า" });
    }
    if (!req.session.user || !req.session.user.userid) {
        return res.status(401).json({ success: false, message: "กรุณาเข้าสู่ระบบ" });
    }

    const userId = req.session.user.userid;
    const cart = req.session.cart;
    const { address_id, total_price } = req.body;

    try {
        const orderSql = `INSERT INTO orders (user_id, total_price, status, delivery_type, address_id) VALUES (?, ?, 'pending', 'delivery', ?)`;
        const newOrderId = await new Promise((resolve, reject) => {
            db.run(orderSql, [userId, total_price, address_id], function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });

        console.log(`✅ Order created with ID: ${newOrderId}`);

        for (const item of cart) {
            const product = await new Promise((resolve, reject) => {
                db.get('SELECT product_id FROM products WHERE product_name = ?', [item.productName], (err, row) => {
                    if (err || !row) return reject(new Error(`ไม่พบ product_id สำหรับ ${item.productName}`));
                    resolve(row);
                });
            });

            // SQL ที่ตัด topping_id ออก
            const itemSql = `INSERT INTO order_items (order_id, product_id, quantity, price, sweetness_level) VALUES (?, ?, ?, ?, ?)`;
            await new Promise((resolve, reject) => {
                db.run(itemSql, [newOrderId, product.product_id, item.quantity, item.price, item.sweetness], function (err) {
                    if (err) return reject(err);
                    console.log(`- Saved item ${item.productName}`);
                    resolve();
                });
            });
        }

        req.session.cart = [];
        res.status(201).json({ success: true, message: 'สร้างคำสั่งซื้อสำเร็จ!', orderId: newOrderId });

    } catch (error) {
        console.error('❌ Error in /create-order:', error.message);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์', error: error.message });
    }
});

// ในไฟล์ index.js ให้หา Route นี้แล้ววางทับของเดิม

app.post("/upload", upload.single("receipt"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "กรุณาเลือกไฟล์" });
    }
    const order_id = req.body.order_id;
    const user_id = req.session.user ? req.session.user.userid : 'guest';
    const receiptBuffer = req.file.buffer;

    // เพิ่ม 2 บรรทัดนี้เข้ามาใหม่
    const transaction_id = `TXN${Date.now()}`;
    const payment_method = "e-wallet";

    // แก้ไข SQL query ให้มี transaction_id
    const insertQuery = `INSERT INTO payments (order_id, user_id, receipt, payment_status, payment_method, transaction_id) VALUES (?, ?, ?, 'pending', ?, ?)`;
    
    // เพิ่ม transaction_id เข้าไปใน array
    db.run(insertQuery, [order_id, user_id, receiptBuffer, payment_method, transaction_id], function (err) {
        if (err) {
            console.error("❌ Error inserting payment:", err.message);
            return res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล", error: err.message });
        }
        res.json({ success: true, message: "✅ อัปโหลดใบเสร็จสำเร็จ!", payment_id: this.lastID });
    });
});

// =================================================================
// SECTION: ORDER VIEWING (Customer & Seller)
// =================================================================

// หน้าประวัติคำสั่งซื้อของลูกค้า
app.get("/orders", (req, res) => {
    const id_user = req.session.user ? req.session.user.userid : null;
    if (!id_user) {
        return res.redirect('/login');
    }
    const sql = "SELECT order_id, datetime, total_price, status FROM orders WHERE user_id = ?";
    db.all(sql, [id_user], (err, rows) => {
        if (err) {
            return res.status(500).send("Database error");
        }
        res.render("orders", { orders: rows, id_user: id_user });
    });
});

// หน้ารายละเอียดคำสั่งซื้อของลูกค้า
app.get("/show-order-user/:orderId", (req, res) => {
    const orderId = req.params.orderId;
    // แก้ไข: เอา oi.topping_id ออกจาก query
    const itemsQuery = `
      SELECT oi.order_item_id, oi.order_id, p.product_name, oi.quantity, oi.price, oi.sweetness_level
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = ?
    `;
    const orderQuery = `SELECT order_id, status FROM orders WHERE order_id = ?`;

    db.all(itemsQuery, [orderId], (err, items) => {
        if (err || items.length === 0) {
            return res.status(404).send('Order not found or has no items');
        }
        db.get(orderQuery, [orderId], (err, orderDetails) => {
            if (err) {
                return res.status(500).send('Error fetching order status');
            }
            res.render('show_order_user', {
                order_items: items,
                order: orderDetails
            });
        });
    });
});

// หน้าจัดการคำสั่งซื้อของร้านค้า
app.get("/order_seller", (req, res) => {
    const sql = "SELECT order_id, datetime, total_price, status FROM orders ORDER BY order_id DESC";
    db.all(sql, [], (err, orders) => {
        if (err) {
            return res.status(500).send("Database error");
        }
        res.render("order_seller", { orders });
    });
});



// POST อัปเดตสถานะคำสั่งซื้อ
app.post("/order/:orderId/update-status", (req, res) => {
    const orderId = req.params.orderId;
    const newStatus = req.body.status;
    const sql = `UPDATE orders SET status = ? WHERE order_id = ?`;
    db.run(sql, [newStatus, orderId], function (err) {
        if (err) {
            return res.status(500).send("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
        }
        res.redirect('/order_seller');
    });
});
// ในไฟล์ index.js (วางโค้ดนี้ลงไป)

// POST: ลบคำสั่งซื้อและข้อมูลที่เกี่ยวข้องทั้งหมด
app.post("/order/:orderId/delete", (req, res) => {
    const orderId = req.params.orderId;

    // ใช้ db.serialize เพื่อให้แน่ใจว่าคำสั่งรันตามลำดับ
    db.serialize(() => {
        // 1. ลบข้อมูลการชำระเงิน (payments) ก่อน
        db.run('DELETE FROM payments WHERE order_id = ?', orderId, function(err) {
            if (err) {
                console.error("Error deleting from payments:", err.message);
                return res.status(500).send("เกิดข้อผิดพลาดในการลบข้อมูลการชำระเงิน");
            }
        });

        // 2. ลบรายการสินค้า (order_items)
        db.run('DELETE FROM order_items WHERE order_id = ?', orderId, function(err) {
            if (err) {
                console.error("Error deleting from order_items:", err.message);
                return res.status(500).send("เกิดข้อผิดพลาดในการลบรายการสินค้า");
            }
        });

        // 3. ลบออเดอร์หลัก (orders) เป็นลำดับสุดท้าย
        db.run('DELETE FROM orders WHERE order_id = ?', orderId, function(err) {
            if (err) {
                console.error("Error deleting from orders:", err.message);
                return res.status(500).send("เกิดข้อผิดพลาดในการลบคำสั่งซื้อ");
            }
            console.log(`✅ Order ID ${orderId} and all related data deleted successfully.`);
            // เมื่อลบสำเร็จ ให้กลับไปหน้ารายการออเดอร์
            res.redirect('/order_seller');
        });
    });
});
// ในไฟล์ index.js (วางโค้ดนี้ลงไป)

// หน้ารายละเอียดคำสั่งซื้อสำหรับร้านค้า (Seller)
app.get("/show_order_seller/:orderId", (req, res) => {
    const orderId = req.params.orderId;

    // Query หลัก: ดึงข้อมูล Order, User, และ Address พร้อมกัน
    const query = `
        SELECT
            o.order_id,
            o.datetime,
            o.total_price,
            o.status,
            u.full_name AS customer_name,
            u.phone_number AS customer_phone,
            a.full_name AS recipient_name,
            a.phone_number AS recipient_phone,
            a.province,
            a.district,
            a.subdistrict,
            a.postal_code
        FROM orders AS o
        JOIN users AS u ON o.user_id = u.user_id
        JOIN addresses AS a ON o.address_id = a.address_id
        WHERE o.order_id = ?
    `;

    // Query รอง: ดึงรายการสินค้า
    const itemsQuery = `
        SELECT
            p.product_name,
            oi.quantity,
            oi.price,
            oi.sweetness_level
        FROM order_items AS oi
        JOIN products AS p ON oi.product_id = p.product_id
        WHERE oi.order_id = ?
    `;

    // 1. ดึงข้อมูลหลักก่อน
    db.get(query, [orderId], (err, orderInfo) => {
        if (err) {
            console.error("Error fetching seller order details:", err.message);
            return res.status(500).send("เกิดข้อผิดพลาดในระบบ");
        }
        if (!orderInfo) {
            return res.status(404).send("ไม่พบข้อมูลคำสั่งซื้อ");
        }

        // 2. ถ้าเจอข้อมูลหลัก ให้ดึงรายการสินค้าต่อ
        db.all(itemsQuery, [orderId], (itemErr, items) => {
            if (itemErr) {
                console.error("Error fetching seller order items:", itemErr.message);
                return res.status(500).send("เกิดข้อผิดพลาดในระบบ");
            }

            // 3. ส่งข้อมูลทั้งหมดไปแสดงผล
            res.render("show_order_seller", {
                order: orderInfo,
                items: items
            });
        });
    });
});
// =================================================================
// SECTION: PRODUCT MANAGEMENT (SELLER)
// =================================================================

app.get('/addmenu', (req, res) => {
    const id_user = req.session.user ? req.session.user.userid : null;
    res.render('addmenu', { id_user });
});

// ในไฟล์ index.js ให้หา Route นี้แล้ววางทับของเดิม

// ในไฟล์ index.js ให้หา Route นี้แล้ววางทับของเดิม

app.get('/get-products', (req, res) => {
    // แก้ไข: เลือกเฉพาะคอลัมน์ที่มีอยู่จริงในตาราง products ของคุณ
    const query = 'SELECT product_id, product_name, price, image_product FROM products';

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("❌ Database error in /get-products:", err.message);
            return res.status(500).json({ success: false, message: 'ไม่สามารถดึงข้อมูลสินค้าได้' });
        }
        try {
            const productsWithImage = rows.map(product => {
                if (product.image_product) {
                    product.image_product = Buffer.from(product.image_product).toString('base64');
                }
                return product;
            });
            // ส่งข้อมูลกลับไปเป็น JSON ที่มี success: true
            res.json({ success: true, products: productsWithImage });
        } catch (e) {
            console.error("❌ Error processing product images:", e.message);
            res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการแปลงข้อมูลรูปภาพ' });
        }
    });
});
app.post('/update-product', (req, res) => {
    const { productId, column, newValue } = req.body;
    const query = `UPDATE products SET ${column} = ? WHERE product_id = ?`;
    db.run(query, [newValue, productId], function (err) {
        if (err) {
            res.status(500).send('ไม่สามารถอัปเดตข้อมูลสินค้าได้');
        } else {
            res.json({ message: 'อัปเดตข้อมูลสินค้าสำเร็จ' });
        }
    });
});

app.post('/upload-image', upload.single('image_product'), (req, res) => {
    const { product_id } = req.body;
    const image = req.file.buffer;
    const query = 'UPDATE products SET image_product = ? WHERE product_id = ?';
    db.run(query, [image, product_id], function (err) {
        if (err) {
            res.status(500).send('ไม่สามารถอัปเดตรูปภาพได้');
        } else {
            res.json({ message: 'อัปเดตรูปภาพสำเร็จ' });
        }
    });
});

app.delete('/delete-product/:id', (req, res) => {
    const productId = req.params.id;
    const query = 'DELETE FROM products WHERE product_id = ?';
    db.run(query, [productId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'ไม่สามารถลบข้อมูลสินค้าได้' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'ไม่พบสินค้าที่จะลบ' });
        }
        res.json({ message: 'ลบข้อมูลสินค้าสำเร็จ' });
    });
});

// ในไฟล์ index.js ให้หา Route นี้แล้ววางทับของเดิม

app.post('/add-product', upload.single('image_product'), (req, res) => {
    // แก้ไข: เอา stock ออก แต่เพิ่ม description
    const { product_name, price, description } = req.body;
    const imageProduct = req.file ? req.file.buffer : null;

    // แก้ไข: เอา stock ออกจากการตรวจสอบ
    if (!product_name || !price || !description || !imageProduct) {
        return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วนและอัปโหลดรูปภาพ!' });
    }

    // แก้ไข: เอา stock ออกจากคำสั่ง SQL
    const query = `INSERT INTO products (product_name, price, description, image_product) VALUES (?, ?, ?, ?)`;
    db.run(query, [product_name, price, description, imageProduct], function (err) {
        if (err) {
            console.error("❌ Error adding product:", err.message);
            return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล!' });
        }
        res.json({ success: true, message: 'เพิ่มสินค้าสำเร็จ!' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});