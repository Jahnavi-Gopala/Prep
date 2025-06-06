import React from 'react'
import { Control, Controller, Field, FieldValues, Path } from 'react-hook-form'
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'
import path from 'path';

interface FormFieldProps<T extends FieldValues> {
    control: Control<T>; 
    name: Path<T>;
    label?: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'number';
}

const FormField = <T extends Record<string, any>>({
    control,
    name,
    label,
    placeholder,
    type = "text"
}: FormFieldProps<T>) => (
    <Controller
        name={name}
        control={control}
        render={({ field }) => (
            <FormItem>
                <FormLabel className='label'>{label}</FormLabel>
                <FormControl>
                    <Input className='input' placeholder={placeholder} type={type} {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
        )}
    />
)

export default FormField