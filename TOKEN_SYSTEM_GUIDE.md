# 🔐 Token System Guide

## 📋 **Token Lifetimes**

### **Standard Session (Remember Me = false)**

- **Access Token**: 24 hours
- **Refresh Token**: 7 days
- **Auto-refresh**: 1 hour before expiry

### **Remember Me Session (Remember Me = true)**

- **Access Token**: 30 days
- **Refresh Token**: 90 days
- **Auto-refresh**: 1 day before expiry

## 🔄 **How It Works**

### **1. Login Process**

```typescript
// User logs in with remember me option
const response = await fetch("/api/login", {
  method: "POST",
  body: JSON.stringify({
    action: "verifyOTP",
    email,
    otp,
    rememberMe: true, // or false
  }),
});

// Server generates tokens based on remember me setting
const token = generateToken(payload, rememberMe);
const refreshToken = generateRefreshToken(payload, rememberMe);
```

### **2. Token Storage**

```typescript
// Tokens stored in localStorage
localStorage.setItem("token", accessToken);
localStorage.setItem("refreshToken", refreshToken);
localStorage.setItem("user", JSON.stringify(userData));
```

### **3. Automatic Token Refresh**

```typescript
// Token manager automatically refreshes tokens
const tokenManager = new TokenManager();
tokenManager.init(); // Starts monitoring and auto-refresh

// When token is about to expire:
// - Standard: 1 hour before expiry
// - Remember Me: 1 day before expiry
```

### **4. API Request Flow**

```typescript
// Every API request automatically gets valid token
const headers = await tokenManager.getAuthHeaders();
// Returns: { Authorization: 'Bearer <valid-token>' }

// If token is expired, it's automatically refreshed
// If refresh fails, user is redirected to login
```

## 🛡️ **Security Features**

### **Token Blacklisting**

- Old refresh tokens are blacklisted when new ones are issued
- Prevents token reuse attacks
- In-memory blacklist (will be moved to Redis in production)

### **Token Validation**

- All tokens are verified on each request
- Expired tokens are automatically rejected
- Invalid tokens trigger immediate logout

### **Session Management**

- Automatic logout when both tokens expire
- Graceful handling of network errors
- Clear session data on logout

## 📊 **Token Information Display**

### **Console Logs**

```bash
🔐 Login successful!
📧 User email: user@example.com
👤 User role: TENANT_ADMIN
🏪 Tenant: Restaurant Name
⏰ Token expires in: 24 hours
📅 Remember Me: Yes
🕐 Expires at: 1/15/2025, 2:30:45 PM
🔄 Scheduling token refresh in 23 hours
```

### **Visual Component**

The `TokenInfo` component shows:

- Session type (Standard/Remember Me)
- Time remaining until expiry
- Expiration date/time
- Visual progress bar

## 🔧 **API Endpoints**

### **Token Refresh**

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response:
{
  "success": true,
  "token": "new-access-token",
  "refreshToken": "new-refresh-token",
  "user": { ... }
}
```

### **Login**

```http
POST /api/login
Content-Type: application/json

{
  "action": "verifyOTP",
  "email": "user@example.com",
  "otp": "123456",
  "rememberMe": true
}

Response:
{
  "user": { ... },
  "token": "access-token",
  "refreshToken": "refresh-token",
  "rememberMe": true
}
```

## 🎯 **Remember Me Benefits**

### **For Users**

- ✅ **Stay logged in** for 30 days (vs 24 hours)
- ✅ **No frequent re-authentication**
- ✅ **Seamless experience** across browser sessions
- ✅ **Automatic token renewal** in background

### **For Security**

- ✅ **Still secure** with proper token validation
- ✅ **Automatic logout** when tokens expire
- ✅ **Token blacklisting** prevents reuse
- ✅ **Audit logging** tracks all sessions

## 🚀 **Usage Examples**

### **Check if User is Authenticated**

```typescript
import { tokenManager } from "@/lib/token-manager";

if (tokenManager.isAuthenticated()) {
  // User is logged in
  const user = tokenManager.getCurrentUser();
  console.log("Welcome back,", user.firstName);
} else {
  // Redirect to login
  window.location.href = "/login";
}
```

### **Get Token Info**

```typescript
const tokenInfo = tokenManager.getTokenInfo();
if (tokenInfo) {
  console.log("Session expires in:", tokenInfo.expiresIn, "seconds");
  console.log("Remember Me:", tokenInfo.isRememberMe);
  console.log("Expires at:", tokenInfo.expiresAt);
}
```

### **Make Authenticated API Request**

```typescript
const headers = await tokenManager.getAuthHeaders();
const response = await fetch("/api/protected-endpoint", {
  headers: headers,
});
```

### **Logout**

```typescript
tokenManager.logout();
// Automatically clears tokens and redirects to login
```

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Token Expired Error**

   - Check if refresh token is valid
   - Verify token manager is initialized
   - Check network connectivity

2. **Remember Me Not Working**

   - Verify `rememberMe` is sent in login request
   - Check token expiration times in console
   - Ensure token manager is running

3. **Auto-refresh Not Working**
   - Check browser console for errors
   - Verify `/api/auth/refresh` endpoint exists
   - Check token manager initialization

### **Debug Commands**

```javascript
// Check token status
console.log("Is authenticated:", tokenManager.isAuthenticated());

// Get token info
console.log("Token info:", tokenManager.getTokenInfo());

// Check localStorage
console.log("Stored token:", localStorage.getItem("token"));
console.log("Stored refresh token:", localStorage.getItem("refreshToken"));
```

## 📈 **Performance**

### **Token Refresh Strategy**

- **Background refresh**: No interruption to user experience
- **Proactive refresh**: Tokens refreshed before expiry
- **Fallback handling**: Graceful degradation on network issues

### **Storage Optimization**

- **Minimal localStorage usage**: Only essential data stored
- **Automatic cleanup**: Old tokens removed on logout
- **Memory efficient**: In-memory blacklist with size limits

## 🔮 **Future Enhancements**

### **Planned Improvements**

1. **Redis Integration**: Move token blacklist to Redis
2. **Device Tracking**: Remember trusted devices
3. **Session Analytics**: Track session patterns
4. **Multi-device Support**: Sync sessions across devices
5. **Advanced Security**: Biometric authentication integration

The token system now provides a **secure, user-friendly, and robust** authentication experience! 🎉
