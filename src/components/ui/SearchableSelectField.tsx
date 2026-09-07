import React from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { SearchableSelect } from "./SearchableSelect";
import type { SearchableSelectProps } from "./SearchableSelect";
import { cn } from "../../lib/utils/utils";
import { tokens } from "../../lib/tokens";

export interface SearchableSelectFieldProps<T, TFieldValues extends FieldValues>
  extends Omit<SearchableSelectProps<T>, "value" | "onChange"> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  containerClassName?: string;
}

export function SearchableSelectField<
  T,
  TFieldValues extends FieldValues = FieldValues,
>({
  name,
  control,
  label,
  description,
  error,
  required,
  className,
  containerClassName,
  ...selectProps
}: SearchableSelectFieldProps<T, TFieldValues>) {
  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label
          htmlFor={selectProps.id}
          className={cn(
            tokens.typography.webUI.b2Emphasized,
            "block mb-1.5 text-app-label-primary"
          )}
        >
          {label}
          {required && (
            <span className="text-app-status-danger ms-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => {
          const value = (field.value ?? null) as T | null;
          const resolvedError = error ?? fieldState.error?.message;
          return (
            <>
              <SearchableSelect<T>
                {...selectProps}
                value={value}
                onChange={(next) => field.onChange(next)}
                onBlur={() => field.onBlur()}
                className={cn(
                  resolvedError &&
                    "[&_button]:border-app-status-danger/80 [&_button]:focus:border-app-status-danger [&_button]:focus:ring-app-status-danger",
                  className
                )}
                aria-invalid={resolvedError ? true : undefined}
                aria-describedby={
                  resolvedError
                    ? `${selectProps.id ?? name}-error`
                    : undefined
                }
              />
              {resolvedError && (
                <p
                  id={`${selectProps.id ?? name}-error`}
                  className={cn(
                    tokens.typography.webUI.c1Regular,
                    "text-app-status-danger mt-1 font-normal"
                  )}
                  role="alert"
                >
                  {resolvedError}
                </p>
              )}
              {description && !resolvedError && (
                <p
                  className={cn(
                    tokens.typography.webUI.c1Regular,
                    "text-app-label-tertiary mt-1"
                  )}
                >
                  {description}
                </p>
              )}
            </>
          );
        }}
      />
    </div>
  );
}
