# CRUD-API

## Task

<https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/crud-api/assignment.md>

## Installation

1. Use 22.x.x version (22.14.0 or upper) of Node.js
2. Clone repo:

   ```bash
   git clone git@github.com:ArturKhelshtein/CRUD-API.git
   cd CRUD-API
   ```

3. Set dependencies:

   ```bash
   npm install
   ```

## Running

### In Development Mode

To run the application in dev mode, use the following command:

```bash
npm run start:dev
```

### In Production Mode

To build and run the application in prod mode, use:

```bash
npm run start:prod
```

## Clustering

The application supports clustering mode for improved performance. To run in cluster mode, use:

```bash
npm run start:multi
```

This will start multiple instances of the application utilizing all available CPU cores.

## API Endpoints

### Users

- **GET /api/users**: Получить всех пользователей.
- **GET /api/users/{userId}**: Получить пользователя по ID.
- **POST /api/users**: Создать нового пользователя.
- **PUT /api/users/{userId}**: Обновить существующего пользователя.
- **DELETE /api/users/{userId}**: Удалить пользователя.

## Testing

There are 3 automated test scenarios:

- Checking the overall API scenario.
- Checking for negative scenarios.
- Checking for repeated deletion.

## Running Automated Tests

```bash
npm run test
```

## Notes

- All users are stored as objects with the fields: `id`, `username`, `age`, `hobbies`.
- Errors are handled correctly, and the server returns appropriate messages.
- The value of the port and main server port (for clusters) on which the application runs is stored in the `.env` file.
 `.env` example:

  ```
  PORT=4000
  MAIN_SERVER_PORT=3000
  ```
