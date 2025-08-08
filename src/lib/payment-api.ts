const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api/v1";

export interface StripeConfig {
  publishableKey: string;
  currency: string;
  merchantName: string;
  merchantCountry: string;
  isStripeEnabled: boolean;
  applePayEnabled: boolean;
  googlePayEnabled: boolean;
  merchantId?: string;
  merchantCapabilities?: string[];
}

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface PaymentConfirmation {
  success: boolean;
  orderId: string;
  paymentStatus: string;
  amount: number;
}

export interface PaymentStatus {
  paymentStatus: string;
  paymentIntentId?: string;
  amount?: number;
  lastUpdated?: string;
}

export class PaymentAPI {
  static async getTenantInfo(
    tenantSlug: string
  ): Promise<{ tenantId: string }> {
    const response = await fetch(
      `${API_BASE_URL}/public/tenant-info/${tenantSlug}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "stripeDebug",
        "Failed to get tenant info:",
        response.status,
        errorText
      );
      throw new Error(
        `Failed to get tenant info: ${response.status} - ${errorText}`
      );
    }

    const result = await response.json();
    console.log("stripeDebug", "Tenant info response:", result);

    // Handle backend response structure
    if (result.data) {
      return result.data;
    }

    return result;
  }

  static async getStripeConfig(tenantSlug: string): Promise<StripeConfig> {
    // First get the tenantId from tenantSlug
    const tenantInfo = await this.getTenantInfo(tenantSlug);
    const tenantId = tenantInfo.tenantId;

    console.log(
      "stripeDebug",
      "Using tenantId:",
      tenantId,
      "for tenantSlug:",
      tenantSlug
    );

    const response = await fetch(
      `${API_BASE_URL}/stripe/tenants/${tenantId}/config`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "stripeDebug",
        "Failed to get Stripe config:",
        response.status,
        errorText
      );
      throw new Error(
        `Failed to get Stripe config: ${response.status} - ${errorText}`
      );
    }

    const result = await response.json();
    console.log("stripeDebug", "Stripe config response:", result);

    // Handle backend response structure
    if (result.data) {
      return result.data;
    }

    return result;
  }

  static async createPaymentIntent(data: {
    tenantSlug: string;
    amount: number;
    currency: string;
    orderId: string;
    customerEmail?: string;
    metadata?: Record<string, string | number | boolean>;
  }): Promise<PaymentIntent> {
    // Get the actual tenantId from tenantSlug
    const tenantInfo = await this.getTenantInfo(data.tenantSlug);
    const tenantId = tenantInfo.tenantId;

    console.log(
      "stripeDebug",
      "Creating payment intent with tenantId:",
      tenantId
    );

    const requestData = {
      ...data,
      tenantId: tenantId,
    };

    const response = await fetch(
      `${API_BASE_URL}/stripe/orders/create-payment-intent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create payment intent: ${response.status}`);
    }

    const result = await response.json();

    // Handle backend response structure
    if (result.data) {
      return result.data;
    }

    return result;
  }

  static async confirmPayment(
    orderId: string,
    data: {
      paymentIntentId: string;
      paymentMethod: string;
      amount: number;
      stripePaymentMethodId?: string;
      tenantId: string;
    }
  ): Promise<PaymentConfirmation> {
    const response = await fetch(
      `${API_BASE_URL}/stripe/orders/${orderId}/confirm-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantId: data.tenantId,
          paymentIntentId: data.paymentIntentId,
          paymentMethod: data.paymentMethod,
          amount: data.amount,
          stripePaymentMethodId: data.stripePaymentMethodId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to confirm payment: ${response.status}`);
    }

    const result = await response.json();

    // Handle backend response structure
    if (result.data) {
      return result.data;
    }

    return result;
  }

  static async getPaymentStatus(
    orderId: string,
    tenantId: string
  ): Promise<PaymentStatus> {
    const response = await fetch(
      `${API_BASE_URL}/stripe/orders/${orderId}/payment-status?tenantId=${tenantId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get payment status: ${response.status}`);
    }

    const result = await response.json();

    // Handle backend response structure
    if (result.data) {
      return result.data;
    }

    return result;
  }
}
