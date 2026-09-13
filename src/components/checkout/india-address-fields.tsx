"use client";

import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import {
  getCitiesForState,
  INDIA_STATE_OPTIONS,
  OTHER_CITY,
  OTHER_CITY_LABEL,
  OTHER_STATE,
  OTHER_STATE_LABEL,
} from "@/lib/india-locations";
import type { CheckoutFormInput } from "@/lib/validations/checkout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type IndiaAddressFieldsProps = {
  prefix: "shipping" | "billing";
  register: UseFormRegister<CheckoutFormInput>;
  setValue: UseFormSetValue<CheckoutFormInput>;
  watch: UseFormWatch<CheckoutFormInput>;
  errors: FieldErrors<CheckoutFormInput>;
  showNameFields?: boolean;
};

export function IndiaAddressFields({
  prefix,
  register,
  setValue,
  watch,
  errors,
  showNameFields = true,
}: IndiaAddressFieldsProps) {
  const state = watch(`${prefix}State`) ?? "";
  const city = watch(`${prefix}City`) ?? "";
  const isOtherState = state === OTHER_STATE;
  const cityOptions = state && !isOtherState ? getCitiesForState(state) : [];
  const showCityOther = isOtherState || city === OTHER_CITY;

  const firstNameKey = prefix === "shipping" ? "shippingFirstName" : "billingFirstName";
  const lastNameKey = prefix === "shipping" ? "shippingLastName" : "billingLastName";
  const line1Key = prefix === "shipping" ? "shippingLine1" : "billingLine1";
  const line2Key = prefix === "shipping" ? "shippingLine2" : "billingLine2";
  const stateKey = prefix === "shipping" ? "shippingState" : "billingState";
  const stateOtherKey = prefix === "shipping" ? "shippingStateOther" : "billingStateOther";
  const cityKey = prefix === "shipping" ? "shippingCity" : "billingCity";
  const cityOtherKey = prefix === "shipping" ? "shippingCityOther" : "billingCityOther";
  const zipKey = prefix === "shipping" ? "shippingZip" : "billingZip";
  const phoneKey = prefix === "shipping" ? "shippingPhone" : undefined;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {showNameFields && (
        <>
          <div>
            <Label htmlFor={`${prefix}-first-name`}>First name</Label>
            <Input
              id={`${prefix}-first-name`}
              className="mt-2"
              autoComplete={prefix === "shipping" ? "given-name" : "billing given-name"}
              {...register(firstNameKey)}
            />
            {errors[firstNameKey] && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors[firstNameKey]?.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor={`${prefix}-last-name`}>Last name</Label>
            <Input
              id={`${prefix}-last-name`}
              className="mt-2"
              autoComplete={prefix === "shipping" ? "family-name" : "billing family-name"}
              {...register(lastNameKey)}
            />
            {errors[lastNameKey] && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors[lastNameKey]?.message}
              </p>
            )}
          </div>
        </>
      )}

      <div className="sm:col-span-2">
        <Label htmlFor={`${prefix}-line1`}>Address</Label>
        <Input
          id={`${prefix}-line1`}
          className="mt-2"
          autoComplete={prefix === "shipping" ? "address-line1" : "billing address-line1"}
          {...register(line1Key)}
        />
        {errors[line1Key] && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors[line1Key]?.message}
          </p>
        )}
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor={`${prefix}-line2`}>Apartment, suite, etc. (optional)</Label>
        <Input
          id={`${prefix}-line2`}
          className="mt-2"
          autoComplete={prefix === "shipping" ? "address-line2" : "billing address-line2"}
          {...register(line2Key)}
        />
      </div>

      <div className={isOtherState ? "sm:col-span-2" : undefined}>
        <Label htmlFor={`${prefix}-state`}>State / UT</Label>
        <Select
          value={state || undefined}
          onValueChange={(value) => {
            setValue(stateKey, value, { shouldValidate: true });
            setValue(cityKey, "", { shouldValidate: true });
            setValue(cityOtherKey, "", { shouldValidate: true });
            if (value !== OTHER_STATE) {
              setValue(stateOtherKey, "", { shouldValidate: true });
            }
          }}
        >
          <SelectTrigger id={`${prefix}-state`} className="mt-2" aria-label="State or union territory">
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {INDIA_STATE_OPTIONS.map((name) => (
              <SelectItem key={name} value={name}>
                {name === OTHER_STATE ? OTHER_STATE_LABEL : name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors[stateKey] && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors[stateKey]?.message}
          </p>
        )}
      </div>

      {isOtherState && (
        <div className="sm:col-span-2">
          <Label htmlFor={`${prefix}-state-other`}>State / UT name</Label>
          <Input
            id={`${prefix}-state-other`}
            className="mt-2"
            placeholder="Enter your state or union territory"
            {...register(stateOtherKey)}
          />
          {errors[stateOtherKey] && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors[stateOtherKey]?.message}
            </p>
          )}
        </div>
      )}

      {!isOtherState && (
        <div>
          <Label htmlFor={`${prefix}-city`}>City</Label>
          <Select
            value={city || undefined}
            onValueChange={(value) => {
              setValue(cityKey, value, { shouldValidate: true });
              if (value !== OTHER_CITY) {
                setValue(cityOtherKey, "", { shouldValidate: true });
              }
            }}
            disabled={!state}
          >
            <SelectTrigger
              id={`${prefix}-city`}
              className="mt-2"
              aria-label="City"
              aria-disabled={!state}
            >
              <SelectValue placeholder={state ? "Select city" : "Select state first"} />
            </SelectTrigger>
            <SelectContent>
              {cityOptions.map((name) => (
                <SelectItem key={name} value={name}>
                  {name === OTHER_CITY ? OTHER_CITY_LABEL : name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors[cityKey] && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors[cityKey]?.message}
            </p>
          )}
        </div>
      )}

      {showCityOther && (
        <div className={isOtherState ? "sm:col-span-2" : "sm:col-span-2"}>
          <Label htmlFor={`${prefix}-city-other`}>City name</Label>
          <Input
            id={`${prefix}-city-other`}
            className="mt-2"
            placeholder="Enter your city"
            autoComplete={prefix === "shipping" ? "address-level2" : "billing address-level2"}
            {...register(cityOtherKey)}
          />
          {errors[cityOtherKey] && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors[cityOtherKey]?.message}
            </p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor={`${prefix}-zip`}>PIN code</Label>
        <Input
          id={`${prefix}-zip`}
          className="mt-2"
          inputMode="numeric"
          maxLength={6}
          autoComplete={prefix === "shipping" ? "postal-code" : "billing postal-code"}
          {...register(zipKey)}
        />
        {errors[zipKey] && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors[zipKey]?.message}
          </p>
        )}
      </div>

      {prefix === "shipping" && (
        <div>
          <Label className="text-[var(--foreground)]">Country</Label>
          <p
            className="mt-2 flex h-11 items-center rounded-xl border border-[var(--border)] bg-[var(--muted)] px-4 text-sm text-[var(--foreground)]"
            aria-label="Country: India"
          >
            India
          </p>
          <input type="hidden" {...register("shippingCountry")} />
        </div>
      )}

      {phoneKey && (
        <div className="sm:col-span-2">
          <Label htmlFor={`${prefix}-phone`}>Phone (for UPI / delivery)</Label>
          <Input
            id={`${prefix}-phone`}
            type="tel"
            className="mt-2"
            autoComplete="tel"
            {...register(phoneKey)}
          />
        </div>
      )}
    </div>
  );
}
