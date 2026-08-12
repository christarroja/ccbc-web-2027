"use client";

import type { TextFieldClientComponent } from "payload";
import { FieldError, FieldLabel, useField } from "@payloadcms/ui";
import { expandHex, isHex } from "@/lib/contrast";
import "./ColorPickerField.css";

const SWATCH_FALLBACK = "#ffffff";

export const ColorPickerField: TextFieldClientComponent = ({
  field,
  path,
  readOnly,
}) => {
  const { errorMessage, setValue, showError, value } = useField<string>({
    path,
  });
  const swatch = isHex(value) ? expandHex(value) : SWATCH_FALLBACK;
  const description = field?.admin?.description;

  return (
    <div className="field-type color-picker-field">
      <FieldLabel
        htmlFor={path}
        label={field?.label}
        path={path}
        required={field?.required}
      />
      <div className="color-picker-field__controls">
        <input
          aria-label="Pick a colour"
          className="color-picker-field__swatch"
          disabled={readOnly}
          onChange={(e) => setValue(e.target.value)}
          type="color"
          value={swatch}
        />
        <input
          className="color-picker-field__hex"
          disabled={readOnly}
          id={path}
          onChange={(e) => setValue(e.target.value)}
          placeholder="#f4f1ea"
          spellCheck={false}
          type="text"
          value={value ?? ""}
        />
      </div>
      <FieldError message={errorMessage} path={path} showError={showError} />
      {typeof description === "string" && (
        <div className="field-description">{description}</div>
      )}
    </div>
  );
};
