# AI App Generator System

This is a dynamic application runtime that converts structured JSON configuration into fully working web applications.

## Prerequisites
- Node.js v18+

## Setup Instructions

1. **Install Dependencies**
   Run the following command in the project root:
   ```bash
   npm install
   ```

2. **Database Configuration**
   The application uses a local **SQLite** database (`database.sqlite`). You do not need to install or configure an external database server. The database file will be created and managed automatically in the project root.

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

4. **Generate an App**
   Navigate to `http://localhost:3000`. You will see the Admin Panel where you can define an App Name, Slug, and JSON Configuration.

## Key Features

- **Dynamic UI Engine**: Converts JSON schemas into functional React forms, tables, and layouts automatically.
- **Dynamic Database Engine**: Translates JSON models directly into SQLite `CREATE TABLE` and schema generation commands via the local database.
- **Customizable Auth UI**: The JSON configuration controls the authentication view.
- **CSV Import System**: Includes a built-in module to upload a CSV file that maps directly to the dynamically generated DB tables.
- **Mobile-Responsive**: Handcrafted Vanilla CSS utilizing CSS Grid & Flexbox to ensure mobile accessibility on all generated components.
