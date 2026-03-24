# Browser Testing Scenarios for Coach-E

You are a browser testing agent. Run the following scenario explicitly on `http://localhost:8080` (or whichever port Vite started on). Follow exactly these steps:

## Scenario 1: New User Registration & Onboarding Flow
1. Navigate to `http://localhost:8080/register`
2. Enter "testuser" in the Username field.
3. Enter "password123" in the Password field.
4. Enter "password123" in the Confirm Password field.
5. Click **Sign Up**. Wait for the redirection to `/onboarding`.
6. Onboarding Step 1 (Personal Data):
   - Enter Age: "25"
   - Select Gender: "Male"
   - Enter Height: "180"
   - Enter Weight: "80"
   - Select Fitness Experience: "Intermediate"
   - Enter Health Limitations: "None"
   - Click **Continue**.
7. Complete all the following steps by selecting arbitrary valid options (at least one choice for each array/required field) and clicking **Continue**.
8. On the final step, you will see a button labeled **Generate My Plan**. Click it. Wait for the redirect to `/dashboard`.
9. Verify that you are on the Dashboard page and see elements like "Training Plan", "Nutrition Plan" and "Start Over".
10. Open the sidebar or tap the Profile icon and click **My Profile**.
11. Verify that your Age, Weight, and Height display correctly as entered (25, 80kg, 180cm).
12. Click **Logout** from the Profile or Dashboard.
13. Return success and take a screenshot of the login screen.

## Scenario 2: Admin Login & Panel Access
1. Navigate to `http://localhost:8080/login`.
2. Given that an admin user already exists (created automatically by backend), enter "admin" for Username, and "admin" for Password.
3. Click "Login". Wait to arrive at the dashboard.
4. Click "Admin Panel" in the sidebar/menu.
5. Verify you see the User Management table. It should contain "admin" and "testuser".
6. Return success and take a screenshot of the admin panel.
