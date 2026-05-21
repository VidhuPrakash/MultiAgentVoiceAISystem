import { useState } from "react";
import { AxiosError } from "axios";
import type { FieldError } from "@/types/auth";

type ApiErrorResponse = {
  message?: string;
  error?: string;
  errors?: FieldError[];
};

export function useFormErrors() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleApiError = (error: unknown) => {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const data = axiosError.response?.data;

    if (data?.errors) {
      const mapped = data.errors.reduce<Record<string, string>>(
        (acc, e: FieldError) => {
          acc[e.field] = e.message;
          return acc;
        },
        {},
      );
      setFieldErrors(mapped);
      setGlobalError(null);
    } else {
      setGlobalError(data?.message ?? data?.error ?? "Something went wrong");
      setFieldErrors({});
    }
  };

  const clearErrors = () => {
    setFieldErrors({});
    setGlobalError(null);
  };

  return {
    fieldErrors,
    globalError,
    handleApiError,
    clearErrors,
    setErrors: setFieldErrors,
  };
}
