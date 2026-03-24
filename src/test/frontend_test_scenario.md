# Frontend Testing Scenarios

## Scenario 1: Onboarding flow for an underweight user with physical limitations

**Objective**: Verify the onboarding flow completes successfully, uses the new multi-select for complications/allergies, handles an underweight user asking for conflicting goals, and respects the "Missing Knee" limitation.

### Steps for Browser Subagent
1. **Navigate to the app**: `http://localhost:5173`
2. **Start Onboarding**: Click "Get Started" or "Start Your Plan". If it goes to a Login page, click on "Don't have an account? Sign up".
3. **Register**: Fill in a random username (e.g., `testuser1`) and password (`password123`), click "Register". Redirect to onboarding.
4. **Step 1 - Personal Data**: 
   - Age: `25`, Gender: `Male`, Height: `180` cm, Weight: `50` kg.
   - **Health Limitations**: Click the `Missing Knee` button. (Ensure it lights up).
   - Click "Continue".
5. **Step 2 - Goals**: Select `Fat Loss`, `Muscle Gain`, `Strength`. Click "Continue".
6. **Step 3 - Obstacles**: Select any obstacle. Click "Continue".
7. **Step 4 - Lifestyle**: Select any options. Click "Continue".
8. **Step 5 - Nutrition**: 
   - **Allergies**: Click the `Soy` and `Seafood` buttons.
   - Click "Continue".
9. **Step 6 - Plan Preference**: Select `Structured`. Click "Generate My Plan".
10. **Dashboard Vertification**:
   - **Nutrition**: Check daily calories (should be > 2000). Expand meals and verify no "tofu", "salmon", or "tuna" are listed.
   - **Training**: Check the training plan. Verify that no bilateral leg exercises (e.g., Barbell Squat, Lunges) are included, and instead single-leg or seated variations exist.
11. **Log Out**: Click "Sign Out".

## Scenario 2: Admin Bypass & Management

**Objective**: Verify that an admin account bypasses onboarding, cannot view a plan on their profile, and can view other users' info.

### Steps for Browser Subagent
1. **Navigate to Login**: `http://localhost:5173/login`
2. **Register Admin**: We need an admin account. If one doesn't exist, we may have to seed it, or use standard credentials if configured. (Assuming the backend creates the first user as admin or we can inject one). For testing purposes, assume login with an existing admin account: Username `admin` Password `admin`.
3. **Login Bypass**: Upon login as admin, verify you are redirected directly to `/admin` or `/dashboard` without being forced to fill out the onboarding questionnaire.
4. **Profile View**: Navigate to `/profile`. Verify the "Admin Mode enabled" style profile is shown, and there is no Training Plan.
5. **Admin Panel**: Navigate to `/admin`. You should see a table of users.
6. **View Info**: Click the "Eye" icon on a user row. Verify a Modal opens up showing their profile data and generated plan details.
7. **Return Report**: State if the admin successfully bypassed onboarding and was able to view user details.
