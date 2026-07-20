# Forensic Product Document Management System

A MERN stack web app for managing forensic product documents. Built during my Software Development Internship at Kwick Forensic Solutions Pvt. Ltd.

Admins upload and organize product-related documents, and employees can securely access the latest versions through role-based access control.

## Features

- JWT authentication
- Role-based access control (Admin & Employee)
- Product management (CRUD)
- Product-wise document organization
- Secure document upload & download
- Document version management with latest version tracking
- Product search
- Audit logs for document views and downloads
- Responsive UI
- RESTful APIs

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Auth:** JWT
- **File upload:** Multer
- **Tools:** Git, GitHub, VS Code, Postman

## Project Structure

```
kwick-docms
├── backend
│   ├── config
│   ├── controllers
│   ├── middlewares
│   ├── models
│   ├── routes
│   ├── uploads
│   └── server.js
├── frontend
│   ├── public
│   └── src
│       ├── assets
│       ├── components
│       ├── context
│       ├── pages
│       ├── services
│       └── App.jsx
├── screenshots
├── README.md
└── package.json
```

## Database Schema

**Users** — name, email, password, role

**Products** — product name, description, category, created by

**Documents** — product, title, version, file URL, file size, file format, uploaded by, latest version

**Audit Logs** — user, document, action, timestamp

## API Endpoints

**Auth**
```
POST   /api/auth/register    Register a new user
POST   /api/auth/login       User login
GET    /api/auth/me          Get current user
```

**Products**
```
GET    /api/products         Get all products
POST   /api/products         Create a product
PUT    /api/products/:id     Update a product
DELETE /api/products/:id     Delete a product
```

**Documents**
```
POST   /api/documents/:productId   Upload a document
GET    /api/documents/:id          Download a document
DELETE /api/documents/:id          Delete a document
```

**Audit Logs**
```
GET    /api/audit-logs       Get audit logs
```

## Getting Started

### Prerequisites

- Node.js v20+
- MongoDB (local or Atlas)
- npm

### Clone the repo

```bash
git clone https://github.com/SamarjitSingh17/kwick-docms.git
cd kwick-docms
```

### Backend

```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`

### Environment Variables

Create a `.env` file in the `backend` folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## Screenshots

- Login page — secure login for Admin & Employee
   <img width="1919" height="909" alt="image" src="https://github.com/user-attachments/assets/809afa00-3b95-406a-915e-5eb5b817d600" />
   <img width="1919" height="910" alt="image" src="https://github.com/user-attachments/assets/723972f3-2911-44de-9b6e-0c9ce90973c8" />

ADMIN:
  
- Admin dashboard — 
   <img width="1919" height="904" alt="image" src="https://github.com/user-attachments/assets/f9a78cef-2088-41e0-ba5f-5abd0cb19783" />

- Product management — create, update, delete products
  <img width="1919" height="914" alt="image" src="https://github.com/user-attachments/assets/ae811e92-2ebc-46b0-99e3-8d8c7b99a183" />

- Document upload — upload brochures, manuals, specs
  <img width="1919" height="906" alt="image" src="https://github.com/user-attachments/assets/cd871870-283f-4c24-b92e-b4ae12a812fe" />

 -Employee add page for admin-
   <img width="1919" height="913" alt="image" src="https://github.com/user-attachments/assets/5218c0f2-d90f-4399-9b0a-5c143c2b2d45" />

  - Audit logs — tracks document views/downloads
  <img width="1919" height="918" alt="image" src="https://github.com/user-attachments/assets/11ff0ac6-1c02-49fc-a19b-f3c3a9c3f6ab" />
  -Edit Profile Page
    <img width="1918" height="907" alt="image" src="https://github.com/user-attachments/assets/3c240429-fe03-467e-bad5-57273519062c" />


EMPLOYEE
- Product details
  <img width="1919" height="908" alt="image" src="https://github.com/user-attachments/assets/f31e405e-2730-4eb7-922d-6ea3b74e171d" />

  
- Employee dashboard
 <img width="1919" height="902" alt="image" src="https://github.com/user-attachments/assets/a7320d01-5be8-4c00-9a2b-2905d3658971" />






## Future Enhancements

- Cloud storage integration (AWS S3 / Cloudinary)
- Advanced search & filters
- Dashboard analytics
- Email notifications
- Document preview
- Docker deployment

## Author

**Samarjit Singh**
Software Development Intern, Kwick Forensic Solutions Pvt. Ltd.
GitHub: [SamarjitSingh17](https://github.com/SamarjitSingh17)
