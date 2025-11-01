# API Testing Documentation

This directory contains Postman collections for testing the EatWithSam backend API endpoints.

## Postman Collection

### Importing the Collection

1. Open Postman
2. Click **Import** button
3. Select **File** tab
4. Choose `postman_collection.json` from this directory
5. The collection will be imported with all endpoints

### Environment Setup

The collection uses environment variables for easy configuration across different environments.

#### Required Environment Variable

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `BASE_URL` | Base URL of the API server | `http://localhost:3000` |

#### Setting Up Environment Variable

**Option 1: Postman Environment**
1. In Postman, create a new Environment (click the gear icon in top right)
2. Add variable `BASE_URL` with your server URL
3. Select the environment from the dropdown in top right

**Option 2: Global Variable**
1. In Postman, click the eye icon in top right
2. Under "Globals", add `BASE_URL` variable
3. This applies to all requests

## Available Endpoints

### Lifecycle Endpoints

#### Health Check
- **Method**: `GET`
- **URL**: `{{BASE_URL}}/health``
- **Description**: Check if the server is running
- **Response**: 
  ```json
  {
    "status": "OK",
    "message": "Server is running"
  }
  ```

#### Not Found Handler
- **Method**: `GET`
- **URL**: `{{BASE_URL}}/some-not-found-url-ho-ho-ho`
- **Description**: Test 404 error handling
- **Response**: 
  ```json
  {
    "error": "Route not found"
  }
  ```

## Usage Tips

1. **Update BASE_URL**: Ensure `BASE_URL` is set to your running server (default: `http://localhost:3000`)
2. **Run in Sequence**: Some endpoints may depend on others (e.g., authentication before protected routes)
3. **Save Responses**: Use Postman's "Save Response" feature to document expected responses
4. **Add Tests**: Consider adding automated tests in Postman's Tests tab for validation

## Collection Structure

The collection is organized into folders:
- **Lifecycle**: Basic server health and error handling endpoints

As more endpoints are added, they will be organized into logical folders (e.g., Authentication, Users, Restaurants, Orders, etc.).

