import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_METHODS,
  type ShippingMethodId,
} from "@/lib/constants";
import { getStoreSettings, type StoreSettings } from "@/lib/store-settings";

export type ShippingMethod = {
  id: ShippingMethodId;
  label: string;
  price: number;
  days: string;
};

export type CommerceConfig = {
  freeShippingThreshold: number;
  shippingMethods: ShippingMethod[];
  gstRate: number;
  pincodeDeliveryDays: string;
};

export function commerceFromSettings(settings: StoreSettings): CommerceConfig {
  return {
    freeShippingThreshold: settings.shipping.freeShippingThreshold,
    shippingMethods: settings.shipping.methods,
    gstRate: settings.tax.gstRate,
    pincodeDeliveryDays: settings.shipping.pincodeDeliveryDays,
  };
}

export async function getCommerceConfig(): Promise<CommerceConfig> {
  const settings = await getStoreSettings();
  return commerceFromSettings(settings);
}

/** Sync fallback for client bundles — use server-passed config when possible. */
export const DEFAULT_COMMERCE_CONFIG: CommerceConfig = {
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  shippingMethods: SHIPPING_METHODS.map((m) => ({ ...m })),
  gstRate: 0.05,
  pincodeDeliveryDays: "4–6 business days",
};
