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
  register: UseFormRegister<CheckoutFormInput>;
  setValue: UseFormSetValue<CheckoutFormInput>;
  watch: UseFormWatch<CheckoutFormInput>;
  errors: FieldErrors<CheckoutFormInput>;
  showNameFields?: boolean;
};

export function IndiaAddressFields({
  register,
  setValue,
  watch,
  errors,
  showNameFields = true,
}: IndiaAddressFieldsProps) {
  const prefix = "shipping";
  const state = watch("shippingState") ?? "";
  const city = watch("shippingCity") ?? "";
  const isOtherState = state === OTHER_STATE;
  const cityOptions = state && !isOtherState ? getCitiesForState(state) : [];
  const showCityOther = isOtherState || city === OTHER_CITY;

  const firstNameKey = "shippingFirstName" as const;
  const lastNameKey = "shippingLastName" as const;
  const line1Key = "shippingLine1" as const;
  const line2Key = "shippingLine2" as const;
  const stateKey = "shippingState" as const;
  const stateOtherKey = "shippingStateOther" as const;
  const cityKey = "shippingCity" as const;
  const cityOtherKey = "shippingCityOther" as const;
  const zipKey = "shippingZip" as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {showNameFields && (
        <>
          <div>
            <Label htmlFor={`${prefix}-first-name`}>First name</Label>
            <Input
              id={`${prefix}-first-name`}
              className="mt-2"
              autoComplete="given-name"
              {...register(firstNameKey)}
            />
            {errors[firstNameKey] && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors[firstNameKey]?.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor={`${prefix}-last-name`}>Last name (optional)</Label>
            <Input
              id={`${prefix}-last-name`}
              className="mt-2"
              autoComplete="family-name"
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
          autoComplete="address-line1"
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
          autoComplete="address-line2"
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
            autoComplete="address-level2"
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
          autoComplete="postal-code"
          {...register(zipKey, {
            onChange: (event) => {
              const digits = event.target.value.replace(/\D/g, "").slice(0, 6);
              if (digits !== event.target.value) {
                setValue(zipKey, digits, { shouldValidate: true });
              }
            },
          })}
        />
        {errors[zipKey] && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors[zipKey]?.message}
          </p>
        )}
      </div>

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

      <div className="sm:col-span-2">
        <Label htmlFor={`${prefix}-phone`}>Phone (10 digits, required)</Label>
        <Input
          id={`${prefix}-phone`}
          type="tel"
          className="mt-2"
          inputMode="numeric"
          maxLength={10}
          autoComplete="tel"
          {...register("shippingPhone", {
            onChange: (event) => {
              const digits = event.target.value.replace(/\D/g, "").slice(0, 10);
              if (digits !== event.target.value) {
                setValue("shippingPhone", digits, { shouldValidate: true });
              }
            },
          })}
        />
        {errors.shippingPhone && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.shippingPhone.message}
          </p>
        )}
      </div>
    </div>
  );
}
