import { useState, FormEvent } from "react";

type FormValue = string | number | boolean | null;

export const useForm = <T extends { [K in keyof T]: FormValue }>(
  initialState: T
) => {
  const [formData, setFormData] = useState<T>(initialState);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent, onSubmit: () => Promise<void> | void) => {
    e.preventDefault();
    onSubmit();
  };

  const resetForm = () => {
    setFormData(initialState);
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    setFormData,
    resetForm,
  };
};
