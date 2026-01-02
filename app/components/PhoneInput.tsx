"use client";

import { useState, useEffect } from "react";
import { formatPhoneInput } from "@/lib/utils";

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    defaultValue?: string;
}

export default function PhoneInput({ defaultValue, className, onChange, ...props }: PhoneInputProps) {
    const [value, setValue] = useState(defaultValue || "");

    useEffect(() => {
        if (defaultValue) {
            setValue(formatPhoneInput(defaultValue));
        }
    }, [defaultValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneInput(e.target.value);
        setValue(formatted);
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <input
            {...props}
            type="tel"
            value={value}
            onChange={handleChange}
            className={className}
        />
    );
}
