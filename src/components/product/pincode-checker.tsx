"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PincodeCheckerProps = {
  pincodeDeliveryDays: string;
};

export function PincodeChecker({ pincodeDeliveryDays }: PincodeCheckerProps) {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleCheck = () => {
    const trimmed = pincode.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setResult("Please enter a valid 6-digit PIN code.");
      return;
    }
    setResult(`Estimated delivery: ${pincodeDeliveryDays}`);
  };

  return (
    <div className="rounded-xl border border-[var(--border)] p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
        <MapPin className="h-4 w-4" aria-hidden />
        Check delivery
      </div>
      <div className="mt-3 flex gap-2">
        <div className="flex-1">
          <Label htmlFor="pincode-check" className="sr-only">
            PIN code
          </Label>
          <Input
            id="pincode-check"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="Enter PIN code"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCheck())}
          />
        </div>
        <Button type="button" variant="secondary" onClick={handleCheck}>
          Check
        </Button>
      </div>
      {result && (
        <p
          className="mt-2 text-sm text-[var(--muted-foreground)]"
          role="status"
          aria-live="polite"
        >
          {result}
        </p>
      )}
    </div>
  );
}
