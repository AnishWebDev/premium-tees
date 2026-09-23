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
import type { AddressFormInput } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProfileIndiaAddressFieldsProps = {
  register: UseFormRegister<AddressFormInput>;
  setValue: UseFormSetValue<AddressFormInput>;
  watch: UseFormWatch<AddressFormInput>;
  errors: FieldErrors<AddressFormInput>;
  idPrefix?: string;
};

export function ProfileIndiaAddressFields({
  register,
  setValue,
  watch,
  errors,
  idPrefix = "addr",
}: ProfileIndiaAddressFieldsProps) {
  const state = watch("state") ?? "";
  const city = watch("city") ?? "";
  const isOtherState = state === OTHER_STATE;
  const cityOptions = state && !isOtherState ? getCitiesForState(state) : [];
  const showCityOther = isOtherState || city === OTHER_CITY;

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${idPrefix}-first-name`}>First name</Label>
          <Input
            id={`${idPrefix}-first-name`}
            className="mt-2"
            autoComplete="given-name"
            {...register("firstName")}
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor={`${idPrefix}-last-name`}>Last name (optional)</Label>
          <Input
            id={`${idPrefix}-last-name`}
            className="mt-2"
            autoComplete="family-name"
            {...register("lastName")}
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-line1`}>Address</Label>
        <Input
          id={`${idPrefix}-line1`}
          className="mt-2"
          autoComplete="address-line1"
          {...register("line1")}
        />
        {errors.line1 && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.line1.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-line2`}>Apartment, suite, etc. (optional)</Label>
        <Input
          id={`${idPrefix}-line2`}
          className="mt-2"
          autoComplete="address-line2"
          {...register("line2")}
        />
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-state`}>State / UT</Label>
        <Select
          value={state || undefined}
          onValueChange={(value) => {
            setValue("state", value, { shouldValidate: true });
            setValue("city", "", { shouldValidate: true });
            setValue("cityOther", "", { shouldValidate: true });
            if (value !== OTHER_STATE) {
              setValue("stateOther", "", { shouldValidate: true });
            }
          }}
        >
          <SelectTrigger id={`${idPrefix}-state`} className="mt-2" aria-label="State or union territory">
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
        {errors.state && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.state.message}
          </p>
        )}
      </div>

      {isOtherState && (
        <div>
          <Label htmlFor={`${idPrefix}-state-other`}>State / UT name</Label>
          <Input
            id={`${idPrefix}-state-other`}
            className="mt-2"
            placeholder="Enter your state or union territory"
            {...register("stateOther")}
          />
          {errors.stateOther && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.stateOther.message}
            </p>
          )}
        </div>
      )}

      {!isOtherState && (
        <div>
          <Label htmlFor={`${idPrefix}-city`}>City</Label>
          <Select
            value={city || undefined}
            onValueChange={(value) => {
              setValue("city", value, { shouldValidate: true });
              if (value !== OTHER_CITY) {
                setValue("cityOther", "", { shouldValidate: true });
              }
            }}
            disabled={!state}
          >
            <SelectTrigger
              id={`${idPrefix}-city`}
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
          {errors.city && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.city.message}
            </p>
          )}
        </div>
      )}

      {showCityOther && (
        <div>
          <Label htmlFor={`${idPrefix}-city-other`}>City name</Label>
          <Input
            id={`${idPrefix}-city-other`}
            className="mt-2"
            placeholder="Enter your city"
            autoComplete="address-level2"
            {...register("cityOther")}
          />
          {errors.cityOther && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.cityOther.message}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${idPrefix}-zip`}>PIN code</Label>
          <Input
            id={`${idPrefix}-zip`}
            className="mt-2"
            inputMode="numeric"
            maxLength={6}
            autoComplete="postal-code"
            {...register("zip")}
          />
          {errors.zip && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {errors.zip.message}
            </p>
          )}
        </div>
        <div>
          <Label>Country</Label>
          <p
            className="mt-2 flex h-11 items-center rounded-xl border border-[var(--border)] bg-[var(--muted)] px-4 text-sm"
            aria-label="Country: India"
          >
            India
          </p>
          <input type="hidden" {...register("country")} />
        </div>
      </div>

      <div>
        <Label htmlFor={`${idPrefix}-phone`}>Phone (10 digits, required)</Label>
        <Input
          id={`${idPrefix}-phone`}
          type="tel"
          className="mt-2"
          inputMode="numeric"
          maxLength={10}
          autoComplete="tel"
          {...register("phone", {
            onChange: (event) => {
              const digits = event.target.value.replace(/\D/g, "").slice(0, 10);
              if (digits !== event.target.value) {
                setValue("phone", digits, { shouldValidate: true });
              }
            },
          })}
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors.phone.message}
          </p>
        )}
      </div>
    </>
  );
}
