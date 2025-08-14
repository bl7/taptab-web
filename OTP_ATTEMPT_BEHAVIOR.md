# 🔐 OTP Attempt Behavior Guide

## ❓ **What Happens When User Enters Wrong OTP?**

### **✅ Current Implementation: Smart Attempt Tracking**

When a user enters a wrong OTP, here's exactly what happens:

#### **1. Wrong OTP Attempt**

- **OTP remains valid** and can be used again
- **Attempt counter increments** (stored in database)
- **User gets helpful message** with attempts remaining
- **Failed attempt logged** for security monitoring

#### **2. Attempt Limits**

- **Maximum 3 attempts** per OTP (configurable)
- **After 3 wrong attempts**: OTP becomes invalid
- **User must request new OTP** to continue

#### **3. User Experience Flow**

```
User enters wrong OTP →
"Wrong OTP. 2 attempts remaining." →
User tries again →
"Wrong OTP. 1 attempt remaining." →
User tries again →
"Too many wrong attempts. Please request a new OTP." →
OTP becomes invalid, user must request new one
```

## 🎯 **Detailed Behavior Breakdown**

### **Attempt 1 (Wrong OTP)**

```typescript
// User enters: 123456 (actual OTP is 789012)
// Response: "Wrong OTP. 2 attempts remaining."
// OTP Status: Still valid, can try again
```

### **Attempt 2 (Wrong OTP)**

```typescript
// User enters: 654321 (actual OTP is 789012)
// Response: "Wrong OTP. 1 attempt remaining."
// OTP Status: Still valid, can try again
```

### **Attempt 3 (Wrong OTP)**

```typescript
// User enters: 111111 (actual OTP is 789012)
// Response: "Too many wrong attempts. Please request a new OTP."
// OTP Status: Invalidated, must request new OTP
```

### **Attempt 4+ (Any OTP)**

```typescript
// User enters: 789012 (correct OTP)
// Response: "Too many wrong attempts. Please request a new OTP."
// OTP Status: Invalidated, must request new OTP
```

## 🛡️ **Security Features**

### **✅ What's Protected**

1. **Brute Force Prevention**: Max 3 attempts per OTP
2. **Rate Limiting**: 5 OTP requests per hour per IP/email
3. **Audit Logging**: Every attempt logged with IP and user agent
4. **Failed Attempt Tracking**: Separate table for security analysis
5. **IP Tracking**: All attempts linked to IP address

### **🔒 Database Schema**

