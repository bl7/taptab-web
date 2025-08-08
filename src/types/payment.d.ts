declare global {
  interface Window {
    ApplePaySession?: {
      canMakePayments(): boolean;
      canMakePaymentsWithActiveCard(merchantIdentifier: string): boolean;
    };
    google?: {
      payments?: {
        api: {
          PaymentsClient: unknown;
        };
      };
    };
  }
}

export {};
