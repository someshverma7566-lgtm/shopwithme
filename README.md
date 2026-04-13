# ShopWithMe - The Digital Curator

A modern, responsive e-commerce web application built with vanilla JavaScript, HTML, and Tailwind CSS. This project simulates a full-featured online shopping platform with user authentication, product management, shopping cart, and order tracking.

## 🚀 Features

- **User Authentication**: Login and registration system with role-based access (User/Admin)
- **Product Catalog**: Browse products by categories (Electronics, Fashion, Grocery, Gadgets, Home, Accessories)
- **Shopping Cart**: Add/remove items, quantity management, persistent cart
- **Checkout Process**: Complete order placement with shipping details
- **Order Management**: View order history and status tracking
- **Admin Panel**: Manage products, users, and orders (admin role required)
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **Local Storage**: Client-side data persistence (no backend required)

## 🛠️ Technologies Used

- **Frontend**: HTML5, Tailwind CSS, JavaScript (ES6+)
- **Icons**: Google Material Symbols
- **Fonts**: Inter and Manrope from Google Fonts
- **Data Storage**: Browser LocalStorage (simulated database)
- **Database Schema**: MySQL (included for reference/backend implementation)

## 📁 Project Structure

```
ShopWithMe/
├── index.html              # Home page
├── auth.html               # Login/Register page
├── products.html           # Product listing page
├── product-details.html    # Individual product page
├── cart.html               # Shopping cart page
├── checkout.html           # Checkout process
├── orders.html             # Order history
├── profile.html            # User profile
├── admin.html              # Admin dashboard
├── database.sql            # MySQL database schema and sample data
├── js/
│   ├── app.js             # Main application logic
│   └── db.js              # Data management (LocalStorage)
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server or backend required - runs entirely in the browser

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/someshverma7566-lgtm/shopwithme.git
   cd shopwithme
   ```

2. **Open the application**:
   - Open `index.html` in your web browser
   - Or serve the files using a local server (optional):
     ```bash
     # Using Python
     python -m http.server 8000

     # Using Node.js
     npx serve .
     ```

### Default Credentials

**Admin Account:**
- Email: admin@example.com
- Password: admin123

**Sample User Accounts:**
- Email: raj@example.com / Password: password123
- Email: priya@example.com / Password: testpass456

## 📊 Database Schema

The application includes a MySQL database schema (`database.sql`) with the following tables:

- **users**: User accounts and authentication
- **products**: Product catalog with categories and pricing
- **orders**: Order history and tracking

For production use, you would need to implement a backend server to replace the LocalStorage functionality.

## 🎯 Usage

1. **Browse Products**: Visit the home page to see featured products
2. **Register/Login**: Create an account or login with existing credentials
3. **Shop**: Browse categories, view product details, add to cart
4. **Checkout**: Complete purchase with shipping information
5. **Track Orders**: View order history and status
6. **Admin Features**: Login as admin to manage products and users

## 🔧 Development

### Adding New Features
- Modify `js/app.js` for main application logic
- Update `js/db.js` for data management
- Add new HTML pages as needed
- Use Tailwind CSS classes for styling

### Data Management
The application uses LocalStorage to simulate a database. Key functions in `db.js`:
- `initDB()`: Initialize default data
- `getProducts()`: Retrieve product catalog
- `saveCart()`: Persist shopping cart
- `createOrder()`: Process new orders

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (320px - 767px)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Somesh Verma**
- GitHub: [@someshverma7566-lgtm](https://github.com/someshverma7566-lgtm)

## 🙏 Acknowledgments

- Product images from [Unsplash](https://unsplash.com)
- Icons from [Google Material Symbols](https://fonts.google.com/icons)
- Fonts from [Google Fonts](https://fonts.google.com)
- UI Framework: [Tailwind CSS](https://tailwindcss.com)</content>
<parameter name="filePath">c:\Users\hp\OneDrive\Desktop\Shoping Management\README.md