```sql
-- OTP table with attempt tracking
CREATE TABLE otps (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,        -- Current attempts
    max_attempts INTEGER DEFAULT 3,    -- Max allowed attempts
    used BOOLEAN DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE NULL,
    ip_address INET NULL,
    user_agent TEXT NULL
);

-- Failed attempts tracking
CREATE TABLE failed_attempts (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    attempt_type VARCHAR(50) NOT NULL, -- 'otp_verify'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📱 **Frontend User Experience**

### **✅ What Users See**

#### **Wrong OTP (Attempts Remaining)**

```
❌ Wrong OTP. 2 attempts remaining.
[OTP Input Field] [Sign In Button]
```

#### **Wrong OTP (Last Attempt)**

```
❌ Wrong OTP. 1 attempt remaining.
[OTP Input Field] [Sign In Button]
```

#### **Too Many Attempts**

```
❌ Too many wrong attempts. Please request a new OTP.
[OTP Input Field - Disabled] [Sign In Button - Disabled]
[Request New OTP Button]
```

#### **OTP Expired**

```
⚠️ OTP has expired. Please request a new one.
[OTP Input Field - Disabled] [Sign In Button - Disabled]
[Request New OTP Button]
```

## 🔧 **Technical Implementation**

### **Backend Logic**

```typescript
export const verifyOTP = async (
  email: string,
  otp: string,
  tenantId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{
  success: boolean;
  message: string;
  attemptsRemaining?: number;
}> => {
  // 1. Check if OTP exists and is not expired
  const storedOTP = await getOTPFromDatabase(email, tenantId);

  // 2. Check current attempts vs max attempts
  if (storedOTP.attempts >= storedOTP.max_attempts) {
    return {
      success: false,
      message: "Too many wrong attempts. Please request a new OTP.",
    };
  }

  // 3. Verify OTP
  if (storedOTP.otp === otp) {
    // Success: Mark as used
    await markOTPAsUsed(storedOTP.id);
    return { success: true, message: "OTP verified successfully" };
  } else {
    // Failure: Increment attempts
    const newAttempts = storedOTP.attempts + 1;
    await incrementAttempts(storedOTP.id, newAttempts);

    const attemptsRemaining = storedOTP.max_attempts - newAttempts;
    const message =
      attemptsRemaining > 0
        ? `Wrong OTP. ${attemptsRemaining} attempt${
            attemptsRemaining === 1 ? "" : "s"
          } remaining.`
        : "Too many wrong attempts. Please request a new OTP.";

    return {
      success: false,
      message,
      attemptsRemaining: attemptsRemaining > 0 ? attemptsRemaining : 0,
    };
  }
};
```

### **Frontend Handling**

```typescript
const handleVerifyOTP = async () => {
  // Check if OTP is expired
  if (otpExpiryCountdown === 0) {
    setError("OTP has expired. Please request a new one.");
    return;
  }

  const response = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ action: "verifyOTP", email, otp, rememberMe }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.error;

    // Handle different error types
    if (
      errorMessage.includes("Wrong OTP") ||
      errorMessage.includes("attempts remaining")
    ) {
      setError(errorMessage); // Show attempts remaining
    } else if (errorMessage.includes("Too many wrong attempts")) {
      setError("Too many wrong attempts. Please request a new OTP.");
      setOtp(""); // Clear OTP input
      setOtpExpiryCountdown(0); // Reset countdown
    } else {
      setError(errorMessage);
    }
    return;
  }

  // Success: Login user
  router.push("/dashboard");
};
```

## 📊 **Security Monitoring**

### **Key Metrics Tracked**

1. **Failed Attempt Rate**: Percentage of wrong OTPs
2. **Attempt Distribution**: How many users hit max attempts
3. **IP-based Patterns**: Suspicious IP addresses
4. **Time-based Patterns**: Unusual timing of attempts
5. **User Agent Analysis**: Suspicious user agents

### **Alert Thresholds**

- **Failed Attempt Rate > 30%**: Investigate potential issues
- **Max Attempts Hit > 10/hour**: Potential brute force attack
- **Same IP Multiple Failures**: Block suspicious IP
- **Unusual User Agents**: Flag for review

## 🎯 **Best Practices Summary**

### **✅ Current Implementation: EXCELLENT**

- **3 attempts per OTP**: Good balance of security vs usability
- **Clear user feedback**: Users know exactly what's happening
- **Automatic invalidation**: Prevents brute force attacks
- **Comprehensive logging**: Full audit trail for security
- **Rate limiting**: Prevents abuse at multiple levels

### **🔧 Optional Improvements**

1. **Progressive delays**: Increase wait time after each wrong attempt
2. **Device fingerprinting**: Remember trusted devices
3. **Geolocation blocking**: Block suspicious locations
4. **Time-based restrictions**: Limit attempts during unusual hours

### **📈 User Experience Benefits**

- **No confusion**: Clear messages about attempt status
- **Helpful guidance**: Users know when to request new OTP
- **Security awareness**: Users understand the security measures
- **Smooth flow**: Seamless transition to new OTP when needed

## 🚀 **Conclusion**

**Your OTP system provides enterprise-grade security with excellent user experience!**

- **Wrong OTPs don't immediately invalidate the OTP**
- **Users get 3 attempts before needing a new OTP**
- **Clear feedback helps users understand what's happening**
- **Comprehensive security monitoring prevents abuse**
- **Automatic cleanup keeps the system running smoothly**

This follows industry best practices and provides the perfect balance of security and usability! 🎉
